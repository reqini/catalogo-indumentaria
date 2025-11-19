#!/usr/bin/env node

/**
 * Script de pruebas para producción
 * Ejecuta verificaciones básicas antes del deploy
 */

import { execSync } from 'child_process'

console.log('\n🧪 EJECUTANDO PRUEBAS PRE-PRODUCCIÓN\n')
console.log('='.repeat(60) + '\n')

const tests = [
  {
    name: 'Lint',
    command: 'pnpm lint',
    critical: true,
  },
  {
    name: 'TypeScript',
    command: 'pnpm typecheck',
    critical: true,
  },
  {
    name: 'Build',
    command: 'pnpm build',
    critical: true,
  },
]

const results = []

for (const test of tests) {
  try {
    console.log(`▶️  Ejecutando: ${test.name}...`)
    execSync(test.command, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${test.name}: PASÓ\n`)
    results.push({ name: test.name, passed: true, critical: test.critical })
  } catch (error) {
    console.log(`❌ ${test.name}: FALLÓ\n`)
    results.push({ name: test.name, passed: false, critical: test.critical })
    
    if (test.critical) {
      console.log('⚠️  Esta prueba es crítica. Corrige los errores antes de hacer deploy.\n')
    }
  }
}

console.log('='.repeat(60))
console.log('\n📊 RESUMEN:\n')

const passed = results.filter(r => r.passed).length
const total = results.length
const criticalFailed = results.some(r => !r.passed && r.critical)

results.forEach(result => {
  const icon = result.passed ? '✅' : '❌'
  const critical = result.critical ? ' (CRÍTICO)' : ''
  console.log(`   ${icon} ${result.name}${critical}`)
})

console.log(`\n   Total: ${passed}/${total} pruebas pasadas\n`)

if (criticalFailed) {
  console.log('❌ HAY ERRORES CRÍTICOS. Corrige antes de hacer deploy.\n')
  process.exit(1)
} else if (passed === total) {
  console.log('✅ TODAS LAS PRUEBAS PASARON. Listo para producción.\n')
  process.exit(0)
} else {
  console.log('⚠️  Algunas pruebas fallaron, pero no son críticas.\n')
  process.exit(0)
}

