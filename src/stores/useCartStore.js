import { ref, computed } from 'vue'
import storageService from '../services/storageService.js'
import { DATA_MODE } from '../lib/supabaseClient.js'
import { apiFetch } from '../services/apiClient.js'

const items = ref([])

function _loadLocal() {
  try {
    items.value = storageService.get('cart', [])
  } catch {
    items.value = []
  }
}

function _isBackendModeWithSession() {
  if (DATA_MODE !== 'backend') return false
  try {
    const s = JSON.parse(localStorage.getItem('pharmaderm_session') || 'null')
    return Boolean(s?.token)
  } catch {
    return false
  }
}

async function _loadFromBackend() {
  if (!_isBackendModeWithSession()) return
  try {
    const data = await apiFetch('/cart')
    const remoteItems = Array.isArray(data?.items) ? data.items : []
    items.value = remoteItems
    storageService.set('cart', remoteItems)
  } catch {
    // Keep local cart as fallback if backend request fails.
  }
}

function _save() {
  storageService.set('cart', items.value)
  if (_isBackendModeWithSession()) {
    apiFetch('/cart', { method: 'PUT', body: { items: items.value } }).catch(() => {})
  }
  window.dispatchEvent(new Event('storage'))
}

_loadLocal()

export async function initCartForUser() {
  _loadLocal()
  await _loadFromBackend()
}

export function clearCartForUser() {
  items.value = []
}

export function useCartStore() {
  const count = computed(() =>
    items.value.reduce((a, i) => a + (i.quantity || i.qty || 1), 0)
  )

  const subtotal = computed(() =>
    items.value.reduce(
      (a, i) => a + (i.priceRD || i.priceUSD || 0) * (i.quantity || i.qty || 1),
      0
    )
  )

  function addItem(product, options = {}) {
    const { size, qty = 1, priceRD, mode = 'one-time' } = options
    const price = priceRD ?? product.priceRD ?? (product.priceUSD ? Math.round(product.priceUSD * 59.4) : 0)
    const existing = items.value.find(
      (i) => i.id === product.id && (i.size || '') === (size || '')
    )
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty
    } else {
      items.value.push({
        id: product.id,
        slug: product.slug || product.id,
        name: product.name,
        image: product.image,
        size: size || product.defaultSize || '',
        quantity: qty,
        priceRD: price,
        brand: product.brand || product.brandLabel || '',
        mode,
      })
    }
    _save()
  }

  function removeItem(index) {
    items.value.splice(index, 1)
    _save()
  }

  function updateQty(index, qty) {
    const clamped = Math.max(1, qty)
    items.value[index].quantity = clamped
    _save()
  }

  function clear() {
    items.value = []
    _save()
  }

  function refresh() {
    _loadLocal()
    _loadFromBackend()
  }

  return { items, count, subtotal, addItem, removeItem, updateQty, clear, refresh }
}
