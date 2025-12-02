import { NextResponse } from 'next/server'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'

/**
 * Endpoint para verificar y crear tabla ordenes si no existe
 * GET /api/admin/verificar-y-crear-ordenes
 *
 * Este endpoint verifica si la tabla existe y proporciona instrucciones claras
 */
export async function GET(request: Request) {
  try {
    if (!isSupabaseEnabled) {
      return NextResponse.json(
        {
          error: 'Supabase no está configurado',
          hint: 'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
        },
        { status: 500 }
      )
    }

    const { supabaseAdmin } = requireSupabase()

    console.log('[VERIFICAR-ORDENES] 🔍 Verificando existencia de tabla ordenes...')

    // Intentar consultar la tabla
    const { data, error } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('PGRST205')) {
        console.log('[VERIFICAR-ORDENES] ❌ Tabla NO existe (PGRST205)')

        // Leer SQL de migración
        const migrationSQL = `
-- Crear tabla ordenes con estructura completa
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

-- Índices
CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
        `.trim()

        return NextResponse.json({
          exists: false,
          error: 'PGRST205',
          message: 'La tabla ordenes NO existe en Supabase',
          action: 'create',
          instructions: [
            '1. Ve a https://supabase.com/dashboard',
            '2. Selecciona tu proyecto',
            '3. Click en "SQL Editor" en el menú lateral',
            '4. Click en "New query"',
            '5. Copia y pega el SQL del campo "sql" abajo',
            '6. Click en "Run" o presiona Ctrl+Enter',
            '7. Espera confirmación de éxito',
            '8. Verifica en "Table Editor" que la tabla "ordenes" existe',
          ],
          sql: migrationSQL,
          migrationFile: 'supabase/migrations/006_create_ordenes_simple.sql',
          urgent: true,
        })
      }

      // Otro error
      return NextResponse.json(
        {
          exists: false,
          error: error.code || 'UNKNOWN',
          message: error.message,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    // La tabla existe
    console.log('[VERIFICAR-ORDENES] ✅ Tabla existe')

    // Verificar estructura básica intentando insertar orden de prueba
    try {
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
          exists: true,
          working: false,
          error: testError.code,
          message: 'La tabla existe pero hay problemas al insertar',
          details: testError.message,
          hint: testError.hint,
        })
      }

      // Eliminar orden de prueba
      await supabaseAdmin.from('ordenes').delete().eq('id', testData.id)

      return NextResponse.json({
        exists: true,
        working: true,
        message: '✅ La tabla ordenes existe y funciona correctamente',
        testInsert: 'success',
      })
    } catch (testError: any) {
      return NextResponse.json({
        exists: true,
        working: false,
        error: 'TEST_FAILED',
        message: 'La tabla existe pero falló la prueba de inserción',
        details: testError.message,
      })
    }
  } catch (error: any) {
    console.error('[VERIFICAR-ORDENES] ❌ Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error desconocido',
        code: error.code,
      },
      { status: 500 }
    )
  }
}
