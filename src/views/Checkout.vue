<template>
  <div class="checkout-page">
    <transition name="payfade">
      <div v-if="paymentModalOpen" class="payment-modal-backdrop" @click.stop>
        <div class="payment-modal" role="dialog" aria-modal="true" aria-label="Procesando pago">
          <div v-if="paymentStep === 'processing'" class="payment-modal-body">
            <div class="pd-spinner" aria-hidden="true"></div>
            <h3>Procesando pago</h3>
            <p>Estamos confirmando tu pago. Por favor espera…</p>
          </div>

          <div v-else class="payment-modal-body">
            <div class="pd-check" aria-hidden="true">
              <svg viewBox="0 0 52 52">
                <circle class="pd-check-circle" cx="26" cy="26" r="25" fill="none" />
                <path class="pd-check-mark" fill="none" d="M14 27l7 7 17-17" />
              </svg>
            </div>
            <h3>Pago realizado</h3>
            <p>Gracias. Tu compra fue confirmada.</p>
          </div>
        </div>
      </div>
    </transition>
    <!-- Confirmación -->
    <div v-if="orderPlaced" class="confirm-screen">
      <div class="confirm-box">
        <div class="confirm-icon"><span class="material-symbols-outlined">check_circle</span></div>
        <h2>¡Pedido confirmado!</h2>
        <p class="confirm-code">Código: <strong>{{ confirmationCode }}</strong></p>
        <p class="confirm-msg">{{ emailStatusMsg }}</p>

        <div class="confirm-summary">
          <div v-for="item in placedItems" :key="item.id" class="confirm-item">
            <img :src="item.image" :alt="item.name" />
            <div><p>{{ item.name }}</p><p class="meta">{{ item.size }} × {{ item.quantity }}</p></div>
            <strong>{{ fmtCurrency(item.priceRD * item.quantity) }}</strong>
          </div>
          <div class="confirm-total">
            <span>Total pagado</span>
            <strong>{{ fmtCurrency(placedTotal) }}</strong>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="btn-outline" @click="router.push('/inicio')">Ir al inicio</button>
          <button class="btn-primary" @click="router.push('/tienda')">Seguir comprando</button>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div v-else class="checkout-layout">
      <div class="checkout-left">
        <h1 class="checkout-title">Finalizar compra</h1>

        <!-- Contacto -->
        <section class="checkout-section">
          <h2>Datos de contacto</h2>
          <div class="form-grid">
            <div class="form-field full">
              <label>Nombre completo</label>
              <input v-model="form.name" type="text" placeholder="Tu nombre" />
            </div>
            <div class="form-field">
              <label>Correo electrónico</label>
              <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div class="form-field">
              <label>Teléfono</label>
              <input v-model="form.phone" type="tel" placeholder="+1 809 000 0000" />
            </div>
          </div>
        </section>

        <!-- Dirección -->
        <section class="checkout-section">
          <h2>Dirección de entrega</h2>
          <div class="form-grid">
            <div class="form-field full">
              <label>Dirección</label>
              <input v-model="form.address" type="text" placeholder="Calle, número, sector" />
            </div>
            <div class="form-field">
              <label>Ciudad</label>
              <input v-model="form.city" type="text" placeholder="Santo Domingo" />
            </div>
            <div class="form-field">
              <label>País</label>
              <select v-model="form.country">
                <option value="DO">República Dominicana</option>
                <option value="US">Estados Unidos</option>
                <option value="PR">Puerto Rico</option>
                <option value="MX">México</option>
                <option value="CO">Colombia</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Método de pago -->
        <section class="checkout-section">
          <h2>Método de pago</h2>
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
              Pago simulado — no se realizará ningún cargo real.
            </p>
            <div class="form-grid">
              <div class="form-field full">
                <label>Número de tarjeta</label>
                <input v-model="card.number" type="text" placeholder="1234 5678 9012 3456" maxlength="19" @input="formatCardNumber" />
              </div>
              <div class="form-field full">
                <label>Nombre del titular</label>
                <input v-model="card.holder" type="text" placeholder="Como aparece en la tarjeta" />
              </div>
              <div class="form-field">
                <label>Vencimiento</label>
                <input v-model="card.expiry" type="text" placeholder="MM/AA" maxlength="5" @input="formatExpiry" />
              </div>
              <div class="form-field">
                <label>CVV</label>
                <input v-model="card.cvv" type="password" placeholder="•••" maxlength="4" />
              </div>
            </div>
          </div>

          <!-- Transfer fields -->
          <div v-if="form.paymentMethod === 'transfer'" class="payment-detail-box">
            <p class="transfer-note">Transfiere a una de nuestras cuentas y sube tu comprobante.</p>
            <div class="bank-list">
              <div v-for="bank in banks" :key="bank.name" class="bank-card" :class="{ selected: form.selectedBank === bank.name }" @click="form.selectedBank = bank.name">
                <div class="bank-logo">{{ bank.initials }}</div>
                <div class="bank-info">
                  <strong>{{ bank.name }}</strong>
                  <span>{{ bank.accountType }} · {{ bank.accountNumber }}</span>
                  <span class="bank-holder">A nombre de: {{ bank.holder }}</span>
                </div>
                <span v-if="form.selectedBank === bank.name" class="material-symbols-outlined bank-check">check_circle</span>
              </div>
            </div>
            <div class="form-grid" style="margin-top:16px">
              <div class="form-field">
                <label>Número de referencia</label>
                <input v-model="form.referenceNumber" type="text" placeholder="Número de confirmación" />
              </div>
              <div class="form-field">
                <label>Comprobante de pago</label>
                <label class="upload-receipt-btn">
                  <input type="file" accept="image/*,.pdf" hidden @change="onReceiptUpload" />
                  <span class="material-symbols-outlined">upload_file</span>
                  {{ form.receiptName || 'Subir comprobante' }}
                </label>
              </div>
            </div>
          </div>

          <!-- Cash note -->
          <div v-if="form.paymentMethod === 'cash'" class="payment-detail-box">
            <p class="payment-note">
              <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">info</span>
              Paga en efectivo al momento de recibir tu pedido.
            </p>
          </div>
        </section>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <button class="btn-confirm" :disabled="placing" @click="placeOrder">
          {{ placing ? 'Procesando...' : 'Confirmar compra' }}
        </button>
      </div>

      <!-- Sidebar -->
      <aside class="checkout-right">
        <h2>Resumen del pedido</h2>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <p>No hay productos en el carrito.</p>
          <button @click="router.push('/tienda')">Ir a la tienda</button>
        </div>

        <div v-else>
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.id" class="order-item">
              <img :src="item.image" :alt="item.name" />
              <div class="order-item-info">
                <p class="order-item-name">{{ item.name }}</p>
                <p class="order-item-meta">{{ item.size }} · Cant: {{ item.quantity }}</p>
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
              <span>Envío</span>
              <span>{{ subtotal >= 3000 ? 'Gratis' : fmtCurrency(250) }}</span>
            </div>
            <div class="total-row">
              <span>ITBIS (18%)</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useHistoryStore } from '../stores/useHistoryStore'
