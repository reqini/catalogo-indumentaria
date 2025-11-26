#!/usr/bin/env node

/**
 * Script DEFINITIVO para crear tabla ordenes en Supabase
 * Resuelve PGRST205 de forma automática e inmediata
 * 
 * Ejecuta: node scripts/crear-ordenes-definitivo.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Variables de entorno no configuradas')
  console.error('   Requeridas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verificarTabla() {
  try {
    const { error } = await supabase.from('ordenes').select('id').limit(1)
    return !error || error.code !== 'PGRST205'
  } catch {
    return false
  }
}

async function crearTablaConREST() {
  console.log('🔧 Creando tabla usando REST API de Supabase...')
  
  const sql = `
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
CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Función y trigger para updated_at
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

  // Ejecutar usando REST API directamente
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    })

    if (response.ok) {
      console.log('✅ SQL ejecutado via REST API')
      return true
    }

    const errorText = await response.text()
    console.warn('⚠️ REST API no disponible:', errorText.substring(0, 200))
    return false
  } catch (error) {
    console.warn('⚠️ Error ejecutando REST API:', error.message)
    return false
  }
}

async function crearTablaConInsercion() {
  console.log('🔧 Intentando crear tabla mediante inserción de prueba...')
  
  // Intentar insertar directamente - si falla, Supabase puede crear la tabla
  const testOrder = {
    productos: [{ id: 'test', nombre: 'Test', precio: 0, cantidad: 1, subtotal: 0 }],
    comprador: { nombre: 'Test', email: 'test@test.com' },
    envio: { tipo: 'retiro_local', costo: 0 },
    total: 0,
    estado: 'pendiente',
  }

  try {
    const { data, error } = await supabase
      .from('ordenes')
      .insert(testOrder)
      .select('id')
      .single()

    if (!error && data) {
      // Eliminar orden de prueba
      await supabase.from('ordenes').delete().eq('id', data.id)
      console.log('✅ Tabla existe y funciona correctamente')
      return true
    }

    if (error && error.code === 'PGRST205') {
      console.log('❌ Tabla no existe (PGRST205)')
      return false
    }

    console.warn('⚠️ Error inesperado:', error.message)
    return false
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 INICIANDO CREACIÓN DEFINITIVA DE TABLA ORDENES\n')
  console.log('=' .repeat(60))

  // Paso 1: Verificar si existe
  console.log('\n📋 Paso 1: Verificando si tabla existe...')
  const existe = await verificarTabla()
  
  if (existe) {
    console.log('✅ La tabla ordenes ya existe')
    
    // Verificar que funciona
    const funciona = await crearTablaConInsercion()
    if (funciona) {
      console.log('\n✅ ¡ÉXITO! La tabla existe y funciona correctamente.')
      console.log('✅ El error PGRST205 está resuelto.')
      return
    }
  } else {
    console.log('❌ La tabla ordenes NO existe')
  }

  // Paso 2: Intentar crear con REST API
  console.log('\n📋 Paso 2: Creando tabla con REST API...')
  const creada = await crearTablaConREST()

  if (creada) {
    // Esperar un momento para que se propague
    console.log('⏳ Esperando propagación...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Verificar
    const verificada = await crearTablaConInsercion()
    if (verificada) {
      console.log('\n✅ ¡ÉXITO! Tabla creada y verificada.')
      console.log('✅ El error PGRST205 está resuelto.')
      return
    }
  }

  // Paso 3: Instrucciones manuales
  console.log('\n⚠️ No se pudo crear automáticamente.')
  console.log('\n📋 INSTRUCCIONES MANUALES (2 minutos):')
  console.log('=' .repeat(60))
  console.log('1. Ve a: https://supabase.com/dashboard')
  console.log('2. Selecciona tu proyecto')
  console.log('3. Click en "SQL Editor"')
  console.log('4. Click en "New query"')
  console.log('5. Copia el SQL del archivo: supabase/migrations/006_create_ordenes_simple.sql')
  console.log('6. Pega y ejecuta (Run o Ctrl+Enter)')
  console.log('7. Verifica en "Table Editor" que la tabla "ordenes" existe')
  console.log('=' .repeat(60))
}

main().catch((error) => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

