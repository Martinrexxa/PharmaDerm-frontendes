<template>
  <div class="checkout-page">
    <transition name="payfade">
      <div v-if="paymentModalOpen" class="payment-modal-backdrop" @click.stop style="pointer-events: all;">
        <div class="payment-modal" role="dialog" aria-modal="true" aria-label="Processing payment">
          <div v-if="paymentStep === 'processing'" class="payment-modal-body">
            <div class="pd-spinner" aria-hidden="true"></div>
            <h3>Processing payment</h3>
            <p>We are confirming your payment. Please wait…</p>
          </div>

          <div v-else class="payment-modal-body">
            <div class="pd-check" aria-hidden="true">
              <svg viewBox="0 0 52 52">
                <circle class="pd-check-circle" cx="26" cy="26" r="25" fill="none" />
                <path class="pd-check-mark" fill="none" d="M14 27l7 7 17-17" />
              </svg>
            </div>
            <h3>Payment completed</h3>
            <p>Thank you. Your purchase has been confirmed.</p>
          </div>
        </div>
      </div>
    </transition>
    <!-- Confirmación -->
    <div v-if="orderPlaced" class="confirm-screen">
      <div class="confirm-box">
        <div class="confirm-icon"><span class="material-symbols-outlined">check_circle</span></div>
        <h2>Order confirmed!</h2>
        <p class="confirm-code">Code: <strong>{{ confirmationCode }}</strong></p>
        <p class="confirm-msg">{{ emailStatusMsg }}</p>

        <div class="confirm-summary">
          <div v-for="(item, index) in placedItems" :key="`${item.id || item.slug || item.name}-${item.size || 'default'}-${index}`" class="confirm-item">
            <img :src="item.image" :alt="item.name" />
            <div class="confirm-item-info">
              <p>{{ item.name }}</p>
              <p class="meta">Size: {{ item.size || 'N/A' }}</p>
              <p class="meta">Quantity: {{ item.quantity || 1 }}</p>
            </div>
            <strong>{{ fmtCurrency(item.priceRD * (item.quantity || 1)) }}</strong>
          </div>
          <div class="confirm-total">
            <span>Total paid</span>
            <strong>{{ fmtCurrency(placedTotal) }}</strong>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="btn-outline" @click="router.push('/inicio')">Go to home</button>
          <button class="btn-primary" @click="router.push('/tienda')">Continue shopping</button>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div v-else class="checkout-layout">
      <div class="checkout-left">
        <h1 class="checkout-title">Checkout</h1>

        <!-- Contacto -->
        <section class="checkout-section">
          <h2>Contact information</h2>
          <div class="form-grid">
            <div class="form-field full">
              <label>Full name</label>
              <input v-model="form.name" type="text" pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*" placeholder="Your name" maxlength="60" @beforeinput="blockNonLetterInput" @input="form.name = sanitizeLetters(form.name).slice(0, 60)" />
            </div>
            <div class="form-field">
              <label>Email address</label>
              <input v-model="form.email" type="email" placeholder="email@example.com" maxlength="120" />
            </div>
            <div class="form-field">
              <label>Phone</label>
              <input v-model="form.phone" type="tel" inputmode="numeric" pattern="[0-9]*" placeholder="8091234567" maxlength="10" @input="form.phone = form.phone.replace(/\D/g, '').slice(0, 10)" />
            </div>
            <div class="form-field">
              <label>ID Number</label>
              <input v-model="form.cedula" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="00112345678" maxlength="11" @input="form.cedula = form.cedula.replace(/\D/g, '').slice(0, 11)" />
            </div>
          </div>
        </section>

        <!-- Dirección -->
        <section class="checkout-section">
          <h2>Delivery address</h2>
          <div class="form-grid">
            <div class="form-field full">
              <label>Street address</label>
              <input v-model="form.address" type="text" placeholder="Street, number, neighborhood" maxlength="140" @beforeinput="blockInvalidAddressInput" @input="form.address = sanitizeAddress(form.address).slice(0, 140)" />
            </div>
            <div class="form-field">
              <label>City</label>
              <input v-model="form.city" type="text" pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*" placeholder="City" maxlength="60" @beforeinput="blockNonLetterInput" @input="form.city = sanitizeLetters(form.city).slice(0, 60)" />
            </div>
            <div class="form-field">
              <label>Country</label>
              <select v-model="form.country">
                <option value="DO">Dominican Republic</option>
                <option value="US">United States</option>
                <option value="PR">Puerto Rico</option>
                <option value="MX">Mexico</option>
                <option value="CO">Colombia</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Payment method -->
        <section class="checkout-section">
          <h2>Payment method</h2>
          <div class="payment-methods">
            <label v-for="m in paymentMethods" :key="m.key" class="payment-card" :class="{ selected: form.paymentMethod === m.key }">
              <input type="radio" :value="m.key" v-model="form.paymentMethod" />
              <span class="material-symbols-outlined">{{ m.icon }}</span>
              <span>{{ m.label }}</span>
            </label>
          </div>

          <!-- Card fields -->
          <div v-if="form.paymentMethod === 'card'" class="payment-detail-box">
            <p class="payment-note">
              <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">lock</span>
              Simulated payment — no real charge will be made.
            </p>
            <div class="form-grid">
              <div class="form-field full">
                <label>Card number</label>
                <input v-model="card.number" type="text" inputmode="numeric" pattern="[0-9 ]*" placeholder="1234 5678 9012 3456" maxlength="19" @input="formatCardNumber" />
              </div>
              <div class="form-field full">
                <label>Cardholder name</label>
                <input v-model="card.holder" type="text" pattern="[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*" placeholder="As it appears on the card" maxlength="60" @beforeinput="blockNonLetterInput" @input="card.holder = sanitizeLetters(card.holder).slice(0, 60)" />
              </div>
              <div class="form-field">
                <label>Expiry</label>
                <input v-model="card.expiry" type="text" placeholder="MM/YY" maxlength="5" @input="formatExpiry" />
              </div>
              <div class="form-field">
                <label>CVV</label>
                <input v-model="card.cvv" type="password" inputmode="numeric" pattern="[0-9]*" placeholder="•••" maxlength="3" @input="card.cvv = card.cvv.replace(/\D/g, '').slice(0, 3)" />
              </div>
            </div>
          </div>

          <!-- Transfer fields -->
          <div v-if="form.paymentMethod === 'transfer'" class="payment-detail-box">
            <p class="transfer-note">Transfer to one of our accounts and upload your receipt.</p>
            <div class="bank-list">
              <div v-for="bank in banks" :key="bank.name" class="bank-card" :class="{ selected: form.selectedBank === bank.name }" @click="form.selectedBank = bank.name">
                <div class="bank-logo">{{ bank.initials }}</div>
                <div class="bank-info">
                  <strong>{{ bank.name }}</strong>
                  <span>{{ bank.accountType }} · {{ bank.accountNumber }}</span>
                  <span class="bank-holder">Account name: {{ bank.holder }}</span>
                </div>
                <span v-if="form.selectedBank === bank.name" class="material-symbols-outlined bank-check">check_circle</span>
              </div>
            </div>
            <div class="form-grid" style="margin-top:16px">
              <div class="form-field">
                <label>Reference number</label>
                <input
                  v-model="form.referenceNumber"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="Confirmation number"
                  maxlength="8"
                  @input="form.referenceNumber = form.referenceNumber.replace(/\D/g, '').slice(0, 8)"
                />
              </div>
              <div class="form-field">
                <label>Payment receipt</label>
                <label class="upload-receipt-btn">
                  <input type="file" accept="image/*,.pdf" hidden @change="onReceiptUpload" />
                  <span class="material-symbols-outlined">upload_file</span>
                  {{ form.receiptName || 'Upload receipt' }}
                </label>
              </div>
            </div>
          </div>

          <!-- Cash note -->
          <div v-if="form.paymentMethod === 'cash'" class="payment-detail-box">
            <p class="payment-note">
              <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">info</span>
              Pay in cash when you receive your order.
            </p>
          </div>
        </section>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <button class="btn-confirm" :disabled="placing" @click="placeOrder">
          {{ placing ? 'Processing...' : 'Confirm order' }}
        </button>
      </div>

      <!-- Sidebar -->
      <aside class="checkout-right">
        <h2>Order summary</h2>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <p>No products in cart.</p>
          <button @click="router.push('/tienda')">Go to store</button>
        </div>

        <div v-else>
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.id" class="order-item">
              <img :src="item.image" :alt="item.name" />
              <div class="order-item-info">
                <p class="order-item-name">{{ item.name }}</p>
                <p class="order-item-meta">{{ item.size }} · Qty: {{ item.quantity }}</p>
              </div>
              <strong>{{ fmtCurrency(item.priceRD * (item.quantity || 1)) }}</strong>
            </div>
          </div>

          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>{{ fmtCurrency(subtotal) }}</span>
            </div>
            <div class="total-row">
              <span>Shipping</span>
              <span>{{ subtotal >= 3000 ? 'Free' : fmtCurrency(250) }}</span>
            </div>
            <div class="total-row">
              <span>Tax (18%)</span>
              <span>{{ fmtCurrency(itbis) }}</span>
            </div>
            <div class="total-row total-row--big">
              <strong>Total</strong>
              <strong>{{ fmtCurrency(total) }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { initCartForUser } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useHistoryStore } from '../stores/useHistoryStore'
