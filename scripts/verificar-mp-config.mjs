#!/usr/bin/env node

/**
 * Script para verificar configuración de Mercado Pago
 * Ejecutar: node scripts/verificar-mp-config.mjs
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Cargar variables de entorno
config({ path: '.env.local' })

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN ||
  process.env['MP_ACCESS_TOKEN'] ||
  process.env.MERCADOPAGO_ACCESS_TOKEN ||
  process.env['MERCADOPAGO_ACCESS_TOKEN']

console.log('🔍 Verificando configuración de Mercado Pago...\n')
console.log('='.repeat(60))

// Verificar si está configurado
if (!MP_ACCESS_TOKEN) {
  console.error('❌ MP_ACCESS_TOKEN NO está configurado\n')
  console.log('📋 Pasos para configurar:')
  console.log('1. Ve a https://www.mercadopago.com.ar/developers/panel')
  console.log('2. Inicia sesión y copia tu Access Token')
  console.log('3. Agrega en .env.local:')
  console.log('   MP_ACCESS_TOKEN=TEST-tu-token-aqui')
  console.log('\n4. Para producción en Vercel:')
  console.log('   - Ve a Vercel Dashboard → Settings → Environment Variables')
  console.log('   - Agrega MP_ACCESS_TOKEN con tu token')
  console.log('   - Selecciona Production, Preview, Development')
  console.log('   - Haz REDEPLOY después de agregar\n')
  process.exit(1)
}

// Verificar formato
const isValidFormat =
  MP_ACCESS_TOKEN.startsWith('APP_USR-') || MP_ACCESS_TOKEN.startsWith('TEST-')

if (!isValidFormat) {
  console.warn('⚠️  Formato de token puede ser inválido')
  console.log('   Debe empezar con APP_USR- (producción) o TEST- (sandbox)')
  console.log('   Token actual:', MP_ACCESS_TOKEN.substring(0, 20) + '...\n')
}

// Verificar tipo
const isProduction = MP_ACCESS_TOKEN.startsWith('APP_USR-')
const isSandbox = MP_ACCESS_TOKEN.startsWith('TEST-')

console.log('✅ MP_ACCESS_TOKEN está configurado')
console.log('   Longitud:', MP_ACCESS_TOKEN.length)
console.log('   Tipo:', isProduction ? 'PRODUCCIÓN' : isSandbox ? 'SANDBOX' : 'DESCONOCIDO')
console.log('   Preview:', MP_ACCESS_TOKEN.substring(0, 20) + '...')
console.log('\n' + '='.repeat(60))
console.log('✅ Configuración correcta\n')

// Verificar si está en Vercel
console.log('📝 Para producción en Vercel:')
console.log('   1. Ve a Vercel Dashboard → Settings → Environment Variables')
console.log('   2. Verifica que MP_ACCESS_TOKEN esté configurado')
console.log('   3. Verifica que esté seleccionado para Production')
console.log('   4. Si acabas de agregarlo, haz REDEPLOY\n')

process.exit(0)


