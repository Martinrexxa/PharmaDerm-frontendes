/**
 * storageService — abstracción de persistencia con aislamiento por usuario.
 * Cuando se llama setCurrentUser(id), todas las claves se prefijarán con el userId
 * para que los datos de distintos usuarios no se mezclen.
 */

const PREFIX = 'pharmaderm_'

// FASE 11 — userId activo (null = modo invitado, claves globales)
let _userId = null

export const storageService = {
  /** Llamar en login/_loadProfile para aislar datos por usuario */
  setCurrentUser(id) {
    _userId = id || null
  },

  /** Llamar en logout/_clearState para volver a claves globales */
  clearCurrentUser() {
    _userId = null
  },

  /** Construye la clave final: prefija con userId si hay sesión activa */
  _key(key) {
    return _userId ? `${key}_${_userId}` : key
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + this._key(key))
      if (raw === null) return fallback
      return JSON.parse(raw)
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + this._key(key), JSON.stringify(value))
      return true
    } catch (e) {
      console.warn('[storageService] No se pudo guardar:', key, e)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + this._key(key))
      return true
    } catch {
      return false
    }
  },

  clear(keys = []) {
    if (keys.length === 0) {
      // Borrar solo las claves propias de PharmaDerm
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k))
    } else {
      keys.forEach(k => this.remove(k))
    }
  },

  /** Agrega un elemento al inicio de un array guardado */
  prepend(key, item, maxItems = 50) {
    const current = this.get(key, [])
    const next = [item, ...current].slice(0, maxItems)
    return this.set(key, next)
  },

  /** Retorna todas las claves propias del sistema */
  keys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .map(k => k.replace(PREFIX, ''))
  },

  /**
   * Elimina TODAS las claves privadas de localStorage y sessionStorage,
   * incluyendo claves con UUID (pharmaderm_quiz_result_<uuid>, etc.).
   * Úsalo en logout o para un reset nuclear.
   * Preserva: sb-* (Supabase auth), pharmaderm_user, pharmaderm_session,
   *            settings, products, countries, currencies.
   */
  hardResetPrivateClientData() {
    const PRIVATE_PATTERNS = [
      'quiz', 'diagnostic', 'diagnosis', 'routine', 'analysis',
      'appointment', 'order', 'cart', 'history', 'skin',
    ]
    const PRESERVE_EXACT    = ['pharmaderm_user', 'pharmaderm_session']
    const PRESERVE_STARTS   = ['sb-']
    const PRESERVE_CONTAINS = ['settings', 'product', 'countr', 'currenc', 'brand']

    const shouldDelete = (key) => {
      const lower = key.toLowerCase()
      if (PRESERVE_EXACT.includes(key)) return false
      if (PRESERVE_STARTS.some(p => key.startsWith(p))) return false
      if (PRESERVE_CONTAINS.some(p => lower.includes(p))) return false
      return PRIVATE_PATTERNS.some(p => lower.includes(p))
    }

    Object.keys(localStorage).filter(shouldDelete).forEach(k => localStorage.removeItem(k))
    try {
      Object.keys(sessionStorage).filter(shouldDelete).forEach(k => sessionStorage.removeItem(k))
    } catch { /* ignore in environments without sessionStorage */ }
  },

  /**
   * Elimina solo las claves globales (sin UUID) que son datos privados legacy.
   * Se llama al iniciar la app y al hacer login para limpiar código viejo.
   * NO toca claves con patrón _<uuid> (datos de usuario ya aislados).
   */
  cleanupLegacyPrivateStorage() {
    const LEGACY_EXACT = [
      'pharmaderm_quiz_result',
      'pharmaderm_quiz',
      'pharmaderm_quiz_history',
      'pharmaderm_diagnostic_result',
      'pharmaderm_diagnostics_history',
      'pharmaderm_diagnostic',
      'pharmaderm_diagnosis',
      'pharmaderm_routine',
      'pharmaderm_routines',
      'pharmaderm_history',
      'pharmaderm_cart',
      'pharmaderm_appointments_list',
      'pharmaderm_appointment',
      'pharmaderm_orders',
      'latestQuiz',
      'quizResult',
      'diagnosticResult',
      'diagnosisResult',
      'routineResult',
      'skinAnalysis',
      'savedAnalysis',
      'cart',
      'orders',
      'appointments',
      'history',
    ]
    for (const key of LEGACY_EXACT) {
      localStorage.removeItem(key)
    }
  },
}

export default storageService