import { estimateOrderDelivery, sendOrderConfirmationEmail } from '../services/emailService.js'
import orderService from '../services/orderService.js'
import userService from '../services/userService.js'
import { apiFetch } from '../services/apiClient.js'
import { useI18n } from '../lib/i18n.js'
import { formatPrice, convertPrice } from '../utils/currency.js'
import { getShippingCost } from '../utils/delivery.js'
import { delay, withTimeout } from '../utils/async.js'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const settings = useSettingsStore()
const history = useHistoryStore()
const { lang } = useI18n()

const { items: cartItems, subtotal: cartSubtotal, clear: clearCart } = cart
const { user } = auth

const form = ref({
  name: '', email: '', phone: '', cedula: '',
  address: '', city: '', country: 'DO',
  paymentMethod: 'card',
  selectedBank: '',
  referenceNumber: '',
  receiptName: '',
  receiptBase64: '',
})

const card = reactive({ number: '', holder: '', expiry: '', cvv: '' })

const paymentMethods = [
  { key: 'card', label: 'Credit/debit card', icon: 'credit_card' },
  { key: 'transfer', label: 'Bank transfer', icon: 'account_balance' },
  { key: 'cash', label: 'Cash (on delivery)', icon: 'payments' },
]

const banks = [
  { name: 'Banreservas', initials: 'BR', accountType: 'Checking account', accountNumber: '2100-1234-5678', holder: 'PharmaDerm SRL' },
  { name: 'BHD León', initials: 'BH', accountType: 'Checking account', accountNumber: '2765-9876-5432', holder: 'PharmaDerm SRL' },
  { name: 'Banco Popular', initials: 'BP', accountType: 'Checking account', accountNumber: '5432-1111-2222', holder: 'PharmaDerm SRL' },
  { name: 'Asociación Cibao', initials: 'AC', accountType: 'Cta. de Ahorros', accountNumber: '0201-8765-4321', holder: 'PharmaDerm SRL' },
]

