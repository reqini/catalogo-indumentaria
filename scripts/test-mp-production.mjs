#!/usr/bin/env node

/**
 * Script de prueba exhaustiva para verificar Mercado Pago en producción
 * 
 * Este script prueba:
 * 1. Que las variables están disponibles
 * 2. Que el token es válido haciendo una llamada real a la API
 * 3. Que se puede crear una preferencia de prueba
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
    } catch (error) {
      console.warn('⚠️  dotenv no disponible:', error.message)
    }
  }
}

async function testTokenDirectly(token) {
  console.log('\n🧪 Probando token directamente con API de Mercado Pago...\n')
  
  try {
    // Test 1: Obtener métodos de pago (endpoint simple)
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error al verificar token:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Response: ${errorText}`)
      return false
    }

    const data = await response.json()
    console.log('✅ Token válido - Métodos de pago obtenidos:', data.length || 'N/A')
    return true
  } catch (error) {
    console.error('❌ Error al probar token:', error.message)
    return false
  }
}

async function testCreatePreference(token) {
  console.log('\n🧪 Probando creación de preferencia de prueba...\n')
  
  try {
    const preferenceData = {
      items: [
        {
          title: 'Producto de Prueba',
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Error al crear preferencia:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Response:`, JSON.stringify(errorData, null, 2))
      return false
    }

    const data = await response.json()
    console.log('✅ Preferencia creada exitosamente:')
    console.log(`   ID: ${data.id}`)
    console.log(`   Init Point: ${data.init_point?.substring(0, 50)}...`)
    return true
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error.message)
    return false
  }
}

async function main() {
  await loadEnvIfNeeded()

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
  const NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

  console.log('\n🔍 PRUEBA EXHAUSTIVA DE MERCADO PAGO\n')
  console.log('=' .repeat(60))

  // Verificar variables
  console.log('\n1️⃣ VERIFICACIÓN DE VARIABLES DE ENTORNO\n')
  
  if (!MP_ACCESS_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN NO ENCONTRADO')
    console.error('\n💡 SOLUCIÓN:')
    console.error('   1. Ve a Vercel Dashboard → Settings → Environment Variables')
    console.error('   2. Agrega MP_ACCESS_TOKEN con tu token de producción')
    console.error('   3. Asegúrate de marcarlo para Production')
    console.error('   4. Haz REDEPLOY después de agregarlo')
    process.exit(1)
  }

  console.log('✅ MP_ACCESS_TOKEN encontrado')
  console.log(`   Longitud: ${MP_ACCESS_TOKEN.length}`)
  console.log(`   Empieza con: ${MP_ACCESS_TOKEN.substring(0, 15)}...`)
  
  if (MP_ACCESS_TOKEN.startsWith('APP_USR-')) {
    console.log('   Tipo: ✅ PRODUCCIÓN')
  } else if (MP_ACCESS_TOKEN.startsWith('TEST-')) {
    console.log('   Tipo: ⚠️  TEST (no válido para producción)')
  } else {
    console.log('   Tipo: ❌ Formato desconocido')
  }

  if (NEXT_PUBLIC_MP_PUBLIC_KEY) {
    console.log('\n✅ NEXT_PUBLIC_MP_PUBLIC_KEY encontrado')
    console.log(`   Longitud: ${NEXT_PUBLIC_MP_PUBLIC_KEY.length}`)
  } else {
    console.log('\n⚠️  NEXT_PUBLIC_MP_PUBLIC_KEY no encontrado (opcional)')
  }

  // Test 1: Verificar token con API
  console.log('\n' + '='.repeat(60))
  const tokenValid = await testTokenDirectly(MP_ACCESS_TOKEN)
  
  if (!tokenValid) {
    console.error('\n❌ El token NO es válido o no tiene permisos')
    console.error('\n💡 VERIFICA:')
    console.error('   1. Que el token sea de PRODUCCIÓN (empieza con APP_USR-)')
    console.error('   2. Que el token esté activo en tu cuenta de Mercado Pago')
    console.error('   3. Que tengas permisos para crear preferencias')
    process.exit(1)
  }

  // Test 2: Crear preferencia de prueba
  console.log('\n' + '='.repeat(60))
  const preferenceCreated = await testCreatePreference(MP_ACCESS_TOKEN)
  
  if (!preferenceCreated) {
    console.error('\n❌ No se pudo crear preferencia de prueba')
    console.error('\n💡 VERIFICA:')
    console.error('   1. Que el token tenga permisos para crear preferencias')
    console.error('   2. Que tu cuenta de Mercado Pago esté activa')
    process.exit(1)
  }

  // Resumen final
  console.log('\n' + '='.repeat(60))
  console.log('\n✅ TODAS LAS PRUEBAS PASARON\n')
  console.log('🎉 Mercado Pago está configurado correctamente')
  console.log('\n📋 PRÓXIMOS PASOS:')
  console.log('   1. Verifica que las variables estén en Vercel Dashboard')
  console.log('   2. Haz REDEPLOY si acabas de agregar las variables')
  console.log('   3. Prueba el checkout en producción')
  console.log('   4. Verifica los logs en Vercel Function Logs\n')
}

main().catch(error => {
  console.error('\n❌ Error inesperado:', error.message)
  console.error(error.stack)
  process.exit(1)
})

