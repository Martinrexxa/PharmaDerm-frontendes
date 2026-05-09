import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { apiFetch } from '../services/apiClient.js'
import routineService from '../services/routineService.js'

// Module-level singleton state — scoped per user
const quizHistory   = ref([])
const diagnostics   = ref([])
const routines      = ref([])
const appointments  = ref([])
const orders        = ref([])

let _currentUserId = null
let _lastSyncTime = 0
const SYNC_THRESHOLD = 300000 // 5 minutes

function _hasBackendSession() {
  try {
    const s = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null')
    return Boolean(s?.token)
  } catch {
    return false
  }
}

async function _syncWithBackend() {
  if (!_hasBackendSession()) return
  const data = await apiFetch('/history')
  quizHistory.value = Array.isArray(data?.quiz_history) ? data.quiz_history : []
  diagnostics.value = Array.isArray(data?.diagnostics_history) ? data.diagnostics_history : []
  routines.value = Array.isArray(data?.routines) ? data.routines : []
  appointments.value = Array.isArray(data?.appointments_list) ? data.appointments_list : []
  orders.value = Array.isArray(data?.orders) ? data.orders : []

  const kh = _key('quiz_history')
  const kr = _key('quiz_result')
  const dh = _key('diagnostics_history')
  const dr = _key('diagnostic_result')
  const rh = _key('routines')
  const ah = _key('appointments_list')
  const ap = _key('appointment')
  const oh = _key('orders')
  if (kh) localStorage.setItem(kh, JSON.stringify(quizHistory.value))
  if (kr) localStorage.setItem(kr, JSON.stringify(data?.quiz_result || null))
  if (dh) localStorage.setItem(dh, JSON.stringify(diagnostics.value))
  if (dr) localStorage.setItem(dr, JSON.stringify(data?.diagnostic_result || null))
  if (rh) localStorage.setItem(rh, JSON.stringify(routines.value))
  if (ah) localStorage.setItem(ah, JSON.stringify(appointments.value))
  if (ap) localStorage.setItem(ap, JSON.stringify(data?.appointment || null))
  if (oh) localStorage.setItem(oh, JSON.stringify(orders.value))
}

async function _pushBackendHistory() {
  if (!_hasBackendSession()) return
  const sanitizeQuiz = (q) => {
    if (!q || typeof q !== 'object') return q
    const next = { ...q }
    if (typeof next.selfie === 'string' && next.selfie.startsWith('data:image/')) {
      next.selfie = ''
    }
    return next
  }

  const sanitizedQuizHistory = Array.isArray(quizHistory.value)
    ? quizHistory.value.map(sanitizeQuiz)
    : []

  await apiFetch('/history', {
    method: 'PUT',
    body: {
      quiz_history: sanitizedQuizHistory,
      diagnostics_history: diagnostics.value,
      routines: routines.value,
      appointments_list: appointments.value,
      orders: orders.value,
      quiz_result: sanitizeQuiz(quizHistory.value[0] || null),
      diagnostic_result: diagnostics.value[0] || null,
      appointment: appointments.value[0] || null,
    },
  })
}

// Returns null when no userId — NO fallback to global key
function _key(base) {
  if (!_currentUserId) return null
  return `pharmaderm_${base}_${_currentUserId}`
}

function _parse(key) {
  if (!key) return []
  try { return JSON.parse(localStorage.getItem(key) || 'null') || [] } catch { return [] }
}

