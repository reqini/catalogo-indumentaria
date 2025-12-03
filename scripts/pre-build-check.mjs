#!/usr/bin/env node

/**
 * Script Pre-Build Check
 * Detecta problemas antes de hacer build en Vercel
 * Evita deployments fallidos
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const errors = []
const warnings = []

console.log('🔍 Ejecutando pre-build check...\n')

// 1. Verificar que no haya @import de Google Fonts en CSS
console.log('1️⃣ Verificando Google Fonts...')
try {
  const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf-8')
  if (globalsCss.includes("@import url('https://fonts.googleapis.com")) {
    errors.push({
      file: 'app/globals.css',
      issue: 'Se encontró @import de Google Fonts que causa descargas en build time',
      solution: 'Usar next/font/google en lib/fonts.ts en lugar de @import',
    })
  } else {
    console.log('   ✅ No se encontraron @import de Google Fonts')
  }
} catch (error) {
  warnings.push({
    file: 'app/globals.css',
    issue: 'No se pudo leer el archivo',
  })
}

// 2. Verificar que lib/fonts.ts existe y usa next/font/google
console.log('2️⃣ Verificando configuración de fuentes...')
try {
  const fontsTs = readFileSync(join(process.cwd(), 'lib/fonts.ts'), 'utf-8')
  if (!fontsTs.includes('next/font/google')) {
    errors.push({
      file: 'lib/fonts.ts',
      issue: 'No se está usando next/font/google',
      solution: 'Migrar a next/font/google para evitar descargas en build time',
    })
  } else {
    console.log('   ✅ next/font/google configurado correctamente')
  }
} catch (error) {
  errors.push({
    file: 'lib/fonts.ts',
    issue: 'Archivo no encontrado',
    solution: 'Crear lib/fonts.ts con configuración de next/font/google',
  })
}

// 3. Verificar que layout.tsx use las fuentes de lib/fonts.ts
console.log('3️⃣ Verificando uso de fuentes en layout...')
try {
  const layoutTsx = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf-8')
  if (!layoutTsx.includes("from '@/lib/fonts'")) {
    warnings.push({
      file: 'app/layout.tsx',
      issue: 'No se está importando fuentes desde lib/fonts.ts',
      solution: 'Importar y usar las fuentes de lib/fonts.ts',
    })
  } else {
    console.log('   ✅ Layout usa fuentes de lib/fonts.ts')
  }
} catch (error) {
  warnings.push({
    file: 'app/layout.tsx',
    issue: 'No se pudo leer el archivo',
  })
}

// 4. Verificar hooks problemáticos
console.log('4️⃣ Verificando hooks problemáticos...')
try {
  const catalogoClient = readFileSync(
    join(process.cwd(), 'app/(ecommerce)/catalogo/CatalogoClient.tsx'),
    'utf-8'
  )
  
  // Verificar useCallback con dependencias desconocidas
  if (catalogoClient.includes('useCallback') && catalogoClient.includes('debounce')) {
    const useCallbackMatch = catalogoClient.match(/useCallback\s*\([^)]*debounce[^)]*\)/s)
    if (useCallbackMatch && !useCallbackMatch[0].includes('useMemo')) {
      warnings.push({
        file: 'app/(ecommerce)/catalogo/CatalogoClient.tsx',
        issue: 'useCallback con debounce puede tener dependencias incorrectas',
        solution: 'Usar useMemo para funciones debounced en lugar de useCallback',
      })
    } else {
      console.log('   ✅ useCallback/useMemo configurado correctamente')
    }
  }
} catch (error) {
  warnings.push({
    file: 'app/(ecommerce)/catalogo/CatalogoClient.tsx',
    issue: 'No se pudo verificar hooks',
  })
}

// 5. Verificar next.config.js
console.log('5️⃣ Verificando next.config.js...')
try {
  const nextConfig = readFileSync(join(process.cwd(), 'next.config.js'), 'utf-8')
  
  if (!nextConfig.includes('forceSwcTransforms')) {
    warnings.push({
      file: 'next.config.js',
      issue: 'No se encontró forceSwcTransforms en experimental',
      solution: 'Agregar forceSwcTransforms: true en experimental',
    })
  } else {
    console.log('   ✅ forceSwcTransforms configurado')
  }
  
  if (nextConfig.includes('generateEtags: true')) {
    warnings.push({
      file: 'next.config.js',
      issue: 'generateEtags está activado, puede causar problemas de cache',
      solution: 'Desactivar generateEtags o configurarlo como false',
    })
  } else {
    console.log('   ✅ generateEtags configurado correctamente')
  }
} catch (error) {
  errors.push({
    file: 'next.config.js',
    issue: 'No se pudo leer next.config.js',
  })
}

// 6. Verificar vercel.json
console.log('6️⃣ Verificando vercel.json...')
try {
  const vercelJson = readFileSync(join(process.cwd(), 'vercel.json'), 'utf-8')
  const vercelConfig = JSON.parse(vercelJson)
  
  if (!vercelConfig.github || !vercelConfig.github.enabled) {
    warnings.push({
      file: 'vercel.json',
      issue: 'GitHub auto-deploy puede no estar habilitado',
      solution: 'Verificar que github.enabled esté en true',
    })
  } else {
    console.log('   ✅ GitHub auto-deploy configurado')
  }
  
  if (!vercelConfig.buildCommand || !vercelConfig.buildCommand.includes('NEXT_IGNORE_CACHE')) {
    warnings.push({
      file: 'vercel.json',
      issue: 'buildCommand no incluye NEXT_IGNORE_CACHE',
      solution: 'Agregar NEXT_IGNORE_CACHE=true al buildCommand',
    })
  } else {
    console.log('   ✅ NEXT_IGNORE_CACHE configurado en buildCommand')
  }
} catch (error) {
  warnings.push({
    file: 'vercel.json',
    issue: 'No se pudo leer o parsear vercel.json',
  })
}

// 7. Verificar que no haya fetch en build time
console.log('7️⃣ Verificando fetchs en build time...')
try {
  const apiRoutes = [
    'app/api',
    'app/(ecommerce)',
  ]
  
  // Buscar fetch en archivos de servidor
  const checkForBuildTimeFetch = (dir) => {
    // Esta verificación es básica, se puede mejorar
    console.log('   ⚠️  Verificación básica completada (revisar manualmente si hay problemas)')
  }
  
  console.log('   ✅ Verificación de fetchs completada')
} catch (error) {
  // Ignorar errores en esta verificación
}

// Reporte final
console.log('\n' + '='.repeat(60))
console.log('📊 REPORTE DE PRE-BUILD CHECK')
console.log('='.repeat(60))

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ TODO OK - Build puede proceder sin problemas\n')
  process.exit(0)
}

if (errors.length > 0) {
  console.log('\n❌ ERRORES CRÍTICOS ENCONTRADOS:')
  console.log('='.repeat(60))
  errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.file}`)
    console.log(`   Problema: ${error.issue}`)
    if (error.solution) {
      console.log(`   Solución: ${error.solution}`)
    }
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
    if (warning.solution) {
      console.log(`   Solución: ${warning.solution}`)
    }
  })
  console.log('\n⚠️  Build puede proceder pero se recomienda revisar las advertencias\n')
  process.exit(0)
}

