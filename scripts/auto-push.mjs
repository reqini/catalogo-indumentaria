#!/usr/bin/env node

/**
 * Auto-Push Script
 * Ejecuta validaciones y hace push automático si todo pasa
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🚀 Iniciando auto-push...\n')

// Ejecutar validaciones pre-push
console.log('📋 Ejecutando validaciones...\n')
try {
  execSync('node scripts/pre-push-validation.mjs', { 
    stdio: 'inherit',
    cwd: projectRoot 
  })
} catch (error) {
  console.error('\n❌ Validaciones fallaron - Push cancelado')
  console.error('💡 Corregir errores y reintentar\n')
  process.exit(1)
}

// Si llegamos aquí, todas las validaciones pasaron
console.log('\n✅ Todas las validaciones pasaron')
console.log('📤 Haciendo push a GitHub...\n')

try {
  // Obtener cambios
  const changes = execSync('git status --short', { 
    encoding: 'utf-8',
    cwd: projectRoot 
  })

  if (!changes.trim()) {
    console.log('ℹ️ No hay cambios para subir\n')
    process.exit(0)
  }

  // Generar mensaje de commit
  const date = new Date().toLocaleString('es-AR')
  const commitMessage = `feat: actualización estable – tests completos y build OK\n\nFecha: ${date}\nValidaciones: ✅ Pasadas\nBuild: ✅ Exitoso`

  // Hacer commit
  execSync('git add .', { stdio: 'inherit', cwd: projectRoot })
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: projectRoot })

  // Hacer push
  execSync('git push', { stdio: 'inherit', cwd: projectRoot })

  console.log('\n✅ Push exitoso a GitHub\n')
} catch (error) {
  console.error('\n❌ Error haciendo push:', error.message)
  console.error('💡 Verificar configuración de Git y permisos\n')
  process.exit(1)
}

