import { NextResponse } from 'next/server'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'

/**
 * Endpoint para verificar si la tabla ordenes existe en Supabase
 * GET /api/admin/verify-ordenes-table
 */
export async function GET() {
  try {
    if (!isSupabaseEnabled) {
      return NextResponse.json(
        {
          exists: false,
          error: 'Supabase no está configurado',
          hint: 'Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
        },
        { status: 500 }
      )
    }

    const { supabaseAdmin } = requireSupabase()

    // Intentar hacer una query simple para verificar si la tabla existe
    const { data, error } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (error) {
      if (
        error.code === 'PGRST116' ||
        error.message.includes('does not exist') ||
        error.message.includes('PGRST205') ||
        error.message.includes('schema cache')
      ) {
        return NextResponse.json({
          exists: false,
          error: error.message,
          code: error.code,
          hint: 'La tabla ordenes no existe. Ejecuta la migración SQL en Supabase Dashboard.',
          migrationFile: 'supabase/migrations/005_create_ordenes_table.sql',
        })
      }

      return NextResponse.json(
        {
          exists: false,
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    // Si llegamos aquí, la tabla existe
    return NextResponse.json({
      exists: true,
      message: 'La tabla ordenes existe y está operativa',
      sampleCount: data?.length || 0,
    })
  } catch (error: any) {
    console.error('[VERIFY-ORDENES] Error:', error)
    return NextResponse.json(
      {
        exists: false,
        error: error.message || 'Error desconocido',
        hint: 'Verifica la conexión a Supabase y las variables de entorno',
      },
      { status: 500 }
    )
  }
}
