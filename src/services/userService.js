import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import storageService from './storageService.js'

export const userService = {
  // ─── Supabase Auth ────────────────────────────────────────────────

  async signUpUser({ email, password, firstName, lastName, phone, birthDate }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          phone: phone || null,
          birth_date: birthDate || null,
        },
      },
    })
    if (error) throw error
    return data
  },

  async signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOutUser() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getAuthSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // ─── public.users ─────────────────────────────────────────────────

  /**
   * Creates or updates a row in public.users.
   * id must equal auth.users.id so RLS (auth.uid() = id) works.
   */
  async createPublicUser(authUserId, { email, firstName, lastName, phone, birthDate }) {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUserId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          birth_date: birthDate || null,
          role_id: 2,
          country_code: 'DO',
          preferred_lang: 'es',
          preferred_currency: 'DOP',
          is_active: true,
          email_verified: false,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Called after signInWithPassword. Ensures public.users and user_settings
   * rows exist. On first login (after email confirmation), creates them from
   * auth.user_metadata because RLS was blocking the insert during signUp.
   */
  async ensurePublicUser(authUser) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (!existing) {
      const meta = authUser.user_metadata || {}
      const firstName = meta.first_name || (meta.full_name || '').split(' ')[0] || ''
      const lastName  = meta.last_name  || (meta.full_name || '').split(' ').slice(1).join(' ') || ''
      await this.createPublicUser(authUser.id, {
        email: authUser.email,
        firstName,
        lastName,
        phone: meta.phone || null,
        birthDate: meta.birth_date || null,
      })
    }

    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!existingSettings) {
      await this.upsertUserSettings(authUser.id, {})
    }
  },

  async getPublicUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateUserProfile(userId, updates) {
    const allowed = ['first_name', 'last_name', 'phone', 'country_code', 'preferred_lang', 'preferred_currency', 'birth_date']
    const payload = {}
    for (const k of allowed) {
      if (k in updates) payload[k] = updates[k]
    }
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ─── user_settings ────────────────────────────────────────────────

  async upsertUserSettings(userId, settings = {}) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          is_dark: settings.isDark ?? false,
          language: settings.language ?? 'es',
          country_code: settings.country ?? 'DO',
          currency: settings.currency ?? 'DOP',
          email_promo: settings.emailPromo ?? true,
          email_orders: settings.emailOrders ?? true,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getUserSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) return null
    return data
  },

  async updateUserSettings(userId, updates) {
    const payload = {}
    if ('isDark' in updates) payload.is_dark = updates.isDark
    if ('language' in updates) payload.language = updates.language
    if ('country' in updates) payload.country_code = updates.country
    if ('currency' in updates) payload.currency = updates.currency
    if ('emailPromo' in updates) payload.email_promo = updates.emailPromo
    if ('emailOrders' in updates) payload.email_orders = updates.emailOrders

    const { data, error } = await supabase
      .from('user_settings')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ─── Addresses ────────────────────────────────────────────────

  getAddresses() {
    return storageService.get('addresses', [])
  },

  async saveAddress(address, userId) {
    // Save to Supabase first to get the real ID
    let supabaseId = address.id
    
    if (isSupabaseConfigured && userId) {
      try {
        const payload = {
          user_id: userId,
          label: address.label || 'Mi dirección',
          full_name: address.full_name || null,
          phone: address.phone || null,
          address_line_1: address.address_line_1 || address.address || '',
          address_line_2: address.address_line_2 || null,
          city: address.city || null,
          state: address.state || null,
          postal_code: address.postal_code || null,
          country_code: address.country_code || 'DO',
          is_default: address.is_default !== false, // Default to true
        }
        
        // If has ID, try to update; otherwise insert
        let result
        if (address.id) {
          const { data, error } = await supabase
            .from('addresses')
            .update(payload)
            .eq('id', address.id)
            .select()
            .single()
          if (error) throw error
          result = data
        } else {
          const { data, error } = await supabase
            .from('addresses')
            .insert([payload])
            .select()
            .single()
          if (error) throw error
          result = data
          supabaseId = result.id
        }
        
        console.log('[UserService] Address saved to Supabase:', supabaseId)
      } catch (error) {
        console.warn('[UserService] Supabase address save failed:', error.message)
      }
    }

    // Save to localStorage with the real ID
    const addresses = this.getAddresses()
    const entry = { 
      ...address, 
      id: supabaseId || address.id || Date.now(),
      address_line_1: address.address_line_1 || address.address || ''
    }
    
    // Remove old entry if exists, then add new one at front
    const filtered = addresses.filter(a => a.id !== entry.id)
    filtered.unshift(entry)
    storageService.set('addresses', filtered.slice(0, 10))
    
    console.log('[UserService] Address saved to localStorage:', entry.id)
    return entry
  },

  removeAddress(id) {
    const addresses = this.getAddresses().filter(a => a.id !== id)
    storageService.set('addresses', addresses)

    // Remove from Supabase if configured
    if (isSupabaseConfigured) {
      supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .catch(err => console.warn('[UserService] Address delete failed:', err))
    }
  },

  getDefaultAddress() {
    return this.getAddresses()[0] || null
  },
}

export default userService
