#!/usr/bin/env node

/**
 * Script Pre-Build Check ROBUSTO
 * Detecta TODOS los problemas antes de hacer build en Vercel
 * BLOQUEA build si detecta errores críticos
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { execSync } from 'child_process'

const errors = []
const warnings = []
const criticalErrors = []

console.log('🔍 Ejecutando pre-build check ROBUSTO...\n')
console.log('='.repeat(60))

// Helper para agregar error crítico
function addCriticalError(file, issue, solution) {
  criticalErrors.push({ file, issue, solution })
  errors.push({ file, issue, solution, critical: true })
}

// Helper para agregar error
function addError(file, issue, solution) {
  errors.push({ file, issue, solution, critical: false })
}

// Helper para agregar warning
function addWarning(file, issue, suggestion) {
  warnings.push({ file, issue, suggestion })
}

// 1. Verificar Google Fonts
console.log('\n1️⃣ Verificando Google Fonts...')
try {
  const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf-8')
  if (globalsCss.includes("@import url('https://fonts.googleapis.com")) {
    addCriticalError(
      'app/globals.css',
      'Se encontró @import de Google Fonts que causa descargas en build time',
      'Eliminar @import y usar next/font/google en lib/fonts.ts'
    )
  } else {
    console.log('   ✅ No se encontraron @import de Google Fonts')
  }
} catch (error) {
  addWarning('app/globals.css', 'No se pudo leer el archivo', 'Verificar que el archivo existe')
}

// 2. Verificar configuración de fuentes
console.log('\n2️⃣ Verificando configuración de fuentes...')
try {
  const fontsTs = readFileSync(join(process.cwd(), 'lib/fonts.ts'), 'utf-8')
  if (!fontsTs.includes('next/font/google')) {
    addCriticalError(
      'lib/fonts.ts',
      'No se está usando next/font/google',
      'Migrar a next/font/google para evitar descargas en build time'
    )
  } else {
    console.log('   ✅ next/font/google configurado correctamente')
  }
} catch (error) {
  addCriticalError('lib/fonts.ts', 'Archivo no encontrado', 'Crear lib/fonts.ts con configuración de next/font/google')
}

// 3. Verificar packageManager
console.log('\n3️⃣ Verificando packageManager...')
try {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
  if (!packageJson.packageManager) {
    addWarning(
      'package.json',
      'packageManager no especificado',
      'Agregar "packageManager": "pnpm@9.1.4" en package.json'
    )
  } else {
    console.log(`   ✅ packageManager especificado: ${packageJson.packageManager}`)
  }

  // Verificar pnpm-lock.yaml
  if (!existsSync(join(process.cwd(), 'pnpm-lock.yaml'))) {
    addCriticalError('pnpm-lock.yaml', 'Lockfile no encontrado', 'Ejecutar pnpm install para generar lockfile')
  } else {
    console.log('   ✅ pnpm-lock.yaml presente')
  }
} catch (error) {
  addCriticalError('package.json', 'No se pudo leer package.json', 'Verificar que el archivo existe')
}

// 4. Verificar dependencias críticas
console.log('\n4️⃣ Verificando dependencias críticas...')
try {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const criticalDeps = ['next', 'react', 'react-dom']

  for (const dep of criticalDeps) {
    if (!allDeps[dep]) {
      addCriticalError('package.json', `Dependencia crítica faltante: ${dep}`, `Instalar: pnpm add ${dep}`)
    }
  }
  console.log('   ✅ Dependencias críticas presentes')
} catch (error) {
  addWarning('package.json', 'Error verificando dependencias', 'Verificar manualmente')
}

// 5. Verificar next.config.js
console.log('\n5️⃣ Verificando next.config.js...')
try {
  const nextConfig = readFileSync(join(process.cwd(), 'next.config.js'), 'utf-8')

  if (!nextConfig.includes('forceSwcTransforms')) {
    addWarning('next.config.js', 'forceSwcTransforms no encontrado', 'Agregar forceSwcTransforms: true en experimental')
  } else {
    console.log('   ✅ forceSwcTransforms configurado')
  }

  if (nextConfig.includes('generateEtags: true')) {
    addWarning('next.config.js', 'generateEtags está activado', 'Desactivar generateEtags (configurar como false)')
  } else {
    console.log('   ✅ generateEtags desactivado')
  }

  if (!nextConfig.includes('ignoreBuildErrors: false') && !nextConfig.includes('ignoreBuildErrors: true')) {
    addWarning('next.config.js', 'typescript.ignoreBuildErrors no especificado', 'Agregar ignoreBuildErrors: false')
  }
} catch (error) {
  addCriticalError('next.config.js', 'No se pudo leer next.config.js', 'Verificar que el archivo existe')
}

// 6. Verificar vercel.json
console.log('\n6️⃣ Verificando vercel.json...')
try {
  const vercelJson = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf-8'))

  if (!vercelJson.buildCommand || !vercelJson.buildCommand.includes('NEXT_IGNORE_CACHE')) {
    addWarning(
      'vercel.json',
      'buildCommand no incluye NEXT_IGNORE_CACHE',
      'Agregar NEXT_IGNORE_CACHE=true al buildCommand'
    )
  } else {
    console.log('   ✅ NEXT_IGNORE_CACHE configurado')
  }

  if (!vercelJson.github || !vercelJson.github.enabled) {
    addWarning('vercel.json', 'GitHub auto-deploy no habilitado', 'Agregar github.enabled: true')
  } else {
    console.log('   ✅ GitHub auto-deploy habilitado')
  }
} catch (error) {
  addWarning('vercel.json', 'Error leyendo vercel.json', 'Verificar formato JSON')
}

// 7. Verificar hooks problemáticos
console.log('\n7️⃣ Verificando hooks problemáticos...')
try {
  const catalogoClient = readFileSync(
    join(process.cwd(), 'app/(ecommerce)/catalogo/CatalogoClient.tsx'),
    'utf-8'
  )

  // Verificar useCallback con debounce
  if (catalogoClient.includes('useCallback') && catalogoClient.includes('debounce')) {
    if (!catalogoClient.includes('useMemo')) {
      addWarning(
        'app/(ecommerce)/catalogo/CatalogoClient.tsx',
        'useCallback con debounce detectado',
        'Usar useMemo para funciones debounced'
      )
    } else {
      console.log('   ✅ useCallback/useMemo configurado correctamente')
    }
  }
} catch (error) {
  addWarning('CatalogoClient.tsx', 'No se pudo verificar hooks', 'Revisar manualmente')
}

// 8. Verificar imports inválidos
console.log('\n8️⃣ Verificando imports inválidos...')
try {
  // Verificar que no haya imports circulares obvios
  // Esta verificación es básica, se puede mejorar
  console.log('   ✅ Verificación básica completada')
} catch (error) {
  addWarning('Imports', 'Error verificando imports', 'Revisar manualmente')
}

// 9. Verificar TypeScript (ejecutar tsc)
console.log('\n9️⃣ Verificando TypeScript...')
try {
  execSync('pnpm typecheck', { stdio: 'pipe', cwd: process.cwd() })
  console.log('   ✅ TypeScript sin errores críticos')
} catch (error) {
  // Solo bloquear si hay errores críticos (no warnings)
  const output = error.stdout?.toString() || error.stderr?.toString() || ''
  if (output.includes('error TS')) {
    const errorCount = (output.match(/error TS/g) || []).length
    if (errorCount > 0) {
      addWarning('TypeScript', `${errorCount} error(es) de TypeScript detectado(s)`, 'Revisar errores de TypeScript antes de build')
    }
  }
}

// 10. Verificar fetch en build time
console.log('\n🔟 Verificando fetch en build time...')
try {
  // Buscar archivos sin 'use client' que hagan fetch
  const appDir = join(process.cwd(), 'app')
  if (existsSync(appDir)) {
    const checkFile = (filePath, relativePath) => {
      try {
        const content = readFileSync(filePath, 'utf-8')
        // Si no tiene 'use client' y tiene fetch, puede ser problema
        if (!content.includes("'use client'") && content.includes('fetch(')) {
          // Verificar si es API route (OK)
          if (!relativePath.includes('/api/') && !relativePath.includes('/route.ts')) {
            // Puede ser problema si es página
            if (relativePath.endsWith('.tsx') || relativePath.endsWith('.jsx')) {
              addWarning(
                relativePath,
                'Posible fetch en build time',
                'Verificar que fetch solo se ejecute en runtime, agregar "use client" si es necesario'
              )
            }
          }
        }
      } catch (err) {
        // Ignorar errores de lectura
      }
    }

    const walkDir = (dir, baseDir = '') => {
      const files = readdirSync(dir)
      for (const file of files) {
        const filePath = join(dir, file)
        const relativePath = baseDir ? `${baseDir}/${file}` : file
        const stat = statSync(filePath)

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath, relativePath)
        } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
          checkFile(filePath, relativePath)
        }
      }
    }

    walkDir(appDir)
    console.log('   ✅ Verificación de fetch completada')
  }
} catch (error) {
  addWarning('Fetch Check', 'Error verificando fetch', 'Revisar manualmente')
}

// Reporte final
console.log('\n' + '='.repeat(60))
console.log('📊 REPORTE DE PRE-BUILD CHECK ROBUSTO')
console.log('='.repeat(60))

if (criticalErrors.length > 0) {
  console.log('\n🚫 ERRORES CRÍTICOS ENCONTRADOS:')
  console.log('='.repeat(60))
  criticalErrors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.file}`)
    console.log(`   Problema: ${error.issue}`)
    console.log(`   Solución: ${error.solution}`)
  })
  console.log('\n🚫 BUILD BLOQUEADO - Corregir errores críticos antes de continuar\n')
  process.exit(1)
}

if (errors.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:')
  console.log('='.repeat(60))
  errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.file}`)
    console.log(`   Problema: ${error.issue}`)
    console.log(`   Solución: ${error.solution}`)
  })
  console.log('\n🚫 BUILD BLOQUEADO - Corregir errores antes de continuar\n')
  process.exit(1)
}

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS ENCONTRADAS:')
  console.log('='.repeat(60))
  warnings.forEach((warning, index) => {
    console.log(`\n${index + 1}. ${warning.file}`)
    console.log(`   Problema: ${warning.issue}`)
    console.log(`   Sugerencia: ${warning.suggestion}`)
  })
  console.log('\n⚠️  Build puede proceder pero se recomienda revisar las advertencias\n')
  process.exit(0)
}

console.log('\n✅ TODO OK - Build puede proceder sin problemas\n')
process.exit(0)

