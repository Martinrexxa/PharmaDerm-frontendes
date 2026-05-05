<template>
  <header class="app-header" @click="closeAll">
    <!-- Promo bar -->
    <div class="top-promos">
      <div>{{ promoText }}</div>
    </div>

    <!-- Main nav -->
    <div class="header-main container">
      <!-- Logo -->
      <div class="brand" @click.stop="router.push('/inicio')">
        <img :src="logoplainSrc" alt="" class="logo-icon" />
        <img :src="logofullSrc" alt="PharmaDerm" class="logo-full" />
      </div>

      <!-- Center nav links -->
      <nav class="desktop-nav" @click.stop>
        <!-- OUR PRODUCTS with mega menu -->
        <div
          class="nav-hover-wrap"
          @mouseenter="productsMenuOpen = true"
          @mouseleave="productsMenuOpen = false"
        >
          <button
            class="nav-link"
            :class="{ active: productsMenuOpen }"
            @click.stop="productsMenuOpen = !productsMenuOpen"
          >
            OUR PRODUCTS
          </button>

          <transition name="fade">
            <div
              v-if="productsMenuOpen"
              class="products-hover-panel"
              @click.stop
            >
              <div class="hover-grid">
                <div class="hover-col">
                  <h4>FACE</h4>
                  <button v-for="item in hoverFace" :key="item" @click="goShop({ search: item })">{{ item }}</button>
                </div>
                <div class="hover-col">
                  <h4>SUNSCREEN</h4>
                  <button v-for="item in hoverSunscreen" :key="item" @click="goShop({ search: item })">{{ item }}</button>
                </div>
                <div class="hover-col">
                  <h4>BODY</h4>
                  <button v-for="item in hoverBody" :key="item" @click="goShop({ search: item })">{{ item }}</button>
                </div>
                <div class="hover-col">
                  <h4>SKIN CONCERN</h4>
                  <button v-for="item in hoverConcerns" :key="item" @click="goShop({ concern: item })">{{ item }}</button>
                </div>
                <div class="hover-col">
                  <h4>PRODUCT LINE</h4>
                  <button v-for="item in hoverLines" :key="item" @click="goShop({ line: item })">{{ item }}</button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <button class="nav-link" @click="router.push('/quiz')">ANALYZE YOUR SKIN</button>
        <button class="nav-link" @click="router.push('/expert-advice')">EXPERT ADVICE</button>
        <button class="nav-link" @click="router.push('/our-story')">OUR STORY</button>
      </nav>

      <!-- Right actions -->
      <div class="header-actions" @click.stop>
        <!-- Search -->
        <button class="icon-btn" aria-label="Search" @click.stop="openSearch">
          <span class="material-symbols-outlined">search</span>
        </button>

        <!-- Cart icon + dropdown -->
        <div class="cart-wrap">
          <button class="icon-btn cart-btn" aria-label="Cart" @click.stop="cartOpen = !cartOpen; profileOpen = false">
            <span class="material-symbols-outlined">shopping_bag</span>
            <span v-if="cartCount > 0" class="cart-badge" :class="{ 'cart-badge--pop': badgePop }">{{ cartCount }}</span>
          </button>

          <transition name="fade">
            <div v-if="cartOpen" class="cart-panel" @click.stop>
              <div class="cart-panel-header">
                <strong>Mi carrito</strong>
                <button @click="cartOpen = false"><span class="material-symbols-outlined" style="font-size:20px">close</span></button>
              </div>

              <div v-if="cartItems.length === 0" class="cart-empty">
                <p>Tu carrito está vacío</p>
                <button class="cart-btn-shop" @click="go('/tienda')">Ir a la tienda</button>
              </div>

              <div v-else class="cart-items-list">
                <div v-for="(item, i) in cartItems" :key="item.id + i" class="cart-item">
                  <img :src="item.image" :alt="item.name" class="cart-item-img" />
                  <div class="cart-item-info">
                    <p class="cart-item-name">{{ item.name }}</p>
                    <p class="cart-item-meta">{{ item.size }}</p>
                    <div class="cart-item-row">
                      <div class="qty-control">
                        <button @click="changeQty(i, -1)">−</button>
                        <span>{{ item.quantity || 1 }}</span>
                        <button @click="changeQty(i, 1)">+</button>
                      </div>
                      <strong>{{ fmtPrice(item.priceRD * (item.quantity || 1)) }}</strong>
                    </div>
                  </div>
                  <button class="cart-remove" @click="removeItem(i)">
                    <span class="material-symbols-outlined" style="font-size:18px">delete</span>
                  </button>
                </div>
              </div>

              <div v-if="cartItems.length > 0" class="cart-panel-footer">
                <div class="cart-total-row">
                  <span>Total</span>
                  <strong>{{ fmtPrice(cartSubtotal) }}</strong>
                </div>
                <button class="cart-btn-full" @click="go('/carrito')">Ver carrito</button>
                <button class="cart-btn-primary" @click="go('/checkout')">Finalizar compra</button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Profile icon + dropdown -->
        <div class="profile-wrap">
          <button class="icon-btn" aria-label="Profile" @click.stop="profileOpen = !profileOpen; cartOpen = false">
            <span class="material-symbols-outlined">person</span>
          </button>

          <transition name="fade">
            <div v-if="profileOpen" class="profile-panel" @click.stop>
              <!-- Logged in state -->
              <template v-if="isLoggedIn">
                <div class="profile-greeting">Hola, {{ displayName }}</div>
                <button @click="go('/perfil?tab=cuenta')">Mi cuenta</button>
                <button @click="go('/perfil?tab=historial')">Mi historial</button>
                <button @click="go('/perfil?tab=settings')">Configuración</button>
                <button @click="doLogout" class="logout-btn">Cerrar sesión</button>
              </template>
              <!-- Logged out state -->
              <template v-else>
                <button @click="go('/login')">Iniciar sesión</button>
                <button @click="go('/registro')">Crear cuenta</button>
                <button @click="go('/carrito')">Mi carrito</button>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>

  <!-- Search overlay -->
  <transition name="fade">
    <div
      v-if="searchOpen"
      class="search-overlay"
      @click.self="searchOpen = false"
    >
      <div class="search-overlay__box" @click.stop>
        <div class="search-overlay__top">
          <div class="search-tabs">
            <button class="nav-link active" @click="goShop({})">OUR PRODUCTS</button>
            <button class="nav-link" @click="router.push('/quiz'); searchOpen = false">ANALYZE YOUR SKIN</button>
            <button class="nav-link" @click="router.push('/expert-advice'); searchOpen = false">EXPERT ADVICE</button>
            <button class="nav-link" @click="router.push('/our-story'); searchOpen = false">OUR STORY</button>
          </div>
          <button class="close-search" @click="searchOpen = false">
            <span class="material-symbols-outlined">close</span>
            <span>CLOSE</span>
          </button>
        </div>

        <div class="search-overlay__input-row">
          <span class="search-title">I'm looking for...</span>
          <input
            ref="searchInputRef"
            v-model.trim="searchQ"
            type="text"
            class="search-overlay__input"
            placeholder="toleriane"
            @keydown.enter="applySearch"
          />
        </div>

        <div class="search-overlay__content">
          <div class="search-left">
            <div class="search-left__header">
              <h3>POPULAR SEARCHES</h3>
            </div>
            <div class="search-side-box">
              <button v-for="term in popularSearches" :key="term" @click="goShop({ search: term })">{{ term }}</button>
            </div>
            <div class="search-left__header" style="margin-top:18px">
              <h3>CATEGORIES</h3>
            </div>
            <div class="search-side-box">
              <button v-for="term in searchCategories" :key="term" @click="goShop({ search: term })">{{ term }}</button>
            </div>
          </div>
          <div class="search-right">
            <div class="search-side-box">
              <h4>SKIN CONCERN</h4>
              <button v-for="item in hoverConcerns" :key="item" @click="goShop({ concern: item })">{{ item }}</button>
            </div>
            <div class="search-side-box">
              <h4>PRODUCT LINE</h4>
              <button v-for="item in hoverLines" :key="item" @click="goShop({ line: item })">{{ item }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { useCartStore } from '../stores/useCartStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import logoplainSrc from '../assets/img/logoplain.jpeg'
import logofullSrc from '../assets/img/logofull.jpeg'
import { priceIn } from '../utils/currency'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const settings = useSettingsStore()

const { isLoggedIn, displayName } = auth
const { items: cartItems, count: cartCount, subtotal: cartSubtotal, removeItem: _removeItem, updateQty } = cart
const userCurrency = settings.currency

const promoText = computed(() => {
  const threshold = priceIn(3000, 'DOP', userCurrency.value)
  return `FREE SHIPPING ON ORDERS OVER ${threshold} • SHOP NOW`
})

function fmtPrice(dopAmount) {
  return priceIn(Number(dopAmount) || 0, 'DOP', userCurrency.value)
}

const productsMenuOpen = ref(false)
const profileOpen = ref(false)
const cartOpen = ref(false)
const searchOpen = ref(false)
const searchQ = ref('')
const searchInputRef = ref(null)
const badgePop = ref(false)
let badgePopTimer = null

const hoverFace = ['Face Wash', 'Face Moisturizer', 'Face Serum', 'Face Toner', 'Eye Care']
const hoverSunscreen = ['Face Sunscreen', 'Body Sunscreen', 'Tinted Sunscreen']
const hoverBody = ['Body Lotion', 'Cleansing Oil', 'Hand Cream', 'Healing Body Spray']
const hoverConcerns = ['Acne Prone', 'Dark Spots', 'Dehydrated Skin', 'Dry Skin', 'Eczema', 'Anti-Aging', 'Oily Skin', 'Sensitive Skin']
const hoverLines = ['Anthelios', 'Cicaplast', 'Effaclar', 'Hyalu B5', 'Lipikar', 'Mela B3', 'Toleriane', 'Vitamin C']
const popularSearches = ['sunscreen', 'cicaplast', 'moisturizer', 'serum', 'effaclar']
const searchCategories = ['Toleriane', 'Serums', 'Moisturizers', 'Sunscreens']

function fmt(n) {
  return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n || 0))
}

