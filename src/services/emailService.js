import storageService from './storageService.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const TEMPLATES = {
  routine: {
    es: import.meta.env.VITE_EMAILJS_ROUTINE_TEMPLATE_ID_ES,
    en: import.meta.env.VITE_EMAILJS_ROUTINE_TEMPLATE_ID_EN,
  },
  order: {
    es: import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID_ES,
    en: import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID_EN,
  },
  appointment: {
    es: import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_ES,
    en: import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID_EN,
  },
}

let emailjs = null

function hasValue(v) {
  return !!String(v || '').trim()
}

function safeMessageForMissingConfig(emailType) {
  if (emailType === 'order') {
    return 'El pedido se guardó correctamente, pero el correo de confirmación no está configurado.'
  }
  return 'La rutina se guardó correctamente, pero el envío por correo no está configurado.'
}

function safeMessageForTemplateNotFound(emailType) {
  if (emailType === 'order') {
    return 'El pedido se guardó correctamente, pero el template de EmailJS no existe o no pertenece a este servicio.'
  }
  return 'La rutina se guardó correctamente, pero el template de EmailJS no existe o no pertenece a este servicio.'
}

async function getEmailJS() {
  if (emailjs) return emailjs
  try {
    const mod = await import('@emailjs/browser')
    emailjs = mod.default || mod
    emailjs.init(PUBLIC_KEY)
    return emailjs
  } catch (error) {
    console.error('[EmailJS error]', error)
    return null
  }
}

function resolveTemplateId(emailType, lang = 'es') {
  const typeTemplates = TEMPLATES[emailType] || {}
  return typeTemplates[lang] || typeTemplates.es || null
}

function validateConfig(emailType, lang = 'es') {
  const serviceId = SERVICE_ID
  const templateId = resolveTemplateId(emailType, lang)
  const publicKeyExists = hasValue(PUBLIC_KEY)

  console.log('[EmailJS config]', {
    emailType,
    serviceId,
    templateId,
    publicKeyExists,
  })

  if (!hasValue(serviceId) || !publicKeyExists || !hasValue(templateId)) {
    return {
      ok: false,
      serviceId,
      templateId,
      message: safeMessageForMissingConfig(emailType),
      reason: 'missing_config',
    }
  }

  return {
    ok: true,
    serviceId,
    templateId,
  }
}

async function writeEmailLog({
  type,
  to_email,
  order_id = null,
  appointment_id = null,
  routine_id = null,
  status,
  provider = 'emailjs',
  error_message = null,
  sent_at = null,
}) {
  const entry = {
    id: Date.now(),
    type,
    to_email,
    order_id,
    appointment_id,
    routine_id,
    status,
    provider,
    error_message,
    sent_at,
    created_at: new Date().toISOString(),
  }

  storageService.prepend('email_logs', entry)

  if (!isSupabaseConfigured) return

  try {
    await supabase.from('email_logs').insert({
      type,
      to_email,
      order_id,
      appointment_id,
      routine_id,
      status,
      provider,
      error_message,
      sent_at,
    })
  } catch (error) {
    console.warn('[EmailJS log] email_logs table unavailable or insert failed:', error?.message || error)
  }
}

async function sendEmail({ emailType, lang = 'es', params, log }) {
  const cfg = validateConfig(emailType, lang)

  if (!cfg.ok) {
    await writeEmailLog({ ...log, status: 'failed', error_message: cfg.message })
    return { ok: false, simulated: true, message: cfg.message }
  }

  const ejs = await getEmailJS()
  if (!ejs) {
    const message = safeMessageForMissingConfig(emailType)
    await writeEmailLog({ ...log, status: 'failed', error_message: message })
    return { ok: false, message }
  }

  try {
    await ejs.send(cfg.serviceId, cfg.templateId, params)
    await writeEmailLog({ ...log, status: 'sent', sent_at: new Date().toISOString(), error_message: null })
    return { ok: true }
  } catch (error) {
    console.error('[EmailJS error]', error)
    const errorText = String(error?.text || error?.message || 'Error desconocido')
    const lower = errorText.toLowerCase()
    const templateNotFound = lower.includes('template') && lower.includes('not found')

    const message = templateNotFound
      ? safeMessageForTemplateNotFound(emailType)
      : safeMessageForMissingConfig(emailType)

    await writeEmailLog({ ...log, status: 'failed', error_message: errorText })

    return {
      ok: false,
      message,
      rawError: errorText,
    }
  }
}

