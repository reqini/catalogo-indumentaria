#!/usr/bin/env node

/**
 * Script para verificar que Supabase esté configurado correctamente
 * 
 * Uso:
 *   pnpm verify-supabase
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificación de Configuración de Supabase\n')
console.log('='.repeat(50))

// Verificar archivo .env.local
const envPath = join(__dirname, '..', '.env.local')
if (!existsSync(envPath)) {
  console.log('❌ .env.local no existe')
  console.log('   Ejecuta: pnpm setup-supabase-env')
  process.exit(1)
} else {
  console.log('✅ .env.local existe')
}

// Verificar variables
console.log('\n📋 Variables de entorno:')

if (!SUPABASE_URL || SUPABASE_URL.includes('xxxxx')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL no configurada o es placeholder')
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`)
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('eyJhbGci')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada o es placeholder')
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 30)}...`)
}

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('eyJhbGci')) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY no configurada o es placeholder')
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY.substring(0, 30)}...`)
}

// Verificar archivos necesarios
console.log('\n📁 Archivos necesarios:')

const files = [
  { path: 'lib/supabase.ts', name: 'Cliente de Supabase' },
  { path: 'supabase/migrations/001_initial_schema.sql', name: 'Esquema SQL' },
  { path: 'lib/supabase-helpers.ts', name: 'Helpers de Supabase' },
]

files.forEach((file) => {
  const fullPath = join(__dirname, '..', file.path)
  if (existsSync(fullPath)) {
    console.log(`✅ ${file.name}: ${file.path}`)
  } else {
    console.log(`❌ ${file.name}: ${file.path} NO ENCONTRADO`)
  }
})

// Resumen
console.log('\n' + '='.repeat(50))
console.log('\n📊 RESUMEN:\n')

const allConfigured =
  SUPABASE_URL &&
  !SUPABASE_URL.includes('xxxxx') &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes('eyJhbGci') &&
  SUPABASE_SERVICE_KEY &&
  !SUPABASE_SERVICE_KEY.includes('eyJhbGci')

if (allConfigured) {
  console.log('✅ TODO CONFIGURADO CORRECTAMENTE')
  console.log('\n🚀 Próximos pasos:')
  console.log('   1. Ejecuta la migración SQL en Supabase Dashboard')
  console.log('   2. Ejecuta: pnpm test-supabase')
  console.log('   3. Si hay datos en MongoDB, ejecuta: pnpm migrate-to-supabase')
} else {
  console.log('⚠️  FALTAN VARIABLES DE ENTORNO')
  console.log('\n📝 Para configurar:')
  console.log('   Ejecuta: pnpm setup-supabase-env')
  console.log('   O edita manualmente .env.local')
}

console.log('')

