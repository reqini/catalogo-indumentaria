#!/usr/bin/env node

/**
 * Test Admin - Valida que el admin funcione correctamente
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testAdmin() {
  console.log('🧪 Testeando admin...\n')

  try {
    // Test 1: Endpoint de productos existe
    console.log('1️⃣ Verificando endpoint de productos...')
    const productsResponse = await fetch(`${BASE_URL}/api/productos`)
    
    if (!productsResponse.ok && productsResponse.status !== 401 && productsResponse.status !== 403) {
      throw new Error(`Endpoint de productos devuelve ${productsResponse.status}`)
    }

    console.log('✅ Endpoint de productos responde\n')

    // Test 2: Endpoint de creación existe (verificar que no devuelve 404)
    console.log('2️⃣ Verificando endpoint de creación...')
    const createResponse = await fetch(`${BASE_URL}/api/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'test' }),
    })

    // Esperamos 401 sin auth o 400 por datos inválidos, no 404 o 500
    if (createResponse.status === 404) {
      throw new Error('Endpoint de creación no existe (404)')
    }

    if (createResponse.status === 500) {
      throw new Error('Endpoint de creación devuelve 500')
    }

    console.log('✅ Endpoint de creación responde correctamente\n')

    console.log('✅ Tests de admin pasados\n')
    return true
  } catch (error) {
    console.error('❌ Error en tests de admin:', error.message)
    return false
  }
}

testAdmin().then((success) => {
  process.exit(success ? 0 : 1)
})

