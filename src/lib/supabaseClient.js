/**
 * Supabase client — PharmaDerm
 * Usa Supabase si las variables .env están configuradas.
 * Si no están configuradas, exporta null para que los servicios usen localStorage.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'hybrid'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const isBackendMode = DATA_MODE === 'backend' || DATA_MODE === 'hybrid'
export const isSupabaseConfigured =
  DATA_MODE !== 'local' &&
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export default supabase
