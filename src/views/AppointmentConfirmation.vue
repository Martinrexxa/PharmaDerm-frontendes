<template>
  <main class="confirmation-page">
    <section class="confirmation-card">
      <img :src="logoIconSrc" alt="PharmaDerm" class="logo" />

      <div class="status-mark" :class="statusClass">
        <span class="material-symbols-outlined">{{ statusIcon }}</span>
      </div>

      <p class="eyebrow">Appointment Confirmation</p>
      <h1>{{ title }}</h1>
      <p class="message">{{ message }}</p>

      <div v-if="appointment" class="details">
        <div class="detail-row">
          <span>Confirmation Code</span>
          <strong>{{ appointment.confirmation_code }}</strong>
        </div>
        <div class="detail-row">
          <span>Date</span>
          <strong>{{ formatDate(appointment.scheduled_date) }}</strong>
        </div>
        <div class="detail-row">
          <span>Time</span>
          <strong>{{ appointment.scheduled_time || 'To be confirmed' }}</strong>
        </div>
        <div class="detail-row">
          <span>Appointment Type</span>
          <strong>{{ appointmentTypeLabel(appointment.appointment_type) }}</strong>
        </div>
        <div class="detail-row">
          <span>Mode</span>
          <strong>{{ modalityLabel(appointment.mode) }}</strong>
        </div>
        <div class="detail-row">
          <span>Status</span>
          <strong>{{ statusLabel(appointment.status) }}</strong>
        </div>
      </div>

      <div class="confirm-actions">
        <button type="button" class="btn-outline" @click="router.push('/inicio')">Go home</button>
        <button type="button" class="btn-primary" @click="router.push('/diagnostics')">Go to diagnostics</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase, isSupabaseConfigured, API_BASE_URL } from '../lib/supabaseClient.js'
import { withTimeout } from '../utils/async.js'
import logoIconSrc from '../assets/logo -Photoroom.png'

const route = useRoute()
const router = useRouter()

const state = ref('loading')
const appointment = ref(null)

const appointmentId = computed(() => String(route.query.appointment_id || '').trim())
const code = computed(() => String(route.query.code || '').trim())

const content = {
  loading: {
    title: 'Confirming your appointment...',
    message: 'Please wait while we verify your confirmation link.',
    icon: 'progress_activity',
  },
  success: {
    title: 'Your appointment has been confirmed.',
    message: 'Thank you. Your appointment status is now confirmed.',
    icon: 'check_circle',
  },
  already: {
    title: 'Your appointment is already confirmed.',
    message: 'This confirmation link was already used successfully.',
    icon: 'verified',
  },
  invalid: {
    title: 'Invalid confirmation link.',
    message: 'The link is missing required confirmation information.',
    icon: 'error',
  },
  notFound: {
    title: 'We could not verify this appointment. Please contact support.',
    message: 'The appointment ID and confirmation code did not match our records.',
    icon: 'support_agent',
  },
  locked: {
    title: 'This appointment can no longer be confirmed.',
    message: 'The appointment has already moved to a final status.',
    icon: 'event_busy',
  },
  updateError: {
    title: 'We could not confirm your appointment automatically. Please contact support.',
    message: 'Your appointment was found, but the status update could not be completed.',
    icon: 'warning',
  },
}

const title = computed(() => content[state.value]?.title || content.notFound.title)
const message = computed(() => content[state.value]?.message || content.notFound.message)
const statusIcon = computed(() => content[state.value]?.icon || 'info')
const statusClass = computed(() => ({
  'is-loading': state.value === 'loading',
  'is-success': state.value === 'success' || state.value === 'already',
  'is-warning': state.value === 'locked' || state.value === 'updateError',
  'is-error': state.value === 'invalid' || state.value === 'notFound',
}))

function appointmentTypeLabel(type) {
  const map = {
    consulta_general: 'General consultation',
    seguimiento: 'Follow-up',
    urgencia: 'Urgent care',
    estetica: 'Aesthetic consultation',
  }
  return map[type] || type || 'General consultation'
}

function modalityLabel(mode) {
  const map = {
    presencial: 'In-person',
    virtual: 'Virtual',
    both: 'Virtual and In-person',
    ambos: 'Virtual and In-person',
  }
  return map[String(mode || '').toLowerCase()] || mode || 'To be confirmed'
}

function statusLabel(status) {
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }
  return map[status] || status || 'Pending'
}