function _deduplicate(list, keys) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  return list.filter(item => {
    const val = keys 
      ? keys.map(k => item[k]).join('|') 
      : JSON.stringify({ ...item, id: null, date: null, savedAt: null, createdAt: null })
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

function _load() {
  if (!_currentUserId) {
    quizHistory.value  = []
    diagnostics.value  = []
    routines.value     = []
    appointments.value = []
    orders.value       = []
    return
  }
  quizHistory.value  = _parse(_key('quiz_history'))
  
  // Deduplicate diagnostics and appointments
  const rawDiagnostics = _parse(_key('diagnostics_history'))
  diagnostics.value = _deduplicate(rawDiagnostics, ['summary'])

  routines.value     = _parse(_key('routines'))
  
  const rawAppointments = _parse(_key('appointments_list'))
  appointments.value = _deduplicate(rawAppointments, ['doctor', 'date', 'time'])

  orders.value       = _parse(_key('orders'))
}

// Sync init (used internally and for non-Supabase mode)
export function initHistoryForUser(userId) {
  _currentUserId = userId || null
  _load()
}


/**
 * Async init called by useAuthStore._loadProfile().
 * Loads cache immediately and triggers a background sync with Supabase.
 */
export async function loadHistoryForUser(userId) {
  _currentUserId = userId || null

  if (_hasBackendSession() && userId) {
    _load()
    try { await _syncWithBackend() } catch (e) { console.warn('[HistoryStore] Backend sync failed:', e) }
    return
  }

  if (!isSupabaseConfigured || !userId) {
    _load()
    return
  }

  // Always load from cache first for immediate responsiveness
  _load()

  // Prevent redundant syncs if already synced recently
  const now = Date.now()
  if (now - _lastSyncTime < SYNC_THRESHOLD) {
    return
  }

  // Trigger sync in background
  _syncWithSupabase(userId).catch(e => console.warn('[HistoryStore] Background sync failed:', e))
}

async function _syncWithSupabase(userId) {
  _lastSyncTime = Date.now()
  console.log('[HistoryStore] Starting background sync for', userId)

  try {
    const { count, error: cntErr } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (!cntErr && count === 0) {
      const staleKeys = [
        'quiz_history', 'diagnostics_history', 'routines',
        'appointments_list', 'orders', 'quiz_result', 'diagnostic_result', 'appointment',
      ]
      staleKeys.forEach(base => localStorage.removeItem(`pharmaderm_${base}_${userId}`))
    } else if (!cntErr && count > 0) {
      // 1. Reconstruct Quiz
      const localQuizRaw = localStorage.getItem(`pharmaderm_quiz_result_${userId}`)
      let localQuizParsed = null
      try { localQuizParsed = localQuizRaw ? JSON.parse(localQuizRaw) : null } catch { localQuizParsed = null }
      const needsQuizRebuild = !localQuizParsed || !localQuizParsed.completed

      if (needsQuizRebuild) {
        let reconstructed = null
        try {
          const { data: qData } = await supabase
            .from('quiz_sessions')
            .select(`
              *,
              skin_types ( code ),
              skin_analyses (
                primary_concern,
                profile_title,
                profile_summary,
                routine_focus,
                metrics,
                detailed_findings,
                created_at
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (qData) {
            const latestAnalysis = Array.isArray(qData.skin_analyses) ? qData.skin_analyses[0] : null
            const metrics = latestAnalysis?.metrics || qData.full_metrics || []
            const resolvedDate =
              qData.completed_at ||
              latestAnalysis?.created_at ||
              qData.created_at ||
              new Date().toISOString()
            const skinTypeCode =
              qData.skin_type ||
              qData.skin_types?.code ||
              ''
            const primaryConcern =
              latestAnalysis?.primary_concern ||
              qData.primary_concern ||
              ''
            const concerns =
              Array.isArray(qData.concerns) && qData.concerns.length
                ? qData.concerns
                : (primaryConcern ? [primaryConcern] : [])

            reconstructed = {
              completed: true,
              id: qData.id,
              date: resolvedDate,
              skinType: skinTypeCode,
              sensitivity: qData.sensitivity || qData.barrier_reactivity || '',
              concerns,
              primaryConcern,
              profileTitle: latestAnalysis?.profile_title || qData.profile_title || '',
              profileSummary: latestAnalysis?.profile_summary || qData.profile_summary || '',
              routineFocus: latestAnalysis?.routine_focus || qData.routine_focus || '',
              detailedFindings: latestAnalysis?.detailed_findings || qData.detailed_findings || [],
              fullMetrics: metrics,
              summaryMetrics: (metrics || []).slice(0, 3),
              answers: qData.answers || {}, photoMeta: qData.photo_meta || {},
            }
          }
        } catch { /* ignore */ }

        if (!reconstructed) {
          try {
            const { data: aData } = await supabase
              .from('skin_analyses')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (aData) {
              const primaryConcern = aData.primary_concern || ''
              const metrics = aData.metrics || []
              reconstructed = {
                completed: true,
                id: aData.quiz_session_id || aData.id,
                date: aData.created_at || new Date().toISOString(),
                skinType: '',
                sensitivity: '',
                concerns: primaryConcern ? [primaryConcern] : [],
                primaryConcern,
                profileTitle: aData.profile_title || '',
                profileSummary: aData.profile_summary || '',
                routineFocus: aData.routine_focus || '',
                detailedFindings: aData.detailed_findings || [],
                fullMetrics: metrics,
                summaryMetrics: (metrics || []).slice(0, 3),
                answers: {},
                photoMeta: {},
              }
            }
          } catch { /* ignore */ }
        }

        if (reconstructed) {
          localStorage.setItem(`pharmaderm_quiz_result_${userId}`, JSON.stringify(reconstructed))
          localStorage.setItem(`pharmaderm_quiz_history_${userId}`, JSON.stringify([reconstructed]))
        }
      }

      // 2. Sync Routine
      try {
        const latestR = await routineService.getLatestRoutine()
        if (latestR) {
          localStorage.setItem(`pharmaderm_routines_${userId}`, JSON.stringify([latestR]))
        }
      } catch { /* ignore */ }

      // 3. Sync Diagnosis
      try {
        const { data: dData } = await supabase
          .from('diagnosis_cases')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (dData?.length > 0) {
          const reconstructedDiags = dData.map(d => ({
            id: d.id, date: d.created_at, title: d.insight_title || 'Diagnostic',
            summary: d.insight_text || '', form: { description: d.description || '', symptoms: d.symptoms || [] },
            status: d.status || 'saved',
          }))
          localStorage.setItem(`pharmaderm_diagnostic_result_${userId}`, JSON.stringify(reconstructedDiags[0]))
          localStorage.setItem(`pharmaderm_diagnostics_history_${userId}`, JSON.stringify(reconstructedDiags))
        }
      } catch { /* ignore */ }

      // 4. Sync Appointments
      try {
        const { data: aData } = await supabase
          .from('appointments')
          .select(`
            id,
            user_id,
            dermatologist_id,
            appointment_type,
            mode,
            scheduled_date,
            scheduled_time,
            reason,
            notes,
            urgency,
            status,
            confirmation_code,
            analysis_id,
            created_at,
            dermatologists (id, name, specialty, photo_url)
          `)
          .eq('user_id', userId)
          .order('scheduled_date', { ascending: false })
          .limit(10)

        if (aData?.length > 0) {
          const reconstructedApts = aData.map(a => ({
            id: a.id,
            doctor: a.dermatologists?.name || 'Specialist Dermatologist',
            doctor_name: a.dermatologists?.name || 'Specialist Dermatologist',
            doctor_specialty: a.dermatologists?.specialty || 'Dermatology',
            doctor_photo: a.dermatologists?.photo_url || null,
            date: a.scheduled_date,
            scheduled_date: a.scheduled_date,
            time: a.scheduled_time,
            scheduled_time: a.scheduled_time,
            appointment_type: a.appointment_type,
            mode: a.mode || a.dermatologists?.mode || null,
            reason: a.reason || null,
            notes: a.notes || null,
            urgency: a.urgency,
            status: a.status,
            confirmationCode: a.confirmation_code,
            confirmation_code: a.confirmation_code,
            analysis_id: a.analysis_id,
            created_at: a.created_at,
          }))
          localStorage.setItem(`pharmaderm_appointments_list_${userId}`, JSON.stringify(reconstructedApts))
        }
      } catch (syncAptError) {
        console.warn('[HistoryStore] Failed to sync appointments:', syncAptError)
      }

      // 5. Sync Orders
      try {
        const { data: oData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (oData?.length > 0) {
          const reconstructedOrders = oData.map(o => ({
            id: o.id, order_number: o.order_number, customer_name: o.customer_name,
            customer_email: o.customer_email, address: o.address_line, city: o.city,
            country: o.country_code, payment_method: o.payment_method, currency: o.currency,
            subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total,
            status: o.status, date: o.created_at,
            items: (o.order_items || []).map(oi => ({
              name: oi.product_name,
              image: oi.product_image || null,
              size: oi.size_label,
              quantity: oi.quantity,
              subtotal: oi.subtotal
            }))
          }))
          localStorage.setItem(`pharmaderm_orders_${userId}`, JSON.stringify(reconstructedOrders))
        }
      } catch { /* ignore */ }
    }
  } catch (e) {
    console.warn('[HistoryStore] Sync failed:', e?.message)
  }

  // Reload memory from the newly synced localStorage
  _load()
}

// Called on logout — clears in-memory state
export function clearHistory() {
  _currentUserId = null
  quizHistory.value  = []
  diagnostics.value  = []
  routines.value     = []
  appointments.value = []
  orders.value       = []
}

export function useHistoryStore() {
  async function saveQuizResult(result) {
    const entry = { ...result, id: Date.now(), date: new Date().toISOString() }
    quizHistory.value.unshift(entry)
    const kh = _key('quiz_history')
    const kr = _key('quiz_result')
    if (kh) localStorage.setItem(kh, JSON.stringify(quizHistory.value))
    if (kr) localStorage.setItem(kr, JSON.stringify(entry))

    if (result.morningSteps || result.nightSteps) {
      try {
        const routineData = {
          name: result.profileTitle || 'My personalized routine',
          primaryConcern: result.primaryConcern,
          skinType: result.skinType,
          morningSteps: result.morningSteps || [],
          nightSteps: result.nightSteps || [],
          generatedFromQuiz: true
        }
        saveRoutine(routineData).catch(e => {
          console.warn('[HistoryStore] Failed to save routine:', e)
        })
      } catch (e) {
        console.warn('[HistoryStore] Failed to save routine:', e)
      }
    }
    try {
      if (_hasBackendSession()) await _pushBackendHistory()
    } catch (e) {
      console.warn('[HistoryStore] Backend quiz sync failed:', e?.message || e)
    }
    return entry
  }

  function saveDiagnostic(diagnostic) {
    const entry = { ...diagnostic, id: Date.now(), date: new Date().toISOString() }
    const isDup = diagnostics.value.some(d => d.summary === entry.summary && d.status === entry.status)
    if (!isDup) {
      diagnostics.value.unshift(entry)
    } else {
      const idx = diagnostics.value.findIndex(d => d.summary === entry.summary)
      if (idx !== -1) diagnostics.value[idx] = { ...diagnostics.value[idx], ...entry }
    }
    const kh = _key('diagnostics_history')
    const kr = _key('diagnostic_result')
    if (kh) localStorage.setItem(kh, JSON.stringify(diagnostics.value))
    if (kr) localStorage.setItem(kr, JSON.stringify(entry))
    _pushBackendHistory().catch(() => {})
    return entry
  }

  async function saveRoutine(routine) {
    try {
      const entry = await routineService.saveRoutine(routine)
      routines.value.unshift(entry)
      _pushBackendHistory().catch(() => {})
      return entry
    } catch (e) {
      console.warn('[HistoryStore] Error saving routine:', e)
      const entry = { ...routine, id: Date.now(), date: new Date().toISOString() }
      routines.value.unshift(entry)
      _pushBackendHistory().catch(() => {})
      return entry
    }
  }

  function saveAppointment(apt) {
    const entry = { id: Date.now(), date: new Date().toISOString(), status: 'pending', ...apt }
    const isDup = appointments.value.some(a => a.doctor === entry.doctor && a.date === entry.date && a.time === entry.time)
    if (!isDup) {
      appointments.value.unshift(entry)
    }
    const kh = _key('appointments_list')
    const ka = _key('appointment')
    if (kh) localStorage.setItem(kh, JSON.stringify(appointments.value))
    if (ka) localStorage.setItem(ka, JSON.stringify(entry))
    _pushBackendHistory().catch(() => {})
    return entry
  }

  async function saveOrder(order) {
    try {
      const { orderService } = await import('../services/orderService.js')
      const entry = await orderService.saveOrder(order)
      orders.value.unshift(entry)
      _pushBackendHistory().catch(() => {})
      return entry
    } catch (e) {
      console.warn('[HistoryStore] Error saving order:', e)
      const entry = { ...order, id: Date.now(), date: new Date().toISOString(), status: 'confirmed' }
      orders.value.unshift(entry)
      const k = _key('orders')
      if (k) localStorage.setItem(k, JSON.stringify(orders.value))
      _pushBackendHistory().catch(() => {})
      return entry
    }
  }

  function getLatestQuizResult() {
    if (quizHistory.value?.[0]) return quizHistory.value[0]
    const key = _key('quiz_result')
    if (!key) return null
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }

  function getLatestDiagnostic() {
    if (diagnostics.value?.[0]) return diagnostics.value[0]
    const key = _key('diagnostic_result')
    if (!key) return null
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }

  function refresh() { _load() }
  function getOrders() { return orders.value || [] }

  return {
    quizHistory, diagnostics, routines, appointments, orders,
    saveQuizResult, saveDiagnostic, saveRoutine, saveAppointment, saveOrder,
    getLatestQuizResult, getLatestDiagnostic,
    refresh, getOrders,
  }
}