function closeAll() {
  productsMenuOpen.value = false
  profileOpen.value = false
  cartOpen.value = false
}

function go(path) {
  productsMenuOpen.value = false
  profileOpen.value = false
  cartOpen.value = false
  searchOpen.value = false
  router.push(path)
}

function goShop(query = {}) {
  productsMenuOpen.value = false
  searchOpen.value = false
  router.push({ path: '/tienda', query })
}

function applySearch() {
  if (searchQ.value.trim()) {
    goShop({ search: searchQ.value.trim() })
  }
}

async function openSearch() {
  profileOpen.value = false
  cartOpen.value = false
  productsMenuOpen.value = false
  searchOpen.value = true
  await nextTick()
  searchInputRef.value?.focus()
}

function doLogout() {
  auth.logout()
  profileOpen.value = false
  router.push('/login')
}

function changeQty(index, delta) {
  const item = cartItems.value[index]
  updateQty(index, (item.quantity || 1) + delta)
}

function removeItem(index) {
  _removeItem(index)
}

let storageDebounceTimer = null
function onStorage() {
  if (document.hidden) return

  if (storageDebounceTimer) clearTimeout(storageDebounceTimer)
  storageDebounceTimer = setTimeout(() => {
    cart.refresh()
    auth.refresh()
    storageDebounceTimer = null
  }, 300)
}

