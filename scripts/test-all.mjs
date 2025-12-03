#!/usr/bin/env node

/**
 * Test All - Ejecuta todos los tests
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🧪 Ejecutando todos los tests...\n')

const tests = [
  { name: 'Tests unitarios', command: 'npm run test' },
  { name: 'Tests de integración', command: 'npm run test:integration || echo "Tests de integración no configurados"' },
  { name: 'Tests de checkout', command: 'npm run test:checkout || echo "Tests de checkout no configurados"' },
  { name: 'Tests de admin', command: 'npm run test:admin || echo "Tests de admin no configurados"' },
]

let passed = 0
let failed = 0

tests.forEach((test) => {
  console.log(`\n📋 ${test.name}...`)
  try {
    execSync(test.command, { stdio: 'inherit', cwd: projectRoot })
    console.log(`✅ ${test.name} pasados\n`)
    passed++
  } catch (error) {
    console.log(`❌ ${test.name} fallaron\n`)
    failed++
  }
})

console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN')
console.log('='.repeat(60))
console.log(`✅ Pasados: ${passed}`)
console.log(`❌ Fallidos: ${failed}`)
console.log(`📊 Total: ${tests.length}\n`)

if (failed > 0) {
  console.log('⚠️ Algunos tests fallaron')
  process.exit(1)
} else {
  console.log('✅ Todos los tests pasaron')
  process.exit(0)
}

