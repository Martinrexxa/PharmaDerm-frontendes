<template>
  <div class="appointments-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/perfil')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Mis Citas</h1>
        <button class="btn-new-apt" @click="goToBooking">
          <span class="material-symbols-outlined">add</span>
          Nueva cita
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando tus citas...</p>
      </div>

      <div v-else-if="appointments.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">clinical_notes</span>
        <h2>No tienes citas programadas</h2>
        <p>Agenda una cita con un especialista dermatológico.</p>
        <button class="btn-primary" @click="goToBooking">Agendar cita</button>
        <button class="btn-secondary" style="margin-top:0.75rem" @click="router.push('/diagnostics')">
          Ir a diagnóstico
        </button>
      </div>

      <div v-else class="apt-list">
        <article v-for="apt in appointments" :key="apt.id" class="apt-card">
          <div class="apt-card__photo">
            <img
              :src="apt.doctor_photo || DOCTOR_PLACEHOLDER"
              :alt="apt.doctor_name || 'Especialista'"
            />
          </div>

          <div class="apt-card__body">
            <p class="apt-doctor">{{ apt.doctor_name || apt.specialist_name || 'Especialista' }}</p>
            <p class="apt-specialty">{{ apt.doctor_specialty || apt.specialty || 'Dermatología' }}</p>
            <div class="apt-meta-row">
              <span class="apt-meta"><span class="material-symbols-outlined">calendar_month</span>{{ formatDate(apt.scheduled_date) }}</span>
              <span class="apt-meta"><span class="material-symbols-outlined">schedule</span>{{ apt.scheduled_time || 'Por confirmar' }}</span>
            </div>
            <div class="apt-meta-row">
              <span class="apt-meta"><span class="material-symbols-outlined">{{ (apt.mode || '').toLowerCase() === 'virtual' ? 'videocam' : 'location_on' }}</span>{{ modalityLabel(apt.mode) }}</span>
              <span v-if="apt.appointment_type" class="apt-meta"><span class="material-symbols-outlined">medical_services</span>{{ apt.appointment_type }}</span>
            </div>
            <p v-if="apt.reason" class="apt-reason">
              <em>{{ apt.reason }}</em>
            </p>
            <p v-if="apt.notes" class="apt-notes">
              Notas: {{ apt.notes }}
            </p>
            <p v-if="apt.confirmation_code" class="apt-code">
              Codigo: <strong>{{ apt.confirmation_code }}</strong>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const router = useRouter()
const auth = useAuthStore()

const appointments = ref([])
const isLoading = ref(true)
const DOCTOR_PLACEHOLDER = 'https://placehold.co/80x80/e2e8f0/334155?text=DR'

function formatDate(iso) {
  if (!iso) return 'Por confirmar'
  return new Date(iso).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function aptStatusLabel(status) {
  const map = {
    pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada',
    cancelled: 'Cancelada', rescheduled: 'Reprogramada',
  }
  return map[status] || status || 'Pendiente'
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
  if (m === 'presencial') return 'Presencial'
  if (m === 'both' || m === 'ambos') return 'Virtual y Presencial'
  return 'Por confirmar'
}

function bookingRoute() {
  return '/citas/agendar'
}

function goToBooking() {
  router.push(bookingRoute())
}

async function loadAppointments() {
  isLoading.value = true
  try {
    if (isSupabaseConfigured) {
      const userId = auth.user?.value?.id
      if (userId) {
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
          .eq('user_id', userId)
          .order('scheduled_date', { ascending: false })
          .order('scheduled_time', { ascending: false })

        if (!error) {
          appointments.value = (data || [])
            .filter(a => a.user_id === userId)
            .map(a => ({
              ...a,
              doctor_name: a.dermatologists?.name || 'Especialista',
              doctor_specialty: a.dermatologists?.specialty || 'Dermatologia',
              doctor_photo: a.dermatologists?.photo_url || DOCTOR_PLACEHOLDER,
              mode: a.mode || a.dermatologists?.mode || null,
            }))
          return
        }
      }
    }

    appointments.value = []
  } catch (e) {
    console.warn('[MisCitas] Error cargando citas:', e)
    appointments.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAppointments)
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
