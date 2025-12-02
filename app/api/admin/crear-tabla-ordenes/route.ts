import { NextResponse } from 'next/server'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Endpoint para crear tabla ordenes automáticamente
 * POST /api/admin/crear-tabla-ordenes
 *
 * Resuelve error PGRST205 ejecutando las migraciones SQL necesarias
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación (opcional pero recomendado)
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret-change-in-production'

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado. Usa Authorization: Bearer {ADMIN_SECRET}' },
        { status: 401 }
      )
    }

    if (!isSupabaseEnabled) {
      return NextResponse.json(
        { error: 'Supabase no está configurado correctamente' },
        { status: 500 }
      )
    }

    const { supabaseAdmin } = requireSupabase()

    console.log('[CREAR-TABLA-ORDENES] 🔍 Verificando si tabla existe...')

    // Verificar si la tabla existe
    try {
      const { error: checkError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

      if (!checkError || checkError.code !== 'PGRST205') {
        // La tabla existe o hay otro error
        if (checkError && checkError.code === 'PGRST205') {
          console.log('[CREAR-TABLA-ORDENES] ⚠️ Tabla no existe, creando...')
        } else {
          console.log('[CREAR-TABLA-ORDENES] ✅ Tabla ya existe')
          return NextResponse.json({
            success: true,
            message: 'La tabla ordenes ya existe',
            action: 'none',
          })
        }
      }
    } catch (error: any) {
      if (error.code === 'PGRST205' || error.message?.includes('PGRST205')) {
        console.log('[CREAR-TABLA-ORDENES] ⚠️ Tabla no existe (PGRST205), creando...')
      } else {
        throw error
      }
    }

    // SQL completo para crear tabla con todos los campos
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

-- Índices
CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_number_idx ON public.ordenes ((envio->>'tracking_number')) WHERE envio->>'tracking_number' IS NOT NULL;

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

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();
`

    console.log('[CREAR-TABLA-ORDENES] 📤 Ejecutando SQL de creación...')

    // Intentar ejecutar usando Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: 'Variables de entorno de Supabase no configuradas',
          hint: 'Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      )
    }

    // Ejecutar SQL usando REST API de Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_query: createTableSQL }),
    })

    if (!response.ok) {
      // Si no funciona el método RPC, retornar instrucciones manuales
      const errorText = await response.text()
      console.error('[CREAR-TABLA-ORDENES] ❌ Error ejecutando SQL:', errorText)

      return NextResponse.json(
        {
          success: false,
          error: 'No se puede ejecutar automáticamente',
          message: 'Ejecuta manualmente en Supabase Dashboard → SQL Editor',
          sql: createTableSQL,
          instructions: [
            '1. Ve a Supabase Dashboard → SQL Editor',
            '2. Copia y pega el SQL proporcionado en el campo "sql"',
            '3. Ejecuta el SQL',
            '4. Verifica que la tabla se creó correctamente',
          ],
        },
        { status: 200 } // 200 porque las instrucciones están disponibles
      )
    }

    // Verificar que la tabla se creó correctamente
    console.log('[CREAR-TABLA-ORDENES] 🔍 Verificando creación...')

    const { error: verifyError } = await supabaseAdmin.from('ordenes').select('id').limit(1)

    if (verifyError) {
      if (verifyError.code === 'PGRST205') {
        return NextResponse.json(
          {
            success: false,
            error: 'La tabla aún no existe después de la creación',
            message: 'Ejecuta manualmente en Supabase Dashboard',
            sql: createTableSQL,
          },
          { status: 500 }
        )
      }
      throw verifyError
    }

    console.log('[CREAR-TABLA-ORDENES] ✅ Tabla creada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Tabla ordenes creada exitosamente',
      action: 'created',
    })
  } catch (error: any) {
    console.error('[CREAR-TABLA-ORDENES] ❌ Error:', error)

    // Leer migración SQL para incluirla en la respuesta
    let migrationSQL = ''
    try {
      const migrationPath = join(process.cwd(), 'supabase/migrations/006_create_ordenes_simple.sql')
      migrationSQL = readFileSync(migrationPath, 'utf-8')
    } catch {
      // Si no se puede leer, usar SQL básico
      migrationSQL = `
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);
      `
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido',
        code: error.code,
        message: 'Ejecuta manualmente en Supabase Dashboard → SQL Editor',
        sql: migrationSQL,
        migrationFile: 'supabase/migrations/006_create_ordenes_simple.sql',
        instructions: [
          '1. Ve a https://supabase.com/dashboard',
          '2. Selecciona tu proyecto',
          '3. Ve a SQL Editor',
          '4. Copia y pega el SQL proporcionado en el campo "sql"',
          '5. Click en "Run"',
          '6. Verifica que no hay errores',
        ],
      },
      { status: 500 }
    )
  }
}
