#!/usr/bin/env node

/**
 * Script de EMERGENCIA para verificar y crear tabla ordenes
 * Resuelve error PGRST205 de forma inmediata
 * 
 * Uso: node scripts/verificar-y-crear-ordenes-emergencia.mjs
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
  console.error('\n   Configúralas en .env.local o en Vercel Dashboard')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verificarTabla() {
  console.log('🔍 Verificando si tabla ordenes existe...')
  
  try {
    const { data, error } = await supabase
      .from('ordenes')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('PGRST205')) {
        console.log('❌ Tabla NO existe (PGRST205)')
        return false
      }
      throw error
    }

    console.log('✅ Tabla existe')
    return true
  } catch (error: any) {
    if (error.code === 'PGRST205' || error.message?.includes('PGRST205')) {
      return false
    }
    throw error
  }
}

async function crearTabla() {
  console.log('\n📋 Creando tabla ordenes...')
  
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

-- Función para updated_at
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();
  `.trim()

  // Intentar ejecutar usando Management API
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
      console.log('✅ SQL ejecutado usando REST API')
      return true
    } else {
      const errorText = await response.text()
      console.warn('⚠️ REST API no disponible:', errorText)
      return false
    }
  } catch (error) {
    console.warn('⚠️ No se puede ejecutar automáticamente:', error.message)
    return false
  }
}

async function probarInsercion() {
  console.log('\n🧪 Probando inserción de orden de prueba...')
  
  try {
    const testOrder = {
      productos: [{ id: 'test', nombre: 'Test', precio: 0, cantidad: 1, subtotal: 0 }],
      comprador: { nombre: 'Test', email: 'test@test.com' },
      envio: { tipo: 'retiro_local', costo: 0 },
      total: 0,
      estado: 'pendiente',
    }

    const { data, error } = await supabase
      .from('ordenes')
      .insert(testOrder)
      .select('id')
      .single()

    if (error) {
      console.error('❌ Error al insertar:', error.message)
      return false
    }

    console.log('✅ Inserción exitosa, ID:', data.id)

    // Eliminar orden de prueba
    await supabase.from('ordenes').delete().eq('id', data.id)
    console.log('✅ Orden de prueba eliminada')

    return true
  } catch (error: any) {
    console.error('❌ Error en prueba:', error.message)
    return false
  }
}

async function main() {
  console.log('🚨 SCRIPT DE EMERGENCIA: Crear tabla ordenes\n')
  console.log('=' .repeat(60))

  // Verificar si existe
  const existe = await verificarTabla()

  if (existe) {
    console.log('\n✅ La tabla ya existe')
    
    // Probar inserción
    const funciona = await probarInsercion()
    
    if (funciona) {
      console.log('\n✅ ✅ ✅ TODO FUNCIONA CORRECTAMENTE')
      console.log('✅ La tabla ordenes está operativa')
      console.log('✅ El error PGRST205 está resuelto')
      return
    } else {
      console.log('\n⚠️ La tabla existe pero hay problemas')
      console.log('⚠️ Revisa los logs arriba para más detalles')
      return
    }
  }

  // Crear tabla
  console.log('\n📋 La tabla NO existe, creando...')
  const creada = await crearTabla()

  if (!creada) {
    console.log('\n❌ No se pudo crear automáticamente')
    console.log('\n📋 INSTRUCCIONES MANUALES:')
    console.log('1. Ve a https://supabase.com/dashboard')
    console.log('2. Selecciona tu proyecto')
    console.log('3. Click en "SQL Editor"')
    console.log('4. Click en "New query"')
    console.log('5. Copia y pega el SQL de: supabase/migrations/006_create_ordenes_simple.sql')
    console.log('6. Click en "Run"')
    console.log('7. Verifica éxito')
    console.log('\n📄 SQL completo guardado en: supabase/migrations/006_create_ordenes_simple.sql')
    process.exit(1)
  }

  // Esperar un momento para que se actualice el cache
  console.log('\n⏳ Esperando actualización de cache (3 segundos)...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Verificar que se creó
  const verificada = await verificarTabla()
  
  if (!verificada) {
    console.log('\n⚠️ La tabla puede no haberse creado correctamente')
    console.log('⚠️ Espera 1-2 minutos y vuelve a intentar')
    console.log('⚠️ O ejecuta el SQL manualmente en Supabase Dashboard')
    process.exit(1)
  }

  // Probar inserción
  const funciona = await probarInsercion()

  if (funciona) {
    console.log('\n✅ ✅ ✅ ÉXITO TOTAL')
    console.log('✅ Tabla ordenes creada correctamente')
    console.log('✅ Inserción funciona correctamente')
    console.log('✅ El error PGRST205 está RESUELTO')
    console.log('\n🎯 Ahora puedes intentar hacer una compra')
  } else {
    console.log('\n⚠️ La tabla se creó pero hay problemas al insertar')
    console.log('⚠️ Revisa los logs arriba')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

