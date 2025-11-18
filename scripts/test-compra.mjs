#!/usr/bin/env node

/**
 * Script de prueba del flujo de compra
 * Simula el proceso completo sin necesidad de Mercado Pago real
 */

import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

async function testCompra() {
  console.log('\n🧪 Probando flujo de compra completo...\n')

  try {
    // 1. Obtener productos
    console.log('1️⃣ Obteniendo productos...')
    const productosRes = await axios.get(`${BASE_URL}/api/productos`)
    const productos = productosRes.data

    if (!productos || productos.length === 0) {
      console.error('❌ No hay productos disponibles')
      console.log('💡 Ejecutá: pnpm seed')
      return
    }

    console.log(`✅ ${productos.length} productos encontrados`)
    const producto = productos[0]
    console.log(`   Producto de prueba: ${producto.nombre}`)
    console.log(`   ID: ${producto.id}`)
    console.log(`   Stock: ${JSON.stringify(producto.stock || {})}`)

    // 2. Verificar configuración de MP
    console.log('\n2️⃣ Verificando configuración de Mercado Pago...')
    const testPago = {
      items: [
        {
          title: producto.nombre,
          quantity: 1,
          unit_price: producto.precio,
          id: producto.id,
          talle: producto.talles?.[0] || 'M',
        },
      ],
      back_urls: {
        success: `${BASE_URL}/pago/success`,
        failure: `${BASE_URL}/pago/failure`,
        pending: `${BASE_URL}/pago/pending`,
      },
    }

    try {
      const pagoRes = await axios.post(`${BASE_URL}/api/pago`, testPago)
      console.log('✅ Preferencia creada exitosamente')
      console.log(`   Preference ID: ${pagoRes.data.preference_id}`)
      console.log(`   Init Point: ${pagoRes.data.init_point?.substring(0, 50)}...`)
      console.log('\n✅ Flujo de compra funcionando correctamente!')
    } catch (error) {
      if (error.response?.data?.error === 'Mercado Pago no configurado') {
        console.error('❌ Mercado Pago no está configurado')
        console.error('💡 Configurá MP_ACCESS_TOKEN en .env.local')
        console.error('   Ver: /docs/configuracion-mercadopago.md')
      } else {
        console.error('❌ Error al crear preferencia:', error.response?.data || error.message)
      }
    }

    // 3. Verificar endpoints
    console.log('\n3️⃣ Verificando endpoints...')
    const endpoints = [
      '/api/productos',
      '/api/pago',
      '/api/mp/webhook',
    ]

    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(`${BASE_URL}${endpoint}`, { validateStatus: () => true })
        const status = res.status === 405 ? '✅ (método no permitido, pero existe)' : res.status < 500 ? '✅' : '⚠️'
        console.log(`   ${status} ${endpoint} - Status: ${res.status}`)
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Error: ${error.message}`)
      }
    }

    console.log('\n✅ Pruebas completadas\n')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 El servidor no está corriendo. Ejecutá: pnpm dev')
    }
  }
}

testCompra()

