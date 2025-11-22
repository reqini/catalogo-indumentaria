#!/usr/bin/env node

/**
 * Test automatizado del flujo completo de checkout de Mercado Pago
 * Ejecutar después de configurar credenciales para validar que todo funciona
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Cargar variables de entorno
config({ path: join(rootDir, '.env.local') })

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

console.log('\n🧪 Test Automatizado - Checkout Mercado Pago\n')
console.log(`Base URL: ${BASE_URL}`)
console.log(`MP_ACCESS_TOKEN presente: ${!!MP_ACCESS_TOKEN}`)
console.log(`MP_ACCESS_TOKEN length: ${MP_ACCESS_TOKEN?.length || 0}\n`)

if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.includes('xxxxx')) {
  console.error('❌ MP_ACCESS_TOKEN no configurado o es placeholder')
  console.error('   Configura MP_ACCESS_TOKEN en .env.local antes de ejecutar este test\n')
  process.exit(1)
}

// Test 1: Verificar endpoint de verificación
console.log('📋 Test 1: Verificar configuración...')
try {
  const verifyResponse = await fetch(`${BASE_URL}/api/mp/verify-config`)
  const verifyData = await verifyResponse.json()
  
  if (verifyData.valid) {
    console.log('✅ Configuración válida')
    console.log(`   Tipo: ${verifyData.isProduction ? 'PRODUCCIÓN' : 'TEST'}`)
  } else {
    console.error('❌ Configuración inválida')
    console.error('   Errores:', verifyData.errors)
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error verificando configuración:', error.message)
  console.error('   Asegúrate de que el servidor esté corriendo (pnpm dev)')
  process.exit(1)
}

// Test 2: Crear preferencia de prueba
console.log('\n📋 Test 2: Crear preferencia de pago...')
try {
  const preferenceData = {
    items: [
      {
        title: 'Producto de Prueba',
        quantity: 1,
        unit_price: 100,
        id: 'test-product-1',
        talle: 'M',
      },
    ],
    back_urls: {
      success: `${BASE_URL}/pago/success`,
      failure: `${BASE_URL}/pago/failure`,
      pending: `${BASE_URL}/pago/pending`,
    },
  }

  const response = await fetch(`${BASE_URL}/api/pago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferenceData),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Error creando preferencia')
    console.error('   Status:', response.status)
    console.error('   Error:', data.error)
    console.error('   Details:', data.details)
    process.exit(1)
  }

  if (data.init_point && data.preference_id) {
    console.log('✅ Preferencia creada exitosamente')
    console.log(`   Preference ID: ${data.preference_id}`)
    console.log(`   Init Point: ${data.init_point.substring(0, 80)}...`)
  } else {
    console.error('❌ Respuesta inválida de API')
    console.error('   Data:', data)
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error creando preferencia:', error.message)
  process.exit(1)
}

console.log('\n✅ Todos los tests pasaron correctamente')
console.log('🎯 Checkout de Mercado Pago está funcionando\n')

