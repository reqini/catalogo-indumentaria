#!/usr/bin/env node

/**
 * Script para verificar y crear la tabla ordenes en Supabase
 * Ejecutar: node scripts/verify-and-create-ordenes-table.mjs
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
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyAndCreateTable() {
  console.log('🔍 Verificando existencia de tabla ordenes...')

  try {
    // Intentar hacer una query simple para verificar si la tabla existe
    const { data, error } = await supabase.from('ordenes').select('id').limit(1)

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('PGRST205')) {
        console.log('⚠️  La tabla ordenes NO existe. Creándola...')
        await createTable()
      } else {
        console.error('❌ Error verificando tabla:', error)
        throw error
      }
    } else {
      console.log('✅ La tabla ordenes ya existe')
      console.log(`   Total de registros: ${data?.length || 0}`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('PGRST205') || error.message.includes('does not exist')) {
      console.log('⚠️  La tabla ordenes NO existe. Creándola...')
      await createTable()
    } else {
      throw error
    }
  }
}

async function createTable() {
  console.log('📝 Leyendo migración SQL...')
  
  const migrationPath = join(rootDir, 'supabase/migrations/005_create_ordenes_table.sql')
  let migrationSQL
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8')
  } catch (error) {
    console.error('❌ No se pudo leer el archivo de migración:', migrationPath)
    console.error('   Error:', error.message)
    console.log('\n📋 Ejecutá manualmente el SQL en Supabase Dashboard:')
    console.log('   1. Ve a Supabase Dashboard → SQL Editor')
    console.log('   2. Copiá y pegá el contenido de:', migrationPath)
    console.log('   3. Ejecutá el script\n')
    process.exit(1)
  }

  console.log('📤 Ejecutando migración SQL...')
  
  // Dividir el SQL en statements individuales
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.trim().length === 0) continue
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error) {
        // Si el RPC no existe, intentar ejecutar directamente
        console.log('⚠️  No se puede ejecutar SQL directamente desde el cliente')
        console.log('📋 Por favor, ejecutá manualmente el SQL en Supabase Dashboard:')
        console.log('   1. Ve a Supabase Dashboard → SQL Editor')
        console.log('   2. Copiá y pegá el contenido de:', migrationPath)
        console.log('   3. Ejecutá el script completo\n')
        process.exit(1)
      }
    } catch (error) {
      console.log('⚠️  No se puede ejecutar SQL directamente desde el cliente')
      console.log('📋 Por favor, ejecutá manualmente el SQL en Supabase Dashboard:')
      console.log('   1. Ve a Supabase Dashboard → SQL Editor')
      console.log('   2. Copiá y pegá el contenido de:', migrationPath)
      console.log('   3. Ejecutá el script completo\n')
      process.exit(1)
    }
  }

  console.log('✅ Tabla ordenes creada exitosamente')
}

async function main() {
  console.log('🚀 Iniciando verificación de tabla ordenes...\n')
  
  await verifyAndCreateTable()
  
  // Verificar nuevamente después de crear
  console.log('\n🔍 Verificando nuevamente...')
  const { data, error } = await supabase.from('ordenes').select('id').limit(1)
  
  if (error) {
    console.error('❌ Error después de crear tabla:', error)
    console.log('\n📋 IMPORTANTE: Ejecutá manualmente el SQL en Supabase Dashboard:')
    console.log('   1. Ve a Supabase Dashboard → SQL Editor')
    console.log('   2. Copiá y pegá el contenido de: supabase/migrations/005_create_ordenes_table.sql')
    console.log('   3. Ejecutá el script completo\n')
    process.exit(1)
  }
  
  console.log('✅ Tabla ordenes verificada y lista para usar')
  console.log('\n🎉 ¡Listo! La tabla ordenes está operativa.')
}

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})

