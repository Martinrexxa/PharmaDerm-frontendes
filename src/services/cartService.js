import storageService from './storageService.js'

export const cartService = {
  getItems() {
    return storageService.get('cart', [])
  },

  addItem(product, { size = 'Default', qty = 1, priceUSD = 0, priceRD = 0 } = {}) {
    const items = this.getItems()
    const existingIdx = items.findIndex(i => i.id === product.id && i.size === size)
    if (existingIdx !== -1) {
      items[existingIdx].quantity = (items[existingIdx].quantity || 1) + qty
    } else {
      items.push({
        id: product.id || product.slug || Date.now(),
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.image,
        size,
        quantity: qty,
        priceRD: priceRD || product.priceRD || product.priceFrom || 0,
        priceUSD: priceUSD || product.priceUSD || 0,
        category: product.category,
      })
    }
    storageService.set('cart', items)
    return items
  },

  removeItem(index) {
    const items = this.getItems()
    items.splice(index, 1)
    storageService.set('cart', items)
    return items
  },

  updateQty(index, qty) {
    const items = this.getItems()
    if (!items[index]) return items
    if (qty <= 0) return this.removeItem(index)
    items[index].quantity = qty
    storageService.set('cart', items)
    return items
  },

  clearCart() {
    storageService.set('cart', [])
  },

  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + (i.priceRD || 0) * (i.quantity || 1), 0)
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + (i.quantity || 1), 0)
  },
}

export default cartService
