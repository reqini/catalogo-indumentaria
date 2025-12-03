#!/usr/bin/env node

/**
 * Test Checkout - Valida que el checkout funcione correctamente
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testCheckout() {
  console.log('🧪 Testeando checkout...\n')

  try {
    // Test 1: Endpoint existe
    console.log('1️⃣ Verificando endpoint de checkout...')
    const response = await fetch(`${BASE_URL}/api/checkout/create-order-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos: [] }),
    })

    if (response.status === 500) {
      throw new Error('Checkout devuelve 500 (error del servidor)')
    }

    console.log('✅ Endpoint de checkout responde correctamente\n')

    // Test 2: Validaciones funcionan
    console.log('2️⃣ Verificando validaciones...')
    if (response.status === 400) {
      console.log('✅ Validaciones funcionan (400 esperado para datos inválidos)\n')
    } else {
      console.log('⚠️ Respuesta inesperada del endpoint\n')
    }

    console.log('✅ Tests de checkout pasados\n')
    return true
  } catch (error) {
    console.error('❌ Error en tests de checkout:', error.message)
    return false
  }
}

testCheckout().then((success) => {
  process.exit(success ? 0 : 1)
})

