#!/usr/bin/env node

/**
 * Script para verificar la configuración de Mercado Pago
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

  console.log('\n🔍 Verificando configuración de Mercado Pago...\n')

  if (!mpToken) {
    console.log('❌ MP_ACCESS_TOKEN no encontrado en .env.local')
    console.log('💡 Agregá la variable MP_ACCESS_TOKEN en .env.local')
  } else if (mpToken === 'TEST-xxxxxxxxxxxxxxxxxxxx' || mpToken.includes('xxxxx')) {
    console.log('⚠️  Token es un placeholder')
    console.log(`   Token actual: ${mpToken.substring(0, 20)}...`)
    console.log('💡 Necesitás reemplazarlo con un token real de Mercado Pago')
    console.log('📖 Ver: /docs/guia-rapida-mercadopago.md')
  } else if (mpToken.startsWith('TEST-')) {
    console.log('✅ Token de prueba configurado')
    console.log(`   Token: ${mpToken.substring(0, 20)}...`)
    console.log('💡 Este es un token de prueba (no cobra dinero real)')
  } else {
    console.log('✅ Token configurado')
    console.log(`   Token: ${mpToken.substring(0, 20)}...`)
    console.log('💡 Este parece ser un token de producción')
  }

  console.log('\n📝 Para obtener un token:')
  console.log('   1. Ir a https://www.mercadopago.com.ar/developers')
  console.log('   2. Crear aplicación')
  console.log('   3. Copiar Access Token')
  console.log('   4. Agregar a .env.local como: MP_ACCESS_TOKEN=tu-token-aqui')
  console.log('   5. Reiniciar servidor (pnpm dev)\n')

} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('❌ Archivo .env.local no encontrado')
    console.log('💡 Creá el archivo .env.local con MP_ACCESS_TOKEN\n')
  } else {
    console.error('❌ Error:', error.message)
  }
}

