<template>
  <div class="routine-page">
    <!-- No quiz yet -->
    <div v-if="!hasRoutine && !isLoadingRoutine" class="empty-state">
      <span class="material-symbols-outlined empty-icon">auto_fix_high</span>
      <h2>{{ t('routine.emptyTitle') }}</h2>
      <p>{{ t('routine.emptyText') }}</p>
      <button class="btn-primary" @click="router.push('/quiz')">{{ t('routine.doQuiz') }}</button>
      <button class="btn-secondary" @click="router.push('/diagnostics')" style="margin-top: 1rem;">{{ t('routine.goDiagnostics') }}</button>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoadingRoutine" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('routine.loading') }}</p>
    </div>

    <!-- Routine view -->
    <div v-else>
      <!-- Header with banner background -->
      <div class="routine-header" :style="{ backgroundImage: `url(${routineBannerImg})` }">
        <div class="container">
          <p class="routine-eyebrow">{{ t('routine.eyebrow') }}</p>
          <h1>{{ currentRoutine.profileTitle || currentRoutine.name || quizResult.value?.profileTitle || diagnosticResult.value?.title || t('routine.fallbackTitle') }}</h1>
          <p v-if="routineDescription" class="routine-sub">{{ routineDescription }}</p>
          <div class="routine-meta-pills">
            <span class="meta-pill">{{ skinTypeLabel }}</span>
            <span class="meta-pill concern">{{ concernLabel }}</span>
            <span class="meta-pill date">{{ t('routine.generated') }} {{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <div class="container">
          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'morning' }" @click="activeTab = 'morning'">
              <span class="material-symbols-outlined">wb_sunny</span> {{ t('quiz.morning') }}
            </button>
            <button class="tab" :class="{ active: activeTab === 'night' }" @click="activeTab = 'night'">
              <span class="material-symbols-outlined">bedtime</span> {{ t('quiz.night') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="container">
        <Transition name="tab-slide" mode="out-in">
        <div :key="activeTab">
        <div v-if="currentSteps.length === 0" class="no-steps">
          <p>{{ t('routine.noProducts') }}</p>
        </div>

        <div v-else class="steps-grid">
          <div v-for="step in currentSteps" :key="step.slug || step.step" class="step-card">
            <div class="step-number">{{ t('routine.step') }} {{ step.step }}</div>
            <div class="step-category">{{ step.category }}</div>

            <div class="step-body">
              <TransparentImg :src="step.image" :alt="step.name" class="step-img" @error="$event.target.src='https://placehold.co/300x400/e5e7eb/475569?text=PRODUCT'" />
              <div class="step-info">
                <p class="step-brand">{{ step.brand }}</p>
                <h3 class="step-name">{{ step.name }}</h3>
                <p class="step-size">{{ step.size }}</p>
                <p class="step-desc">{{ step.longDescription }}</p>
                <div class="step-rating" v-if="step.rating">
                  <span class="stars">{{ starText(step.rating) }}</span>
                  <span class="review-count">({{ step.reviews }})</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn-view" @click="router.push('/producto/' + step.slug)">
                <span class="material-symbols-outlined">visibility</span> {{ t('shop.viewProduct') }}
              </button>
              <button class="btn-add" @click="addToCart(step)">
                <span class="material-symbols-outlined">shopping_bag</span> {{ t('general.addToCart') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Saved routine names (text fallback if no product objects) -->
        <div v-if="currentSteps.length === 0 && currentNameList.length" class="name-list-card">
          <h3>{{ t('routine.recommendedProducts') }}</h3>
          <ul>
            <li v-for="name in currentNameList" :key="name">{{ name }}</li>
          </ul>
          <button class="btn-primary mt-4" @click="router.push('/tienda')">{{ t('quiz.viewInShop') }}</button>
        </div>
        </div>
        </Transition>
      </div>

      <!-- Actions -->
      <div class="routine-actions container">
        <button class="btn-secondary" @click="router.push('/quiz')">{{ t('routine.repeatQuiz') }}</button>
        <button class="btn-secondary" @click="router.push('/diagnostics')">{{ t('diagnostics.title') }}</button>
        <button class="btn-secondary" @click="sendRoutineEmail">{{ t('routine.email') }}</button>
        <button class="btn-primary" @click="router.push('/tienda')">{{ t('routine.viewStore') }}</button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useHistoryStore } from '../stores/useHistoryStore'
import { convertPrice } from '../utils/currency'
import TransparentImg from '../components/TransparentImg.vue'
import routineService from '../services/routineService.js'
import { getProductsByQuizResult } from '../data/productCatalog.js'
import { sendRoutineByEmail } from '../services/emailService.js'
import { apiFetch } from '../services/apiClient.js'
import { useAuthStore } from '../stores/useAuthStore.js'
import { useI18n } from '../lib/i18n.js'
import routineBannerImg from '../assets/fondo/skincare-routine.png'

const router = useRouter()
const cart = useCartStore()
const history = useHistoryStore()
const auth = useAuthStore()
const { lang, t } = useI18n()

const activeTab = ref('morning')
const toast = ref('')
let toastTimer = null

const quizResult = computed(() => history.getLatestQuizResult())
const diagnosticResult = computed(() => history.getLatestDiagnostic())
const authUserId = computed(() => auth.user?.value?.id || null)

const hasQuiz = computed(() => !!quizResult.value)

// Current routine data (from diagnosis or quiz)
const currentRoutine = ref(null)
const isLoadingRoutine = ref(true)

const hasRoutine = computed(() => !!currentRoutine.value)

const skinTypeLabel = computed(() => {
  if (!currentRoutine.value) return lang.value === 'es' ? 'Piel' : 'Skin'
  const mapEs = { seca: 'Piel seca', normal: 'Piel normal', mixta: 'Piel mixta', grasa: 'Piel grasa' }
  const mapEn = { seca: 'Dry skin', normal: 'Normal skin', mixta: 'Combination skin', grasa: 'Oily skin' }
  const map = lang.value === 'es' ? mapEs : mapEn
  return map[currentRoutine.value.skinType] || currentRoutine.value.skinType || (lang.value === 'es' ? 'Piel' : 'Skin')
})

const concernLabel = computed(() => {
  if (!currentRoutine.value) return ''
  const map = {
    luminosidad: lang.value === 'es' ? 'Luminosidad' : 'Radiance',
    deshidratacion: lang.value === 'es' ? 'Deshidratación' : 'Dehydration',
    manchas: lang.value === 'es' ? 'Manchas' : 'Dark spots',
    sensibilidad: lang.value === 'es' ? 'Sensibilidad' : 'Sensitivity',
    arrugas: lang.value === 'es' ? 'Líneas finas' : 'Early lines',
    poros: lang.value === 'es' ? 'Poros' : 'Pores',
    barrera: lang.value === 'es' ? 'Barrera cutánea' : 'Skin barrier',
  }
  return map[currentRoutine.value.primaryConcern] || currentRoutine.value.primaryConcern || ''
})

const routineDescription = computed(() => {
  const raw = currentRoutine.value?.profileSummary
    || currentRoutine.value?.routineFocus
    || currentRoutine.value?.summary
    || currentRoutine.value?.description
    || quizResult.value?.profileSummary
    || quizResult.value?.routineFocus
    || diagnosticResult.value?.summary
    || diagnosticResult.value?.form?.description
    || ''

  let trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return lang.value === 'es'
    ? 'Tu rutina está basada en tu diagnóstico, por lo que lo mejor es...'
    : 'Your routine is based on your diagnosis, so it is best to...'

  const marker = lang.value === 'es' ? 'por lo que lo mejor es' : 'so it is best to'
  const lower = trimmed.toLowerCase()
  const markerIndex = lower.indexOf(marker)
  if (markerIndex >= 0) {
    const endIndex = markerIndex + marker.length
    const result = trimmed.slice(0, endIndex).trim()
    return `${result}...`
  }

  trimmed = trimmed.replace(/[\.\?!]+$/, '')
  const suffix = lang.value === 'es' ? ' por lo que lo mejor es...' : ' so it is best to...'
  const maxLength = 160 - suffix.length
  if (trimmed.length <= maxLength) {
    return `${trimmed}${suffix}`
  }
  return `${trimmed.slice(0, maxLength).trim()}${suffix}`
})

const formattedDate = computed(() => {
  if (!currentRoutine.value?.date) return ''
  return new Date(currentRoutine.value.date).toLocaleDateString(lang.value === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

function buildRoutineFromQuizData(quiz) {
  if (!quiz) return { morningSteps: [], nightSteps: [] }
  const quizPayload = {
    skinType: quiz.skinType || quiz.skin_type || 'normal',
    concerns: quiz.concerns || [],
    sensitivity: quiz.sensitivity || 'mild',
  }
  const toStep = (p, i) => ({
    ...p,
    step: i + 1,
    longDescription: p.description || p.longDescription || '',
    size: p.sizes?.[0]?.label || p.size || '',
    category: p.category || p.type || 'Care',
  })
  return {
    morningSteps: getProductsByQuizResult(quizPayload, 'morning').map(toStep),
    nightSteps: getProductsByQuizResult(quizPayload, 'night').map(toStep),
  }
}

function buildStepsFromNameList(names) {
  return (names || []).map((name, index) => ({
    step: index + 1,
    name,
    category: 'Product',
    size: '',
    longDescription: '',
    brand: '',
    image: 'https://placehold.co/300x400/e5e7eb/475569?text=Product',
  }))
}

function hasRenderableStepData(steps) {
  return (steps || []).some((step) => step && (step.name || step.image || step.longDescription))
}

const currentSteps = computed(() => {
  if (!currentRoutine.value) return []
  const key = activeTab.value === 'morning' ? 'morningSteps' : 'nightSteps'
  const raw = currentRoutine.value[key] || currentRoutine.value.routineSteps || []
  if (raw.length && hasRenderableStepData(raw)) {
    return raw.map((p, i) => ({ ...p, step: i + 1 }))
  }

  // Handle older or reconstructed quiz objects with only named routines
  const nameKey = activeTab.value === 'morning' ? 'morningRoutine' : 'nightRoutine'
  const names = currentRoutine.value[nameKey] || []
  if (names.length) return buildStepsFromNameList(names)

  // As last fallback, rebuild from quiz metadata
  if (quizResult.value) {
    const fallback = buildRoutineFromQuizData(quizResult.value)
    const steps = fallback[key] || []
    return steps
  }

  return []
})

const currentNameList = computed(() => {
  if (!currentRoutine.value) return []
  const r = currentRoutine.value
  const key = activeTab.value === 'morning' ? 'morningRoutine' : 'nightRoutine'
  return r[key] || []
})

function getLegacyQuizResult() {
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith('pharmaderm_quiz_result')) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null')
        if (parsed && parsed.completed) return parsed
      } catch { /* ignore invalid JSON */ }
    }
  }
  return null
}

function getQuizFallback() {
  return quizResult.value || getLegacyQuizResult()
}

async function loadRoutineData({ silent = false } = {}) {
  if (!silent) isLoadingRoutine.value = true
  try {
    const savedRoutine = await routineService.getLatestRoutine()
    if (savedRoutine) {
      currentRoutine.value = {
        ...savedRoutine,
        profileTitle: savedRoutine.profileTitle || quizResult.value?.profileTitle,
        profileSummary: savedRoutine.profileSummary || quizResult.value?.profileSummary,
        routineFocus: savedRoutine.routineFocus || quizResult.value?.routineFocus,
        summary: savedRoutine.summary || diagnosticResult.value?.summary,
        description: savedRoutine.description || diagnosticResult.value?.form?.description,
      }
      console.log('[Routine] Loaded saved routine from Supabase:', currentRoutine.value.name || currentRoutine.value.profileTitle)
      return
    }

    const quiz = getQuizFallback()
    if (quiz) {
      currentRoutine.value = quiz
      console.log('[Routine] Loaded routine from quiz fallback')
      return
    }

    console.log('[Routine] No routine or quiz data available yet')
  } catch (e) {
    console.warn('[Routine] Error loading routine data:', e)
    currentRoutine.value = getQuizFallback()
  } finally {
    isLoadingRoutine.value = false
    if (!silent) {
      await nextTick()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }
}

watch(quizResult, (newQuiz) => {
  if (newQuiz) {
    currentRoutine.value = newQuiz
    isLoadingRoutine.value = false
    nextTick(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
    console.log('[Routine] Reactive quiz result loaded after mount')
  }
})

watch(authUserId, (id, oldId) => {
  if (id && id !== oldId) loadRoutineData()
})

watch(
  () => [history.routines.value.length, history.quizHistory.value.length, history.diagnostics.value.length],
  () => loadRoutineData({ silent: true })
)

function reloadRoutineWhenVisible() {
  if (!document.hidden) loadRoutineData({ silent: true })
}

function starText(rating) {
  const r = Math.round(rating || 0)
  return '★'.repeat(Math.max(0, Math.min(5, r))) + '☆'.repeat(Math.max(0, 5 - r))
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}

function addToCart(product) {
  const usdPrice = product.sizes?.[0]?.priceUSD ?? product.priceFrom ?? product.priceUSD ?? 0
  const priceRD = Math.round(convertPrice(usdPrice, 'USD', 'DOP'))
  const size = product.sizes?.[0]?.label || product.size || 'Default'
  cart.addItem(product, { size, qty: 1, priceRD })
  showToast(`${product.name} added to cart`)
}

async function sendRoutineEmail() {
  const email = auth.user?.value?.email || ''
  if (!email) {
    showToast('We could not find an email associated with your account.')
    return
  }

  const quizFallback = getQuizFallback()
  const rebuiltFromQuiz = buildRoutineFromQuizData(quizFallback)

  const fromSteps = (steps = []) => steps.map((s) => s?.name).filter(Boolean)
  const dedupe = (list = []) => list.filter((v, i, arr) => arr.indexOf(v) === i)

  const morningNames = dedupe([
    ...fromSteps(currentRoutine.value?.morningSteps || []),
    ...(currentRoutine.value?.morningRoutine || []).filter(Boolean),
    ...fromSteps(rebuiltFromQuiz.morningSteps || []),
  ])

  const nightNames = dedupe([
    ...fromSteps(currentRoutine.value?.nightSteps || []),
    ...(currentRoutine.value?.nightRoutine || []).filter(Boolean),
    ...fromSteps(rebuiltFromQuiz.nightSteps || []),
  ])

  const recommendedNames = dedupe([...morningNames, ...nightNames])

  const morning = morningNames.join(' | ')
  const night = nightNames.join(' | ')
  const recommended = recommendedNames.join(' | ')

  let result = null
  try {
    const backendRes = await apiFetch('/email/routine', {
      method: 'POST',
      body: {
        to_email: email,
        to_name: auth.user?.value?.name || 'Customer',
        skin_type: skinTypeLabel.value || '',
        diagnosis: concernLabel.value || routineDescription.value || '',
        morning_routine: morning || 'N/A',
        night_routine: night || 'N/A',
        recommended_products: recommended || 'N/A',
        routine_id: currentRoutine.value?.id || Date.now(),
      }
    })
    result = { ok: !!backendRes?.ok }
  } catch {
    result = await sendRoutineByEmail({
      to_email: email,
      to_name: auth.user?.value?.name || 'Customer',
      skin_type: skinTypeLabel.value || '',
      diagnosis: concernLabel.value || routineDescription.value || '',
      morning_routine: morning || 'N/A',
      night_routine: night || 'N/A',
      recommended_products: recommended || 'N/A',
      reply_to: 'soporte@pharmadermrd.com',
      routine_id: currentRoutine.value?.id || null,
    }, lang.value || 'es')
  }

  if (result.ok) {
    showToast('Your routine was sent to your email.')
    return
  }
  showToast(result.message || 'The routine was saved, but email delivery is not configured.')
}

// Load routine data on mount
onMounted(() => {
  loadRoutineData()
  window.addEventListener('focus', reloadRoutineWhenVisible)
  document.addEventListener('visibilitychange', reloadRoutineWhenVisible)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', reloadRoutineWhenVisible)
  document.removeEventListener('visibilitychange', reloadRoutineWhenVisible)
})
</script>

<style scoped>
.tab-slide-enter-active, .tab-slide-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.tab-slide-enter-from { opacity: 0; transform: translateX(12px); }
.tab-slide-leave-to { opacity: 0; transform: translateX(-12px); }

.routine-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.container { width: min(1200px, 92%); margin: 0 auto; }

.empty-state { text-align: center; padding: 6rem 1rem; }
.empty-icon { font-size: 64px; color: #16a6e2; display: block; margin-bottom: 1rem; }
.empty-state h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.empty-state p { color: #64748b; margin: 0 0 1.5rem; }

.routine-header {
  position: relative;
  overflow: hidden;
  background-position: center 58%;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #005187;
  color: white;
  padding: 3.5rem 0 2.5rem;
}
.routine-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,78,146,0.74), rgba(22,166,226,0.56));
  z-index: 0;
}
.routine-header .container {
  position: relative;
  z-index: 1;
}
.routine-eyebrow { font-size: 0.72rem; letter-spacing: 0.22em; font-weight: 700; text-transform: uppercase; opacity: 0.75; margin: 0 0 0.6rem; }
.routine-header h1 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; margin: 0 0 0.75rem; line-height: 1.2; }
.routine-sub { max-width: 640px; opacity: 0.9; line-height: 1.7; margin: 0 0 1.25rem; font-size: 1rem; }
.routine-meta-pills { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.meta-pill { font-size: 0.78rem; font-weight: 700; padding: 0.35rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.2); color: white; }
.meta-pill.concern { background: rgba(255,255,255,0.3); }
.meta-pill.date { background: rgba(0,0,0,0.15); font-weight: 500; }

.tab-bar { background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 96px; z-index: 20; }
.tabs { display: flex; gap: 0; }
.tab { display: flex; align-items: center; gap: 0.5rem; padding: 1.1rem 1.5rem; border: none; background: transparent; font-size: 0.9rem; font-weight: 700; color: #94a3b8; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.18s; }
.tab.active { color: #16a6e2; border-bottom-color: #16a6e2; }
.tab .material-symbols-outlined { font-size: 18px; }

.steps-grid { display: grid; gap: 1.5rem; padding: 2.5rem 0; }
.step-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; }
.step-number { background: #16a6e2; color: white; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; padding: 0.5rem 1.25rem; display: inline-block; }
.step-category { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; color: #94a3b8; text-transform: uppercase; padding: 0.75rem 1.25rem 0; }
.step-body { display: grid; grid-template-columns: 180px 1fr; gap: 1.5rem; padding: 1rem 1.25rem; }
.step-img { width: 100%; height: 220px; object-fit: contain; background: #f8fafc; border-radius: 12px; }
.step-brand { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.3rem; }
.step-name { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; line-height: 1.3; }
.step-size { font-size: 0.88rem; color: #64748b; margin: 0 0 0.75rem; }
.step-desc { font-size: 0.92rem; color: #475569; line-height: 1.65; margin: 0 0 0.75rem; }
.step-rating { display: flex; align-items: center; gap: 0.5rem; }
.stars { color: #f59e0b; font-size: 0.9rem; }
.review-count { font-size: 0.82rem; color: #94a3b8; }
.step-actions { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #f1f5f9; }
.btn-view, .btn-add { display: flex; align-items: center; justify-content: center; gap: 0.4rem; border: none; padding: 1rem; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: background 0.15s; }
.btn-view { background: #f8fafc; color: #475569; }
.btn-view:hover { background: #f1f5f9; }
.btn-add { background: #16a6e2; color: white; border-left: 1px solid #e2e8f0; }
.btn-add:hover { background: #0c8cc4; }
.btn-add .material-symbols-outlined, .btn-view .material-symbols-outlined { font-size: 18px; }

.name-list-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 2rem; margin-top: 1.5rem; }
.name-list-card h3 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem; }
.name-list-card ul { padding-left: 1.2rem; }
.name-list-card li { color: #475569; padding: 0.4rem 0; font-size: 0.96rem; }
.no-steps { padding: 3rem 0; text-align: center; color: #94a3b8; }

.routine-actions { display: flex; gap: 1rem; padding: 2rem 0; flex-wrap: wrap; }
.btn-primary { background: #16a6e2; color: white; border: none; padding: 0.85rem 1.75rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 0.95rem; }
.btn-primary:hover { background: #0c8cc4; }
.btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; padding: 0.85rem 1.75rem; font-weight: 700; cursor: pointer; border-radius: 999px; font-size: 0.95rem; }
.btn-secondary:hover { background: #f8fafc; }
.mt-4 { margin-top: 1rem; }

.toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: #0f172a; color: white; padding: 0.75rem 1.5rem; border-radius: 999px; font-size: 0.9rem; z-index: 100; white-space: nowrap; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 700px) {
  .step-body { grid-template-columns: 1fr; }
  .step-img { height: 180px; }
}
.loading-state { text-align: center; padding: 6rem 1rem; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #16a6e2; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
