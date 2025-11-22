#!/usr/bin/env node

/**
 * Script de diagnóstico para variables de entorno de Mercado Pago
 * 
 * Este script ayuda a identificar por qué MP_ACCESS_TOKEN no se está detectando
 * 
 * USO:
 *   pnpm diagnose-mp-env
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
config({ path: join(__dirname, '..', '.env.local') })

console.log('\n🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO - MERCADO PAGO\n')
console.log('═'.repeat(70))

// 1. Verificar variables directamente
console.log('\n1️⃣ VERIFICACIÓN DIRECTA DE VARIABLES:\n')

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
const NODE_ENV = process.env.NODE_ENV
const VERCEL_ENV = process.env.VERCEL_ENV
const VERCEL = process.env.VERCEL

console.log(`MP_ACCESS_TOKEN: ${MP_ACCESS_TOKEN ? '✅ PRESENTE' : '❌ NO ENCONTRADO'}`)
if (MP_ACCESS_TOKEN) {
  console.log(`   - Longitud: ${MP_ACCESS_TOKEN.length} caracteres`)
  console.log(`   - Empieza con: ${MP_ACCESS_TOKEN.substring(0, 20)}...`)
  console.log(`   - Formato válido: ${MP_ACCESS_TOKEN.startsWith('APP_USR-') || MP_ACCESS_TOKEN.startsWith('TEST-') ? '✅' : '❌'}`)
} else {
  console.log('   ⚠️  Variable no encontrada en process.env')
}

console.log(`\nNEXT_PUBLIC_MP_PUBLIC_KEY: ${NEXT_PUBLIC_MP_PUBLIC_KEY ? '✅ PRESENTE' : '⚠️  NO ENCONTRADO (opcional)'}`)
if (NEXT_PUBLIC_MP_PUBLIC_KEY) {
  console.log(`   - Longitud: ${NEXT_PUBLIC_MP_PUBLIC_KEY.length} caracteres`)
  console.log(`   - Empieza con: ${NEXT_PUBLIC_MP_PUBLIC_KEY.substring(0, 20)}...`)
}

console.log(`\nNODE_ENV: ${NODE_ENV || 'no definido'}`)
console.log(`VERCEL_ENV: ${VERCEL_ENV || 'no definido'}`)
console.log(`VERCEL: ${VERCEL || 'no definido'}`)

// 2. Verificar todas las variables que empiezan con MP
console.log('\n\n2️⃣ TODAS LAS VARIABLES QUE EMPIEZAN CON "MP":\n')

const mpVars = Object.keys(process.env)
  .filter(key => key.toUpperCase().includes('MP') || key.toUpperCase().includes('MERCADO'))
  .sort()

if (mpVars.length === 0) {
  console.log('❌ No se encontraron variables relacionadas con Mercado Pago')
} else {
  mpVars.forEach(key => {
    const value = process.env[key]
    const preview = value ? `${value.substring(0, 20)}...` : 'undefined'
    console.log(`   ${key}: ${preview}`)
  })
}

// 3. Simular validación
console.log('\n\n3️⃣ SIMULACIÓN DE VALIDACIÓN (validateMercadoPagoConfig):\n')

const errors = []
let isValid = false

if (!MP_ACCESS_TOKEN) {
  errors.push('MP_ACCESS_TOKEN no está configurado')
} else if (MP_ACCESS_TOKEN.includes('xxxxx')) {
  errors.push('MP_ACCESS_TOKEN es un placeholder')
} else if (MP_ACCESS_TOKEN.startsWith('TEST-')) {
  const isVercelProduction = VERCEL_ENV === 'production'
  const isNodeProduction = NODE_ENV === 'production'
  if (isVercelProduction && isNodeProduction) {
    errors.push('MP_ACCESS_TOKEN es de TEST pero estamos en producción')
  }
} else if (MP_ACCESS_TOKEN.startsWith('APP_USR-') || MP_ACCESS_TOKEN.length > 50) {
  console.log('   ✅ Token de producción detectado')
  isValid = true
} else {
  errors.push('MP_ACCESS_TOKEN tiene formato inválido')
}

isValid = !!MP_ACCESS_TOKEN && MP_ACCESS_TOKEN.length > 20 && !MP_ACCESS_TOKEN.includes('xxxxx')

console.log(`   isValid: ${isValid ? '✅' : '❌'}`)
console.log(`   errors: ${errors.length > 0 ? errors.join(', ') : 'ninguno'}`)

// 4. Verificar archivos .env
console.log('\n\n4️⃣ VERIFICACIÓN DE ARCHIVOS .env:\n')

import { existsSync } from 'fs'

const envFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
]

envFiles.forEach(file => {
  const path = join(__dirname, '..', file)
  const exists = existsSync(path)
  console.log(`   ${file}: ${exists ? '✅ existe' : '❌ no existe'}`)
  if (exists) {
    try {
      const content = require('fs').readFileSync(path, 'utf8')
      const hasMP = content.includes('MP_ACCESS_TOKEN')
      console.log(`      - Contiene MP_ACCESS_TOKEN: ${hasMP ? '✅' : '❌'}`)
    } catch (e) {
      console.log(`      - Error leyendo archivo: ${e.message}`)
    }
  }
})

// 5. Recomendaciones
console.log('\n\n5️⃣ RECOMENDACIONES:\n')

if (!MP_ACCESS_TOKEN) {
  console.log('❌ PROBLEMA DETECTADO: MP_ACCESS_TOKEN no está configurado\n')
  console.log('📋 SOLUCIÓN:\n')
  console.log('   1. Si estás en LOCAL:')
  console.log('      - Crea archivo .env.local en la raíz del proyecto')
  console.log('      - Agrega: MP_ACCESS_TOKEN=APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974')
  console.log('')
  console.log('   2. Si estás en VERCEL:')
  console.log('      - Ve a: https://vercel.com/dashboard')
  console.log('      - Selecciona proyecto: catalogo-indumentaria')
  console.log('      - Settings → Environment Variables')
  console.log('      - Agrega variable MP_ACCESS_TOKEN con el valor completo')
  console.log('      - Marca Production, Preview y Development')
  console.log('      - Guarda y haz REDEPLOY')
  console.log('')
  console.log('   3. Verifica que el nombre sea exactamente: MP_ACCESS_TOKEN')
  console.log('      (no MERCADOPAGO_ACCESS_TOKEN ni otro nombre)')
} else if (!isValid) {
  console.log('⚠️  PROBLEMA DETECTADO: MP_ACCESS_TOKEN tiene formato inválido\n')
  console.log('📋 SOLUCIÓN:')
  console.log('   - Verifica que el token sea válido')
  console.log('   - Debe empezar con APP_USR- (producción) o TEST- (test)')
  console.log('   - No debe contener "xxxxx" o ser un placeholder')
} else {
  console.log('✅ TODO CORRECTO: Las variables están configuradas correctamente')
  console.log('   Si aún ves errores, verifica que:')
  console.log('   1. Hiciste redeploy después de agregar las variables')
  console.log('   2. Las variables están en el entorno correcto (Production/Preview/Development)')
  console.log('   3. No hay espacios extra en el valor de la variable')
}

console.log('\n' + '═'.repeat(70))
console.log('\n')

