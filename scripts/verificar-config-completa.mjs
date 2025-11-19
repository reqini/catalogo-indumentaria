/**
 * Script para verificar que el bucket "productos" existe en Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno manualmente
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    const envVars = {}

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        }
      }
    })

    return envVars
  } catch (error) {
    console.error('Error cargando .env.local:', error.message)
    return {}
  }
}

const env = loadEnv()

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function verificarBucket() {
  console.log('🔍 Verificando configuración de Supabase Storage...\n')

  try {
    // Verificar buckets existentes
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error listando buckets:', bucketsError.message)
      process.exit(1)
    }

    console.log(`📦 Buckets encontrados: ${buckets?.length || 0}`)

    const bucketProductos = buckets?.find((b) => b.name === 'productos')

    if (!bucketProductos) {
      console.error('\n❌ Bucket "productos" NO existe')
      console.log('\n📝 Pasos para crear el bucket:')
      console.log('   1. Ve a Supabase Dashboard > Storage')
      console.log('   2. Haz clic en "New bucket"')
      console.log('   3. Nombre: productos')
      console.log('   4. Marca "Public bucket"')
      console.log('   5. File size limit: 5242880 (5MB)')
      console.log('   6. Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp')
      console.log('   7. Haz clic en "Create bucket"')
      console.log('\n📖 Ver documentación completa en: docs/setup-supabase-storage.md')
      process.exit(1)
    }

    console.log('✅ Bucket "productos" existe')
    console.log(`   - Público: ${bucketProductos.public ? 'Sí' : 'No'}`)
    console.log(`   - Tamaño máximo: ${bucketProductos.file_size_limit || 'Sin límite'}`)
    console.log(`   - MIME types permitidos: ${bucketProductos.allowed_mime_types?.join(', ') || 'Todos'}`)

    if (!bucketProductos.public) {
      console.warn('\n⚠️  El bucket NO es público. Las imágenes no serán accesibles desde el frontend.')
      console.log('   Para hacerlo público:')
      console.log('   1. Ve a Storage > productos')
      console.log('   2. Haz clic en "Settings"')
      console.log('   3. Marca "Public bucket"')
      console.log('   4. Guarda los cambios')
    }

    // Verificar tabla producto_historial
    console.log('\n🔍 Verificando tabla producto_historial...')

    const { data: historialData, error: historialError } = await supabase
      .from('producto_historial')
      .select('id')
      .limit(1)

    if (historialError) {
      if (historialError.code === 'PGRST116') {
        console.error('❌ Tabla "producto_historial" NO existe')
        console.log('\n📝 Ejecuta el script de migración SQL en Supabase Dashboard')
        console.log('   Ver: scripts/migrate-to-supabase.mjs o docs/migracion-supabase.md')
        process.exit(1)
      } else {
        console.error('❌ Error verificando tabla:', historialError.message)
        process.exit(1)
      }
    }

    console.log('✅ Tabla "producto_historial" existe')

    console.log('\n✅ Configuración completa verificada correctamente')
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

verificarBucket()