const formError = ref('')
const placing = ref(false)
const paymentModalOpen = ref(false)
const paymentStep = ref('processing') // 'processing' | 'success'
const orderPlaced = ref(false)
const confirmationCode = ref('')
const placedItems = ref([])
const placedTotal = ref(0)
const emailStatusMsg = ref('Thank you for your purchase. You will receive a confirmation email soon.')

const subtotal = computed(() => cartSubtotal.value)
const shipping = computed(() => getShippingCost(subtotal.value, form.value.city))
const itbis = computed(() => Math.round(subtotal.value * 0.18))
const total = computed(() => subtotal.value + shipping.value + itbis.value)
const CARD_ENCRYPTION_KEY = String(import.meta.env.VITE_CARD_ENCRYPTION_KEY || '').trim()

function sanitizeLetters(value) {
  return String(value || '').replace(/[^\p{L}\s'-]/gu, '')
}

function sanitizeAddress(value) {
  return String(value || '').replace(/[^\p{L}0-9\s.,#/\-]/gu, '')
}

function blockNonLetterInput(event) {
  const text = String(event?.data || '')
  if (!text) return
  if (/[^\p{L}\s'-]/u.test(text)) {
    event.preventDefault()
  }
}

function blockInvalidAddressInput(event) {
  const text = String(event?.data || '')
  if (!text) return
  if (/[^\p{L}0-9\s.,#/\-]/u.test(text)) {
    event.preventDefault()
  }
}

function toBase64(bytes) {
  let binary = ''
  const arr = new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i += 1) binary += String.fromCharCode(arr[i])
  return btoa(binary)
}

async function encryptCardSnapshot(cardSnapshot) {
  if (!CARD_ENCRYPTION_KEY) {
    throw new Error('Card encryption key is not configured. Set VITE_CARD_ENCRYPTION_KEY.')
  }
  if (!window?.crypto?.subtle) {
    throw new Error('Secure crypto API is not available in this browser.')
  }

  const encoder = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.digest('SHA-256', encoder.encode(CARD_ENCRYPTION_KEY))
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const plaintext = encoder.encode(JSON.stringify(cardSnapshot))
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return `v1:${toBase64(iv)}:${toBase64(ciphertext)}`
}

function fmtCurrency(amount) {
  const cur = settings.currency?.value || 'DOP'
  return formatPrice(convertPrice(amount, 'DOP', cur), cur)
}

function formatCardNumber(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16)
  card.number = v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4)
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
  card.expiry = v
}

function onReceiptUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  form.value.receiptName = file.name
  const reader = new FileReader()
  reader.onload = (e) => { form.value.receiptBase64 = String(e.target?.result || '') }
  reader.readAsDataURL(file)
}

function resolvePaymentDetails() {
  const method = String(form.value.paymentMethod || '').toLowerCase()

  if (method === 'card') {
    const digits = String(card.number || '').replace(/\D/g, '')
    const last4 = digits.slice(-4) || '****'
    return `Card: **** **** **** ${last4}`
  }

  if (method === 'transfer') {
    const bank = (form.value.selectedBank || '').trim()
    const ref = (form.value.referenceNumber || '').trim()
    if (bank && ref) {
      return `Bank transfer: pending validation. Bank: ${bank}. Reference: ${ref}`
    }
    if (ref) {
      return `Bank transfer: pending validation. Reference: ${ref}`
    }
    return 'Bank transfer: pending validation.'
  }

  if (method === 'cash') {
    return 'Cash on delivery: you will pay when you receive your order.'
  }

  return 'Payment method registered successfully.'
}

function toBackendOrderPayload(orderData, userId) {
  return {
    ...orderData,
    user_id: userId || null,
    userId: userId || null,
    usuario_id: userId || null,
    orderNumber: orderData.order_number,
    customerName: orderData.customer_name,
    customerEmail: orderData.customer_email,
    customerPhone: orderData.customer_phone,
    address_line: orderData.address,
    direccion: orderData.address,
    countryCode: orderData.country_code,
    paymentMethod: orderData.payment_method,
    deliveryMethod: orderData.delivery_method,
    selectedBank: orderData.selected_bank,
    referenceNumber: orderData.reference_number,
    createdAt: orderData.created_at,
    items: (orderData.items || []).map((item) => ({
      ...item,
      productName: item.product_name || item.name,
      sizeLabel: item.size_label || item.size || null,
      qty: item.quantity || 1,
      unit_price: item.priceRD || item.price || 0,
      unitPrice: item.priceRD || item.price || 0,
    })),
  }
}

const MIN_EXPIRY_MONTH = 5  // mayo
const MIN_EXPIRY_YEAR  = 2026

function validateCard() {
  card.holder = sanitizeLetters(card.holder)
  const digits = card.number.replace(/\s/g, '')
  if (digits.length !== 16) return 'Card number must have 16 digits.'
  if (!card.holder.trim()) return 'Enter the cardholder name.'

  const [mm, yy] = (card.expiry || '').split('/')
  const month = parseInt(mm, 10)
  const year  = parseInt('20' + (yy || ''), 10)
  if (
    !mm || !yy ||
    mm.length !== 2 || yy.length !== 2 ||
    isNaN(month) || isNaN(year) ||
    month < 1 || month > 12 ||
    year < MIN_EXPIRY_YEAR ||
    (year === MIN_EXPIRY_YEAR && month < MIN_EXPIRY_MONTH)
  ) {
    return 'Invalid expiry date. Must be 05/26 or later (MM/YY format).'
  }

  const cvvDigits = card.cvv.replace(/\D/g, '')
  if (cvvDigits.length !== 3) return 'CVV must be exactly 3 digits.'
  return ''
}

function validateTransfer() {
  if (!form.value.selectedBank) return 'Select the bank you transferred to.'
  form.value.referenceNumber = String(form.value.referenceNumber || '').trim().slice(0, 8)
  if (!form.value.referenceNumber.trim()) return 'Enter the transfer reference number.'
  if (!form.value.receiptBase64) return 'Upload the payment receipt.'
  return ''
}

function validateContact() {
  const phone = (form.value.phone || '').replace(/\D/g, '')
  if (phone.length !== 10) return 'Phone must be exactly 10 digits (e.g. 8091234567).'
  const cedula = (form.value.cedula || '').replace(/\D/g, '')
  if (cedula.length !== 11) return 'ID number must be exactly 11 digits (e.g. 00112345678).'
  return ''
}

function validate() {
  form.value.name = sanitizeLetters(form.value.name)
  form.value.city = sanitizeLetters(form.value.city)
  if (!form.value.name.trim()) return 'Enter your full name.'
  if (!form.value.email.trim() || !form.value.email.includes('@')) return 'Enter a valid email address.'
  if (!form.value.address.trim()) return 'Enter your delivery address.'
  if (!form.value.city.trim()) return 'Enter your city.'
  if (cartItems.value.length === 0) return 'Your cart is empty.'

  const contactErr = validateContact()
  if (contactErr) return contactErr

  if (form.value.paymentMethod === 'card') return validateCard()
  if (form.value.paymentMethod === 'transfer') return validateTransfer()
  return ''
}

async function placeOrder() {
  formError.value = validate()
  if (formError.value) return

  placing.value = true
  paymentModalOpen.value = true
  paymentStep.value = 'processing'
  try {
  await delay(2800)

  const code = 'PD-' + Date.now().toString(36).toUpperCase()
  confirmationCode.value = code
  const cur = settings.currency?.value || 'DOP'
  const cardDigits = String(card.number || '').replace(/\D/g, '')
  const cardLast4 = cardDigits.slice(-4) || null
  let encryptedCardBlob = null

  if (form.value.paymentMethod === 'card') {
    try {
      encryptedCardBlob = await encryptCardSnapshot({
        holder: card.holder?.trim() || '',
        number: cardDigits,
        expiry: card.expiry || '',
        last4: cardLast4,
        captured_at: new Date().toISOString(),
      })
    } catch (encError) {
      throw new Error(encError?.message || 'Could not encrypt card data before saving.')
    }
  }

  const orderData = {
    id: Date.now(),
    order_number: code,
    customer_name: form.value.name,
    customer_email: form.value.email,
    customer_phone: form.value.phone,
    address: form.value.address,
    city: form.value.city,
    country_code: form.value.country || 'DO',
    payment_method: form.value.paymentMethod,
    selected_bank: form.value.selectedBank || null,
    reference_number: form.value.referenceNumber || null,
    payment_card_last4: form.value.paymentMethod === 'card' ? cardLast4 : null,
    payment_card_encrypted: form.value.paymentMethod === 'card' ? encryptedCardBlob : null,
    delivery_method: 'delivery',
    currency: cur,
    items: cartItems.value.map(i => ({
      id: i.id || null,
      product_id: i.product_id || i.id || null,
      slug: i.slug || null,
      name: i.name,
      product_name: i.name,
      sku: i.sku || null,
      image: i.image || null,
      size: i.size,
      size_label: i.size,
      quantity: i.quantity,
      price: i.priceRD,
      priceRD: i.priceRD,
      subtotal: Math.round(i.priceRD * (i.quantity || 1)),
    })),
    subtotal: subtotal.value,
    shipping: shipping.value,
    tax: itbis.value,
    total: total.value,
    status: 'confirmed',
    notes: encryptedCardBlob
      ? JSON.stringify({
          payment_card_encrypted: encryptedCardBlob,
          payment_card_last4: cardLast4,
          payment_card_schema: 'v1',
        })
      : null,
    created_at: new Date().toISOString(),
  }

  placedItems.value = JSON.parse(JSON.stringify(cartItems.value))
  placedTotal.value = total.value

  // Save to localStorage
  await history.saveOrder(orderData)

  const userId = user.value?.id
  let persisted = false
  const backendPayload = toBackendOrderPayload(orderData, userId)
  try {
    await withTimeout(apiFetch('/orders', { method: 'POST', body: backendPayload }), 6000, 'Save order to backend')
    persisted = true
  } catch (error) {
    console.warn('[Checkout] Backend order save failed:', error)
    if (userId) {
      try {
        const supabaseSave = await withTimeout(orderService.saveOrderToSupabase(orderData, userId), 4000, 'Save order to Supabase')
        persisted = Boolean(supabaseSave)
      } catch (supabaseError) {
        console.warn('[Checkout] Supabase save failed:', supabaseError)
      }
    }
  }

  if (!persisted) {
    throw new Error('No se pudo guardar tu pedido en el servidor. No se confirmó la compra.')
  }

  clearCart()

  const productsSummary = (orderData.items || [])
    .map(i => `${i.name} — ${i.size || 'N/A'} × ${i.quantity || 1} — ${fmtCurrency((i.priceRD || 0) * (i.quantity || 1))}`)
    .join('\n')
  const estimatedDelivery = estimateOrderDelivery(orderData)

  withTimeout((async () => {
    try {
      const backendEmail = await apiFetch('/email/order', {
        method: 'POST',
        body: {
          to_email: orderData.customer_email,
          to_name: orderData.customer_name,
          order_number: orderData.order_number,
          order_total: fmtCurrency(orderData.total),
          payment_method: orderData.payment_method,
          delivery_method: orderData.delivery_method,
          estimated_delivery: estimatedDelivery,
          products: productsSummary,
          shipping_address: [orderData.address, orderData.city, orderData.country_code].filter(Boolean).join(', '),
        }
      })
      return { ok: !!backendEmail?.ok }
    } catch {
      return sendOrderConfirmationEmail({
        to_email: orderData.customer_email,
        to_name: orderData.customer_name,
        order_id: orderData.id,
        order_number: orderData.order_number,
        order_total: fmtCurrency(orderData.total),
        order_status: orderData.status,
        payment_method: orderData.payment_method,
        payment_details: resolvePaymentDetails(),
        delivery_method: orderData.delivery_method,
        estimated_delivery: estimatedDelivery,
        products: productsSummary,
        shipping_address: [orderData.address, orderData.city, orderData.country_code].filter(Boolean).join(', '),
        support_email: 'soporte@pharmadermrd.com',
        reply_to: 'soporte@pharmadermrd.com',
      }, lang.value)
    }
  })(), 8000, 'Order confirmation email')
  .then((emailResult) => {
    if (emailResult.ok) {
      emailStatusMsg.value = 'Order confirmed. We sent the confirmation to your email.'
    } else if (emailResult.simulated) {
      emailStatusMsg.value = emailResult.message || 'Order saved successfully, but the confirmation email is not configured.'
    } else {
      emailStatusMsg.value = emailResult.message || 'Order saved successfully, but we could not send the confirmation email.'
    }
  })
  .catch((error) => {
    console.warn('[Checkout] Order email failed:', error)
    emailStatusMsg.value = 'Order saved successfully, but we could not send the confirmation email.'
  })

  paymentStep.value = 'success'
  await delay(900)
  paymentModalOpen.value = false

  placing.value = false
  orderPlaced.value = true
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch (error) {
    console.warn('[Checkout] Order flow failed:', error)
    formError.value = error?.message || 'We could not complete the order right now. Please try again.'
    paymentModalOpen.value = false
    placing.value = false
  }
}

onMounted(() => {
  initCartForUser().catch(() => {})
  nextTick(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  if (user.value) {
    form.value.name = sanitizeLetters(user.value.name || `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim())
    form.value.email = user.value.email || ''
    form.value.phone = user.value.phone || ''
    form.value.address = user.value.address || ''
  }
  try {
    const saved = userService.getAddresses()
    if (saved && saved.length > 0) {
      const addr = saved[0]
      if (!form.value.address) form.value.address = addr.address_line_1 || addr.address || ''
      if (!form.value.city && addr.city) form.value.city = sanitizeLetters(addr.city)
    }
  } catch { /* ignore */ }
})
</script>

<style scoped>
.checkout-page { max-width: 1200px; margin: 0 auto; padding: 32px 16px; }

.payfade-enter-active,
.payfade-leave-active { transition: opacity .2s ease; }
.payfade-enter-from,
.payfade-leave-to { opacity: 0; }

.payment-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 18px;
}

.payment-modal {
  width: min(440px, 100%);
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.payment-modal-body {
  padding: 22px 20px;
  text-align: center;
}

.payment-modal-body h3 {
  margin: 14px 0 6px;
  font-size: 18px;
  font-weight: 900;
  color: #111827;
}

.payment-modal-body p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.pd-spinner {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 5px solid rgba(0, 159, 227, 0.18);
  border-top-color: #009fe3;
  margin: 2px auto 0;
  animation: pd-spin 1s linear infinite;
}

@keyframes pd-spin { to { transform: rotate(360deg); } }

.pd-check { width: 58px; height: 58px; margin: 0 auto; }
.pd-check svg { width: 58px; height: 58px; }
.pd-check-circle {
  stroke: rgba(34, 197, 94, 0.25);
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: pd-stroke .5s ease forwards;
}
.pd-check-mark {
  stroke: #22c55e;
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: pd-stroke .45s .2s ease forwards;
}

@keyframes pd-stroke { to { stroke-dashoffset: 0; } }

.checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
.checkout-title { font-size: 28px; font-weight: 800; margin: 0 0 28px; color: #111827; }

.checkout-section { margin-bottom: 28px; }
.checkout-section h2 { font-size: 16px; font-weight: 800; letter-spacing: .04em; color: #111827; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.full { grid-column: 1 / -1; }
.form-field label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
.form-field input, .form-field select { height: 44px; border: 1px solid #d1d5db; padding: 0 12px; font-size: 14px; background: white; box-sizing: border-box; }
.form-field input:focus, .form-field select:focus { outline: none; border-color: #009fe3; }

.payment-methods { display: grid; gap: 10px; }
.payment-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid #e5e7eb; cursor: pointer; font-size: 14px; font-weight: 600; background: white; transition: border-color .15s; }
.payment-card.selected { border-color: #009fe3; background: #f0f9ff; }
.payment-card input { display: none; }
.payment-card .material-symbols-outlined { color: #009fe3; }

.payment-detail-box { margin-top: 16px; padding: 18px; background: #f8fafc; border: 1px solid #e5e7eb; }
.payment-note { font-size: 12px; color: #6b7280; margin: 0 0 14px; }
.transfer-note { font-size: 13px; color: #374151; margin: 0 0 14px; }

/* Banks */
.bank-list { display: grid; gap: 10px; }
.bank-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e5e7eb; background: white; cursor: pointer; transition: border-color .15s; }
.bank-card.selected { border-color: #009fe3; background: #f0f9ff; }
.bank-logo { width: 40px; height: 40px; border-radius: 8px; background: #004e92; color: white; font-size: 12px; font-weight: 800; display: grid; place-items: center; flex-shrink: 0; }
.bank-info { flex: 1; }
.bank-info strong { display: block; font-size: 13px; font-weight: 700; color: #111827; }
.bank-info span { display: block; font-size: 12px; color: #6b7280; }
.bank-holder { font-size: 11px; color: #9ca3af; }
.bank-check { color: #009fe3; }

/* Receipt upload */
.upload-receipt-btn { display: flex; align-items: center; gap: 8px; height: 44px; border: 1px dashed #d1d5db; padding: 0 12px; font-size: 13px; color: #6b7280; cursor: pointer; background: white; box-sizing: border-box; }
.upload-receipt-btn .material-symbols-outlined { font-size: 18px; }
.upload-receipt-btn:hover { border-color: #009fe3; color: #009fe3; }

.form-error { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 14px; margin-bottom: 16px; }

.btn-confirm { width: 100%; height: 52px; background: #009fe3; color: white; border: none; cursor: pointer; font-size: 15px; font-weight: 800; letter-spacing: .04em; }
.btn-confirm:disabled { opacity: .65; cursor: not-allowed; }

.checkout-right { background: #f8fafc; border: 1px solid #e5e7eb; padding: 24px; position: sticky; top: 120px; min-width: 0; }
.checkout-right h2 { font-size: 16px; font-weight: 800; letter-spacing: .04em; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }

.order-items { display: grid; gap: 14px; margin-bottom: 20px; }
.order-item { display: flex; align-items: center; gap: 12px; width: 100%; min-width: 0; overflow: hidden; }
.order-item img { width: 52px; height: 52px; object-fit: contain; background: white; border: 1px solid #e5e7eb; flex-shrink: 0; }
.order-item-info { flex: 1 1 auto; min-width: 0; overflow: hidden; }
.order-item-name { display: block; max-width: 100%; font-size: 13px; font-weight: 600; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-item-meta { font-size: 12px; color: #6b7280; margin: 0; }
.order-item > strong { flex: 0 0 auto; max-width: 96px; text-align: right; font-size: 13px; }

.order-totals { border-top: 1px solid #e5e7eb; padding-top: 16px; }
.total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #374151; }
.total-row--big { font-size: 17px; padding-top: 12px; border-top: 1px solid #e5e7eb; margin-top: 6px; color: #111827; }

.empty-cart { text-align: center; padding: 24px 0; color: #6b7280; font-size: 14px; }
.empty-cart button { margin-top: 12px; padding: 10px 20px; background: #009fe3; color: white; border: none; cursor: pointer; font-weight: 700; }

/* Confirmation */
.confirm-screen { display: flex; justify-content: center; padding: 40px 16px; }
.confirm-box { max-width: 560px; width: 100%; text-align: center; }
.confirm-icon .material-symbols-outlined { font-size: 72px; color: #22c55e; }
.confirm-box h2 { font-size: 28px; font-weight: 800; margin: 16px 0 8px; color: #111827; }
.confirm-code { font-size: 16px; color: #6b7280; margin: 0 0 8px; }
.confirm-msg { font-size: 14px; color: #6b7280; margin: 0 0 28px; line-height: 1.6; max-width: 420px; margin-left: auto; margin-right: auto; }
.confirm-summary { text-align: left; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 28px; }
.confirm-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
.confirm-item img { width: 42px; height: 42px; object-fit: contain; background: #f8fafc; }
.confirm-item-info { flex: 1; min-width: 0; }
.confirm-item p { margin: 0; font-size: 13px; font-weight: 600; }
.confirm-item .meta { font-size: 12px; color: #6b7280; font-weight: 400; }
.confirm-item strong { flex-shrink: 0; }
.confirm-total { display: flex; justify-content: space-between; padding: 14px 16px; font-size: 16px; font-weight: 800; background: #f8fafc; }
.confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.btn-outline { height: 48px; border: 1px solid #d1d5db; background: white; cursor: pointer; font-weight: 700; font-size: 14px; }
.btn-primary { height: 48px; border: 1px solid #009fe3; background: #009fe3; color: white; cursor: pointer; font-weight: 700; font-size: 14px; }

@media (max-width: 900px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-right { position: static; }
  .form-grid { grid-template-columns: 1fr; }
  .form-field.full { grid-column: auto; }
}
</style>


