#!/usr/bin/env node

/**
 * Script URGENTE para crear tabla ordenes en Supabase
 * Resuelve PGRST205 de forma inmediata
 * 
 * Ejecuta: node scripts/crear-tabla-ordenes-urgente.mjs
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

async function crearTabla() {
  console.log('🔧 Creando tabla ordenes...')
  
  // SQL completo con estructura correcta
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

  // Ejecutar usando REST API de Supabase
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error ejecutando SQL:', errorText)
      return false
    }

    console.log('✅ SQL ejecutado')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function probarInsercion() {
  console.log('🧪 Probando inserción de orden...')
  
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

    if (error) {
      console.error('❌ Error insertando:', error.message)
      return false
    }

    // Eliminar orden de prueba
    await supabase.from('ordenes').delete().eq('id', data.id)
    console.log('✅ Inserción funciona correctamente')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 VERIFICACIÓN Y CREACIÓN URGENTE DE TABLA ORDENES\n')
  
  const existe = await verificarTabla()
  
  if (existe) {
    console.log('✅ Tabla existe, verificando funcionamiento...')
    const funciona = await probarInsercion()
    if (funciona) {
      console.log('\n✅ TODO OK - La tabla ordenes está funcionando correctamente')
      return
    }
  }

  console.log('⚠️ Tabla no existe o no funciona, creando...')
  const creada = await crearTabla()
  
  if (!creada) {
    console.log('\n❌ NO SE PUDO CREAR AUTOMÁTICAMENTE')
    console.log('\n📋 EJECUTA MANUALMENTE EN SUPABASE DASHBOARD:')
    console.log('1. Ve a https://supabase.com/dashboard')
    console.log('2. SQL Editor → New query')
    console.log('3. Copia el SQL de: supabase/migrations/006_create_ordenes_simple.sql')
    console.log('4. Ejecuta')
    process.exit(1)
  }

  // Esperar un momento para que se actualice el cache
  console.log('⏳ Esperando actualización de cache...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  const funciona = await probarInsercion()
  
  if (funciona) {
    console.log('\n✅ ¡ÉXITO! Tabla creada y funcionando')
    console.log('✅ El error PGRST205 está resuelto')
  } else {
    console.log('\n⚠️ Tabla creada pero hay problemas')
    console.log('   Espera 1-2 minutos y prueba nuevamente')
  }
}

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})

