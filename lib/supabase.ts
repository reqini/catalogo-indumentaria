import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// CRÍTICO: No lanzar error durante importación para permitir build sin Supabase
// Las variables de Supabase son opcionales - el sistema puede funcionar sin ellas
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Cliente para uso en cliente (browser) - usa anon key
// Si no está configurado, crear cliente dummy que fallará al usarse
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any) // Type assertion para evitar errores de tipo durante build

// Cliente para uso en servidor (API routes) - usa service role key si está disponible
export const supabaseAdmin: SupabaseClient = isSupabaseConfigured
  ? supabaseServiceKey
    ? createClient(supabaseUrl!, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase
  : (null as any) // Type assertion para evitar errores de tipo durante build

// Helper para validar que Supabase está configurado antes de usar
export function requireSupabase(): { supabase: SupabaseClient; supabaseAdmin: SupabaseClient } {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase no está configurado. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.'
    )
  }
  return { supabase, supabaseAdmin }
}

// Helper para obtener cliente según contexto
export function getSupabaseClient(): SupabaseClient {
  // Validar que está configurado antes de usar
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase no está configurado. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.'
    )
  }
  // En servidor, preferir admin client
  if (typeof window === 'undefined' && supabaseServiceKey) {
    return supabaseAdmin
  }
  return supabase
}

// Exportar flag para verificar si está configurado
export const isSupabaseEnabled = isSupabaseConfigured

export default supabase
