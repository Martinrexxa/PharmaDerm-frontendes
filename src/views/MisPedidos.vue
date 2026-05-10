<template>
  <div class="orders-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/perfil')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>{{ isEs ? 'Mis pedidos' : 'My Orders' }}</h1>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ isEs ? 'Cargando tus pedidos...' : 'Loading your orders...' }}</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">inventory_2</span>
        <h2>{{ isEs ? 'AÃºn no tienes pedidos' : "You don't have any orders yet" }}</h2>
        <p>{{ isEs ? 'Cuando hagas tu primera compra, la verÃ¡s aquÃ­.' : "When you make your first purchase, you'll see it here." }}</p>
        <button class="btn-primary" @click="router.push('/tienda')">{{ isEs ? 'Ir a la tienda' : 'Go to store' }}</button>
      </div>

      <div v-else class="orders-list">
        <div class="policy-hint">
          <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">local_shipping</span>
          {{ isEs ? '¿Preguntas sobre envíos o devoluciones?' : 'Questions about delivery or returns?' }}
          <RouterLink to="/shipping-returns" class="policy-link">{{ isEs ? 'Ver política de envíos y devoluciones' : 'View Shipping &amp; Returns Policy' }} ?</RouterLink>
        </div>

        <article v-for="order in orders" :key="order.id || order.order_number" class="order-card">
          <div class="order-card__header">
            <div>
              <p class="order-number">Order #{{ order.order_number || order.id }}</p>
              <p class="order-date">{{ formatDate(order.created_at || order.date) }}</p>
            </div>
            <span class="order-status" :class="statusClass(order.status)">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div class="order-card__items">
            <div v-for="item in (order.items || []).slice(0, 3)" :key="item.name" class="order-item">
              <img :src="item.image || fallbackOrderImage" :alt="item.name" />
              <div>
                <p class="item-name">{{ item.name }}</p>
                <p class="item-meta">{{ item.size }} Ã— {{ item.quantity }}</p>
              </div>
            </div>
            <p v-if="(order.items || []).length > 3" class="more-items">
              +{{ (order.items || []).length - 3 }} {{ isEs ? 'producto(s) mÃ¡s' : 'more item(s)' }}
            </p>
          </div>

          <div class="order-card__footer">
            <div class="order-totals">
              <span>{{ isEs ? 'MÃ©todo de pago' : 'Payment method' }}: <strong>{{ paymentLabel(order.payment_method) }}</strong></span>
              <span class="order-total">Total: <strong>{{ fmtPrice(order.total) }}</strong></span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '../stores/useHistoryStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { formatPrice, convertPrice } from '../utils/currency.js'
import orderService from '../services/orderService.js'
import { lrpCatalog } from '../data/lrpCatalog'
import { ceraveCatalog } from '../data/ceraveCatalog'
import { useI18n } from '../lib/i18n.js'

const router = useRouter()
const history = useHistoryStore()
const auth = useAuthStore()
const settings = useSettingsStore()
const { lang } = useI18n()
const isEs = computed(() => lang.value === 'es')

const orders = ref([])
const isLoading = ref(true)
const userId = computed(() => auth.user?.value?.id || null)
const fallbackOrderImage = 'https://placehold.co/60x60/e5e7eb/475569?text=P'
const productIndex = [...lrpCatalog, ...ceraveCatalog]
let loadToken = 0

