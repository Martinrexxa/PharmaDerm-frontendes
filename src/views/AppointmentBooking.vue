<template>
  <div class="booking-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.back()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1>Agendar Cita</h1>
          <p class="page-sub" v-if="diagnosisSummary">
            Basado en tu diagnóstico: <em>{{ diagnosisSummary }}</em>
          </p>
        </div>
      </div>

      <div v-if="booked" class="confirm-box">
        <span class="material-symbols-outlined confirm-icon">check_circle</span>
        <h2>Cita agendada</h2>
        <p>Tu cita con <strong>{{ selectedDoctor?.name }}</strong> ha sido registrada.</p>
      </div>

      <template v-else>
        <section class="booking-section">
          <h2><span class="step-num">1</span> Especialistas recomendados</h2>
          <div class="doctors-grid" v-if="recommendedDoctors.length">
            <div
              v-for="doc in recommendedDoctors"
              :key="doc.id"
              class="doctor-card"
              :class="{ selected: selectedDoctor?.id === doc.id }"
              @click="selectedDoctor = doc"
            >
              <img :src="doc.photo_url || 'https://placehold.co/80x80/dbeafe/1e3a8a?text=Dr'" :alt="doc.name" class="doctor-photo" />
              <div class="doctor-info">
                <p class="doctor-name">{{ doc.name }}</p>
                <p class="doctor-specialty">{{ doc.specialty }}</p>
                <p class="doctor-location">{{ doc.location }}</p>
                <div class="doctor-rating"><span class="stars">{{ starText(doc.rating) }}</span></div>
                <span class="modality-badge">{{ modalityLabel(doc.mode) }}</span>
                <span class="recommend-badge">Recomendado para tu caso</span>
              </div>
            </div>
          </div>
        </section>

        <section class="booking-section" v-if="otherDoctors.length">
          <h2>Otros especialistas</h2>
          <div class="doctors-grid">
            <div
              v-for="doc in otherDoctors"
              :key="doc.id"
              class="doctor-card"
              :class="{ selected: selectedDoctor?.id === doc.id }"
              @click="selectedDoctor = doc"
            >
              <img :src="doc.photo_url || 'https://placehold.co/80x80/dbeafe/1e3a8a?text=Dr'" :alt="doc.name" class="doctor-photo" />
              <div class="doctor-info">
                <p class="doctor-name">{{ doc.name }}</p>
                <p class="doctor-specialty">{{ doc.specialty }}</p>
                <p class="doctor-location">{{ doc.location }}</p>
                <div class="doctor-rating"><span class="stars">{{ starText(doc.rating) }}</span></div>
                <span class="modality-badge">{{ modalityLabel(doc.mode) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor">
          <h2><span class="step-num">2</span> Tipo y modalidad</h2>
          <div class="options-row">
            <label v-for="t in appointmentTypes" :key="t.key" class="option-card" :class="{ selected: form.type === t.key }">
              <input type="radio" :value="t.key" v-model="form.type" />
              <span>{{ t.label }}</span>
            </label>
          </div>

          <h3 style="margin-top:14px;">Modalidad</h3>
          <div class="options-row">
            <label class="option-card" :class="{ selected: form.mode === 'presencial', disabled: selectedDoctor.mode === 'virtual' }">
              <input type="radio" value="presencial" v-model="form.mode" :disabled="selectedDoctor.mode === 'virtual'" />Presencial
            </label>
            <label class="option-card" :class="{ selected: form.mode === 'virtual', disabled: selectedDoctor.mode === 'presencial' }">
              <input type="radio" value="virtual" v-model="form.mode" :disabled="selectedDoctor.mode === 'presencial'" />Virtual
            </label>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor && form.type">
          <h2><span class="step-num">3</span> Fecha y hora</h2>
          <div class="form-grid">
            <div class="form-field">
              <label>Fecha</label>
              <input type="date" v-model="form.date" :min="minDate" />
            </div>
            <div class="form-field">
              <label>Hora preferida</label>
              <select v-model="form.time">
                <option value="">Seleccionar hora</option>
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
        </section>

        <section class="booking-section" v-if="selectedDoctor && form.type && form.date">
          <h2><span class="step-num">4</span> Motivo</h2>
          <textarea v-model="form.reason" class="reason-input" rows="4" placeholder="Describe brevemente tu motivo"></textarea>
        </section>

        <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

        <div class="booking-footer" v-if="selectedDoctor">
          <button class="btn-confirm" :disabled="isSubmitting" @click="bookAppointment">{{ isSubmitting ? 'Agendando...' : 'Confirmar cita' }}</button>
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

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const history = useHistoryStore()

const diagnosisSummary = computed(() => String(route.query.diagnosis || '').toLowerCase())
const concernFromQuery = computed(() => String(route.query.concern || '').toLowerCase())
const skinTypeFromQuery = computed(() => String(route.query.skin_type || route.query.skinType || '').toLowerCase())

const concernAliases = {
  'acne': ['acne'],
  'manchas': ['manchas', 'tono desigual'],
  'sensibilidad': ['sensibilidad', 'piel sensible'],
  'barrera': ['barrera'],
  'deshidratacion': ['deshidratacion', 'deshidratación'],
  'arrugas': ['arrugas', 'anti-aging', 'antiaging'],
  'rojez': ['rojez'],
  'luminosidad': ['luminosidad'],
  'textura': ['textura'],
  'poros': ['poros']
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
  if (text.includes('grasa')) return 'grasa'
  if (text.includes('seca')) return 'seca'
  if (text.includes('mixta')) return 'mixta'
  if (text.includes('normal')) return 'normal'
  return ''
}

const selectedConcern = computed(() => normalizeConcern(concernFromQuery.value || diagnosisSummary.value))
const selectedSkinType = computed(() => normalizeSkinType(skinTypeFromQuery.value || diagnosisSummary.value))

const doctors = ref([])
const selectedDoctor = ref(null)
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

const appointmentTypes = [
  { key: 'consulta_general', label: 'Consulta general' },
  { key: 'seguimiento', label: 'Seguimiento' },
  { key: 'urgencia', label: 'Urgencia' },
  { key: 'estetica', label: 'Estética' }
]

const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

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

function starText(rating) {
  const r = Math.round(rating || 0)
  return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r))
}

