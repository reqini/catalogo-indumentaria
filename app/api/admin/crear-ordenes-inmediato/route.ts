import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Endpoint CRÍTICO para crear tabla ordenes INMEDIATAMENTE
 * POST /api/admin/crear-ordenes-inmediato
 *
 * Este endpoint intenta crear la tabla usando múltiples métodos
 */
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase no configurado',
          hint: 'Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      )
    }

    console.log('[CREAR-ORDENES-INMEDIATO] 🚀 Iniciando creación inmediata...')

    // SQL completo para crear tabla
    const createSQL = `
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pago_preferencia_id TEXT,
  pago_id TEXT,
  pago_estado TEXT DEFAULT 'pendiente',
  pago_fecha TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);
    `.trim()

    // Método 1: Intentar verificar primero
    console.log('[CREAR-ORDENES-INMEDIATO] Método 1: Verificando existencia...')
    const { error: checkError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (!checkError || checkError.code !== 'PGRST205') {
      // La tabla existe
      console.log('[CREAR-ORDENES-INMEDIATO] ✅ Tabla ya existe')

      // Verificar que funciona
      const testOrder = {
        productos: [{ id: 'test', nombre: 'Test', precio: 0, cantidad: 1, subtotal: 0 }],
        comprador: { nombre: 'Test', email: 'test@test.com' },
        envio: { tipo: 'retiro_local', costo: 0 },
        total: 0,
        estado: 'pendiente',
      }

      const { data: testData, error: testError } = await supabaseAdmin
        .from('ordenes')
        .insert(testOrder)
        .select('id')
        .single()

      if (testError) {
        return NextResponse.json({
          success: false,
          exists: true,
          working: false,
          error: testError.code,
          message: 'La tabla existe pero no funciona correctamente',
          details: testError.message,
          sql: createSQL,
        })
      }

      // Eliminar orden de prueba
      await supabaseAdmin.from('ordenes').delete().eq('id', testData.id)

      return NextResponse.json({
        success: true,
        exists: true,
        working: true,
        message: '✅ La tabla ordenes existe y funciona correctamente',
      })
    }

    // Método 2: Intentar crear usando REST API directa
    console.log('[CREAR-ORDENES-INMEDIATO] Método 2: Intentando crear con REST API...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: createSQL }),
      })

      if (response.ok) {
        console.log('[CREAR-ORDENES-INMEDIATO] ✅ SQL ejecutado via REST API')

        // Esperar propagación
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Verificar
        const { error: verifyError } = await supabaseAdmin.from('ordenes').select('id').limit(1)
        if (!verifyError) {
          return NextResponse.json({
            success: true,
            message: '✅ Tabla creada exitosamente usando REST API',
            method: 'rest_api',
          })
        }
      }
    } catch (restError: any) {
      console.warn('[CREAR-ORDENES-INMEDIATO] ⚠️ REST API no disponible:', restError.message)
    }

    // Método 3: Retornar SQL para ejecución manual
    return NextResponse.json({
      success: false,
      exists: false,
      message: 'No se pudo crear automáticamente. Ejecuta manualmente:',
      sql: createSQL,
      instructions: [
        '1. Ve a https://supabase.com/dashboard',
        '2. Selecciona tu proyecto',
        '3. Click en "SQL Editor"',
        '4. Click en "New query"',
        '5. Copia y pega el SQL del campo "sql"',
        '6. Click en "Run" o presiona Ctrl+Enter',
        '7. Espera confirmación de éxito',
        '8. Verifica en "Table Editor" que la tabla "ordenes" existe',
      ],
      urgent: true,
    })
  } catch (error: any) {
    console.error('[CREAR-ORDENES-INMEDIATO] ❌ Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido',
        code: error.code,
      },
      { status: 500 }
    )
  }
}
