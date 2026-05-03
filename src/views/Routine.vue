<template>
  <div class="routine-page">
    <!-- No quiz yet -->
    <div v-if="!hasQuiz" class="empty-state">
      <span class="material-symbols-outlined empty-icon">auto_fix_high</span>
      <h2>No hay rutina personalizada</h2>
      <p>Completa el quiz de piel para generar tu rutina personalizada.</p>
      <button class="btn-primary" @click="router.push('/quiz')">Hacer quiz</button>
    </div>

    <!-- Routine view -->
    <div v-else>
      <!-- Header -->
      <div class="routine-header">
        <div class="container">
          <p class="routine-eyebrow">MI RUTINA PERSONALIZADA</p>
          <h1>{{ quizResult.profileTitle || 'Mi rutina de piel' }}</h1>
          <p class="routine-sub">{{ quizResult.profileSummary?.slice(0, 160) }}...</p>
          <div class="routine-meta-pills">
            <span class="meta-pill">{{ skinTypeLabel }}</span>
            <span class="meta-pill concern">{{ concernLabel }}</span>
            <span class="meta-pill date">Generada {{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <div class="container">
          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'morning' }" @click="activeTab = 'morning'">
              <span class="material-symbols-outlined">wb_sunny</span> MAÑANA
            </button>
            <button class="tab" :class="{ active: activeTab === 'night' }" @click="activeTab = 'night'">
              <span class="material-symbols-outlined">bedtime</span> NOCHE
            </button>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="container">
        <div v-if="currentSteps.length === 0" class="no-steps">
          <p>No se encontraron productos para esta rutina.</p>
        </div>

        <div v-else class="steps-grid">
          <div v-for="step in currentSteps" :key="step.slug || step.step" class="step-card">
            <div class="step-number">Paso {{ step.step }}</div>
            <div class="step-category">{{ step.category }}</div>

            <div class="step-body">
              <img :src="step.image" :alt="step.name" class="step-img" @error="$event.target.src='https://placehold.co/300x400/e5e7eb/475569?text=PRODUCTO'" />
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
                <span class="material-symbols-outlined">visibility</span> Ver producto
              </button>
              <button class="btn-add" @click="addToCart(step)">
                <span class="material-symbols-outlined">shopping_bag</span> Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        <!-- Saved routine names (text fallback if no product objects) -->
        <div v-if="currentSteps.length === 0 && currentNameList.length" class="name-list-card">
          <h3>Productos recomendados</h3>
          <ul>
            <li v-for="name in currentNameList" :key="name">{{ name }}</li>
          </ul>
          <button class="btn-primary mt-4" @click="router.push('/tienda')">Ver en tienda</button>
        </div>
      </div>

      <!-- Actions -->
      <div class="routine-actions container">
        <button class="btn-secondary" @click="router.push('/quiz')">Repetir quiz</button>
        <button class="btn-secondary" @click="router.push('/diagnostics')">Ver diagnóstico</button>
        <button class="btn-primary" @click="router.push('/tienda')">Ver tienda</button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useHistoryStore } from '../stores/useHistoryStore'
import { convertPrice } from '../utils/currency'

const router = useRouter()
const cart = useCartStore()
const history = useHistoryStore()

const activeTab = ref('morning')
const toast = ref('')
let toastTimer = null

const quizResult = computed(() => history.getLatestQuizResult())

const hasQuiz = computed(() => !!quizResult.value)

const skinTypeLabel = computed(() => {
  const map = { seca: 'Piel seca', normal: 'Piel normal', mixta: 'Piel mixta', grasa: 'Piel grasa' }
  return map[quizResult.value?.skinType] || quizResult.value?.skinType || 'Piel'
})

const concernLabel = computed(() => {
  const map = {
    luminosidad: 'Luminosidad', deshidratacion: 'Deshidratación', manchas: 'Manchas',
    sensibilidad: 'Sensibilidad', arrugas: 'Líneas tempranas', poros: 'Poros', barrera: 'Barrera',
  }
  return map[quizResult.value?.primaryConcern] || quizResult.value?.primaryConcern || ''
})

const formattedDate = computed(() => {
  if (!quizResult.value?.date) return ''
  return new Date(quizResult.value.date).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })
})

const currentSteps = computed(() => {
  const r = quizResult.value
  if (!r) return []
  const key = activeTab.value === 'morning' ? 'morningSteps' : 'nightSteps'
  const raw = r[key] || r.routineSteps || []
  return raw.map((p, i) => ({ ...p, step: i + 1 }))
})

const currentNameList = computed(() => {
  const r = quizResult.value
  if (!r) return []
  if (activeTab.value === 'morning') return r.morningRoutine || []
  return r.nightRoutine || []
})

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
  showToast(`${product.name} agregado al carrito`)
}
</script>

<style scoped>
.routine-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.container { width: min(1200px, 92%); margin: 0 auto; }

.empty-state { text-align: center; padding: 6rem 1rem; }
.empty-icon { font-size: 64px; color: #16a6e2; display: block; margin-bottom: 1rem; }
.empty-state h2 { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem; }
.empty-state p { color: #64748b; margin: 0 0 1.5rem; }

.routine-header { background: linear-gradient(135deg, #16a6e2, #004e92); color: white; padding: 3.5rem 0 2.5rem; }
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
</style>
