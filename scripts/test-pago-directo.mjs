#!/usr/bin/env node

/**
 * Script para probar directamente la creación de preferencia
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

  console.log('\n🧪 Probando creación de preferencia directamente...\n')

  const baseUrl = 'http://localhost:3001'
  // Probar primero SIN auto_return para verificar que back_urls funciona
  const preferenceData = {
    items: [
      {
        title: 'Producto Test',
        quantity: 1,
        unit_price: 100,
      },
    ],
    back_urls: {
      success: `${baseUrl}/pago/success`,
      failure: `${baseUrl}/pago/failure`,
      pending: `${baseUrl}/pago/pending`,
    },
    // Remover auto_return temporalmente para probar
    // auto_return: 'approved',
    notification_url: `${baseUrl}/api/mp/webhook`,
  }

  console.log('📤 Enviando a MP:')
  console.log(JSON.stringify(preferenceData, null, 2))
  console.log('')

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mpToken}`,
    },
    body: JSON.stringify(preferenceData),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Error:')
    console.error('Status:', response.status)
    console.error('Response:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  console.log('✅ Preferencia creada exitosamente')
  console.log('Preference ID:', data.id)
  console.log('Init Point:', data.init_point?.substring(0, 60) + '...')
  console.log('\n✅ El formato es correcto\n')

} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

