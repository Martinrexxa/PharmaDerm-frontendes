/**
 * emailService — Envío de correos via EmailJS.
 *
 * Para activar:
 *  1. npm install @emailjs/browser
 *  2. Crea cuenta en https://www.emailjs.com/
 *  3. Llena las variables en .env (ver .env.example)
 *
 * Si EmailJS no está configurado, las funciones retornan { ok: false, simulated: true }
 * y la orden/cita se guarda igual — NO se pierde ningún dato.
 */

import storageService from './storageService.js'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const TEMPLATES = {
  order_es:       import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID_ES,
  order_en:       import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID_EN,
  appointment_es: import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_ES,
  appointment_en: import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_EN,
  routine_es:     import.meta.env.VITE_EMAILJS_ROUTINE_TEMPLATE_ID_ES,
  routine_en:     import.meta.env.VITE_EMAILJS_ROUTINE_TEMPLATE_ID_EN,
}

const isConfigured = !!SERVICE_ID && !!PUBLIC_KEY &&
  SERVICE_ID !== '' && PUBLIC_KEY !== ''

let emailjs = null

async function getEmailJS() {
  if (emailjs) return emailjs
  try {
    const mod = await import('@emailjs/browser')
    emailjs = mod.default || mod
    emailjs.init(PUBLIC_KEY)
    return emailjs
  } catch {
    return null
  }
}

/** Guarda log del intento de correo en localStorage */
function logEmail({ type, toEmail, orderId = null, appointmentId = null, status, error = null }) {
  storageService.prepend('email_logs', {
    id: Date.now(),
    type,
    to_email: toEmail,
    order_id: orderId,
    appointment_id: appointmentId,
    status,
    provider: 'emailjs',
    error_message: error,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  })
}

/**
 * Envía correo de confirmación de orden.
 * @param {object} order - Objeto de orden completa
 * @param {string} lang  - 'es' | 'en'
 */
export async function sendOrderConfirmation(order, lang = 'es') {
  const langTemplate = TEMPLATES[`order_${lang}`]

  // Fallback: si no se configuró template de "order", usa el de "routine"
  // para no bloquear el envío de correos en demo/producción temprana.
  const routineFallback = TEMPLATES[`routine_${lang}`] || TEMPLATES.routine_es
  const templateId = langTemplate || TEMPLATES.order_es || routineFallback

  if (!isConfigured || !templateId) {
    console.warn('[EmailJS] No configurado. El correo de orden NO fue enviado.')
    logEmail({ type: 'order_confirmation', toEmail: order.customer_email, orderId: order.id, status: 'pending', error: 'EmailJS no configurado' })

    const missing = []
    if (!SERVICE_ID) missing.push('VITE_EMAILJS_SERVICE_ID')
    if (!PUBLIC_KEY) missing.push('VITE_EMAILJS_PUBLIC_KEY')
    if (!templateId) {
      // Si no hay template para el idioma, al menos requerimos el ES como fallback.
      if (!TEMPLATES.order_es) missing.push('VITE_EMAILJS_ORDER_TEMPLATE_ID_ES')
      // Y si el idioma pedido fue en, también sugerimos el EN (opcional pero recomendado).
      if (lang === 'en' && !TEMPLATES.order_en) missing.push('VITE_EMAILJS_ORDER_TEMPLATE_ID_EN')
      // También aceptamos routine como fallback
      if (!TEMPLATES.routine_es && !TEMPLATES.routine_en) missing.push('VITE_EMAILJS_ROUTINE_TEMPLATE_ID_ES')
    }

    const msg = missing.length
      ? `No se pudo enviar el correo porque faltan variables de EmailJS: ${missing.join(', ')}.`
      : 'EmailJS no está configurado. La orden fue guardada correctamente.'

    return { ok: false, simulated: true, message: msg }
  }

  const ejs = await getEmailJS()
  if (!ejs) {
    logEmail({ type: 'order_confirmation', toEmail: order.customer_email, orderId: order.id, status: 'failed', error: '@emailjs/browser no instalado' })
    return { ok: false, message: 'No se pudo cargar el módulo de correo.' }
  }

  const itemsSummary = (order.items || [])
    .map(i => `${i.name} (${i.size || 'Standard'}) × ${i.quantity} — ${order.currency}${i.subtotal}`)
    .join('\n')

  const params = {
    to_email:         order.customer_email,
    customer_name:    order.customer_name,
    order_id:         order.order_number || order.id,
    order_date:       new Date(order.created_at).toLocaleDateString('es-DO'),
    order_status:     order.status,
    payment_method:   order.payment_method,
    delivery_method:  order.delivery_method || 'Delivery',
    country:          order.country || 'República Dominicana',
    currency:         order.currency,
    subtotal:         `${order.currency}${order.subtotal}`,
    shipping:         order.shipping > 0 ? `${order.currency}${order.shipping}` : 'Gratis',
    tax:              order.tax > 0 ? `${order.currency}${order.tax}` : '0',
    total:            `${order.currency}${order.total}`,
    items_summary:    itemsSummary,
    billing_address:  `${order.address}, ${order.city}, ${order.country}`,
    support_email:    'soporte@pharmadermrd.com',
    // Campos extra por si el template es el de rutina (fallback)
    email_title:      'Confirmación de compra',
    email_subtitle:   'Detalles de tu pedido',
  }

  try {
    await ejs.send(SERVICE_ID, templateId, params)
    logEmail({ type: 'order_confirmation', toEmail: order.customer_email, orderId: order.id, status: 'sent' })
    return { ok: true }
  } catch (err) {
    const msg = err?.text || err?.message || 'Error desconocido'
    logEmail({ type: 'order_confirmation', toEmail: order.customer_email, orderId: order.id, status: 'failed', error: msg })
    return { ok: false, message: msg }
  }
}

