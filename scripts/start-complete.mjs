#!/usr/bin/env node

/**
 * Script para iniciar toda la aplicación completa
 * - Verifica MongoDB
 * - Ejecuta seed si es necesario
 * - Inicia el servidor Next.js
 */

import { execSync } from 'child_process'
import { spawn } from 'child_process'

console.log('\n🚀 Iniciando aplicación completa...\n')

// 1. Verificar MongoDB
console.log('1️⃣ Verificando MongoDB...')
try {
  execSync('mongosh --eval "db.adminCommand(\'ping\')" --quiet', { stdio: 'ignore' })
  console.log('   ✅ MongoDB está corriendo\n')
} catch (error) {
  console.error('   ❌ MongoDB no está corriendo')
  console.error('   💡 Ejecutá: brew services start mongodb-community')
  process.exit(1)
}

// 2. Verificar datos
console.log('2️⃣ Verificando datos en la base de datos...')
try {
  const productosCount = execSync(
    'mongosh catalogo_indumentaria --eval "db.productos.countDocuments()" --quiet',
    { encoding: 'utf-8' }
  ).trim()
  
  const tenantsCount = execSync(
    'mongosh catalogo_indumentaria --eval "db.tenants.countDocuments()" --quiet',
    { encoding: 'utf-8' }
  ).trim()
  
  const plansCount = execSync(
    'mongosh catalogo_indumentaria --eval "db.plans.countDocuments()" --quiet',
    { encoding: 'utf-8' }
  ).trim()

  const productos = parseInt(productosCount) || 0
  const tenants = parseInt(tenantsCount) || 0
  const plans = parseInt(plansCount) || 0

  console.log(`   Productos: ${productos}`)
  console.log(`   Tenants: ${tenants}`)
  console.log(`   Planes: ${plans}`)

  if (productos === 0 || tenants === 0 || plans === 0) {
    console.log('\n   ⚠️  Faltan datos. Ejecutando seed...\n')
    
    if (plans === 0) {
      console.log('   📦 Creando planes...')
      execSync('pnpm seed-plans', { stdio: 'inherit' })
    }
    
    if (tenants === 0) {
      console.log('   👤 Inicializando SaaS (creando superadmin)...')
      execSync('pnpm init-saas', { stdio: 'inherit' })
    }
    
    if (productos === 0) {
      console.log('   📦 Creando productos de ejemplo...')
      execSync('pnpm seed', { stdio: 'inherit' })
    }
    
    console.log('\n   ✅ Datos inicializados\n')
  } else {
    console.log('   ✅ Base de datos tiene datos\n')
  }
} catch (error) {
  console.error('   ⚠️  Error al verificar datos:', error.message)
  console.log('   💡 Intentando ejecutar seed de todas formas...\n')
  try {
    execSync('pnpm seed-plans', { stdio: 'inherit' })
    execSync('pnpm init-saas', { stdio: 'inherit' })
    execSync('pnpm seed', { stdio: 'inherit' })
  } catch (seedError) {
    console.error('   ❌ Error en seed:', seedError.message)
  }
}

// 3. Iniciar servidor
console.log('3️⃣ Iniciando servidor Next.js...\n')
console.log('   🌐 Servidor disponible en: http://localhost:3001\n')
console.log('   📋 URLs disponibles:')
console.log('      - Home:       http://localhost:3001/')
console.log('      - Catálogo:   http://localhost:3001/catalogo')
console.log('      - Admin:      http://localhost:3001/admin')
console.log('      - API:        http://localhost:3001/api/productos\n')
console.log('   ⚠️  Para detener: Ctrl+C\n')
console.log('='.repeat(60) + '\n')

// Iniciar servidor en foreground
const server = spawn('pnpm', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3001',
  },
})

server.on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error)
  process.exit(1)
})

server.on('exit', (code) => {
  console.log(`\n\nServidor detenido (código: ${code})\n`)
  process.exit(code || 0)
})

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo servidor...\n')
  server.kill('SIGINT')
  process.exit(0)
})

