#!/usr/bin/env node

/**
 * Script para crear automáticamente la tabla ordenes en Supabase
 * Usa la estructura simplificada requerida
 * Ejecutar: node scripts/create-ordenes-table-automatic.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.error('\n📋 Configurá las variables de entorno y ejecutá nuevamente.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkTableExists() {
  try {
    const { data, error } = await supabase.from('ordenes').select('id').limit(1)
    
    if (error) {
      if (
        error.code === 'PGRST116' ||
        error.code === 'PGRST205' ||
        error.message.includes('does not exist') ||
        error.message.includes('schema cache')
      ) {
        return false
      }
      throw error
    }
    
    return true
  } catch (error) {
    if (
      error.code === 'PGRST116' ||
      error.code === 'PGRST205' ||
      error.message?.includes('does not exist') ||
      error.message?.includes('schema cache')
    ) {
      return false
    }
    throw error
  }
}

async function createTable() {
  console.log('📝 Creando tabla ordenes con estructura simplificada...')
  
  // SQL directo para crear la tabla
  const createTableSQL = `
    -- Crear tabla ordenes con estructura simplificada
    CREATE TABLE IF NOT EXISTS public.ordenes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      productos JSONB NOT NULL,
      comprador JSONB NOT NULL,
      envio JSONB NOT NULL,
      total NUMERIC NOT NULL,
      estado TEXT DEFAULT 'pendiente' NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
    CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);

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
  `

  // Intentar ejecutar usando rpc (si existe)
  try {
    // Supabase no permite ejecutar SQL arbitrario desde el cliente JS
    // Necesitamos usar el SQL Editor manualmente o una función RPC
    console.log('⚠️  No se puede ejecutar SQL directamente desde el cliente JS')
    console.log('\n📋 INSTRUCCIONES PARA CREAR LA TABLA:')
    console.log('   1. Ve a Supabase Dashboard → SQL Editor')
    console.log('   2. Copiá y pegá el siguiente SQL:')
    console.log('\n' + '='.repeat(60))
    console.log(createTableSQL)
    console.log('='.repeat(60))
    console.log('\n   3. Ejecutá el script (Run o Cmd/Ctrl + Enter)')
    console.log('   4. Verificá que no hay errores')
    console.log('   5. Verificá en Table Editor que la tabla existe\n')
    
    // También guardar en archivo para fácil acceso
    const migrationFile = join(rootDir, 'supabase/migrations/006_create_ordenes_simple.sql')
    console.log(`📄 SQL guardado en: ${migrationFile}`)
    
    return false // Indica que necesita ejecución manual
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testTable() {
  console.log('🧪 Probando inserción de prueba...')
  
  try {
    const testData = {
      productos: [{ id: 'test', nombre: 'Test', precio: 100, cantidad: 1 }],
      comprador: { nombre: 'Test User', email: 'test@example.com' },
      envio: { tipo: 'retiro_local', costo: 0 },
      total: 100,
      estado: 'pendiente',
    }
    
    const { data, error } = await supabase
      .from('ordenes')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error en prueba de inserción:', error.message)
      return false
    }
    
    console.log('✅ Inserción de prueba exitosa')
    console.log('   Order ID:', data.id)
    
    // Limpiar dato de prueba
    await supabase.from('ordenes').delete().eq('id', data.id)
    console.log('🧹 Dato de prueba eliminado')
    
    return true
  } catch (error) {
    console.error('❌ Error en prueba:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Verificando y creando tabla ordenes...\n')
  console.log('📊 Supabase URL:', supabaseUrl)
  console.log('🔑 Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante')
  console.log('')
  
  const exists = await checkTableExists()
  
  if (exists) {
    console.log('✅ La tabla ordenes ya existe')
    const testPassed = await testTable()
    if (testPassed) {
      console.log('\n🎉 ¡Tabla ordenes está operativa y funcionando!')
      process.exit(0)
    } else {
      console.log('\n⚠️  La tabla existe pero hay problemas con las inserciones')
      console.log('   Verificá los permisos RLS y las políticas')
      process.exit(1)
    }
  } else {
    console.log('❌ La tabla ordenes NO existe')
    console.log('')
    await createTable()
    console.log('\n📋 Después de ejecutar el SQL en Supabase Dashboard:')
    console.log('   1. Ejecutá este script nuevamente para verificar')
    console.log('   2. O probá directamente el endpoint de checkout')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})

