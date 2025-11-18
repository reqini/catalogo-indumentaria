#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    const envVars = {}
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          envVars[key.trim()] = value.trim()
        }
      }
    })
    return envVars
  } catch (error) {
    return {}
  }
}

const env = loadEnvFile()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log('\n🔍 Verificando configuración...\n')

// 1. Verificar bucket
console.log('1️⃣ Verificando bucket "productos"...')
try {
  const { data: buckets } = await supabase.storage.listBuckets()
  const productosBucket = buckets?.find((b) => b.name === 'productos')
  if (productosBucket) {
    console.log('   ✅ Bucket encontrado')
    console.log('      - Público:', productosBucket.public ? 'Sí ✅' : 'No ❌')
    if (!productosBucket.public) {
      console.log('   ⚠️  Configura el bucket como público en Supabase Dashboard')
    }
  } else {
    console.log('   ❌ Bucket NO encontrado')
    console.log('   📝 Crea el bucket "productos" en Supabase Dashboard → Storage')
  }
} catch (error) {
  console.error('   ❌ Error:', error.message)
}

// 2. Verificar tabla
console.log('\n2️⃣ Verificando tabla "producto_historial"...')
try {
  const { data, error } = await supabase.from('producto_historial').select('id').limit(1)
  if (error) {
    if (error.code === '42P01') {
      console.log('   ❌ Tabla NO existe')
      console.log('   📝 Ejecuta supabase/migrations/004_add_historial_productos.sql en SQL Editor')
    } else {
      console.error('   ❌ Error:', error.message)
    }
  } else {
    console.log('   ✅ Tabla existe')
    const { count } = await supabase.from('producto_historial').select('*', { count: 'exact', head: true })
    console.log(`   📊 Registros: ${count || 0}`)
  }
} catch (error) {
  console.error('   ❌ Error:', error.message)
}

console.log('\n✅ Verificación completada\n')

