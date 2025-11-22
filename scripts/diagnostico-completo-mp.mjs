#!/usr/bin/env node

/**
 * Script de diagnóstico COMPLETO para Mercado Pago
 * 
 * Este script verifica:
 * 1. Variables de entorno locales (.env.local)
 * 2. Formato de tokens
 * 3. Conectividad con API de Mercado Pago
 * 4. Creación de preferencia de prueba
 * 
 * USO:
 *   pnpm diagnose-mp-complete
 */

import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

async function loadEnvIfNeeded() {
  const envLocalPath = join(rootDir, '.env.local')
  if (existsSync(envLocalPath)) {
    try {
      const dotenv = await import('dotenv')
      dotenv.config({ path: envLocalPath })
      console.log('✅ .env.local cargado')
    } catch (error) {
      console.warn('⚠️  dotenv no disponible:', error.message)
    }
  } else {
    console.warn('⚠️  .env.local no encontrado')
  }
}

async function testMercadoPagoAPI(accessToken) {
  console.log('\n🔍 Probando conectividad con API de Mercado Pago...')
  
  try {
    // Test 1: Verificar token con GET /users/me
    const response = await fetch('https://api.mercadopago.com/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      console.log('✅ Token válido - Usuario:', userData.nickname || userData.email || 'N/A')
      console.log('   - ID:', userData.id || 'N/A')
      console.log('   - Tipo:', userData.site_id || 'N/A')
      return { valid: true, user: userData }
    } else {
      const errorData = await response.json()
      console.error('❌ Token inválido:', errorData.message || 'Error desconocido')
      return { valid: false, error: errorData }
    }
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message)
    return { valid: false, error: error.message }
  }
}

async function testPreferenceCreation(accessToken) {
  console.log('\n🔍 Probando creación de preferencia de prueba...')
  
  try {
    const testPreference = {
      items: [
        {
          title: 'Test Product',
          quantity: 1,
          unit_price: 100,
        },
      ],
      back_urls: {
        success: 'https://example.com/success',
        failure: 'https://example.com/failure',
        pending: 'https://example.com/pending',
      },
      notification_url: 'https://example.com/webhook',
      statement_descriptor: 'TEST',
      external_reference: `test-${Date.now()}`,
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPreference),
    })

    if (response.ok) {
      const preference = await response.json()
      console.log('✅ Preferencia creada exitosamente')
      console.log('   - ID:', preference.id)
      console.log('   - Init Point:', preference.init_point?.substring(0, 50) + '...')
      return { valid: true, preference }
    } else {
      const errorData = await response.json()
      console.error('❌ Error al crear preferencia:', errorData.message || 'Error desconocido')
      console.error('   - Código:', errorData.status || response.status)
      console.error('   - Detalles:', JSON.stringify(errorData, null, 2))
      return { valid: false, error: errorData }
    }
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message)
    return { valid: false, error: error.message }
  }
}

async function main() {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO DE MERCADO PAGO')
  console.log('==========================================\n')

  await loadEnvIfNeeded()

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
  const NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
  const NODE_ENV = process.env.NODE_ENV || 'development'
  const VERCEL_ENV = process.env.VERCEL_ENV || 'local'

  console.log('📋 Información del Entorno:')
  console.log(`   - NODE_ENV: ${NODE_ENV}`)
  console.log(`   - VERCEL_ENV: ${VERCEL_ENV}`)
  console.log(`   - VERCEL: ${process.env.VERCEL ? 'SÍ' : 'NO'}`)
  console.log(`   - VERCEL_URL: ${process.env.VERCEL_URL || 'no definido'}`)

  console.log('\n📋 Variables de Entorno:')
  
  // Verificar MP_ACCESS_TOKEN
  if (!MP_ACCESS_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN: NO CONFIGURADO')
    console.error('   → Configura en .env.local o Vercel Dashboard')
    process.exit(1)
  } else {
    console.log('✅ MP_ACCESS_TOKEN: CONFIGURADO')
    console.log(`   - Longitud: ${MP_ACCESS_TOKEN.length}`)
    console.log(`   - Empieza con: ${MP_ACCESS_TOKEN.substring(0, 15)}...`)
    
    if (MP_ACCESS_TOKEN.startsWith('TEST-')) {
      console.warn('   ⚠️  Token de TEST (no válido para producción)')
    } else if (MP_ACCESS_TOKEN.startsWith('APP_USR-')) {
      console.log('   ✅ Token de PRODUCCIÓN')
    } else {
      console.warn('   ⚠️  Formato desconocido')
    }
  }

  // Verificar NEXT_PUBLIC_MP_PUBLIC_KEY
  if (!NEXT_PUBLIC_MP_PUBLIC_KEY) {
    console.warn('⚠️  NEXT_PUBLIC_MP_PUBLIC_KEY: NO CONFIGURADO (opcional pero recomendado)')
  } else {
    console.log('✅ NEXT_PUBLIC_MP_PUBLIC_KEY: CONFIGURADO')
    console.log(`   - Longitud: ${NEXT_PUBLIC_MP_PUBLIC_KEY.length}`)
    console.log(`   - Empieza con: ${NEXT_PUBLIC_MP_PUBLIC_KEY.substring(0, 15)}...`)
  }

  // Test de conectividad con API
  const apiTest = await testMercadoPagoAPI(MP_ACCESS_TOKEN)
  
  if (!apiTest.valid) {
    console.error('\n❌ El token no es válido o hay problemas de conectividad')
    console.error('   Verifica:')
    console.error('   1. Que el token sea correcto')
    console.error('   2. Que tengas conexión a internet')
    console.error('   3. Que la API de Mercado Pago esté disponible')
    process.exit(1)
  }

  // Test de creación de preferencia
  const preferenceTest = await testPreferenceCreation(MP_ACCESS_TOKEN)
  
  if (!preferenceTest.valid) {
    console.error('\n❌ No se pudo crear una preferencia de prueba')
    console.error('   Esto puede indicar problemas con:')
    console.error('   1. Permisos del token')
    console.error('   2. Formato de la preferencia')
    console.error('   3. Configuración de la cuenta de Mercado Pago')
    process.exit(1)
  }

  console.log('\n✅ DIAGNÓSTICO COMPLETO: TODO FUNCIONA CORRECTAMENTE')
  console.log('==========================================')
  console.log('\n📝 Resumen:')
  console.log('   ✅ Token configurado')
  console.log('   ✅ Token válido')
  console.log('   ✅ Conectividad con API OK')
  console.log('   ✅ Creación de preferencias OK')
  console.log('\n🚀 Mercado Pago está listo para producción')
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Verifica que las variables estén en Vercel Dashboard')
  console.log('   2. Haz redeploy después de agregar variables')
  console.log('   3. Prueba el checkout en producción')
  console.log('   4. Verifica los logs en Vercel')
}

main().catch(error => {
  console.error('\n❌ Error inesperado:', error.message)
  console.error(error.stack)
  process.exit(1)
})

