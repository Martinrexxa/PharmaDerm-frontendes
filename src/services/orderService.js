import storageService from './storageService.js'

export const orderService = {
  getOrders() {
    return storageService.get('orders', [])
  },

  getOrder(id) {
    return this.getOrders().find(o => o.id === id) || null
  },

  saveOrder(data) {
    const entry = {
      ...data,
      id: data.id || Date.now(),
      date: data.date || new Date().toISOString(),
      status: data.status || 'confirmed',
    }
    const orders = this.getOrders()
    orders.unshift(entry)
    storageService.set('orders', orders.slice(0, 50))
    return entry
  },

  updateStatus(id, status) {
    const orders = this.getOrders()
    const idx = orders.findIndex(o => o.id === id)
    if (idx !== -1) {
      orders[idx].status = status
      storageService.set('orders', orders)
      return orders[idx]
    }
    return null
  },
}

export default orderService
