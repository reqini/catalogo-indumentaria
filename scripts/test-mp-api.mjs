#!/usr/bin/env node

/**
 * Script para probar la conexión con la API de Mercado Pago
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env.local')

try {
  const envContent = readFileSync(envPath, 'utf-8')
  const mpToken = envContent
    .split('\n')
    .find(line => line.startsWith('MP_ACCESS_TOKEN='))
    ?.split('=')[1]
    ?.trim()

  if (!mpToken) {
    console.error('❌ MP_ACCESS_TOKEN no encontrado')
    process.exit(1)
  }

  console.log('\n🧪 Probando conexión con Mercado Pago API...\n')
  console.log(`Token: ${mpToken.substring(0, 20)}...\n`)

  // Probar crear una preferencia de prueba
  const testPreference = {
    items: [
      {
        title: 'Test Product',
        quantity: 1,
        unit_price: 100,
      },
    ],
    back_urls: {
      success: 'http://localhost:3001/pago/success',
      failure: 'http://localhost:3001/pago/failure',
      pending: 'http://localhost:3001/pago/pending',
    },
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(testPreference),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error de Mercado Pago API:')
      console.error('Status:', response.status)
      console.error('Response:', JSON.stringify(data, null, 2))
      process.exit(1)
    }

    console.log('✅ Conexión exitosa con Mercado Pago API')
    console.log('Preference ID:', data.id)
    console.log('Init Point:', data.init_point?.substring(0, 50) + '...')
    console.log('\n✅ La API de Mercado Pago está funcionando correctamente\n')

  } catch (error) {
    console.error('❌ Error al conectar con Mercado Pago:')
    console.error(error.message)
    if (error.cause) {
      console.error('Causa:', error.cause)
    }
    process.exit(1)
  }

} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

