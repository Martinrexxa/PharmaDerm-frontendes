import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured, isBackendMode, DATA_MODE, API_BASE_URL } from '../lib/supabaseClient.js'
import { userService } from '../services/userService.js'
import storageService from '../services/storageService.js'
import { loadHistoryForUser, clearHistory } from './useHistoryStore.js'
import { initCartForUser, clearCartForUser } from './useCartStore.js'

// â”€â”€â”€ Singleton state (shared across all imports) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const user      = ref(null)    // public.users profile row
const session   = ref(null)    // Supabase Auth session (or legacy object)
const settings  = ref(null)    // user_settings row
const loading   = ref(false)
const initialized = ref(false)
const SHOULD_USE_BACKEND_AUTH = Boolean(API_BASE_URL && !String(API_BASE_URL).includes('localhost'))

// â”€â”€â”€ Internal helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function _loadProfile(userId) {
  // Scope all localStorage keys to this user
  storageService.setCurrentUser(userId)
  try {
    user.value = await userService.getPublicUser(userId)
  } catch {
    user.value = null
  }
  try {
    const s = await userService.getUserSettings(userId)
    settings.value = s
    _applySettings(s)
  } catch {
    settings.value = null
  }
  // Bind history and cart stores to this user (async: checks Supabase sync)
  await loadHistoryForUser(userId)
  await initCartForUser()
}

function _applySettings(s) {
  if (!s) return
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
  storageService.set('settings', {
    language: s.language ?? 'es',
    country: s.country_code ?? 'DO',
    currency: s.currency ?? 'DOP',
  })
}

function _clearState() {
  user.value = null
  session.value = null
  settings.value = null
  // Clear cart and history stores BEFORE clearing user context
  clearCartForUser()
  clearHistory()
  // Clear user context in storageService (future reads use global key)
  storageService.clearCurrentUser()
  // Remove fallback session keys (non-Supabase mode)
  localStorage.removeItem('pharmaderm_user')
  localStorage.removeItem('pharmaderm_session')
  // Wipe private client data on logout but keep cart persistence per user.
  storageService.hardResetPrivateClientData({ preserveContains: ['cart'] })
}

