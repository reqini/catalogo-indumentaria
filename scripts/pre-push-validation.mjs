#!/usr/bin/env node

/**
 * Pre-Push Validation Script
 * Ejecuta validaciones completas antes de permitir push a GitHub
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const errors = []
const warnings = []

console.log('🔍 Ejecutando validaciones pre-push...\n')

// Test 1: Lint
console.log('1️⃣ Ejecutando lint...')
try {
  execSync('npm run lint', { stdio: 'inherit', cwd: projectRoot })
  console.log('✅ Lint pasado\n')
} catch (error) {
  errors.push('Lint falló')
  console.log('❌ Lint falló\n')
}

// Test 2: Typecheck
console.log('2️⃣ Ejecutando typecheck...')
try {
  execSync('npm run typecheck', { stdio: 'inherit', cwd: projectRoot })
  console.log('✅ Typecheck pasado\n')
} catch (error) {
  errors.push('Typecheck falló')
  console.log('❌ Typecheck falló\n')
}

// Test 3: Tests unitarios
console.log('3️⃣ Ejecutando tests unitarios...')
try {
  execSync('npm run test', { stdio: 'inherit', cwd: projectRoot })
  console.log('✅ Tests unitarios pasados\n')
} catch (error) {
  warnings.push('Algunos tests unitarios fallaron')
  console.log('⚠️ Algunos tests unitarios fallaron\n')
}

// Test 4: Build
console.log('4️⃣ Ejecutando build...')
try {
  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })
  console.log('✅ Build exitoso\n')
} catch (error) {
  errors.push('Build falló')
  console.log('❌ Build falló\n')
}

// Test 5: Verificar imports rotos
console.log('5️⃣ Verificando imports...')
try {
  const result = execSync('npx tsc --noEmit --skipLibCheck', { 
    encoding: 'utf-8',
    cwd: projectRoot,
    stdio: 'pipe'
  })
  console.log('✅ Imports verificados\n')
} catch (error) {
  const output = error.stdout?.toString() || error.stderr?.toString() || ''
  if (output.includes('Cannot find module') || output.includes('Module not found')) {
    errors.push('Imports rotos detectados')
    console.log('❌ Imports rotos detectados\n')
  } else {
    console.log('✅ Imports verificados\n')
  }
}

// Test 6: Verificar rutas críticas
console.log('6️⃣ Verificando rutas críticas...')
const criticalRoutes = [
  'app/page.tsx',
  'app/(ecommerce)/catalogo/page.tsx',
  'app/(ecommerce)/producto/[id]/page.tsx',
  'app/(ecommerce)/checkout/page.tsx',
  'app/api/checkout/create-order-simple/route.ts',
  'app/api/productos/route.ts',
]

let routesOk = true
criticalRoutes.forEach((route) => {
  const fullPath = join(projectRoot, route)
  if (!existsSync(fullPath)) {
    errors.push(`Ruta crítica no existe: ${route}`)
    routesOk = false
  }
})

if (routesOk) {
  console.log('✅ Rutas críticas verificadas\n')
} else {
  console.log('❌ Algunas rutas críticas no existen\n')
}

// Resumen
console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE VALIDACIONES')
console.log('='.repeat(60))

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ TODAS LAS VALIDACIONES PASARON')
  console.log('✅ Push permitido\n')
  process.exit(0)
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORES CRÍTICOS:')
    errors.forEach((err, index) => {
      console.log(`  ${index + 1}. ${err}`)
    })
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ ADVERTENCIAS:')
    warnings.forEach((warn, index) => {
      console.log(`  ${index + 1}. ${warn}`)
    })
  }

  if (errors.length > 0) {
    console.log('\n🚫 PUSH BLOQUEADO - Resolver errores antes de continuar')
    console.log('\n💡 SUGERENCIAS:')
    console.log('  1. Revisar los errores arriba')
    console.log('  2. Ejecutar: npm run lint:fix')
    console.log('  3. Verificar que el build funcione: npm run build')
    console.log('  4. Reintentar push después de corregir\n')
    process.exit(1)
  } else {
    console.log('\n⚠️ Push permitido con advertencias\n')
    process.exit(0)
  }
}