import { sendOrderConfirmation } from '../services/emailService.js'
import orderService from '../services/orderService.js'
import { useI18n } from '../lib/i18n.js'
import { formatPrice, convertPrice } from '../utils/currency.js'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const settings = useSettingsStore()
const history = useHistoryStore()
const { lang } = useI18n()

const { items: cartItems, subtotal: cartSubtotal, clear: clearCart } = cart
const { user } = auth

const form = ref({
  name: '', email: '', phone: '',
  address: '', city: '', country: 'DO',
  paymentMethod: 'card',
  selectedBank: '',
  referenceNumber: '',
  receiptName: '',
  receiptBase64: '',
})

const card = reactive({ number: '', holder: '', expiry: '', cvv: '' })

const paymentMethods = [
  { key: 'card', label: 'Tarjeta de crédito/débito', icon: 'credit_card' },
  { key: 'transfer', label: 'Transferencia bancaria', icon: 'account_balance' },
  { key: 'cash', label: 'Efectivo (contraentrega)', icon: 'payments' },
]

const banks = [
  { name: 'Banreservas', initials: 'BR', accountType: 'Cta. Corriente', accountNumber: '2100-1234-5678', holder: 'PharmaDerm SRL' },
  { name: 'BHD León', initials: 'BH', accountType: 'Cta. Corriente', accountNumber: '2765-9876-5432', holder: 'PharmaDerm SRL' },
  { name: 'Banco Popular', initials: 'BP', accountType: 'Cta. Corriente', accountNumber: '5432-1111-2222', holder: 'PharmaDerm SRL' },
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
const emailStatusMsg = ref('Gracias por tu compra. Recibirás un correo de confirmación pronto.')

const subtotal = computed(() => cartSubtotal.value)
const shipping = computed(() => subtotal.value >= 3000 ? 0 : 250)
const itbis = computed(() => Math.round(subtotal.value * 0.18))
const total = computed(() => subtotal.value + shipping.value + itbis.value)

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

function validateCard() {
  const digits = card.number.replace(/\s/g, '')
  if (digits.length !== 16) return 'El número de tarjeta debe tener 16 dígitos.'
  if (!card.holder.trim()) return 'Ingresa el nombre del titular de la tarjeta.'
  const [mm, yy] = card.expiry.split('/')
  const month = parseInt(mm, 10), year = parseInt('20' + yy, 10)
  const now = new Date()
  if (!mm || !yy || month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'Fecha de vencimiento inválida.'
  if (card.cvv.length < 3) return 'El CVV debe tener al menos 3 dígitos.'
  return ''
}

function validateTransfer() {
  if (!form.value.selectedBank) return 'Selecciona el banco al que realizaste la transferencia.'
  if (!form.value.referenceNumber.trim()) return 'Ingresa el número de referencia de la transferencia.'
  if (!form.value.receiptBase64) return 'Sube el comprobante de pago.'
  return ''
}

function validate() {
  if (!form.value.name.trim()) return 'Ingresa tu nombre completo.'
  if (!form.value.email.trim() || !form.value.email.includes('@')) return 'Ingresa un correo válido.'
  if (!form.value.address.trim()) return 'Ingresa tu dirección de entrega.'
  if (!form.value.city.trim()) return 'Ingresa tu ciudad.'
  if (cartItems.value.length === 0) return 'Tu carrito está vacío.'
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
  await new Promise((r) => setTimeout(r, 1800))

  const code = 'PD-' + Date.now().toString(36).toUpperCase()
  confirmationCode.value = code
  const cur = settings.currency?.value || 'DOP'

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
    delivery_method: 'delivery',
    currency: cur,
    items: cartItems.value.map(i => ({
      name: i.name,
      product_name: i.name,
      sku: i.sku || null,
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
    created_at: new Date().toISOString(),
  }

  placedItems.value = JSON.parse(JSON.stringify(cartItems.value))
  placedTotal.value = total.value

  // Save to localStorage
  await history.saveOrder(orderData)

  // Save to Supabase if user is authenticated
  try {
    const userId = auth.user?.value?.id
    if (userId) {
      await orderService.saveOrderToSupabase(orderData, userId)
    }
  } catch (error) {
    console.warn('[Checkout] Supabase save failed:', error)
    // Continue anyway - localStorage save is sufficient
  }

  clearCart()

  const emailResult = await sendOrderConfirmation(orderData, lang.value)
  if (emailResult.ok) {
    emailStatusMsg.value = 'Gracias por tu compra. Se ha enviado un correo de confirmación.'
  } else if (emailResult.simulated) {
    emailStatusMsg.value = emailResult.message || 'El registro se guardó, pero el correo no pudo enviarse porque EmailJS no está configurado.'
  } else {
    emailStatusMsg.value = emailResult.message || 'Gracias por tu compra. Recibirás un correo de confirmación pronto.'
  }

  paymentStep.value = 'success'
  await new Promise((r) => setTimeout(r, 1200))
  paymentModalOpen.value = false

  placing.value = false
  orderPlaced.value = true
}

onMounted(() => {
  if (user.value) {
    form.value.name = user.value.name || `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
    form.value.email = user.value.email || ''
    form.value.phone = user.value.phone || ''
    form.value.address = user.value.address || ''
  }
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

.checkout-right { background: #f8fafc; border: 1px solid #e5e7eb; padding: 24px; position: sticky; top: 120px; }
.checkout-right h2 { font-size: 16px; font-weight: 800; letter-spacing: .04em; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }

.order-items { display: grid; gap: 14px; margin-bottom: 20px; }
.order-item { display: flex; align-items: center; gap: 12px; }
.order-item img { width: 52px; height: 52px; object-fit: contain; background: white; border: 1px solid #e5e7eb; flex-shrink: 0; }
.order-item-info { flex: 1; min-width: 0; }
.order-item-name { font-size: 13px; font-weight: 600; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-item-meta { font-size: 12px; color: #6b7280; margin: 0; }

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
.confirm-item div { flex: 1; }
.confirm-item p { margin: 0; font-size: 13px; font-weight: 600; }
.confirm-item .meta { font-size: 12px; color: #6b7280; font-weight: 400; }
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
