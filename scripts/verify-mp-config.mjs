#!/usr/bin/env node

/**
 * Script de verificación de configuración de Mercado Pago
 * Ejecutar antes de deploy para asegurar que todo está correcto
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Cargar variables de entorno
config({ path: join(rootDir, '.env.local') })

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
const NODE_ENV = process.env.NODE_ENV || 'development'
const VERCEL_ENV = process.env.VERCEL_ENV || 'local'

console.log('\n🔍 Verificando configuración de Mercado Pago...\n')
console.log(`Entorno: ${NODE_ENV}`)
console.log(`Vercel ENV: ${VERCEL_ENV}\n`)

const errors = []
const warnings = []

// Validar MP_ACCESS_TOKEN
if (!MP_ACCESS_TOKEN) {
  errors.push('❌ MP_ACCESS_TOKEN no está configurado')
} else {
  console.log(`✅ MP_ACCESS_TOKEN presente (length: ${MP_ACCESS_TOKEN.length})`)
  
  if (MP_ACCESS_TOKEN === 'TEST-xxxxxxxxxxxxxxxxxxxx' || MP_ACCESS_TOKEN.includes('xxxxx')) {
    errors.push('❌ MP_ACCESS_TOKEN es un placeholder, debe ser reemplazado por un token real')
  } else if (MP_ACCESS_TOKEN.startsWith('TEST-')) {
    console.log('⚠️  MP_ACCESS_TOKEN es de TEST')
    if (VERCEL_ENV === 'production' || NODE_ENV === 'production') {
      errors.push('❌ MP_ACCESS_TOKEN es de TEST pero estamos en producción. Se requiere token de PRODUCCIÓN')
    }
  } else if (MP_ACCESS_TOKEN.startsWith('APP_USR-') || MP_ACCESS_TOKEN.length > 50) {
    console.log('✅ MP_ACCESS_TOKEN parece ser de PRODUCCIÓN')
  } else {
    warnings.push('⚠️  MP_ACCESS_TOKEN tiene formato inusual')
  }
  
  console.log(`   Preview: ${MP_ACCESS_TOKEN.substring(0, 15)}...`)
}

// Validar NEXT_PUBLIC_MP_PUBLIC_KEY (opcional pero recomendado)
if (!NEXT_PUBLIC_MP_PUBLIC_KEY) {
  warnings.push('⚠️  NEXT_PUBLIC_MP_PUBLIC_KEY no está configurado (opcional pero recomendado)')
} else {
  console.log(`✅ NEXT_PUBLIC_MP_PUBLIC_KEY presente`)
  if (NEXT_PUBLIC_MP_PUBLIC_KEY === 'TEST-xxxxxxxxxxxxxxxxxxxx' || NEXT_PUBLIC_MP_PUBLIC_KEY.includes('xxxxx')) {
    warnings.push('⚠️  NEXT_PUBLIC_MP_PUBLIC_KEY es un placeholder')
  }
}

console.log('\n')

// Mostrar resultados
if (errors.length > 0) {
  console.error('❌ ERRORES ENCONTRADOS:')
  errors.forEach(err => console.error(`   ${err}`))
  console.error('\n💡 SOLUCIÓN:')
  console.error('   1. Obtener credenciales en: https://www.mercadopago.com.ar/developers/panel')
  console.error('   2. Configurar MP_ACCESS_TOKEN en .env.local (local) o Vercel (producción)')
  console.error('   3. Ver documentación: docs/configuracion-mercadopago.md\n')
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn('⚠️  ADVERTENCIAS:')
  warnings.forEach(warn => console.warn(`   ${warn}`))
  console.log('')
}

console.log('✅ Configuración de Mercado Pago válida\n')
process.exit(0)

