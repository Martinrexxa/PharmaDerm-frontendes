<template>
  <div class="pd-root">
    <main class="max-w-[1200px] mx-auto px-6 pt-4 pb-4">
      <!-- HERO BANNER ROTATION -->
      <section class="mt-2">
        <div class="pd-hero-banner rounded-[28px] overflow-hidden shadow-xl relative">
          <Transition name="banner-media-fade">
            <!-- Video slide -->
            <video
              v-if="currentSlide.type === 'video'"
              :key="currentSlide.src"
              :src="currentSlide.src"
              class="banner-media"
              autoplay
              muted
              playsinline
              preload="auto"
              @ended="nextSlide"
              @error="nextSlide"
            />

            <!-- Image slide -->
            <img
              v-else
              :key="currentSlide.src"
              :src="currentSlide.src"
              :alt="currentSlide.alt"
              class="banner-media banner-img"
            />
          </Transition>

          <!-- Overlay content: video slide shows only CTA -->
          <div class="banner-overlay" :class="{ 'banner-overlay--video': isVideoSlide }">
            <Transition name="banner-copy-fade" mode="out-in">
              <div v-if="!isVideoSlide" :key="`image-copy-${slideIndex}`" class="banner-copy-group">
                <div class="banner-content px-6 sm:px-10 py-12 sm:py-16 text-center text-white">
                  <span class="banner-kicker text-xs uppercase tracking-[0.25em] opacity-80">{{ t('home.recommendedBy') }}</span>
                  <h2 class="banner-title text-3xl sm:text-4xl font-extrabold mt-4 leading-tight">
                    {{ t('home.heroTitle') }}
                  </h2>
                  <p class="banner-subtitle mt-4 text-white/90 text-sm sm:text-base">
                    {{ t('home.heroSub') }}
                  </p>
                  <button
                    class="banner-action mt-8 pd-cta px-8 sm:px-10 py-3 rounded-full font-bold shadow-lg transition"
                    type="button"
                    @click="router.push('/tienda')"
                  >
                    {{ t('home.shopNow') }}
                  </button>
                </div>

                <div class="banner-card-wrap px-6 sm:px-10 pb-10">
                  <div class="pd-card rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between gap-4">
                    <div>
                      <h3 class="font-bold text-lg">{{ t('home.analyzeSkin') }}</h3>
                      <p class="text-sm pd-muted">{{ t('home.quizSub') }}</p>
                      <button
                        type="button"
                        class="mt-2 inline-flex items-center gap-1 pd-link font-bold text-sm"
                        @click="router.push('/quiz')"
                      >
                        {{ t('home.startQuiz') }}
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                    <div class="shrink-0 pd-chip p-4 rounded-2xl">
                      <span class="material-symbols-outlined text-5xl pd-link">face_retouching_natural</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Video slide: only bottom CTA -->
              <div v-else :key="`video-copy-${slideIndex}`" class="banner-video-cta">
                <button
                  class="pd-cta px-8 sm:px-10 py-3 rounded-full font-bold shadow-lg transition"
                  type="button"
                  @click="router.push('/tienda')"
                >
                  {{ t('home.shopNow') }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Slide dots -->
          <div class="banner-dots">
            <button
              v-for="(slide, i) in slides"
              :key="i"
              class="banner-dot"
              :class="{ active: i === slideIndex }"
              @click="slideIndex = i"
              :aria-label="`Slide ${i + 1}`"
            />
          </div>
        </div>
      </section>

      <!-- BEST SELLERS -->
      <section class="mt-10" v-reveal>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">{{ t('home.bestSellers') }}</h3>
          <RouterLink class="pd-link font-semibold text-sm hover:underline" to="/tienda">{{ t('home.viewAll') }}</RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="(product, i) in featuredProducts"
            :key="product.id"
            v-reveal="{ delay: i * 0.1 }"
            class="pd-card pd-border rounded-2xl p-4 shadow-sm cursor-pointer pd-card-hover"
            @click="router.push(`/producto/${product.slug}`)"
          >
            <div class="relative pd-soft rounded-xl p-6 flex items-center justify-center">
              <TransparentImg class="h-40 object-contain" :src="product.image" :alt="product.name" @error="onImgError" />
            </div>
            <p class="mt-3 text-[10px] uppercase tracking-widest pd-muted font-bold">{{ brandLabel(product.brand) }}</p>
            <h4 class="font-semibold">{{ product.name }}</h4>
            <div class="mt-3 flex items-center justify-between">
              <span class="pd-price font-bold">{{ displayPrice(product.sizes?.[0]?.priceUSD ?? product.priceUSD ?? 0) }}</span>
              <button
                class="pd-fab-mini"
                type="button"
                @click.stop="addToCart(product)"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- EXPERT RECOMMENDED BRANDS -->
      <section class="mt-10" v-reveal="{ delay: 0.05 }">
        <h3 class="font-bold text-xl mb-4">{{ t('home.expertRec') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            class="pd-brandcard-a rounded-2xl overflow-hidden shadow-lg relative pd-card-hover"
            v-reveal="{ delay: 0 }"
            @click="goToBrand('cerave')"
            style="cursor: pointer;"
          >
            <img :src="ceraVeImg" alt="CeraVe" class="brand-bg-img" />
            <div class="brand-img-overlay p-6 text-white">
              <span class="text-[10px] uppercase tracking-widest opacity-80 font-bold">{{ t('home.officialPartner') }}</span>
              <h4 class="text-2xl font-extrabold mt-2">CeraVe</h4>
              <p class="mt-1 text-white/80 text-sm">Hydration and skin barrier repair</p>
              <button class="mt-4 pd-pill" type="button" @click.stop="goToBrand('cerave')">{{ t('general.view') }} CeraVe</button>
            </div>
          </div>
          <div
            class="pd-brandcard-b rounded-2xl overflow-hidden shadow-lg relative pd-card-hover"
            v-reveal="{ delay: 0.1 }"
            @click="goToBrand('larocheposay')"
            style="cursor: pointer;"
          >
            <img :src="laRochePosayImg" alt="La Roche-Posay" class="brand-bg-img" />
            <div class="brand-img-overlay p-6 text-white">
              <span class="text-[10px] uppercase tracking-widest opacity-80 font-bold">{{ t('home.premiumCare') }}</span>
              <h4 class="text-2xl font-extrabold mt-2">La Roche-Posay</h4>
              <p class="mt-1 text-white/80 text-sm">SPF, acne, dark spots and sensitive skin</p>
              <button class="mt-4 pd-pill" type="button" @click.stop="goToBrand('larocheposay')">{{ t('general.view') }} La Roche-Posay</button>
            </div>
          </div>
        </div>
      </section>

      <!-- PROFESSIONAL GUIDANCE -->
      <section class="mt-10 mb-4" v-reveal>
        <div class="pd-guidance pd-border rounded-2xl p-8 text-center">
          <span class="material-symbols-outlined pd-link text-5xl">clinical_notes</span>
          <h3 class="font-bold text-2xl mt-2">{{ t('home.proGuide') }}</h3>
          <p class="pd-muted mt-2 max-w-2xl mx-auto">
            {{ t('home.proGuideDesc') }}
          </p>
          <button
            class="mt-6 w-full max-w-xl mx-auto py-4 rounded-xl pd-primary text-white font-bold shadow-lg"
            type="button"
            @click="router.push('/diagnostics')"
          >
            {{ t('home.bookAppt') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { allProducts } from '../data/productCatalog.js'
import productService from '../services/productService.js'
import { formatPrice, convertPrice } from '../utils/currency.js'
import TransparentImg from '../components/TransparentImg.vue'
import { useI18n } from '../lib/i18n.js'

import video1 from '../assets/fondo/Descubre la mejor versión de tu piel.mp4'
import bannerImg from '../assets/fondo/banner.png'
import video2 from '../assets/fondo/HYALU B5 SÉRUM DERMATOLÓGICO ANTIEDAD _ LA ROCHE-POSAY.mp4'
import bannercImg from '../assets/fondo/bannerc.png'
import ceraVeImg from '../assets/fondo/ceraVe.png'
import laRochePosayImg from '../assets/fondo/larocheposay.jpg'

const router = useRouter()
const cart = useCartStore()
const settings = useSettingsStore()
const { t } = useI18n()

const slides = [
  { type: 'video', src: video1, alt: 'Discover the best version of your skin' },
  { type: 'image', src: bannerImg, alt: 'PharmaDerm skincare' },
  { type: 'video', src: video2, alt: 'Hyalu B5 Serum - La Roche-Posay' },
  { type: 'image', src: bannercImg, alt: 'PharmaDerm skincare collection' },
]

const slideIndex = ref(0)
const currentSlide = computed(() => slides[slideIndex.value])
const isVideoSlide = computed(() => currentSlide.value.type === 'video')

let imageTimer = null
const IMAGE_SLIDE_DURATION_MS = 9500

function nextSlide() {
  clearTimeout(imageTimer)
  slideIndex.value = (slideIndex.value + 1) % slides.length
}

function scheduleImageNext() {
  clearTimeout(imageTimer)
  if (currentSlide.value.type === 'image') {
    imageTimer = setTimeout(nextSlide, IMAGE_SLIDE_DURATION_MS)
  }
}

import { watch } from 'vue'
watch(slideIndex, () => scheduleImageNext(), { immediate: true })

onUnmounted(() => clearTimeout(imageTimer))

const remoteProducts = ref([])
const featuredProducts = computed(() =>
  (remoteProducts.value.length ? remoteProducts.value : allProducts).filter(p => p.image).slice(0, 3)
)

onMounted(() => {
  productService.getAll()
    .then((rows) => {
      if (Array.isArray(rows) && rows.length) remoteProducts.value = rows
    })
    .catch(() => {})
})

function displayPrice(priceUSD) {
  const currency = settings.currency?.value ?? 'DOP'
  const amount = convertPrice(priceUSD, 'USD', currency)
  return formatPrice(amount, currency)
}

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160'%3E%3Crect width='200' height='160' fill='%23e2f0fb'/%3E%3Ctext x='100' y='88' text-anchor='middle' fill='%23004e92' font-size='13' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E"

function onImgError(e) {
  e.target.onerror = null
  e.target.src = PLACEHOLDER_IMG
}

function brandLabel(brand) {
  if (!brand) return ''
  const b = brand.toLowerCase()
  if (b.includes('cerave')) return 'CeraVe'
  if (b.includes('roche') || b.includes('lrp') || b.includes('larocheposay')) return 'La Roche-Posay'
  return brand
}

function addToCart(product) {
  const size = product.sizes?.[0] || {}
  cart.addItem(product, {
    qty: 1,
    size: size.label || '',
    priceUSD: size.priceUSD ?? product.priceUSD ?? 0,
  })
}

function goToBrand(brand) {
  router.push(`/tienda?brand=${brand}`)
}
</script>

<style scoped>
.pd-root {
  --bg: #f8fafc;
  --text: #0f172a;
  --muted: #64748b;
  --surface: rgba(255,255,255,0.92);
  --card: #ffffff;
  --soft: #f1f5f9;
  --border: #e2e8f0;
  --brand: #004e92;
  --link: #5dbcd2;
  --accent: #76b82a;
  --price: #004e92;
  --cta-bg: #ffffff;
  --cta-text: #004e92;
  --primary: #004e92;
  background: var(--bg);
  color: var(--text);
}

.pd-muted { color: var(--muted); }
.pd-surface { background: var(--surface); backdrop-filter: blur(10px); }
.pd-card { background: var(--card); }
.pd-soft { background: var(--soft); }
.pd-border { border: 1px solid var(--border); }
.pd-brand { color: var(--brand); }
.pd-link { color: var(--link); }
.pd-price { color: var(--price); }
.pd-primary { background: var(--primary); }
.pd-chip { background: color-mix(in srgb, var(--link) 12%, transparent); }
.pd-guidance { background: color-mix(in srgb, var(--link) 8%, var(--card)); }
.pd-cta { background: var(--cta-bg); color: var(--cta-text); }

/* Hero banner */
.pd-hero-banner {
  position: relative;
  min-height: 420px;
  background: #004e92;
  isolation: isolate;
}

.banner-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.012);
  will-change: opacity, transform;
}

.banner-img {
  object-position: center top;
}

.banner-media-fade-enter-active,
.banner-media-fade-leave-active {
  transition: opacity 900ms ease, transform 1200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.banner-media-fade-enter-from {
  opacity: 0;
  transform: scale(1.045);
}

.banner-media-fade-enter-to {
  opacity: 1;
  transform: scale(1.012);
}

.banner-media-fade-leave-from {
  opacity: 1;
  transform: scale(1.012);
}

.banner-media-fade-leave-to {
  opacity: 0;
  transform: scale(1.035);
}

.banner-overlay {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, rgba(0,78,146,0.72) 0%, rgba(0,78,146,0.45) 100%);
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: background 700ms ease;
}

.banner-overlay--video {
  background: linear-gradient(to top, rgba(0,78,146,0.65) 0%, transparent 55%);
  justify-content: flex-end;
}

.banner-video-cta {
  padding: 0 24px 28px;
  display: flex;
  justify-content: center;
}

.banner-copy-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 420px;
}

.banner-content {
  flex: 1;
}

.banner-kicker,
.banner-title,
.banner-subtitle,
.banner-action,
.banner-card-wrap {
  animation: banner-copy-rise 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.banner-title { animation-delay: 80ms; }
.banner-subtitle { animation-delay: 150ms; }
.banner-action { animation-delay: 230ms; }
.banner-card-wrap { animation-delay: 300ms; }

.banner-copy-fade-enter-active,
.banner-copy-fade-leave-active {
  transition: opacity 420ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.banner-copy-fade-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.banner-copy-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes banner-copy-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 6px;
}

.banner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.45);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.banner-dot.active {
  background: #fff;
  transform: scale(1.2);
}

@media (prefers-reduced-motion: reduce) {
  .banner-media,
  .banner-media-fade-enter-active,
  .banner-media-fade-leave-active,
  .banner-copy-fade-enter-active,
  .banner-copy-fade-leave-active,
  .banner-kicker,
  .banner-title,
  .banner-subtitle,
  .banner-action,
  .banner-card-wrap {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}

/* Brand cards */
.pd-brandcard-a,
.pd-brandcard-b {
  position: relative;
  min-height: 200px;
}

.brand-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.brand-img-overlay {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, rgba(0,60,130,0.78) 0%, rgba(0,40,100,0.55) 100%);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pd-pill {
  background: rgba(255,255,255,0.18);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  color: #fff;
}

.pd-fab-mini {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
}

.pd-card-hover {
  transition: box-shadow 0.2s, transform 0.2s;
}
.pd-card-hover:hover {
  box-shadow: 0 8px 24px rgba(0,78,146,0.12);
  transform: translateY(-2px);
}
</style>