onMounted(() => {
  window.addEventListener('storage', onStorage)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  if (storageDebounceTimer) clearTimeout(storageDebounceTimer)
  if (badgePopTimer) clearTimeout(badgePopTimer)
})

watch(cartCount, (next, prev) => {
  const n = Number(next || 0)
  const p = Number(prev || 0)
  if (n <= p) return
  badgePop.value = false
  requestAnimationFrame(() => {
    badgePop.value = true
    if (badgePopTimer) clearTimeout(badgePopTimer)
    badgePopTimer = setTimeout(() => { badgePop.value = false }, 450)
  })
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 90;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  overflow: visible;
}

.container {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.top-promos {
  background: #63b6cb;
  color: white;
  padding: 10px 24px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  text-align: center;
  font-weight: 700;
}

.header-main {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  position: relative;
  overflow: visible;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.logo-full {
  height: 36px;
  width: auto;
  object-fit: contain;
  max-width: 160px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: visible;
}

.nav-link {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .02em;
  cursor: pointer;
  color: #111827;
  white-space: nowrap;
  padding: 4px 6px;
}

.nav-link.active { color: #07579b; }
.nav-link:hover { color: #07579b; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  position: relative;
  cursor: pointer;
  color: #07579b;
  display: grid;
  place-items: center;
}

.icon-btn .material-symbols-outlined { font-size: 24px; }

.cart-badge {
  position: absolute;
  right: 0;
  top: 2px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  padding: 0 3px;
  transform-origin: center;
}

@keyframes pd-badge-pop {
  0%   { transform: scale(0.72) translateY(0); }
  40%  { transform: scale(1.22) translateY(-1px); }
  70%  { transform: scale(0.98) translateY(0); }
  100% { transform: scale(1) translateY(0); }
}

.cart-badge--pop {
  animation: pd-badge-pop 420ms cubic-bezier(.22, 1.2, .36, 1);
}

/* Mega menu */
.nav-hover-wrap {
  position: static;
  overflow: visible;
}

.products-hover-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, calc(100vw - 32px));
  background: #f7f7f7;
  border: 1px solid #d8dee5;
  box-shadow: 0 18px 40px rgba(15,23,42,.08);
  padding: 22px 24px;
  z-index: 999;
  overflow-x: auto;
}

.hover-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 22px;
  min-width: 980px;
}

.hover-col h4 { margin: 0 0 12px; font-size: 12px; letter-spacing: .03em; font-weight: 800; }

.hover-col button {
  display: block;
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: 12px;
  text-align: left;
  color: #334155;
  cursor: pointer;
  font-size: 13px;
  width: 100%;
}

.hover-col button:hover { text-decoration: underline; }

/* Profile panel */
.profile-wrap, .cart-wrap {
  position: relative;
}

.profile-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15,23,42,.1);
  z-index: 120;
  padding: 10px;
  display: grid;
  gap: 6px;
}

