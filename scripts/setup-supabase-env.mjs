#!/usr/bin/env node

/**
 * Script para ayudar a configurar variables de entorno de Supabase
 * 
 * Uso:
 *   pnpm setup-supabase-env
 * 
 * Este script te guiará paso a paso para configurar las variables
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function setup() {
  console.log('🔧 Configuración de Variables de Entorno - Supabase\n')
  console.log('Este script te ayudará a configurar las variables necesarias.\n')

  const envPath = join(__dirname, '..', '.env.local')
  let envContent = ''

  // Leer .env.local si existe
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
    console.log('✅ Archivo .env.local encontrado\n')
  } else {
    console.log('📝 Creando nuevo archivo .env.local\n')
  }

  console.log('📋 Necesitas obtener estas credenciales de Supabase:')
  console.log('   1. Ve a: https://supabase.com/dashboard')
  console.log('   2. Selecciona tu proyecto')
  console.log('   3. Ve a Settings → API')
  console.log('   4. Copia los valores que te pediré a continuación\n')

  // NEXT_PUBLIC_SUPABASE_URL
  let supabaseUrl = ''
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    const match = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
    if (match) {
      supabaseUrl = match[1].trim()
      console.log(`📌 URL actual: ${supabaseUrl}`)
      const update = await question('¿Actualizar? (s/n): ')
      if (update.toLowerCase() !== 's') {
        supabaseUrl = match[1].trim()
      }
    }
  }

  if (!supabaseUrl || supabaseUrl.includes('xxxxx')) {
    supabaseUrl = await question('🔗 NEXT_PUBLIC_SUPABASE_URL (https://xxxxx.supabase.co): ')
  }

  // NEXT_PUBLIC_SUPABASE_ANON_KEY
  let anonKey = ''
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    const match = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
    if (match) {
      anonKey = match[1].trim()
      console.log(`📌 Anon Key actual: ${anonKey.substring(0, 20)}...`)
      const update = await question('¿Actualizar? (s/n): ')
      if (update.toLowerCase() !== 's') {
        anonKey = match[1].trim()
      }
    }
  }

  if (!anonKey || anonKey.includes('eyJhbGci')) {
    anonKey = await question('🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJhbGci...): ')
  }

  // SUPABASE_SERVICE_ROLE_KEY
  let serviceKey = ''
  if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    if (match) {
      serviceKey = match[1].trim()
      console.log(`📌 Service Key actual: ${serviceKey.substring(0, 20)}...`)
      const update = await question('¿Actualizar? (s/n): ')
      if (update.toLowerCase() !== 's') {
        serviceKey = match[1].trim()
      }
    }
  }

  if (!serviceKey || serviceKey.includes('eyJhbGci')) {
    serviceKey = await question('🔐 SUPABASE_SERVICE_ROLE_KEY (eyJhbGci...): ')
  }

  // Construir nuevo contenido
  const newLines = [
    '# Supabase Configuration',
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`,
    '',
  ]

  // Mantener otras variables existentes
  const existingLines = envContent
    .split('\n')
    .filter((line) => {
      return (
        !line.includes('NEXT_PUBLIC_SUPABASE') &&
        !line.includes('SUPABASE_SERVICE_ROLE_KEY') &&
        line.trim() !== ''
      )
    })

  const finalContent = [...newLines, ...existingLines].join('\n')

  // Escribir archivo
  writeFileSync(envPath, finalContent, 'utf-8')

  console.log('\n✅ Variables configuradas en .env.local')
  console.log('\n📝 Próximo paso:')
  console.log('   Ejecuta: pnpm test-supabase')
  console.log('   para verificar la conexión\n')

  rl.close()
}

setup().catch((error) => {
  console.error('❌ Error:', error.message)
  rl.close()
  process.exit(1)
})

