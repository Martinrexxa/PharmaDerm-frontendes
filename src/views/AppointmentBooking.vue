<template>
  <div class="booking-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.back()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1>{{ ui.pageTitle }}</h1>
          <p class="page-sub" v-if="displayDiagnosisSummary">
            {{ ui.basedOnDiagnosis }}: <em>{{ displayDiagnosisSummary }}</em>
          </p>
        </div>
      </div>

      <div v-if="booked" class="confirm-box">
        <span class="material-symbols-outlined confirm-icon">check_circle</span>
        <h2>{{ ui.bookedTitle }}</h2>
        <p>{{ ui.bookedWith }} <strong>{{ selectedDoctor?.name }}</strong> {{ ui.bookedRegistered }}</p>
      </div>

      <template v-else>
        <section class="booking-section">
          <div class="section-heading-row">
            <h2><span class="step-num">1</span> {{ doctorSelectionLocked ? ui.selectedSpecialist : ui.recommendedSpecialists }}</h2>
            <button v-if="doctorSelectionLocked" type="button" class="btn-change-doctor" @click="showAllDoctors">
              {{ ui.changeSpecialist }}
            </button>
          </div>
          <div class="doctors-grid" v-if="displayedRecommendedDoctors.length">
            <div
              v-for="doc in displayedRecommendedDoctors"
              :key="doc.id"
              class="doctor-card"
              :class="{ selected: selectedDoctor?.id === doc.id }"
              @click="selectDoctor(doc)"
            >
              <img :src="resolveDoctorPhoto(doc)" :alt="doc.name" class="doctor-photo" />
              <div class="doctor-info">
                <p class="doctor-name">{{ doc.name }}</p>
                <p class="doctor-specialty">{{ specialtyLabel(doc.specialty) }}</p>
                <p class="doctor-location">{{ doc.location }}</p>
                <div class="doctor-rating"><span class="stars">{{ starText(doc.rating) }}</span></div>
                <span class="modality-badge">{{ modalityLabel(doc.mode) }}</span>
                <span class="recommend-badge">{{ ui.recommendedForCase }}</span>
              </div>
            </div>
          </div>
          <div v-else class="form-error">{{ ui.noSpecialists }}</div>
        </section>

        <section class="booking-section" v-if="!doctorSelectionLocked && otherDoctors.length">
          <h2>{{ ui.otherSpecialists }}</h2>
          <div class="doctors-grid">
            <div
              v-for="doc in otherDoctors"
              :key="doc.id"
              class="doctor-card"
              :class="{ selected: selectedDoctor?.id === doc.id }"
              @click="selectDoctor(doc)"
            >
              <img :src="resolveDoctorPhoto(doc)" :alt="doc.name" class="doctor-photo" />
              <div class="doctor-info">
                <p class="doctor-name">{{ doc.name }}</p>
                <p class="doctor-specialty">{{ specialtyLabel(doc.specialty) }}</p>
                <p class="doctor-location">{{ doc.location }}</p>
                <div class="doctor-rating"><span class="stars">{{ starText(doc.rating) }}</span></div>
                <span class="modality-badge">{{ modalityLabel(doc.mode) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor">
          <h2><span class="step-num">2</span> {{ ui.typeAndFormat }}</h2>
          <div class="options-row">
            <label v-for="t in appointmentTypes" :key="t.key" class="option-card" :class="{ selected: form.type === t.key }">
              <input type="radio" :value="t.key" v-model="form.type" />
              <span>{{ t.label }}</span>
            </label>
          </div>

          <h3 style="margin-top:14px;">{{ ui.format }}</h3>
          <div class="options-row">
            <label class="option-card" :class="{ selected: form.mode === 'presencial', disabled: selectedDoctor.mode === 'virtual' }">
              <input type="radio" value="presencial" v-model="form.mode" :disabled="selectedDoctor.mode === 'virtual'" />{{ ui.inPerson }}
            </label>
            <label class="option-card" :class="{ selected: form.mode === 'virtual', disabled: selectedDoctor.mode === 'presencial' }">
              <input type="radio" value="virtual" v-model="form.mode" :disabled="selectedDoctor.mode === 'presencial'" />{{ ui.virtual }}
            </label>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor && form.type">
          <h2><span class="step-num">3</span> {{ ui.dateAndTime }}</h2>
          <div class="form-grid">
            <div class="form-field">
              <label>{{ ui.date }}</label>
              <input type="date" v-model="form.date" :min="minDate" />
            </div>
            <div class="form-field">
              <label>{{ ui.preferredTime }}</label>
              <select v-model="form.time">
                <option value="">{{ ui.selectTime }}</option>
                <option v-for="t in timeSlots" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor && form.type && form.date">
          <h2><span class="step-num">4</span> {{ ui.reason }}</h2>
          <textarea v-model="form.reason" class="reason-input" rows="4" :placeholder="ui.reasonPlaceholder"></textarea>
        </section>

        <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

        <div class="booking-footer" v-if="selectedDoctor">
          <button class="btn-confirm" :disabled="isSubmitting" @click="bookAppointment">{{ isSubmitting ? ui.booking : ui.confirmAppointment }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { useHistoryStore } from '../stores/useHistoryStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { apiFetch } from '../services/apiClient.js'
import { buildAppointmentConfirmationUrl, sendAppointmentConfirmationEmail } from '../services/emailService.js'
import { withTimeout } from '../utils/async.js'
import { useI18n } from '../lib/i18n.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const history = useHistoryStore()
const { lang } = useI18n()

const isEs = computed(() => lang.value === 'es')
const ui = computed(() => ({
  pageTitle: isEs.value ? 'Reservar cita' : 'Book Appointment',
  basedOnDiagnosis: isEs.value ? 'Basado en tu diagnostico' : 'Based on your diagnosis',
  bookedTitle: isEs.value ? 'Cita reservada' : 'Appointment booked',
  bookedWith: isEs.value ? 'Tu cita con' : 'Your appointment with',
  bookedRegistered: isEs.value ? 'ha sido registrada.' : 'has been registered.',
  selectedSpecialist: isEs.value ? 'Especialista seleccionado' : 'Selected specialist',
  recommendedSpecialists: isEs.value ? 'Especialistas recomendados' : 'Recommended specialists',
  changeSpecialist: isEs.value ? 'Cambiar especialista' : 'Change specialist',
  recommendedForCase: isEs.value ? 'Recomendado para tu caso' : 'Recommended for your case',
  otherSpecialists: isEs.value ? 'Otros especialistas' : 'Other specialists',
  typeAndFormat: isEs.value ? 'Tipo y formato' : 'Type and format',
  format: isEs.value ? 'Formato' : 'Format',
  inPerson: isEs.value ? 'Presencial' : 'In-person',
  virtual: 'Virtual',
  dateAndTime: isEs.value ? 'Fecha y hora' : 'Date and time',
  date: isEs.value ? 'Fecha' : 'Date',
  preferredTime: isEs.value ? 'Hora preferida' : 'Preferred time',
  selectTime: isEs.value ? 'Seleccionar hora' : 'Select time',
  reason: isEs.value ? 'Motivo' : 'Reason',
  reasonPlaceholder: isEs.value ? 'Describe brevemente tu motivo' : 'Briefly describe your reason',
  booking: isEs.value ? 'Reservando...' : 'Booking...',
  confirmAppointment: isEs.value ? 'Confirmar cita' : 'Confirm appointment',
  noSpecialists: isEs.value ? 'No hay especialistas disponibles ahora mismo.' : 'No specialists are available right now.',
}))

const diagnosisSummary = computed(() => String(route.query.diagnosis || '').toLowerCase())
const concernFromQuery = computed(() => String(route.query.concern || '').toLowerCase())
const skinTypeFromQuery = computed(() => String(route.query.skin_type || route.query.skinType || '').toLowerCase())

const concernLabels = {
  acne: 'Acne',
  manchas: 'Dark spots',
  sensibilidad: 'Sensitivity',
  barrera: 'Skin barrier',
  deshidratacion: 'Hydration',
  arrugas: 'Early lines',
  rojez: 'Redness',
  luminosidad: 'Radiance',
  textura: 'Texture',
  poros: 'Visible pores'
}

const concernAliases = {
  'acne': ['acne'],
  'manchas': ['manchas', 'tono desigual', 'dark spots', 'uneven tone', 'discoloration'],
  'sensibilidad': ['sensibilidad', 'piel sensible', 'sensitivity', 'sensitive skin'],
  'barrera': ['barrera', 'skin barrier', 'barrier'],
  'deshidratacion': ['deshidratacion', 'deshidratación', 'hydration', 'dehydration', 'dehydrated'],
  'arrugas': ['arrugas', 'anti-aging', 'antiaging', 'early lines', 'wrinkles'],
  'rojez': ['rojez', 'redness'],
  'luminosidad': ['luminosidad', 'radiance', 'glow'],
  'textura': ['textura', 'texture'],
  'poros': ['poros', 'pores', 'visible pores']
}

function normalizeConcern(raw) {
  const text = String(raw || '').toLowerCase()
  if (!text) return ''
  for (const [code, aliases] of Object.entries(concernAliases)) {
    if (aliases.some(a => text.includes(a))) return code
  }
  return text
}

function normalizeSkinType(raw) {
  const text = String(raw || '').toLowerCase()
  if (text.includes('grasa') || text.includes('oily')) return 'grasa'
  if (text.includes('seca') || text.includes('dry')) return 'seca'
  if (text.includes('mixta') || text.includes('combination')) return 'mixta'
  if (text.includes('normal')) return 'normal'
  return ''
}

const selectedConcern = computed(() => normalizeConcern(concernFromQuery.value || diagnosisSummary.value))
const selectedSkinType = computed(() => normalizeSkinType(skinTypeFromQuery.value || diagnosisSummary.value))
const displayDiagnosisSummary = computed(() =>
  String(route.query.reason || '').trim()
  || concernLabels[selectedConcern.value]
  || String(route.query.diagnosis || '').trim()
)

const doctors = ref([])
const selectedDoctor = ref(null)
const doctorSelectionLocked = ref(false)
const booked = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')

const form = ref({
  type: 'consulta_general',
  mode: 'presencial',
  date: '',
  time: '',
  reason: ''
})

const appointmentTypes = computed(() => [
  { key: 'consulta_general', label: isEs.value ? 'Consulta general' : 'General consultation' },
  { key: 'seguimiento', label: isEs.value ? 'Seguimiento' : 'Follow-up' },
  { key: 'urgencia', label: isEs.value ? 'Atencion urgente' : 'Urgent care' },
  { key: 'estetica', label: isEs.value ? 'Consulta estetica' : 'Aesthetic consultation' }
])

const timeSlots = [
  { value: '08:00:00', label: '8:00 AM' },
  { value: '09:00:00', label: '9:00 AM' },
  { value: '10:00:00', label: '10:00 AM' },
  { value: '11:00:00', label: '11:00 AM' },
  { value: '14:00:00', label: '2:00 PM' },
  { value: '15:00:00', label: '3:00 PM' },
  { value: '16:00:00', label: '4:00 PM' },
  { value: '17:00:00', label: '5:00 PM' },
]

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const rankedDoctors = computed(() => {
  return doctors.value
    .map(doc => {
      const concernMatch = selectedConcern.value && doc.concerns.includes(selectedConcern.value) ? 1 : 0
      const skinMatch = selectedSkinType.value && doc.skinTypes.includes(selectedSkinType.value) ? 1 : 0
      const concernPriority = doc.concernPriority[selectedConcern.value] || 0
      const skinPriority = doc.skinPriority[selectedSkinType.value] || 0
      const score = concernMatch * 100 + skinMatch * 60 + concernPriority * 4 + skinPriority * 2 + (doc.rating || 0)
      return { ...doc, score, exact: concernMatch || skinMatch }
    })
    .sort((a, b) => b.score - a.score)
})

const recommendedDoctors = computed(() => {
  const exact = rankedDoctors.value.filter(d => d.exact)
  const related = rankedDoctors.value.filter(d => !d.exact)
  return [...exact, ...related].slice(0, 3)
})

const otherDoctors = computed(() => {
  const recIds = new Set(recommendedDoctors.value.map(d => d.id))
  return rankedDoctors.value.filter(d => !recIds.has(d.id))
})

const displayedRecommendedDoctors = computed(() => {
  if (doctorSelectionLocked.value && selectedDoctor.value) return [selectedDoctor.value]
  return recommendedDoctors.value
})

function applyDoctorMode(doc) {
  if (doc?.mode === 'virtual') form.value.mode = 'virtual'
  if (doc?.mode === 'presencial') form.value.mode = 'presencial'
}

function selectDoctor(doc) {
  selectedDoctor.value = doc
  doctorSelectionLocked.value = true
  applyDoctorMode(doc)
}

function showAllDoctors() {
  doctorSelectionLocked.value = false
}

function starText(rating) {
  const r = Math.round(rating || 0)
  return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r))
}

function modalityLabel(mode) {
  const map = { virtual: 'Virtual', presencial: 'In-person', both: 'Virtual and In-person', ambos: 'Virtual and In-person' }
  return map[mode] || mode || 'Both'
}

function specialtyLabel(specialty) {
  const value = String(specialty || '').trim()
  const map = {
    dermatologia: 'Dermatology',
    dermatología: 'Dermatology',
    'dermatología clínica': 'Clinical dermatology',
    'dermatologia clinica': 'Clinical dermatology',
    estetica: 'Aesthetic dermatology',
    estética: 'Aesthetic dermatology'
  }
  return map[value.toLowerCase()] || value || 'Dermatology'
}

function appointmentTypeLabel(type) {
  return appointmentTypes.value.find(t => t.key === type)?.label || type || (isEs.value ? 'Consulta general' : 'General consultation')
}

function resolveDoctorPhoto(doc) {
  const raw =
    doc?.photo_url ||
    doc?.photo ||
    doc?.avatar_url ||
    doc?.avatar ||
    doc?.image_url ||
    doc?.image ||
    '';

  const value = String(raw || '').trim();
  if (!value) return 'https://placehold.co/80x80/dbeafe/1e3a8a?text=Dr';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;

  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const cleanPath = value.replace(/^\/+/, '');
  if (supabaseUrl && !cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  if (supabaseUrl) return `${supabaseUrl}/${cleanPath}`;
  return value;
}

async function loadDoctors() {
  let loaded = []

  // 1) Try backend endpoint first (works even when Supabase client is not available on frontend).
  try {
    const backendDocs = await apiFetch('/specialists')
    if (Array.isArray(backendDocs) && backendDocs.length) {
      loaded = backendDocs.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        mode: d.mode || 'both',
        location: d.location || '',
        availability_note: d.availability_note || '',
        rating: Number(d.rating || 5),
        photo_url: d.photo_url || null,
        concerns: Array.isArray(d.concerns) ? d.concerns : [],
        concernPriority: d.concernPriority || {},
        skinTypes: Array.isArray(d.skinTypes) ? d.skinTypes : [],
        skinPriority: d.skinPriority || {},
      }))
    }
  } catch {}

  // 2) Supabase tables (authoritative source for specialist photos and metadata).
  if (isSupabaseConfigured) {
    const [docsRes, concernsRes, skinTypesRes] = await withTimeout(Promise.all([
      supabase.from('dermatologists').select('*').eq('is_active', true).order('rating', { ascending: false }),
      supabase.from('dermatologist_concerns').select('dermatologist_id,concern_code,priority_score'),
      supabase.from('dermatologist_skin_types').select('dermatologist_id,skin_type_code,priority_score')
    ]), 10000, 'Load specialists')

    if (!docsRes.error && Array.isArray(docsRes.data) && docsRes.data.length) {
      const concernsByDoc = (concernsRes.data || []).reduce((acc, row) => {
        if (!acc[row.dermatologist_id]) acc[row.dermatologist_id] = { list: [], priority: {} }
        acc[row.dermatologist_id].list.push(row.concern_code)
        acc[row.dermatologist_id].priority[row.concern_code] = row.priority_score || 1
        return acc
      }, {})

      const skinsByDoc = (skinTypesRes.data || []).reduce((acc, row) => {
        if (!acc[row.dermatologist_id]) acc[row.dermatologist_id] = { list: [], priority: {} }
        acc[row.dermatologist_id].list.push(row.skin_type_code)
        acc[row.dermatologist_id].priority[row.skin_type_code] = row.priority_score || 1
        return acc
      }, {})

      const supabaseLoaded = (docsRes.data || []).map(d => ({
        ...d,
        photo_url: resolveDoctorPhoto(d),
        concerns: concernsByDoc[d.id]?.list || [],
        concernPriority: concernsByDoc[d.id]?.priority || {},
        skinTypes: skinsByDoc[d.id]?.list || [],
        skinPriority: skinsByDoc[d.id]?.priority || {}
      }))

      // If backend already provided rows, enrich/override them with Supabase metadata and photos by id.
      if (loaded.length) {
        const byId = new Map(supabaseLoaded.map((d) => [String(d.id), d]))
        loaded = loaded.map((d) => {
          const match = byId.get(String(d.id))
          return match ? { ...d, ...match, photo_url: match.photo_url || d.photo_url } : d
        })
        // Also append any specialists only present in Supabase.
        const loadedIds = new Set(loaded.map((d) => String(d.id)))
        for (const s of supabaseLoaded) {
          if (!loadedIds.has(String(s.id))) loaded.push(s)
        }
      } else {
        loaded = supabaseLoaded
      }
    }
  }

  // 3) Last-resort seed so UI is never blank.
  if (!loaded.length) {
    loaded = [
      { id: 1, name: 'Dra. Ana Martinez', specialty: 'Dermatologia', mode: 'both', location: 'Santo Domingo', rating: 4.9, photo_url: null, concerns: [], concernPriority: {}, skinTypes: [], skinPriority: {} },
      { id: 2, name: 'Dr. Carlos Reyes', specialty: 'Dermatologia clinica', mode: 'presencial', location: 'Santiago', rating: 4.8, photo_url: null, concerns: [], concernPriority: {}, skinTypes: [], skinPriority: {} },
      { id: 3, name: 'Dra. Laura Gomez', specialty: 'Dermatologia estetica', mode: 'virtual', location: 'Online', rating: 4.7, photo_url: null, concerns: [], concernPriority: {}, skinTypes: [], skinPriority: {} },
    ]
  }

  doctors.value = loaded

  if (!selectedDoctor.value && recommendedDoctors.value.length) {
    selectedDoctor.value = recommendedDoctors.value[0]
    applyDoctorMode(selectedDoctor.value)
  }
}

