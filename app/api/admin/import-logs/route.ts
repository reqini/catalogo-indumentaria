import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'

/**
 * Endpoint para obtener logs de importación
 */
export async function GET(request: Request) {
  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    // Intentar obtener de Supabase
    try {
      const supabaseModule = await import('@/lib/supabase').catch(() => null)
      if (supabaseModule && supabaseModule.isSupabaseEnabled) {
        const { supabaseAdmin } = supabaseModule.requireSupabase()
        const { data } = await supabaseAdmin
          .from('import_logs')
          .select('log_data')
          .order('fecha', { ascending: false })
          .limit(50)

        if (data) {
          const logs = data.map((item: any) => item.log_data)
          return NextResponse.json({ logs })
        }
      }
    } catch (supabaseError) {
      // Continuar con fallback
    }

    // Fallback: retornar array vacío
    return NextResponse.json({ logs: [] })
  } catch (error: any) {
    console.error('[IMPORT-LOGS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error obteniendo logs', logs: [] },
      { status: 500 }
    )
  }
}