export async function sendRoutineByEmail(payload, lang = 'es') {
  const params = {
    to_email: payload.to_email,
    to_name: payload.to_name || 'Cliente',
    skin_type: payload.skin_type || '',
    diagnosis: payload.diagnosis || '',
    morning_routine: payload.morning_routine || '',
    night_routine: payload.night_routine || '',
    recommended_products: payload.recommended_products || '',
    reply_to: payload.reply_to || 'soporte@pharmadermrd.com',
  }

  return sendEmail({
    emailType: 'routine',
    lang,
    params,
    log: {
      type: 'routine_ready',
      to_email: payload.to_email,
      routine_id: payload.routine_id || null,
    },
  })
}

export async function sendOrderConfirmationEmail(payload, lang = 'es') {
  const params = {
    to_email: payload.to_email,
    to_name: payload.to_name || 'Cliente',
    order_number: payload.order_number,
    order_total: payload.order_total,
    order_status: payload.order_status || 'confirmed',
    payment_method: payload.payment_method || 'card',
    payment_details: payload.payment_details || 'Método de pago registrado correctamente.',
    delivery_method: payload.delivery_method || 'delivery',
    products: payload.products || '',
    shipping_address: payload.shipping_address || '',
    support_email: payload.support_email || 'soporte@pharmadermrd.com',
    reply_to: payload.reply_to || 'soporte@pharmadermrd.com',
  }

  return sendEmail({
    emailType: 'order',
    lang,
    params,
    log: {
      type: 'order_confirmation',
      to_email: payload.to_email,
      order_id: payload.order_id || null,
    },
  })
}

export async function sendAppointmentConfirmationEmail(payload, lang = 'es') {
  const params = {
    to_email: payload.to_email,
    to_name: payload.to_name || 'Paciente',
    appointment_id: payload.appointment_id,
    appointment_date: payload.appointment_date || '',
    appointment_time: payload.appointment_time || '',
    appointment_type: payload.appointment_type || 'consulta_general',
    appointment_reason: payload.appointment_reason || '',
    appointment_status: payload.appointment_status || 'pending',
    support_email: payload.support_email || 'soporte@pharmadermrd.com',
    reply_to: payload.reply_to || 'soporte@pharmadermrd.com',
  }

  return sendEmail({
    emailType: 'appointment',
    lang,
    params,
    log: {
      type: 'appointment_confirmation',
      to_email: payload.to_email,
      appointment_id: payload.appointment_id || null,
    },
  })
}

export async function sendOrderConfirmation(order, lang = 'es') {
  const products = (order.items || [])
    .map(i => `${i.name || i.product_name} x${i.quantity || 1} (${i.size || i.size_label || 'N/A'})`)
    .join(', ')

  return sendOrderConfirmationEmail({
    to_email: order.customer_email,
    to_name: order.customer_name,
    order_id: order.id,
    order_number: order.order_number || order.id,
    order_total: `${order.currency || 'DOP'} ${order.total || 0}`,
    order_status: order.status,
    payment_method: order.payment_method,
    payment_details: order.payment_details || 'Método de pago registrado correctamente.',
    delivery_method: order.delivery_method,
    products,
    shipping_address: [order.address, order.city, order.country_code].filter(Boolean).join(', '),
    support_email: 'soporte@pharmadermrd.com',
    reply_to: 'soporte@pharmadermrd.com',
  }, lang)
}

export async function sendAppointmentConfirmation(apt, lang = 'es') {
  return sendAppointmentConfirmationEmail({
    to_email: apt.email,
    to_name: apt.customerName,
    appointment_id: apt.id,
    appointment_date: apt.date,
    appointment_time: apt.time,
    appointment_type: apt.type,
    appointment_reason: apt.reason,
    appointment_status: apt.status,
  }, lang)
}

export const emailServiceConfigured = hasValue(SERVICE_ID) && hasValue(PUBLIC_KEY)
