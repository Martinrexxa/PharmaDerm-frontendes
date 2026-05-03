import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

// Module-level singleton state — scoped per user
const quizHistory   = ref([])
const diagnostics   = ref([])
const routines      = ref([])
const appointments  = ref([])
const orders        = ref([])

let _currentUserId = null

// Returns null when no userId — NO fallback to global key
function _key(base) {
  if (!_currentUserId) return null
  return `pharmaderm_${base}_${_currentUserId}`
}

function _parse(key) {
  if (!key) return []
  try { return JSON.parse(localStorage.getItem(key) || 'null') || [] } catch { return [] }
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
  diagnostics.value  = _parse(_key('diagnostics_history'))
  routines.value     = _parse(_key('routines'))
  appointments.value = _parse(_key('appointments_list'))
  orders.value       = _parse(_key('orders'))
}

// Sync init (used internally and for non-Supabase mode)
export function initHistoryForUser(userId) {
  _currentUserId = userId || null
  _load()
}

/**
 * Async init called by useAuthStore._loadProfile().
 * When Supabase is configured:
 *   - If DB has 0 quiz sessions → clear stale localStorage cache
 *   - If DB has data but localStorage is empty → reconstruct partial data from Supabase
 */
export async function loadHistoryForUser(userId) {
  _currentUserId = userId || null

  if (!isSupabaseConfigured || !userId) {
    _load()
    return
  }

  try {
    const { count, error: cntErr } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (!cntErr && count === 0) {
      // DB was reset or user never did a quiz → wipe stale private localStorage
      console.log('[HistoryStore] quiz_sessions = 0 en DB → limpiando caché obsoleta para', userId)
      const staleKeys = [
        'quiz_history', 'diagnostics_history', 'routines',
        'appointments_list', 'orders', 'quiz_result', 'diagnostic_result', 'appointment',
      ]
      staleKeys.forEach(base => localStorage.removeItem(`pharmaderm_${base}_${userId}`))
    } else if (!cntErr && count > 0) {
      // DB has quiz data — check if localStorage is empty (e.g. after logout)
      const localQuizResult = localStorage.getItem(`pharmaderm_quiz_result_${userId}`)
      if (!localQuizResult) {
        // Reconstruct partial quiz data from Supabase so Diagnostics + historial work
        const { data: qData, error: qErr } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!qErr && qData) {
          const reconstructed = {
            completed: true,
            id: Date.now(),
            date: qData.completed_at,
            skinType: qData.skin_type || '',
            sensitivity: qData.sensitivity || '',
            concerns: qData.concerns || [],
            primaryConcern: qData.primary_concern || '',
            profileTitle: qData.profile_title || '',
            routineFocus: qData.routine_focus || '',
            fullMetrics: qData.full_metrics || [],
            summaryMetrics: (qData.full_metrics || []).slice(0, 3),
            answers: qData.answers || {},
          }
          localStorage.setItem(`pharmaderm_quiz_result_${userId}`, JSON.stringify(reconstructed))
          localStorage.setItem(`pharmaderm_quiz_history_${userId}`, JSON.stringify([reconstructed]))
          console.log('[HistoryStore] quiz reconstruido desde Supabase para', userId)
        }

        // Also reconstruct latest diagnosis_case if any
        const { data: dData, error: dErr } = await supabase
          .from('diagnosis_cases')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!dErr && dData) {
          const reconstructedDiag = {
            id: Date.now(),
            date: dData.created_at,
            title: dData.insight_title || 'Diagnóstico guardado',
            summary: dData.insight_text || '',
            form: {
              description: dData.description || '',
              duration: dData.duration || '',
              urgency: dData.urgency || '',
              symptoms: dData.symptoms || [],
              areas: dData.areas || [],
              priorities: dData.priorities || [],
            },
            status: dData.status || 'saved',
          }
          localStorage.setItem(`pharmaderm_diagnostic_result_${userId}`, JSON.stringify(reconstructedDiag))
          localStorage.setItem(`pharmaderm_diagnostics_history_${userId}`, JSON.stringify([reconstructedDiag]))
          console.log('[HistoryStore] diagnóstico reconstruido desde Supabase para', userId)
        }
      }
    }
  } catch (e) {
    console.warn('[HistoryStore] sync check falló (no bloqueante):', e?.message)
  }

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
  function saveQuizResult(result) {
    const entry = { ...result, id: Date.now(), date: new Date().toISOString() }
    quizHistory.value.unshift(entry)
    const kh = _key('quiz_history')
    const kr = _key('quiz_result')
    if (kh) localStorage.setItem(kh, JSON.stringify(quizHistory.value))
    if (kr) localStorage.setItem(kr, JSON.stringify(entry))
    return entry
  }

  function saveDiagnostic(diagnostic) {
    const entry = { ...diagnostic, id: Date.now(), date: new Date().toISOString() }
    diagnostics.value.unshift(entry)
    const kh = _key('diagnostics_history')
    const kr = _key('diagnostic_result')
    if (kh) localStorage.setItem(kh, JSON.stringify(diagnostics.value))
    if (kr) localStorage.setItem(kr, JSON.stringify(entry))
    return entry
  }

  function saveRoutine(routine) {
    const entry = { ...routine, id: Date.now(), date: new Date().toISOString() }
    routines.value.unshift(entry)
    const k = _key('routines')
    if (k) localStorage.setItem(k, JSON.stringify(routines.value))
    return entry
  }

  function saveAppointment(apt) {
    const entry = { id: Date.now(), date: new Date().toISOString(), status: 'pending', ...apt }
    appointments.value.unshift(entry)
    const kh = _key('appointments_list')
    const ka = _key('appointment')
    if (kh) localStorage.setItem(kh, JSON.stringify(appointments.value))
    if (ka) localStorage.setItem(ka, JSON.stringify(entry))
    return entry
  }

  function saveOrder(order) {
    const entry = { ...order, id: Date.now(), date: new Date().toISOString(), status: 'confirmed' }
    orders.value.unshift(entry)
    const k = _key('orders')
    if (k) localStorage.setItem(k, JSON.stringify(orders.value))
    return entry
  }

  function getLatestQuizResult() {
    const key = _key('quiz_result')
    if (!key) return null
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }

  function getLatestDiagnostic() {
    const key = _key('diagnostic_result')
    if (!key) return null
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }

  function refresh() { _load() }

  return {
    quizHistory, diagnostics, routines, appointments, orders,
    saveQuizResult, saveDiagnostic, saveRoutine, saveAppointment, saveOrder,
    getLatestQuizResult, getLatestDiagnostic,
    refresh,
  }
}
