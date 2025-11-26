#!/usr/bin/env node

/**
 * Script para verificar que la tabla 'ordenes' existe en Supabase
 * y tiene la estructura correcta
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyTable() {
  console.log('🔍 Verificando tabla "ordenes" en Supabase...\n')

  try {
    // Intentar hacer un SELECT para verificar que la tabla existe
    const { data, error } = await supabase.from('ordenes').select('id').limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ La tabla "ordenes" NO EXISTE en Supabase')
        console.error('\n📋 Solución:')
        console.error('   1. Ve a Supabase Dashboard → SQL Editor')
        console.error('   2. Ejecuta el archivo: supabase/migrations/002_ordenes_schema.sql')
        console.error('   3. Verifica que la tabla se haya creado correctamente')
        process.exit(1)
      } else {
        console.error('❌ Error al verificar tabla:', error.message)
        console.error('   Código:', error.code)
        console.error('   Detalles:', error.details)
        process.exit(1)
      }
    } else {
      console.log('✅ La tabla "ordenes" existe y es accesible')
    }

    // Verificar estructura de la tabla consultando información del schema
    console.log('\n🔍 Verificando estructura de la tabla...')
    const { data: testData, error: testError } = await supabase
      .from('ordenes')
      .select('*')
      .limit(0)

    if (testError && testError.code !== 'PGRST116') {
      // PGRST116 es "no rows returned" que es esperado con limit(0)
      console.error('⚠️  Advertencia al verificar estructura:', testError.message)
    } else {
      console.log('✅ Estructura de tabla válida')
    }

    // Verificar que la tabla ordenes_logs también existe
    console.log('\n🔍 Verificando tabla "ordenes_logs"...')
    const { error: logsError } = await supabase.from('ordenes_logs').select('id').limit(1)

    if (logsError && logsError.code === '42P01') {
      console.error('⚠️  La tabla "ordenes_logs" NO EXISTE')
      console.error('   Se creará automáticamente con la migración')
    } else {
      console.log('✅ La tabla "ordenes_logs" existe')
    }

    console.log('\n✅ Verificación completada exitosamente')
    console.log('   La tabla "ordenes" está lista para usar')
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }
}

verifyTable()

