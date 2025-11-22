#!/usr/bin/env node

/**
 * Script para verificar credenciales de Mercado Pago en producción
 * 
 * USO:
 *   pnpm verify-mp-prod
 * 
 * O directamente:
 *   node scripts/verificar-credenciales-mp-produccion.mjs
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
config({ path: join(__dirname, '..', '.env.local') })

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

console.log('\n🔍 Verificando credenciales de Mercado Pago para producción...\n')

// Verificar Access Token
if (!MP_ACCESS_TOKEN) {
  console.error('❌ MP_ACCESS_TOKEN no está configurado')
  console.error('   Configura MP_ACCESS_TOKEN en .env.local o Vercel Dashboard\n')
  process.exit(1)
}

if (!MP_ACCESS_TOKEN.startsWith('APP_USR-')) {
  console.error('❌ MP_ACCESS_TOKEN tiene formato inválido')
  console.error('   Debe empezar con APP_USR- para producción\n')
  process.exit(1)
}

console.log('✅ MP_ACCESS_TOKEN configurado')
console.log(`   Preview: ${MP_ACCESS_TOKEN.substring(0, 20)}...`)
console.log(`   Length: ${MP_ACCESS_TOKEN.length} caracteres`)

// Verificar Public Key (opcional)
if (NEXT_PUBLIC_MP_PUBLIC_KEY) {
  console.log('\n✅ NEXT_PUBLIC_MP_PUBLIC_KEY configurado')
  console.log(`   Preview: ${NEXT_PUBLIC_MP_PUBLIC_KEY.substring(0, 20)}...`)
} else {
  console.log('\n⚠️  NEXT_PUBLIC_MP_PUBLIC_KEY no configurado (opcional)')
}

// Probar crear una preferencia de prueba
console.log('\n🧪 Probando conexión con Mercado Pago API...\n')

try {
  const testResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!testResponse.ok) {
    const errorData = await testResponse.json()
    console.error('❌ Error al conectar con Mercado Pago API')
    console.error(`   Status: ${testResponse.status}`)
    console.error(`   Error: ${JSON.stringify(errorData, null, 2)}\n`)
    process.exit(1)
  }

  const data = await testResponse.json()
  console.log('✅ Conexión exitosa con Mercado Pago API')
  console.log(`   Métodos de pago disponibles: ${data.length || 'N/A'}\n`)

  console.log('🎉 Credenciales verificadas correctamente!')
  console.log('   Las credenciales están listas para usar en producción.\n')
} catch (error) {
  console.error('❌ Error al verificar credenciales:', error.message)
  console.error('   Verifica tu conexión a internet y que las credenciales sean válidas.\n')
  process.exit(1)
}

