<template>
  <div class="appointments-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/perfil')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>{{ isEs ? 'Mis citas' : 'My Appointments' }}</h1>
        <button class="btn-new-apt" @click="goToBooking">
          <span class="material-symbols-outlined">add</span>
          {{ isEs ? 'Nueva cita' : 'New appointment' }}
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ isEs ? 'Cargando tus citas...' : 'Loading your appointments...' }}</p>
      </div>

      <div v-else-if="fetchError" class="empty-state">
        <span class="material-symbols-outlined empty-icon">warning</span>
        <h2>{{ isEs ? 'No se pudieron cargar tus citas' : 'Could not load your appointments' }}</h2>
        <p>{{ fetchError }}</p>
        <button class="btn-primary" @click="loadAppointments">{{ isEs ? 'Reintentar' : 'Retry' }}</button>
      </div>

      <div v-else-if="appointments.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">clinical_notes</span>
        <h2>{{ isEs ? 'No tienes citas programadas' : 'You have no scheduled appointments' }}</h2>
        <p>{{ isEs ? 'Reserva una cita con un especialista en dermatología.' : 'Book an appointment with a dermatology specialist.' }}</p>
        <button class="btn-primary" @click="goToBooking">{{ isEs ? 'Reservar cita' : 'Book appointment' }}</button>
        <button class="btn-secondary" style="margin-top:0.75rem" @click="router.push('/diagnostics')">
          {{ isEs ? 'Ir a diagnóstico' : 'Go to diagnostics' }}
        </button>
      </div>

      <div v-else class="apt-list">
        <article v-for="apt in appointments" :key="apt.id" class="apt-card">
          <div class="apt-card__photo">
            <img
              :src="apt.doctor_photo || DOCTOR_PLACEHOLDER"
              :alt="apt.doctor_name || 'Specialist'"
            />
          </div>

          <div class="apt-card__body">
            <p class="apt-doctor">{{ apt.doctor_name || apt.specialist_name || 'Specialist' }}</p>
            <p class="apt-specialty">{{ specialtyLabel(apt.doctor_specialty || apt.specialty) }}</p>
            <div class="apt-meta-row">
              <span class="apt-meta"><span class="material-symbols-outlined">calendar_month</span>{{ formatDate(apt.scheduled_date) }}</span>
              <span class="apt-meta"><span class="material-symbols-outlined">schedule</span>{{ apt.scheduled_time || (isEs ? 'Por confirmar' : 'To be confirmed') }}</span>
            </div>
            <div class="apt-meta-row">
              <span class="apt-meta"><span class="material-symbols-outlined">{{ (apt.mode || '').toLowerCase() === 'virtual' ? 'videocam' : 'location_on' }}</span>{{ modalityLabel(apt.mode) }}</span>
              <span v-if="apt.appointment_type" class="apt-meta"><span class="material-symbols-outlined">medical_services</span>{{ appointmentTypeLabel(apt.appointment_type) }}</span>
            </div>
            <p v-if="apt.reason" class="apt-reason">
              <em>{{ concernLabel(apt.reason) }}</em>
            </p>
            <p v-if="apt.notes" class="apt-notes">
              {{ isEs ? 'Notas' : 'Notes' }}: {{ concernLabel(apt.notes) }}
            </p>
            <p v-if="apt.confirmation_code" class="apt-code">
              {{ isEs ? 'Código' : 'Code' }}: <strong>{{ apt.confirmation_code }}</strong>
            </p>
          </div>

          <div class="apt-card__status">
            <span class="apt-status" :class="aptStatusClass(apt.status)">
              {{ aptStatusLabel(apt.status) }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { apiFetch } from '../services/apiClient.js'
import { useI18n } from '../lib/i18n.js'

const router = useRouter()
const auth = useAuthStore()
const { lang } = useI18n()
const isEs = computed(() => lang.value === 'es')
const userId = computed(() => auth.user?.value?.id || null)

const appointments = ref([])
const isLoading = ref(true)
const fetchError = ref(null)
const DOCTOR_PLACEHOLDER = 'https://placehold.co/80x80/e2e8f0/334155?text=DR'
let loadToken = 0

watch(userId, async (newUserId) => {
  if (newUserId) {
    await loadAppointments({ scrollTop: true })
  } else {
    appointments.value = []
    isLoading.value = false
  }
}, { immediate: true })

function formatDate(iso) {
  if (!iso) return isEs.value ? 'Por confirmar' : 'To be confirmed'
  return new Date(iso).toLocaleDateString(isEs.value ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function aptStatusLabel(status) {
  const map = {
    pending: isEs.value ? 'Pendiente' : 'Pending',
    confirmed: isEs.value ? 'Confirmada' : 'Confirmed',
    completed: isEs.value ? 'Completada' : 'Completed',
    cancelled: isEs.value ? 'Cancelada' : 'Cancelled',
    rescheduled: isEs.value ? 'Reagendada' : 'Rescheduled',
  }
  return map[status] || status || (isEs.value ? 'Pendiente' : 'Pending')
}

function aptStatusClass(status) {
  const map = {
    pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed',
    cancelled: 'status-cancelled', rescheduled: 'status-pending',
  }
  return map[status] || 'status-pending'
}

function modalityLabel(mode) {
  const m = String(mode || '').toLowerCase()
  if (m === 'virtual') return 'Virtual'
  if (m === 'presencial') return isEs.value ? 'Presencial' : 'In-person'
  if (m === 'both' || m === 'ambos') return isEs.value ? 'Virtual y presencial' : 'Virtual and In-person'
  return isEs.value ? 'Por confirmar' : 'To be confirmed'
}

function appointmentTypeLabel(type) {
  const map = {
    consulta_general: 'General consultation',
    seguimiento: 'Follow-up',
    urgencia: 'Urgent care',
    estetica: 'Aesthetic consultation',
  }
  return map[type] || type || 'General consultation'
}

function specialtyLabel(specialty) {
  const value = String(specialty || '').trim()
  const map = {
    dermatologia: 'Dermatology',
    dermatología: 'Dermatology',
    'dermatología clínica': 'Clinical dermatology',
    'dermatologia clinica': 'Clinical dermatology',
    estetica: 'Aesthetic dermatology',
    estética: 'Aesthetic dermatology',
  }
  return map[value.toLowerCase()] || value || 'Dermatology'
}

function concernLabel(value) {
  const text = String(value || '').trim()
  const map = {
    luminosidad: 'Radiance',
    deshidratacion: 'Hydration',
    hidratacion: 'Hydration',
    manchas: 'Dark spots',
    sensibilidad: 'Sensitivity',
    barrera: 'Skin barrier',
    arrugas: 'Early lines',
    poros: 'Visible pores',
    textura: 'Texture',
    acne: 'Acne',
    rojez: 'Redness',
  }
  return map[text.toLowerCase()] || text
}

function bookingRoute() {
  return '/citas/agendar'
}

function goToBooking() {
  router.push(bookingRoute())
}

async function loadAppointments({ scrollTop = false } = {}) {
  const token = ++loadToken
  isLoading.value = true
  fetchError.value = null
  try {
    if (!userId.value) {
      if (token !== loadToken) return
      fetchError.value = 'No authenticated user was found. Please sign in again.'
      appointments.value = []
      return
    }

    // Backend mode first (Render API)
    try {
      const sess = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null')
      if (sess?.token) {
        const payload = await apiFetch('/appointments')
        const backendAppointments = Array.isArray(payload?.appointments) ? payload.appointments : []
        if (token !== loadToken) return
        appointments.value = backendAppointments.map((a) => ({
          ...a,
          doctor_name: a.doctor_name || 'Specialist',
          doctor_specialty: specialtyLabel(a.doctor_specialty),
          doctor_photo: a.doctor_photo || DOCTOR_PLACEHOLDER,
          mode: a.mode || a.doctor_mode || null,
        }))
        return
      }
    } catch {
      // fallback to Supabase
    }

    if (!isSupabaseConfigured) {
      if (token !== loadToken) return
      fetchError.value = 'The app is not connected to Supabase. Check your .env configuration.'
      appointments.value = []
      return
    }

    const { data, error } = await supabase
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
        dermatologists (id, name, specialty, mode, photo_url)
      `)
      .eq('user_id', userId.value)
      .order('scheduled_date', { ascending: false })
      .order('scheduled_time', { ascending: false })

    if (error) {
      if (token !== loadToken) return
      fetchError.value = `Supabase: ${error.message || 'Unknown error'}`
      appointments.value = []
      return
    }

    if (token !== loadToken) return
    appointments.value = (data || []).map(a => ({
      ...a,
      doctor_name: a.dermatologists?.name || 'Specialist',
      doctor_specialty: specialtyLabel(a.dermatologists?.specialty),
      doctor_photo: a.dermatologists?.photo_url || DOCTOR_PLACEHOLDER,
      mode: a.mode || a.dermatologists?.mode || null,
    }))
  } catch (e) {
    console.warn('[MisAppointments] Error loading appointments:', e)
    if (token !== loadToken) return
    fetchError.value = e?.message || 'Error loading appointments'
    appointments.value = []
  } finally {
    if (token === loadToken) {
      isLoading.value = false
      if (scrollTop) {
        await nextTick()
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }
  }
}

function reloadWhenVisible() {
  if (!document.hidden && userId.value) loadAppointments()
}

window.addEventListener('focus', reloadWhenVisible)
document.addEventListener('visibilitychange', reloadWhenVisible)

onBeforeUnmount(() => {
  window.removeEventListener('focus', reloadWhenVisible)
  document.removeEventListener('visibilitychange', reloadWhenVisible)
})
</script>

<style scoped>
.appointments-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.container { max-width: 900px; margin: 0 auto; padding: 0 16px; }

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 28px 0 20px;
}

.back-btn {
  width: 38px; height: 38px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #475569;
  flex-shrink: 0;
}

.page-header h1 { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0; flex: 1; }

.btn-new-apt {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #16a6e2;
  color: white;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.loading-state { text-align: center; padding: 5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #16a6e2; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 5rem 1rem; }
.empty-icon { font-size: 64px; color: #16a6e2; display: block; margin-bottom: 1rem; }
.empty-state h2 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; }
.empty-state p { color: #64748b; margin: 0 0 1.5rem; }

.apt-list { display: grid; gap: 1rem; }

.apt-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 16px;
  align-items: start;
}

.apt-card__photo img {
  width: 64px; height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.apt-doctor { font-weight: 800; font-size: 1rem; color: #0f172a; margin: 0 0 2px; }
.apt-specialty { font-size: 0.8rem; color: #94a3b8; margin: 0 0 8px; }

.apt-meta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 6px; }
.apt-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: #475569;
}
.apt-meta .material-symbols-outlined { font-size: 16px; color: #16a6e2; }
.apt-reason { font-size: 0.82rem; color: #64748b; margin: 6px 0 0; font-style: italic; }
.apt-notes { font-size: 0.8rem; color: #475569; margin: 6px 0 0; }
.apt-code { font-size: 0.78rem; color: #334155; margin: 6px 0 0; }

.apt-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.status-pending   { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #d1fae5; color: #065f46; }
.status-completed { background: #dbeafe; color: #1e40af; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

.btn-primary { background: #16a6e2; color: white; border: none; padding: 0.85rem 1.75rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 0.95rem; }
.btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; padding: 0.85rem 1.75rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.95rem; display: block; }

@media (max-width: 600px) {
  .apt-card { grid-template-columns: 56px 1fr; }
  .apt-card__status { grid-column: 1 / -1; }
}
</style>
