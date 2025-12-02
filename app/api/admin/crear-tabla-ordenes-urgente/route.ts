import { NextResponse } from 'next/server'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'

/**
 * Endpoint URGENTE para crear tabla ordenes automáticamente
 * POST /api/admin/crear-tabla-ordenes-urgente
 *
 * Resuelve PGRST205 ejecutando SQL directamente
 */
export async function POST(request: Request) {
  try {
    if (!isSupabaseEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase no configurado',
          hint: 'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
        },
        { status: 500 }
      )
    }

    const { supabaseAdmin } = requireSupabase()

    console.log('[URGENTE-CREAR-TABLA] 🔍 Verificando tabla ordenes...')

    // Verificar si existe
    const { error: checkError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (!checkError || checkError.code !== 'PGRST205') {
      // Existe o hay otro error
      if (checkError && checkError.code === 'PGRST205') {
        console.log('[URGENTE-CREAR-TABLA] ⚠️ Tabla NO existe (PGRST205)')
      } else {
        console.log('[URGENTE-CREAR-TABLA] ✅ Tabla existe')
        return NextResponse.json({
          success: true,
          exists: true,
          message: 'La tabla ordenes ya existe',
        })
      }
    }

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
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();
    `.trim()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Ejecutar SQL
    console.log('[URGENTE-CREAR-TABLA] 📤 Ejecutando SQL...')

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_query: createSQL }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[URGENTE-CREAR-TABLA] ❌ Error:', errorText)

      return NextResponse.json({
        success: false,
        error: 'No se puede ejecutar automáticamente',
        message: 'Ejecuta manualmente en Supabase Dashboard → SQL Editor',
        sql: createSQL,
        instructions: [
          '1. Ve a https://supabase.com/dashboard',
          '2. Selecciona tu proyecto',
          '3. SQL Editor → New query',
          '4. Copia y pega el SQL del campo "sql"',
          '5. Click en "Run"',
        ],
      })
    }

    // Esperar actualización de cache
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Verificar creación
    const { error: verifyError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (verifyError && verifyError.code === 'PGRST205') {
      return NextResponse.json({
        success: false,
        error: 'Tabla aún no existe después de creación',
        message: 'Espera 1-2 minutos o ejecuta manualmente',
        sql: createSQL,
      })
    }

    console.log('[URGENTE-CREAR-TABLA] ✅ Tabla creada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Tabla ordenes creada exitosamente',
      action: 'created',
    })
  } catch (error: any) {
    console.error('[URGENTE-CREAR-TABLA] ❌ Error:', error)

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

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);
    `.trim()

    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Ejecuta manualmente en Supabase Dashboard',
      sql: createSQL,
    })
  }
}