async function bookAppointment() {
  if (!selectedDoctor.value) return (errorMsg.value = isEs.value ? 'Selecciona un especialista.' : 'Select a specialist.')
  if (!form.value.date) return (errorMsg.value = isEs.value ? 'Selecciona una fecha.' : 'Select a date.')

  isSubmitting.value = true
  errorMsg.value = ''

  const userId = auth.user?.value?.id || null
  const confirmationCode = `APT-${Date.now().toString().slice(-8)}`

  const aptData = {
    user_id: userId,
    dermatologist_id: selectedDoctor.value.id,
    appointment_type: form.value.type,
    mode: form.value.mode,
    scheduled_date: form.value.date,
    scheduled_time: form.value.time || null,
    reason: form.value.reason || null,
    notes: displayDiagnosisSummary.value || null,
    urgency: form.value.type === 'urgencia' ? 'high' : 'normal',
    status: 'pending',
    confirmation_code: confirmationCode,
    analysis_id: route.query.analysis_id || route.query.analysisId || null
  }

  try {
    let savedAppointment = aptData

    if (isSupabaseConfigured) {
      if (!userId) {
        throw new Error(isEs.value ? 'No se encontro un usuario autenticado. Inicia sesion para guardar la cita en la base de datos.' : 'No authenticated user found. Sign in to save the appointment to the database.')
      }
      const { data: insertedAppointment, error } = await withTimeout(supabase
        .from('appointments')
        .insert([aptData])
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
          created_at
        `)
        .single(), 4000, 'Save appointment')
      if (error) throw error
      savedAppointment = insertedAppointment || aptData
    }

    history.saveAppointment?.({ ...savedAppointment, doctor_name: selectedDoctor.value.name })
    const confirmationUrl = buildAppointmentConfirmationUrl(savedAppointment)

    const currentUser = auth.user?.value || {}
    const userEmail = currentUser.email || ''
    const userName =
      currentUser.first_name ||
      currentUser.firstName ||
      currentUser.name ||
      'Patient'

    try {
      if (userEmail) {
        withTimeout(sendAppointmentConfirmationEmail({
          to_email: userEmail,
          to_name: userName,
          appointment_id: savedAppointment.id || aptData.confirmation_code,
          confirmation_code: savedAppointment.confirmation_code || aptData.confirmation_code,
          appointment_date: savedAppointment.scheduled_date || aptData.scheduled_date,
          appointment_time: savedAppointment.scheduled_time || aptData.scheduled_time || (isEs.value ? 'Pendiente de confirmacion' : 'Pending confirmation'),
          appointment_type: appointmentTypeLabel(savedAppointment.appointment_type || aptData.appointment_type),
          appointment_mode: savedAppointment.mode || aptData.mode,
          appointment_reason: savedAppointment.reason || aptData.reason || (isEs.value ? 'Consulta dermatologica' : 'Dermatology consultation'),
          appointment_notes: savedAppointment.notes || aptData.notes || '',
          appointment_urgency: savedAppointment.urgency || aptData.urgency || 'normal',
          appointment_status: savedAppointment.status || aptData.status || 'pending',
          dermatologist_id: savedAppointment.dermatologist_id || aptData.dermatologist_id,
          doctor_name: selectedDoctor.value?.name || '',
          doctor_specialty: specialtyLabel(selectedDoctor.value?.specialty) || '',
          doctor_location: selectedDoctor.value?.location || '',
          analysis_id: savedAppointment.analysis_id || aptData.analysis_id || '',
          support_email: 'soporte@pharmadermrd.com',
          reply_to: 'soporte@pharmadermrd.com',
          confirmation_url: confirmationUrl,
        }, 'en'), 4000, 'Appointment confirmation email')
          .then((emailResult) => {
            if (!emailResult?.ok) {
              console.warn('[AppointmentBooking] Appointment email was not sent:', emailResult?.message || emailResult)
            }
          })
          .catch((emailError) => {
            console.warn('[AppointmentBooking] Appointment email failed:', emailError?.message || emailError)
          })
      } else {
        console.warn('[AppointmentBooking] No appointment email was sent because the user has no email.')
      }
    } catch (emailError) {
      console.warn('[AppointmentBooking] Appointment email failed:', emailError?.message || emailError)
    }

    booked.value = true
    await nextTick()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch (e) {
    console.warn('[AppointmentBooking] Save failed:', e)
    errorMsg.value = e?.message || (isEs.value ? 'No se pudo guardar la cita en este momento.' : 'The appointment could not be saved right now.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  nextTick(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  if (!form.value.reason) {
    form.value.reason = displayDiagnosisSummary.value
  }
  try {
    await loadDoctors()
  } catch (e) {
    console.warn('[AppointmentBooking] load failed', e)
  }
})
</script>

<style scoped>
.booking-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.container { max-width: 900px; margin: 0 auto; padding: 0 16px; }
.page-header { display: flex; align-items: flex-start; gap: 14px; padding: 28px 0 20px; }
.back-btn { width: 38px; height: 38px; border: 1px solid #e2e8f0; background: white; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-sub { font-size: 0.85rem; color: #64748b; margin: 0; }
.booking-section { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
.booking-section h2 { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 16px; display: flex; align-items: center; gap: 10px; }
.section-heading-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.section-heading-row h2 { margin: 0; }
.btn-change-doctor { border: 1px solid #bae6fd; background: #f0f9ff; color: #0369a1; border-radius: 999px; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
.btn-change-doctor:hover { background: #e0f2fe; }
.step-num { display: inline-flex; width: 26px; height: 26px; border-radius: 50%; background: #16a6e2; color: white; font-size: 0.8rem; align-items: center; justify-content: center; }
.doctors-grid { display: grid; gap: 12px; }
.doctor-card { display: grid; grid-template-columns: 64px 1fr; gap: 14px; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; cursor: pointer; }
.doctor-card.selected { border-color: #16a6e2; background: #f0f9ff; }
.doctor-photo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; }
.doctor-name { font-weight: 800; font-size: 0.95rem; color: #0f172a; margin: 0 0 2px; }
.doctor-specialty { font-size: 0.78rem; color: #64748b; margin: 0 0 4px; }
.doctor-location { font-size: 0.78rem; color: #94a3b8; margin: 0 0 4px; }
.doctor-rating { margin-bottom: 4px; }
.stars { color: #f59e0b; font-size: 0.85rem; }
.modality-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dbeafe; color: #1e40af; }
.recommend-badge { display: inline-block; margin-left: 8px; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #dcfce7; color: #166534; }
.options-row { display: flex; gap: 10px; flex-wrap: wrap; }
.option-card { display: flex; align-items: center; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; cursor: pointer; }
.option-card input { display: none; }
.option-card.selected { border-color: #16a6e2; background: #f0f9ff; }
.option-card.disabled { opacity: 0.4; cursor: not-allowed; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field input, .form-field select { height: 42px; border: 1px solid #d1d5db; padding: 0 12px; border-radius: 8px; }
.reason-input { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; box-sizing: border-box; }
.form-error { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 10px; margin-bottom: 14px; }
.booking-footer { padding: 8px 0 20px; }
.btn-confirm { width: 100%; height: 52px; background: #16a6e2; color: white; border: none; border-radius: 12px; font-weight: 800; }
.confirm-box { text-align: center; background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 48px 24px; margin-top: 20px; }
.confirm-icon { font-size: 72px; color: #22c55e; display: block; margin-bottom: 16px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
