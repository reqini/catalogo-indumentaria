import { NextResponse } from 'next/server'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'

/**
 * ENDPOINT DE EMERGENCIA: Crear tabla ordenes automáticamente
 * POST /api/admin/crear-tabla-ordenes-emergencia
 *
 * Este endpoint intenta crear la tabla ordenes usando la API REST de Supabase
 * Se ejecuta automáticamente cuando se detecta error PGRST205
 */
export async function POST(request: Request) {
  try {
    console.log('[EMERGENCIA-ORDENES] 🚨 Iniciando creación automática de tabla ordenes...')

    if (!isSupabaseEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase no configurado',
          hint: 'Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      )
    }

    const { supabaseAdmin } = requireSupabase()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // SQL completo para crear tabla con estructura correcta
    const createTableSQL = `
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

-- Índices para mejor performance
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

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();
    `.trim()

    // Intentar ejecutar usando Management API de Supabase
    // Método 1: Usar REST API directamente
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: createTableSQL }),
      })

      if (response.ok) {
        console.log('[EMERGENCIA-ORDENES] ✅ Tabla creada usando REST API')

        // Verificar que se creó
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Esperar 2 segundos

        const { error: verifyError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

        if (!verifyError) {
          return NextResponse.json({
            success: true,
            message: '✅ Tabla ordenes creada exitosamente',
            method: 'rest_api',
          })
        }
      }
    } catch (restError: any) {
      console.warn('[EMERGENCIA-ORDENES] ⚠️ REST API no disponible:', restError.message)
    }

    // Método 2: Intentar usando PostgREST directamente (no funciona para DDL)
    // Método 3: Retornar SQL para ejecución manual
    return NextResponse.json({
      success: false,
      error: 'No se puede ejecutar automáticamente',
      message: 'Ejecuta el SQL manualmente en Supabase Dashboard',
      sql: createTableSQL,
      instructions: [
        '1. Ve a https://supabase.com/dashboard',
        '2. Selecciona tu proyecto',
        '3. Click en "SQL Editor"',
        '4. Click en "New query"',
        '5. Copia y pega el SQL del campo "sql"',
        '6. Click en "Run"',
        '7. Verifica éxito',
      ],
      urgent: true,
    })
  } catch (error: any) {
    console.error('[EMERGENCIA-ORDENES] ❌ Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
