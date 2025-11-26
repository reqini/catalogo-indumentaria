#!/usr/bin/env node

/**
 * Script para probar el endpoint /api/checkout/create-order
 * con datos de prueba
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const testOrderData = {
  cliente: {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '1123456789',
  },
  direccion: {
    calle: 'Av. Corrientes',
    numero: '1234',
    pisoDepto: '1A',
    codigoPostal: 'C1000',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    provincia: 'Buenos Aires',
    pais: 'Argentina',
  },
  envio: {
    tipo: 'estandar',
    metodo: 'OCA Estándar',
    costo: 3500,
    demora: '3-5 días hábiles',
    proveedor: 'OCA',
  },
  items: [
    {
      id: 'test-product-id-1',
      nombre: 'Producto de Prueba',
      precio: 10000,
      cantidad: 1,
      talle: 'M',
      subtotal: 10000,
      imagenPrincipal: '/images/default-product.svg',
    },
  ],
  subtotal: 10000,
  descuento: 0,
  envioCosto: 3500,
  total: 13500,
}

async function testCheckoutEndpoint() {
  console.log('🧪 Probando endpoint /api/checkout/create-order\n')
  console.log('📤 Enviando datos de prueba:', JSON.stringify(testOrderData, null, 2))
  console.log('\n')

  try {
    const response = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    console.log(`📥 Respuesta HTTP ${response.status}:`)
    console.log(JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      console.error('\n❌ El endpoint retornó un error')
      if (responseData.error) {
        console.error('   Error:', responseData.error)
      }
      if (responseData.details) {
        console.error('   Detalles:', responseData.details)
      }
      if (responseData.code) {
        console.error('   Código:', responseData.code)
      }
      if (responseData.hint) {
        console.error('   Hint:', responseData.hint)
      }
      process.exit(1)
    } else {
      console.log('\n✅ El endpoint respondió correctamente')
      if (responseData.orderId) {
        console.log('   Order ID:', responseData.orderId)
      }
      if (responseData.preferenceId) {
        console.log('   Preference ID:', responseData.preferenceId)
      }
      if (responseData.initPoint) {
        console.log('   Init Point:', responseData.initPoint.substring(0, 100) + '...')
      }
    }
  } catch (error) {
    console.error('\n❌ Error al probar endpoint:', error.message)
    console.error('   Stack:', error.stack)
    process.exit(1)
  }
}

testCheckoutEndpoint()