.profile-greeting {
  padding: 10px 12px 6px;
  font-weight: 700;
  font-size: 14px;
  color: #07579b;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 4px;
}

.profile-panel button {
  border: none;
  background: #fff;
  text-align: left;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

.profile-panel button:hover { background: #f8fafc; }

.logout-btn { color: #dc2626 !important; }

/* Cart panel */
.cart-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 340px;
  max-width: calc(100vw - 20px);
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 40px rgba(15,23,42,.12);
  z-index: 120;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.cart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 15px;
}

.cart-panel-header button {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  display: grid;
  place-items: center;
}

.cart-empty {
  padding: 28px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cart-empty p { margin: 0; }

.cart-btn-shop {
  padding: 8px 20px;
  border: 1px solid #009fe3;
  background: transparent;
  color: #009fe3;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  border-radius: 4px;
  transition: background .15s ease, color .15s ease;
}

.cart-btn-shop:hover { background: #009fe3; color: #fff; }

.cart-items-list {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f9fafb;
}

.cart-item-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  background: #f8fafc;
  flex-shrink: 0;
  border: 1px solid #f3f4f6;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-meta {
  font-size: 11px;
  color: #6b7280;
  margin: 0 0 6px;
}

.cart-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.qty-control button {
  width: 22px;
  height: 22px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 14px;
  display: grid;
  place-items: center;
  line-height: 1;
}

.cart-remove {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  display: grid;
  place-items: center;
  padding: 2px;
  flex-shrink: 0;
}

.cart-remove:hover { color: #dc2626; }

.cart-panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  display: grid;
  gap: 8px;
}

.cart-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  padding: 4px 0;
}

.cart-btn-full {
  height: 40px;
  border: 1px solid #111827;
  background: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

.cart-btn-primary {
  height: 40px;
  border: 1px solid #009fe3;
  background: #009fe3;
  color: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

/* Search overlay */
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(244,248,251,.94);
  z-index: 200;
}

.search-overlay__box {
  width: 100%;
  min-height: 100%;
  background: #eef4f8;
}

.search-overlay__top {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 1px solid #d7e1e8;
  background: white;
  min-height: 60px;
}

.search-tabs {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 0 18px;
  flex-wrap: wrap;
}

.close-search {
  min-width: 150px;
  border: none;
  border-left: 1px solid #d7e1e8;
  background: #dfeff5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: .04em;
}

.search-overlay__input-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  align-items: center;
  padding: 18px 18px 14px;
}

.search-title {
  font-size: 30px;
  color: #4b5563;
  font-weight: 300;
}

.search-overlay__input {
  width: 100%;
  height: 60px;
  border: 2px solid #4f83ff;
  background: white;
  padding: 0 16px;
  font-size: 24px;
  color: #6b7280;
  font-weight: 600;
}

.search-overlay__content {
  display: grid;
  grid-template-columns: minmax(0,1fr) 280px;
  gap: 18px;
  padding: 14px 18px 20px;
}

.search-left__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-left__header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: .04em;
}

.search-side-box {
  background: white;
  border: 1px solid #dbe3ea;
  padding: 14px 18px;
}

.search-side-box h4 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .04em;
}

.search-side-box button {
  display: block;
  border: none;
  background: transparent;
  padding: 0;
  margin-bottom: 12px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  color: #374151;
  width: 100%;
}

.search-side-box button:hover { text-decoration: underline; }

.search-right { display: grid; gap: 16px; }

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1000px) {
  .desktop-nav { display: none; }
}

@media (max-width: 700px) {
  .search-overlay__content { grid-template-columns: 1fr; }
  .search-overlay__input-row { grid-template-columns: 1fr; }
  .search-title { font-size: 22px; }
  .search-tabs { display: none; }
  .close-search { min-width: 100px; }
  .cart-panel { width: calc(100vw - 20px); }
}
</style>

