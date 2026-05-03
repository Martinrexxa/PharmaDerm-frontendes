import { ref, computed } from 'vue'
import storageService from '../services/storageService.js'

const items = ref([])

function _load() {
  try {
    items.value = storageService.get('cart', [])
  } catch {
    items.value = []
  }
}

function _save() {
  storageService.set('cart', items.value)
  window.dispatchEvent(new Event('storage'))
}

// Load cart for guest on module init (storageService has no user yet → global key)
_load()

// Called by useAuthStore after login — reloads using user-scoped key
export function initCartForUser() {
  _load()
}

// Called by useAuthStore on logout — clears in-memory cart
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
    const { size, qty = 1, priceUSD, mode = 'one-time' } = options
    const price = priceUSD ?? product.priceFrom ?? product.priceRD ?? 0
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
    if (qty <= 0) return removeItem(index)
    items.value[index].quantity = qty
    _save()
  }

  function clear() {
    items.value = []
    _save()
  }

  function refresh() {
    _load()
  }

  return { items, count, subtotal, addItem, removeItem, updateQty, clear, refresh }
}
