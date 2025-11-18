import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Cliente para uso en cliente (browser) - usa anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso en servidor (API routes) - usa service role key si está disponible
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase

// Helper para obtener cliente según contexto
export function getSupabaseClient() {
  // En servidor, preferir admin client
  if (typeof window === 'undefined' && supabaseServiceKey) {
    return supabaseAdmin
  }
  return supabase
}

export default supabase
