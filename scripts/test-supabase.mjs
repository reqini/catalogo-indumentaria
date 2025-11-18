#!/usr/bin/env node

/**
 * Script para probar la conexión a Supabase
 * 
 * Uso:
 *   pnpm test-supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Variables de Supabase no configuradas')
  console.log('\n📝 Configura en .env.local:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  process.exit(1)
}

async function testConnection() {
  console.log('🧪 Probando conexión a Supabase...\n')
  console.log(`📡 URL: ${SUPABASE_URL}\n`)

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Probar conexión listando tablas
    const tables = ['tenants', 'productos', 'banners', 'planes']
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ Error en tabla ${table}:`, error.message)
        if (error.message.includes('does not exist')) {
          console.log(`   💡 La tabla ${table} no existe. Ejecuta la migración SQL primero.`)
        }
      } else {
        console.log(`✅ ${table}: ${count || 0} registros`)
      }
    }

    console.log('\n✅ Conexión exitosa!')
    console.log('\n📝 Verifica que todas las tablas existan.')
    console.log('   Si faltan tablas, ejecuta la migración SQL en Supabase Dashboard.')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    process.exit(1)
  }
}

testConnection()

