import storageService from './storageService.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

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

  /**
   * Save order to Supabase (async, best-effort)
   * @param {Object} orderData - Order data with customer info, items, totals
   * @param {string} userId - User ID from auth
   * @returns {Promise<Object|null>} - Created order or null
   */
  async saveOrderToSupabase(orderData, userId) {
    if (!isSupabaseConfigured || !userId) {
      return null
    }

    try {
      // Insert main order
      const { data: orderInsert, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderData.order_number,
          user_id: userId,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone || null,
          address_line: orderData.address || null,
          city: orderData.city || null,
          country_code: orderData.country_code || 'DO',
          payment_method: orderData.payment_method || 'card',
          delivery_method: orderData.delivery_method || 'delivery',
          currency: orderData.currency || 'DOP',
          subtotal: orderData.subtotal || 0,
          shipping: orderData.shipping || 0,
          tax: orderData.tax || 0,
          discount: orderData.discount || 0,
          total: orderData.total || 0,
          status: orderData.status || 'pending',
          notes: orderData.notes || null,
        })
        .select('id')
        .single()

      if (orderError) {
        console.warn('[OrderService] Order insert failed:', orderError.message)
        return null
      }

      // Insert order items
      if (orderData.items && orderData.items.length > 0 && orderInsert) {
        const itemsPayload = orderData.items.map(item => ({
          order_id: orderInsert.id,
          product_name: item.name || item.product_name || 'Product',
          product_sku: item.sku || item.product_sku || null,
          product_image: item.image || null,
          size_label: item.size || item.size_label || null,
          quantity: item.quantity || 1,
          unit_price_dop: item.priceRD || item.price || 0,
          subtotal: (item.priceRD || item.price || 0) * (item.quantity || 1),
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsPayload)

        if (itemsError) {
          console.warn('[OrderService] Order items insert failed:', itemsError.message)
          // Don't fail the whole order, items are best-effort
        }
      }

      // Insert payment record if payment method is provided
      if (orderData.payment_method && orderInsert) {
        const paymentPayload = {
          order_id: orderInsert.id,
          method: orderData.payment_method,
          bank_name: orderData.selected_bank || null,
          reference_number: orderData.reference_number || null,
          receipt_url: orderData.receipt_url || null,
          amount: orderData.total || 0,
          currency: orderData.currency || 'DOP',
          status: orderData.status === 'confirmed' ? 'confirmed' : 'pending',
        }

        const { error: paymentError } = await supabase
          .from('payments')
          .insert(paymentPayload)

        if (paymentError) {
          console.warn('[OrderService] Payment insert failed:', paymentError.message)
          // Payment record is best-effort
        }
      }

      console.log('[OrderService] Order saved to Supabase:', orderInsert.id)
      return orderInsert
    } catch (error) {
      console.error('[OrderService] Supabase save failed:', error)
      return null
    }
  },

  /**
   * Get user orders from Supabase, normalized for UI consumption.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserOrdersFromSupabase(userId) {
    if (!isSupabaseConfigured || !userId) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error || !data) {
        if (error) {
          console.warn('[OrderService] Fetch orders failed:', error.message)
        }
        return []
      }

      return data.map(order => ({
        ...order,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          name: item.product_name || 'Producto',
          image: item.product_image || null,
          size: item.size_label || '',
          quantity: item.quantity || 1,
          priceRD: Number(item.unit_price_dop || 0),
          subtotal: Number(item.subtotal || 0),
        })),
      }))
    } catch (error) {
      console.warn('[OrderService] Fetch orders exception:', error)
      return []
    }
  },
}

export default orderService