function fmtPrice(dop) {
  const cur = settings.currency?.value || 'DOP'
  return formatPrice(convertPrice(Number(dop) || 0, 'DOP', cur), cur)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(isEs.value ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function statusLabel(status) {
  const map = {
    confirmed: isEs.value ? 'Confirmado' : 'Confirmed',
    pending: isEs.value ? 'Pendiente' : 'Pending',
    processing: isEs.value ? 'Procesando' : 'Processing',
    shipped: isEs.value ? 'Enviado' : 'Shipped',
    delivered: isEs.value ? 'Entregado' : 'Delivered',
    cancelled: isEs.value ? 'Cancelado' : 'Cancelled',
  }
  return map[status] || status || (isEs.value ? 'Confirmado' : 'Confirmed')
}

function statusClass(status) {
  const map = {
    confirmed: 'status-confirmed', pending: 'status-pending', processing: 'status-processing',
    shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
  }
  return map[status] || 'status-confirmed'
}

function paymentLabel(method) {
  const map = {
    card: isEs.value ? 'Tarjeta' : 'Card',
    transfer: isEs.value ? 'Transferencia bancaria' : 'Bank transfer',
    cash: isEs.value ? 'Efectivo' : 'Cash',
  }
  return map[method] || method || (isEs.value ? 'N/D' : 'N/A')
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findCatalogImageByName(name) {
  const needle = normalizeText(name)
  if (!needle) return ''
  const exact = productIndex.find((p) => normalizeText(p.name) === needle)
  if (exact?.image) return exact.image
  const partial = productIndex.find((p) => normalizeText(p.name).includes(needle) || needle.includes(normalizeText(p.name)))
  return partial?.image || ''
}

function hydrateOrderImages(list) {
  return (list || []).map((order) => ({
    ...order,
    items: (order.items || []).map((item) => ({
      ...item,
      image: item.image || findCatalogImageByName(item.name) || fallbackOrderImage,
    })),
  }))
}

function orderKey(order) {
  return String(order?.order_number || order?.id || '')
}

function mergeOrders(remoteOrders = [], localOrders = []) {
  const seen = new Set()
  return [...remoteOrders, ...localOrders].filter((order) => {
    const key = orderKey(order)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function loadOrders({ scrollTop = false } = {}) {
  const token = ++loadToken
  isLoading.value = true
  try {
    const localOrders = history.getOrders?.() || []
    let remoteOrders = []

    if (userId.value) {
      remoteOrders = await orderService.getUserOrdersFromSupabase(userId.value)
    }

    if (token !== loadToken) return
    orders.value = hydrateOrderImages(mergeOrders(remoteOrders, localOrders))
  } catch (e) {
    console.warn('[MisPedidos] Error cargando pedidos:', e)
    if (token !== loadToken) return
    orders.value = hydrateOrderImages(history.getOrders?.() || [])
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
  if (!document.hidden) loadOrders()
}

watch(userId, () => loadOrders({ scrollTop: true }), { immediate: true })
watch(() => history.orders.value.length, loadOrders)

window.addEventListener('focus', reloadWhenVisible)
document.addEventListener('visibilitychange', reloadWhenVisible)

onBeforeUnmount(() => {
  window.removeEventListener('focus', reloadWhenVisible)
  document.removeEventListener('visibilitychange', reloadWhenVisible)
})
</script>

<style scoped>
.orders-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
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

.page-header h1 { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0; }

.loading-state { text-align: center; padding: 5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #16a6e2; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 5rem 1rem; }
.empty-icon { font-size: 64px; color: #16a6e2; display: block; margin-bottom: 1rem; }
.empty-state h2 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; }
.empty-state p { color: #64748b; margin: 0 0 1.5rem; }

.orders-list { display: grid; gap: 1rem; }

.order-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }

.order-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
}

.order-number { font-weight: 800; font-size: 0.95rem; color: #0f172a; margin: 0 0 2px; }
.order-date { font-size: 0.8rem; color: #94a3b8; margin: 0; }

.order-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.status-confirmed { background: #d1fae5; color: #065f46; }
.status-pending   { background: #fef3c7; color: #92400e; }
.status-processing{ background: #dbeafe; color: #1e40af; }
.status-shipped   { background: #e0e7ff; color: #3730a3; }
.status-delivered { background: #dcfce7; color: #14532d; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

.order-card__items { padding: 14px 18px; display: grid; gap: 10px; }

.order-item { display: flex; align-items: center; gap: 10px; }
.order-item img { width: 46px; height: 46px; object-fit: contain; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; flex-shrink: 0; }
.item-name { font-size: 0.88rem; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
.item-meta { font-size: 0.78rem; color: #94a3b8; margin: 0; }
.more-items { font-size: 0.8rem; color: #94a3b8; padding-left: 56px; }

.order-card__footer { padding: 12px 18px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
.order-totals { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #475569; flex-wrap: wrap; gap: 6px; }
.order-total { font-size: 0.95rem; color: #0f172a; }

.btn-primary { background: #16a6e2; color: white; border: none; padding: 0.85rem 1.75rem; font-weight: 800; cursor: pointer; border-radius: 999px; font-size: 0.95rem; }
.btn-primary:hover { background: #0c8cc4; }

.policy-hint { font-size: 0.83rem; color: #64748b; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.policy-link { color: #16a6e2; font-weight: 600; text-decoration: none; }
.policy-link:hover { text-decoration: underline; }
</style>


