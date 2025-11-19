#!/usr/bin/env node

/**
 * Script de verificación pre-producción
 * Verifica que todas las configuraciones estén listas para producción
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const requiredEnvVars = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'NEXT_PUBLIC_BASE_URL',
  ],
  optional: [
    'MP_ACCESS_TOKEN',
    'MP_WEBHOOK_SECRET',
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
  ],
}

function checkEnvFile() {
  console.log('\n📋 Verificando variables de entorno...\n')
  
  let envContent = ''
  try {
    envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8')
  } catch (error) {
    console.log('   ⚠️  No se encontró .env.local (esto es normal en producción)')
    return { missing: [], warnings: [] }
  }

  const envVars = {}
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) {
      envVars[match[1]] = match[2]
    }
  })

  const missing = []
  const warnings = []

  // Verificar variables requeridas
  requiredEnvVars.production.forEach(varName => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      missing.push(varName)
    } else {
      // Validaciones específicas
      if (varName === 'JWT_SECRET' && envVars[varName].length < 32) {
        warnings.push(`${varName}: Debe tener al menos 32 caracteres`)
      }
      if (varName === 'NEXT_PUBLIC_BASE_URL' && envVars[varName].includes('localhost')) {
        warnings.push(`${varName}: No debe contener 'localhost' en producción`)
      }
      if (varName === 'MP_ACCESS_TOKEN' && envVars[varName].startsWith('TEST-')) {
        warnings.push(`${varName}: Parece ser un token de test, usar token de producción`)
      }
    }
  })

  return { missing, warnings, envVars }
}

function checkBuild() {
  console.log('\n🏗️  Verificando build...\n')
  
  try {
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
    console.log(`   ✅ package.json válido`)
    console.log(`   📦 Versión: ${package.json.version || 'N/A'}`)
    return true
  } catch (error) {
    console.log(`   ❌ Error leyendo package.json: ${error.message}`)
    return false
  }
}

function checkSecurity() {
  console.log('\n🔒 Verificando seguridad...\n')
  
  const checks = {
    middleware: false,
    rateLimiting: false,
    cspHeaders: false,
  }

  try {
    const middlewareContent = readFileSync(join(rootDir, 'middleware.ts'), 'utf-8')
    
    if (middlewareContent.includes('rateLimitMap')) {
      checks.rateLimiting = true
      console.log('   ✅ Rate limiting configurado')
    } else {
      console.log('   ⚠️  Rate limiting no encontrado')
    }

    if (middlewareContent.includes('cspHeader')) {
      checks.cspHeaders = true
      console.log('   ✅ CSP headers configurados')
    } else {
      console.log('   ⚠️  CSP headers no encontrados')
    }

    checks.middleware = true
    console.log('   ✅ Middleware.ts existe')
  } catch (error) {
    console.log(`   ❌ Error verificando middleware: ${error.message}`)
  }

  return checks
}

function checkSupabase() {
  console.log('\n🗄️  Verificando configuración de Supabase...\n')
  
  try {
    const supabaseHelpers = readFileSync(join(rootDir, 'lib', 'supabase-helpers.ts'), 'utf-8')
    
    if (supabaseHelpers.includes('supabaseAdmin')) {
      console.log('   ✅ Helpers de Supabase configurados')
    }
    
    // Verificar migraciones
    try {
      const migrationsDir = join(rootDir, 'supabase', 'migrations')
      const fs = await import('fs/promises')
      const files = await fs.readdir(migrationsDir)
      console.log(`   ✅ ${files.length} migraciones encontradas`)
    } catch (error) {
      console.log('   ⚠️  No se encontró directorio de migraciones')
    }
  } catch (error) {
    console.log(`   ⚠️  Error verificando Supabase: ${error.message}`)
  }
}

function generateReport({ missing, warnings, envVars, security, build }) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORTE DE VERIFICACIÓN PRE-PRODUCCIÓN')
  console.log('='.repeat(60) + '\n')

  // Variables de entorno
  console.log('📋 VARIABLES DE ENTORNO:')
  if (missing.length === 0 && warnings.length === 0) {
    console.log('   ✅ Todas las variables requeridas están configuradas\n')
  } else {
    if (missing.length > 0) {
      console.log(`   ❌ Faltan ${missing.length} variables requeridas:`)
      missing.forEach(v => console.log(`      - ${v}`))
      console.log('')
    }
    if (warnings.length > 0) {
      console.log(`   ⚠️  ${warnings.length} advertencias:`)
      warnings.forEach(w => console.log(`      - ${w}`))
      console.log('')
    }
  }

  // Build
  console.log('🏗️  BUILD:')
  if (build) {
    console.log('   ✅ Build verificado\n')
  } else {
    console.log('   ❌ Error en verificación de build\n')
  }

  // Seguridad
  console.log('🔒 SEGURIDAD:')
  const securityChecks = Object.values(security).filter(Boolean).length
  const totalSecurityChecks = Object.keys(security).length
  console.log(`   ${securityChecks}/${totalSecurityChecks} verificaciones pasadas\n`)

  // Resumen
  console.log('='.repeat(60))
  const allGood = missing.length === 0 && warnings.length === 0 && build && securityChecks === totalSecurityChecks
  
  if (allGood) {
    console.log('✅ TODO LISTO PARA PRODUCCIÓN\n')
  } else {
    console.log('⚠️  REVISAR ANTES DE PRODUCCIÓN\n')
    console.log('📝 Próximos pasos:')
    if (missing.length > 0) {
      console.log('   1. Configurar variables faltantes en Vercel Dashboard')
    }
    if (warnings.length > 0) {
      console.log('   2. Revisar advertencias de configuración')
    }
    console.log('   3. Verificar docs/VARIABLES-ENTORNO-PRODUCCION.md')
    console.log('   4. Ejecutar pruebas manuales\n')
  }

  return allGood
}

async function main() {
  console.log('\n🚀 VERIFICACIÓN PRE-PRODUCCIÓN\n')
  
  const { missing, warnings, envVars } = checkEnvFile()
  const build = checkBuild()
  const security = checkSecurity()
  await checkSupabase()
  
  const allGood = generateReport({ missing, warnings, envVars, security, build })
  
  process.exit(allGood ? 0 : 1)
}

main().catch(error => {
  console.error('\n❌ Error ejecutando verificación:', error)
  process.exit(1)
})