function modalityLabel(mode) {
  const map = { virtual: 'Virtual', presencial: 'Presencial', both: 'Virtual y Presencial', ambos: 'Virtual y Presencial' }
  return map[mode] || mode || 'Ambas'
}

async function loadDoctors() {
  if (!isSupabaseConfigured) return

  const [docsRes, concernsRes, skinTypesRes] = await Promise.all([
    supabase.from('dermatologists').select('id,name,specialty,mode,location,availability_note,rating,photo_url,is_active').eq('is_active', true).order('rating', { ascending: false }),
    supabase.from('dermatologist_concerns').select('dermatologist_id,concern_code,priority_score'),
    supabase.from('dermatologist_skin_types').select('dermatologist_id,skin_type_code,priority_score')
  ])

  if (docsRes.error) throw docsRes.error

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

  doctors.value = (docsRes.data || []).map(d => ({
    ...d,
    concerns: concernsByDoc[d.id]?.list || [],
    concernPriority: concernsByDoc[d.id]?.priority || {},
    skinTypes: skinsByDoc[d.id]?.list || [],
    skinPriority: skinsByDoc[d.id]?.priority || {}
  }))

  if (!selectedDoctor.value && recommendedDoctors.value.length) {
    selectedDoctor.value = recommendedDoctors.value[0]
    if (selectedDoctor.value.mode === 'virtual') form.value.mode = 'virtual'
    if (selectedDoctor.value.mode === 'presencial') form.value.mode = 'presencial'
  }
}

async function bookAppointment() {
  if (!selectedDoctor.value) return (errorMsg.value = 'Selecciona un especialista.')
  if (!form.value.date) return (errorMsg.value = 'Selecciona una fecha.')

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
    notes: diagnosisSummary.value || null,
    urgency: form.value.type === 'urgencia' ? 'high' : 'normal',
    status: 'pending',
    confirmation_code: confirmationCode,
    analysis_id: route.query.analysis_id || route.query.analysisId || null
  }

  try {
    if (isSupabaseConfigured && userId) {
      const { error } = await supabase.from('appointments').insert(aptData)
      if (error) throw error
    }
    history.saveAppointment?.({ ...aptData, doctor_name: selectedDoctor.value.name })
    booked.value = true
  } catch (e) {
    errorMsg.value = 'No se pudo guardar la cita en este momento.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  nextTick(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  if (!form.value.reason) {
    form.value.reason = String(route.query.reason || route.query.diagnosis || route.query.concern || '').trim()
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