/**
 * Envía correo de confirmación de cita.
 * @param {object} apt - Objeto de cita
 * @param {string} lang - 'es' | 'en'
 */
export async function sendAppointmentConfirmation(apt, lang = 'es') {
  const langTemplate = TEMPLATES[`appointment_${lang}`]
  const templateId = langTemplate || TEMPLATES.appointment_es

  if (!isConfigured || !templateId) {
    console.warn('[EmailJS] No configurado. El correo de cita NO fue enviado.')
    logEmail({ type: 'appointment_confirmation', toEmail: apt.email, appointmentId: apt.id, status: 'pending', error: 'EmailJS no configurado' })

    const missing = []
    if (!SERVICE_ID) missing.push('VITE_EMAILJS_SERVICE_ID')
    if (!PUBLIC_KEY) missing.push('VITE_EMAILJS_PUBLIC_KEY')
    if (!templateId) {
      if (!TEMPLATES.appointment_es) missing.push('VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_ES')
      if (lang === 'en' && !TEMPLATES.appointment_en) missing.push('VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_EN')
    }

    const msg = missing.length
      ? `No se pudo enviar el correo porque faltan variables de EmailJS: ${missing.join(', ')}.`
      : 'EmailJS no está configurado. La cita fue guardada correctamente.'

    return { ok: false, simulated: true, message: msg }
  }

  const ejs = await getEmailJS()
  if (!ejs) {
    return { ok: false, message: 'No se pudo cargar el módulo de correo.' }
  }

  const params = {
    to_email:            apt.email,
    customer_name:       apt.customerName,
    appointment_id:      apt.id,
    appointment_date:    apt.date,
    appointment_time:    apt.time || 'Por confirmar',
    appointment_type:    apt.type || 'Consulta general',
    appointment_reason:  apt.reason || '',
    appointment_status:  apt.status || 'Pendiente',
    diagnosis_summary:   apt.diagnosisSummary || 'N/A',
    support_email:       'soporte@pharmadermrd.com',
  }

  try {
    await ejs.send(SERVICE_ID, templateId, params)
    logEmail({ type: 'appointment_confirmation', toEmail: apt.email, appointmentId: apt.id, status: 'sent' })
    return { ok: true }
  } catch (err) {
    const msg = err?.text || err?.message || 'Error desconocido'
    logEmail({ type: 'appointment_confirmation', toEmail: apt.email, appointmentId: apt.id, status: 'failed', error: msg })
    return { ok: false, message: msg }
  }
}

/**
 * Envía correo con rutina personalizada.
 */
export async function sendRoutineByEmail(routine, toEmail, lang = 'es') {
  const templateId = TEMPLATES[`routine_${lang}`] || TEMPLATES.routine_es

  if (!isConfigured || !templateId) {
    console.warn('[EmailJS] No configurado. El correo de rutina NO fue enviado.')
    return { ok: false, simulated: true, message: 'EmailJS no está configurado.' }
  }

  const ejs = await getEmailJS()
  if (!ejs) return { ok: false, message: 'No se pudo cargar el módulo de correo.' }

  const morning = (routine.morning || []).map((p, i) => `Paso ${i + 1}: ${p.name}`).join('\n')
  const night   = (routine.night   || []).map((p, i) => `Paso ${i + 1}: ${p.name}`).join('\n')

  try {
    await ejs.send(SERVICE_ID, templateId, {
      to_email:        toEmail,
      skin_type:       routine.skinType || '',
      primary_concern: routine.primaryConcern || '',
      morning_routine: morning,
      night_routine:   night,
      support_email:   'soporte@pharmadermrd.com',
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err?.text || err?.message }
  }
}

export const emailServiceConfigured = isConfigured
