<template>
  <div :class="['pd-root', { 'pd-dark': isDark }]">
    <main class="max-w-[1200px] mx-auto px-6 pt-4 pb-4">
      <!-- HERO -->
      <section class="mt-2">
        <div class="pd-hero rounded-[28px] overflow-hidden shadow-xl relative pd-hero-enter">
          <div class="px-6 sm:px-10 py-12 sm:py-16 text-center text-white">
            <span class="text-xs uppercase tracking-[0.25em] opacity-80">
              Recommended by Experts
            </span>

            <h2 class="text-3xl sm:text-4xl font-extrabold mt-4 leading-tight pd-hero-enter-delay">
              Cuidado de piel respaldado por dermatólogos
            </h2>

            <p class="mt-4 text-white/90 text-sm sm:text-base pd-hero-enter-delay">
              Restaura la barrera protectora de tu piel con fórmulas clínicamente comprobadas.
            </p>

            <button
              class="mt-8 pd-cta px-8 sm:px-10 py-3 rounded-full font-bold shadow-lg transition pd-hero-enter-delay"
              type="button"
              @click="router.push('/tienda')"
            >
              Ver productos recomendados
            </button>
          </div>

          <div class="px-6 sm:px-10 pb-10">
            <div class="pd-card rounded-2xl p-5 sm:p-6 shadow-xl flex items-center justify-between gap-4">
              <div>
                <h3 class="font-bold text-lg">Analiza tu piel</h3>
                <p class="text-sm pd-muted">Obtén una rutina personalizada en 2 minutos.</p>
                <button
                  type="button"
                  class="mt-2 inline-flex items-center gap-1 pd-link font-bold text-sm"
                  @click="router.push('/quiz')"
                >
                  Comenzar análisis
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div class="shrink-0 pd-chip p-4 rounded-2xl">
                <span class="material-symbols-outlined text-5xl pd-link">face_retouching_natural</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- BEST SELLERS -->
      <section class="mt-10" v-reveal>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-xl">Más vendidos</h3>
          <RouterLink class="pd-link font-semibold text-sm hover:underline" to="/tienda">Ver todos</RouterLink>
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
              <img class="h-40 object-contain" :src="product.image" :alt="product.name" @error="onImgError" />
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

      <!-- EXPERT RECOMMENDED -->
      <section class="mt-10" v-reveal="{ delay: 0.05 }">
        <h3 class="font-bold text-xl mb-4">Marcas recomendadas por dermatólogos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="pd-brandcard-a rounded-2xl p-6 text-white shadow-lg overflow-hidden relative pd-card-hover" v-reveal="{ delay: 0 }">
            <span class="text-[10px] uppercase tracking-widest opacity-80 font-bold">Socio oficial</span>
            <h4 class="text-2xl font-extrabold mt-2">CeraVe</h4>
            <p class="mt-1 text-white/80 text-sm">Hidratación y reparación de barrera cutánea</p>
            <button class="mt-4 pd-pill" type="button" @click="goToBrand('cerave')">Ver CeraVe</button>
          </div>
          <div class="pd-brandcard-b rounded-2xl p-6 text-white shadow-lg overflow-hidden relative pd-card-hover" v-reveal="{ delay: 0.1 }">
            <span class="text-[10px] uppercase tracking-widest opacity-80 font-bold">Cuidado premium</span>
            <h4 class="text-2xl font-extrabold mt-2">La Roche-Posay</h4>
            <p class="mt-1 text-white/80 text-sm">SPF, acné, manchas y piel sensible</p>
            <button class="mt-4 pd-pill" type="button" @click="goToBrand('larocheposay')">Ver La Roche-Posay</button>
          </div>
        </div>
      </section>

      <!-- PROFESSIONAL GUIDANCE -->
      <section class="mt-10 mb-4" v-reveal>
        <div class="pd-guidance pd-border rounded-2xl p-8 text-center">
          <span class="material-symbols-outlined pd-link text-5xl">clinical_notes</span>
          <h3 class="font-bold text-2xl mt-2">Orientación Profesional</h3>
          <p class="pd-muted mt-2 max-w-2xl mx-auto">
            Consulta con dermatólogos certificados en República Dominicana para orientación especializada sobre tu piel.
          </p>
          <button
            class="mt-6 w-full max-w-xl mx-auto py-4 rounded-xl pd-primary text-white font-bold shadow-lg"
            type="button"
            @click="router.push('/diagnostics')"
          >
            Agendar orientación
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { allProducts } from '../data/productCatalog.js'
import { formatPrice, convertPrice } from '../utils/currency.js'

const router = useRouter()
const cart = useCartStore()
const settings = useSettingsStore()
const { isDark } = settings

// Top 3 productos del catálogo real (los que tienen imagen disponible)
const featuredProducts = computed(() =>
  allProducts.filter(p => p.image).slice(0, 3)
)

function displayPrice(priceUSD) {
  const currency = settings.currency?.value ?? 'DOP'
  const amount = convertPrice(priceUSD, 'USD', currency)
  return formatPrice(amount, currency)
}

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160'%3E%3Crect width='200' height='160' fill='%23e2f0fb'/%3E%3Ctext x='100' y='88' text-anchor='middle' fill='%23004e92' font-size='13' font-family='sans-serif'%3ESin imagen%3C/text%3E%3C/svg%3E"

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

.pd-dark.pd-root {
  --bg: #0b1220;
  --text: #e5e7eb;
  --muted: #9aa7ba;
  --surface: rgba(10,18,32,0.92);
  --card: #0f1a2e;
  --soft: #0a162a;
  --border: #1c2b44;
  --brand: #8cc7ff;
  --link: #66d6ff;
  --accent: #9be15d;
  --price: #cfe9ff;
  --cta-bg: #0f1a2e;
  --cta-text: #cfe9ff;
  --primary: #183a6b;
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
.pd-hero { background: linear-gradient(135deg, var(--brand), var(--link)); }
.pd-cta { background: var(--cta-bg); color: var(--cta-text); }
.pd-brandcard-a { background: linear-gradient(135deg, #005699, #004276); }
.pd-brandcard-b { background: linear-gradient(135deg, #004e92, #1a2b4b); }

.pd-pill {
  background: rgba(255,255,255,0.18);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
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
</style>
