import { supabase, isSupabaseConfigured } from './supabaseClient.js'

export async function getCurrentUserIdentity() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) return { id: user.id, email: user.email || null, source: 'supabase' }
    } catch {
      // fall through to backend/local identity
    }
  }

  try {
    const rawUser = localStorage.getItem('pharmaderm_user')
    const parsedUser = rawUser ? JSON.parse(rawUser) : null
    if (parsedUser?.id || parsedUser?.email) {
      return {
        id: parsedUser.id || parsedUser.email,
        email: parsedUser.email || null,
        source: 'local-session',
      }
    }
  } catch {
    // ignore
  }

  return { id: null, email: null, source: 'none' }
}