function formatDate(value) {
  if (!value) return 'To be confirmed'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function confirmAppointment() {
  state.value = 'loading'
  appointment.value = null

  if (!appointmentId.value || !code.value) {
    state.value = 'invalid'
    return
  }

  // Backend public confirmation flow first.
  try {
    if (API_BASE_URL && !String(API_BASE_URL).includes('localhost')) {
      const res = await fetch(`${API_BASE_URL}/appointments/confirm?appointment_id=${encodeURIComponent(appointmentId.value)}&code=${encodeURIComponent(code.value)}`)
      const payload = await res.json().catch(() => ({}))
      const st = payload?.status
      if (st === 'success') { appointment.value = payload.appointment || null; state.value = 'success'; return }
      if (st === 'already') { appointment.value = payload.appointment || null; state.value = 'already'; return }
      if (st === 'not_found') { state.value = 'notFound'; return }
      if (st === 'locked') { appointment.value = payload.appointment || null; state.value = 'locked'; return }
      if (st === 'invalid') { state.value = 'invalid'; return }
    }
  } catch {
    // fallback to Supabase flow
  }

  if (!isSupabaseConfigured) {
    state.value = 'updateError'
    return
  }

  try {
    const { data, error } = await withTimeout(supabase
    .from('appointments')
    .select(`
      id,
      confirmation_code,
      status,
      scheduled_date,
      scheduled_time,
      appointment_type,
      mode,
      reason,
      urgency
    `)
    .eq('id', appointmentId.value)
    .eq('confirmation_code', code.value)
    .single(), 4000, 'Verify appointment')

  if (error || !data) {
    state.value = 'notFound'
    return
  }

  appointment.value = data

  if (data.status === 'confirmed') {
    state.value = 'already'
    return
  }

  if (data.status === 'cancelled' || data.status === 'completed') {
    state.value = 'locked'
    return
  }

  if (data.status !== 'pending') {
    state.value = 'locked'
    return
  }

  const { error: updateError } = await withTimeout(supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId.value)
    .eq('confirmation_code', code.value)
    .eq('status', 'pending'), 4000, 'Confirm appointment')

  if (updateError) {
    console.warn('[AppointmentConfirmation] Status update failed:', updateError.message || updateError)
    state.value = 'updateError'
    return
  }

  appointment.value = { ...data, status: 'confirmed' }
  state.value = 'success'
  } catch (error) {
    console.warn('[AppointmentConfirmation] Confirmation flow failed:', error?.message || error)
    state.value = 'updateError'
  } finally {
    await nextTick()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
}

onMounted(confirmAppointment)
watch(() => route.fullPath, confirmAppointment)
</script>

<style scoped>
.confirmation-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4fbff 0%, #f8fafc 100%);
  display: grid;
  place-items: center;
  padding: 32px 16px;
  color: #0f172a;
}

.confirmation-card {
  width: min(680px, 100%);
  background: rgba(255,255,255,0.96);
  border: 1px solid #dbeafe;
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(0, 78, 146, 0.12);
  padding: 32px;
  text-align: center;
}

.logo {
  width: 58px;
  height: 58px;
  object-fit: contain;
  border-radius: 14px;
  margin-bottom: 18px;
}

.status-mark {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  background: #e0f2fe;
  color: #005187;
}

.status-mark span {
  font-size: 34px;
}

.status-mark.is-loading span {
  animation: spin 1s linear infinite;
}

.status-mark.is-success { background: #dcfce7; color: #15803d; }
.status-mark.is-warning { background: #fef3c7; color: #92400e; }
.status-mark.is-error { background: #fee2e2; color: #991b1b; }

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  font-weight: 800;
  color: #16a6e2;
}

h1 {
  margin: 0;
  color: #004e92;
  font-size: clamp(1.7rem, 4vw, 2.5rem);
  line-height: 1.15;
}

.message {
  margin: 14px auto 0;
  max-width: 520px;
  color: #64748b;
  line-height: 1.65;
}

.details {
  margin-top: 26px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: #64748b;
  font-size: 0.9rem;
}

.detail-row strong {
  color: #0f172a;
  text-align: right;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 26px;
}

.btn-primary,
.btn-outline {
  min-height: 50px;
  border-radius: 0;
  padding: 12px 18px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  border: 1px solid #16a6e2;
  background: #16a6e2;
  color: white;
}

.btn-outline {
  border: 1px solid #94a3b8;
  background: white;
  color: #0f172a;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .confirmation-card { padding: 24px 18px; }
  .detail-row { flex-direction: column; gap: 4px; }
  .detail-row strong { text-align: left; }
  .confirm-actions { grid-template-columns: 1fr; }
}
</style>