// â”€â”€â”€ Store factory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useAuthStore() {
  const isLoggedIn = computed(() => {
    // Backend/hybrid mode stores a JWT token in pharmaderm_session.
    // Supabase mode uses access_token in session.value.
    if (session.value?.token) return true
    if (session.value?.isLoggedIn) return true
    if (isSupabaseConfigured && session.value?.access_token) return true
    return !!storageService.get('session', null)?.isLoggedIn
  })

  const isAuthenticated = isLoggedIn

  const displayName = computed(() => {
    const u = user.value
    if (!u) return 'User'
    return u.first_name || u.firstName || u.name || 'User'
  })

  const currentUser = computed(() => user.value)

  // â”€â”€ initAuth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function initAuth() {
    if (initialized.value) return

    // Clean legacy global private keys every time the app starts
    storageService.cleanupLegacyPrivateStorage()

    if (SHOULD_USE_BACKEND_AUTH || isBackendMode || !isSupabaseConfigured) {
      try {
        const rawUser = localStorage.getItem('pharmaderm_user')
        const rawSess = localStorage.getItem('pharmaderm_session')
        user.value    = rawUser ? JSON.parse(rawUser) : null
        session.value = rawSess ? JSON.parse(rawSess) : null
        if (user.value?.id || user.value?.email) {
          await loadHistoryForUser(user.value.id || user.value.email)
        }
      } catch {
        _clearState()
      }
      initialized.value = true
      return
    }

    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      session.value = s
      if (s) await _loadProfile(s.user.id)
    } catch { /* ignore */ }

    // Keep state in sync with Supabase token refresh, sign in/out
    supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'TOKEN_REFRESHED' && s?.user?.id === user.value?.id) {
        session.value = s
        return
      }
      if (event === 'INITIAL_SESSION' && session.value) return;

      session.value = s
      if (s) {
        await userService.ensurePublicUser(s.user)
        await _loadProfile(s.user.id)
      } else {
        // Full reset â€” clears cart, history, storageService user context,
        // and legacy global keys so the next user starts clean
        _clearState()
      }
    })

    initialized.value = true
  }

  // â”€â”€ register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function register({ firstName, lastName, email, phone, password, birthDate }) {
    loading.value = true
    try {
      if (SHOULD_USE_BACKEND_AUTH || isBackendMode || !isSupabaseConfigured) {
        if (SHOULD_USE_BACKEND_AUTH || isBackendMode) {
          const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Nombre: firstName,
              Apellido: lastName,
              Email: email,
              Telefono: phone,
              Contrasena: password,
            }),
          })

          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data?.error || 'Could not create the account')

          return { success: true, needsEmailConfirmation: data?.needsEmailConfirmation !== false }
        }

        const userData = {
          name: `${firstName} ${lastName}`.trim(),
          firstName, lastName, email, phone, password,
          birth_date: birthDate || null,
          createdAt: new Date().toISOString(),
        }
        user.value = userData
        const sess = { isLoggedIn: true, email, loginAt: new Date().toISOString() }
        session.value = sess
        localStorage.setItem('pharmaderm_user', JSON.stringify(userData))
        localStorage.setItem('pharmaderm_session', JSON.stringify(sess))
        return { success: true, needsEmailConfirmation: false }
      }

      const { user: authUser, session: authSession } = await userService.signUpUser({
        email, password, firstName, lastName, phone, birthDate,
      })

      if (authSession && authUser) {
        await userService.ensurePublicUser(authUser)
        session.value = authSession
        await _loadProfile(authUser.id)
        return { success: true, needsEmailConfirmation: false }
      }

      return { success: true, needsEmailConfirmation: true }
    } finally {
      loading.value = false
    }
  }

  // â”€â”€ login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function login(email, password) {
    loading.value = true
    try {
      if (SHOULD_USE_BACKEND_AUTH || isBackendMode || !isSupabaseConfigured) {
        if (SHOULD_USE_BACKEND_AUTH || isBackendMode) {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Email: email, Contrasena: password }),
          })

          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data?.error || 'Could not sign in')

          const u = data?.usuario || null
          if (!u?.email) throw new Error('Invalid server response')

          // Clean legacy data before loading new user
          storageService.cleanupLegacyPrivateStorage()

          const normalizedUser = {
            id: u.id ?? u.usuarioId ?? u.UsuarioID ?? null,
            email: u.email,
            firstName: u.nombre || '',
            lastName: u.apellido || '',
            name: `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'User',
            phone: u.telefono || null,
          }

          user.value = normalizedUser
          const sess = {
            isLoggedIn: true,
            email: normalizedUser.email,
            token: data?.token || null,
            loginAt: new Date().toISOString(),
            mode: 'backend',
          }

          session.value = sess
          localStorage.setItem('pharmaderm_user', JSON.stringify(normalizedUser))
          localStorage.setItem('pharmaderm_session', JSON.stringify(sess))

          // Scope localStorage keys to this user
          storageService.setCurrentUser(normalizedUser.id || normalizedUser.email)
          await loadHistoryForUser(normalizedUser.id || normalizedUser.email)
          await initCartForUser()

          return { success: true }
        }

        const savedUser = JSON.parse(localStorage.getItem('pharmaderm_user') || 'null')
        if (!savedUser) throw new Error('No registered account was found. Create an account first.')
        if (
          savedUser.email?.toLowerCase() !== email.toLowerCase() ||
          savedUser.password !== password
        ) {
          throw new Error('Incorrect email or password.')
        }
        // Clean legacy data before loading new user
        storageService.cleanupLegacyPrivateStorage()
        const sess = { isLoggedIn: true, email, loginAt: new Date().toISOString() }
        user.value = savedUser
        session.value = sess
        localStorage.setItem('pharmaderm_session', JSON.stringify(sess))
        return { success: true }
      }

      // Clean legacy data before loading new user's scoped data
      storageService.cleanupLegacyPrivateStorage()
      const { session: s, user: authUser } = await userService.signInUser(email, password)
      session.value = s

      // If the app-specific profile tables (public.users, user_settings) don't exist yet,
      // still allow the user to log in with Supabase Auth.
      try {
        await userService.ensurePublicUser(authUser)
        await _loadProfile(authUser.id)
      } catch {
        user.value = { id: authUser.id, email: authUser.email }
        storageService.setCurrentUser(authUser.id)
      }
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  // â”€â”€ logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function logout() {
    loading.value = true
    try {
      if (isSupabaseConfigured) await userService.signOutUser()
    } catch { /* ignore */ } finally {
      _clearState()
      loading.value = false
    }
  }

  // â”€â”€ updateProfile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function updateProfile(data) {
    if (!user.value) return
    if (isSupabaseConfigured) {
      const payload = {}
      if (data.firstName   !== undefined) payload.first_name       = data.firstName
      if (data.lastName    !== undefined) payload.last_name        = data.lastName
      if (data.phone       !== undefined) payload.phone            = data.phone
      if (data.country     !== undefined) payload.country_code     = data.country
      if (data.language    !== undefined) payload.preferred_lang   = data.language
      if (data.currency    !== undefined) payload.preferred_currency = data.currency
      Object.assign(payload, data)

      const updated = await userService.updateUserProfile(user.value.id, payload)
      user.value = updated
    } else {
      user.value = { ...user.value, ...data }
      localStorage.setItem('pharmaderm_user', JSON.stringify(user.value))
    }
    return user.value
  }

  // â”€â”€ updateSettings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function updateSettings(data) {
    if (isSupabaseConfigured && user.value) {
      const updated = await userService.updateUserSettings(user.value.id, data)
      settings.value = updated
      _applySettings(updated)
    } else {
      storageService.set('settings', { ...storageService.get('settings', {}), ...data })
      _applySettings({ language: data.language, country_code: data.country, currency: data.currency })
    }
    return settings.value
  }

  // â”€â”€ Legacy compat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function updateUser(partial) {
    user.value = { ...user.value, ...partial }
    if (!isSupabaseConfigured) localStorage.setItem('pharmaderm_user', JSON.stringify(user.value))
  }

  return {
    // state
    user: currentUser,
    session,
    settings,
    loading,
    initialized,
    // computed
    isLoggedIn,
    isAuthenticated,
    displayName,
    // methods
    initAuth,
    register,
    login,
    logout,
    updateProfile,
    updateSettings,
    updateUser,
    loadCurrentUser: () => user.value,
    loadUserSettings: () => settings.value,
    refresh: () => {},
  }
}

