<template>
  <div class="orders-page">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/perfil')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Mis Pedidos</h1>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando tus pedidos...</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">inventory_2</span>
        <h2>Aún no tienes pedidos</h2>
        <p>Cuando realices tu primera compra, podrás verla aquí.</p>
        <button class="btn-primary" @click="router.push('/tienda')">Ir a la tienda</button>
      </div>

      <div v-else class="orders-list">
        <article v-for="order in orders" :key="order.id || order.order_number" class="order-card">
          <div class="order-card__header">
            <div>
              <p class="order-number">Pedido #{{ order.order_number || order.id }}</p>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <span class="order-status" :class="statusClass(order.status)">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div class="order-card__items">
            <div v-for="item in (order.items || []).slice(0, 3)" :key="item.name" class="order-item">
              <img :src="item.image || 'https://placehold.co/60x60/e5e7eb/475569?text=P'" :alt="item.name" />
              <div>
                <p class="item-name">{{ item.name }}</p>
                <p class="item-meta">{{ item.size }} × {{ item.quantity }}</p>
              </div>
            </div>
            <p v-if="(order.items || []).length > 3" class="more-items">
              +{{ (order.items || []).length - 3 }} producto(s) más
            </p>
          </div>

          <div class="order-card__footer">
            <div class="order-totals">
              <span>Método de pago: <strong>{{ paymentLabel(order.payment_method) }}</strong></span>
              <span class="order-total">Total: <strong>{{ fmtPrice(order.total) }}</strong></span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '../stores/useHistoryStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { formatPrice, convertPrice } from '../utils/currency.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const router = useRouter()
const history = useHistoryStore()
const auth = useAuthStore()
const settings = useSettingsStore()

const orders = ref([])
const isLoading = ref(true)

function fmtPrice(dop) {
  const cur = settings.currency?.value || 'DOP'
  return formatPrice(convertPrice(Number(dop) || 0, 'DOP', cur), cur)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function statusLabel(status) {
  const map = {
    confirmed: 'Confirmado', pending: 'Pendiente', processing: 'En proceso',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  }
  return map[status] || status || 'Confirmado'
}

function statusClass(status) {
  const map = {
    confirmed: 'status-confirmed', pending: 'status-pending', processing: 'status-processing',
    shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
  }
  return map[status] || 'status-confirmed'
}

function paymentLabel(method) {
  const map = { card: 'Tarjeta', transfer: 'Transferencia', cash: 'Efectivo' }
  return map[method] || method || 'N/A'
}

async function loadOrders() {
  isLoading.value = true
  try {
    // Intenta cargar desde Supabase
    if (isSupabaseConfigured) {
      const userId = auth.user?.value?.id
      if (userId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data?.length) {
          orders.value = data.map(o => ({
            ...o,
            items: o.order_items || [],
          }))
          return
        }
      }
    }

    // Fallback: historial local
    const localOrders = history.getOrders?.() || []
    orders.value = localOrders
  } catch (e) {
    console.warn('[MisPedidos] Error cargando pedidos:', e)
    orders.value = history.getOrders?.() || []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)
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
</style>
