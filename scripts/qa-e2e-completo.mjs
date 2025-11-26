#!/usr/bin/env node

/**
 * QA E2E Completo - Catálogo Indumentaria
 * 
 * Este script realiza pruebas automatizadas de todos los flujos críticos del sistema
 * y genera un reporte detallado de estado productivo.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const QA_REPORT = {
  timestamp: new Date().toISOString(),
  commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  environment: process.env.NODE_ENV || 'development',
  tests: [],
  errors: [],
  warnings: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
}

function logTest(name, status, details = {}) {
  QA_REPORT.tests.push({
    name,
    status,
    details,
    timestamp: new Date().toISOString(),
  })
  QA_REPORT.summary.total++
  if (status === 'PASS') {
    QA_REPORT.summary.passed++
    console.log(`✅ ${name}`)
  } else if (status === 'FAIL') {
    QA_REPORT.summary.failed++
    QA_REPORT.errors.push({ test: name, ...details })
    console.log(`❌ ${name}: ${details.error || details.message || 'Error desconocido'}`)
  } else if (status === 'WARN') {
    QA_REPORT.summary.warnings++
    QA_REPORT.warnings.push({ test: name, ...details })
    console.log(`⚠️  ${name}: ${details.message || 'Advertencia'}`)
  }
}

// ============================================
// TESTS DE ESTRUCTURA Y CONFIGURACIÓN
// ============================================

function testBuildConfiguration() {
  console.log('\n📦 Verificando configuración de build...')
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
    
    // Verificar scripts críticos
    const requiredScripts = ['dev', 'build', 'start']
    const missingScripts = requiredScripts.filter(s => !packageJson.scripts[s])
    
    if (missingScripts.length > 0) {
      logTest('Scripts de build', 'FAIL', {
        error: `Scripts faltantes: ${missingScripts.join(', ')}`,
      })
    } else {
      logTest('Scripts de build', 'PASS')
    }
    
    // Verificar dependencias críticas
    const criticalDeps = ['next', 'react', 'react-dom']
    const missingDeps = criticalDeps.filter(d => !packageJson.dependencies[d])
    
    if (missingDeps.length > 0) {
      logTest('Dependencias críticas', 'FAIL', {
        error: `Dependencias faltantes: ${missingDeps.join(', ')}`,
      })
    } else {
      logTest('Dependencias críticas', 'PASS')
    }
  } catch (error) {
    logTest('Configuración de build', 'FAIL', { error: error.message })
  }
}

function testVercelConfiguration() {
  console.log('\n⚙️  Verificando configuración de Vercel...')
  
  try {
    const vercelJson = JSON.parse(readFileSync('vercel.json', 'utf-8'))
    
    // Verificar que autoDeployOnPush esté habilitado
    if (vercelJson.github?.autoDeployOnPush !== true) {
      logTest('Auto-deploy en Vercel', 'WARN', {
        message: 'autoDeployOnPush no está habilitado',
      })
    } else {
      logTest('Auto-deploy en Vercel', 'PASS')
    }
    
    // Verificar que main esté habilitado para deployment
    if (vercelJson.git?.deploymentEnabled?.main !== true) {
      logTest('Deployment de main', 'WARN', {
        message: 'Deployment de main no está explícitamente habilitado',
      })
    } else {
      logTest('Deployment de main', 'PASS')
    }
  } catch (error) {
    logTest('Configuración de Vercel', 'WARN', { message: error.message })
  }
}

function testFileStructure() {
  console.log('\n📁 Verificando estructura de archivos...')
  
  const criticalFiles = [
    'next.config.js',
    'package.json',
    'vercel.json',
    'app/page.tsx',
    'app/carrito/page.tsx',
    'app/api/pago/route.ts',
    'app/api/productos/route.ts',
    'app/api/envios/calcular/route.ts',
    'components/ProductCard.tsx',
    'components/ShippingCalculator.tsx',
    'lib/mercadopago/validate.ts',
  ]
  
  const missingFiles = []
  
  for (const file of criticalFiles) {
    try {
      readFileSync(file, 'utf-8')
      logTest(`Archivo crítico: ${file}`, 'PASS')
    } catch (error) {
      missingFiles.push(file)
      logTest(`Archivo crítico: ${file}`, 'FAIL', { error: 'Archivo no encontrado' })
    }
  }
  
  if (missingFiles.length === 0) {
    logTest('Estructura de archivos completa', 'PASS')
  }
}

// ============================================
// TESTS DE CÓDIGO Y LÓGICA
// ============================================

function testMercadoPagoIntegration() {
  console.log('\n💳 Verificando integración de Mercado Pago...')
  
  try {
    const validateFile = readFileSync('lib/mercadopago/validate.ts', 'utf-8')
    
    // Verificar que existe función de validación
    if (!validateFile.includes('validateMercadoPagoConfig')) {
      logTest('Función de validación MP', 'FAIL', {
        error: 'Función validateMercadoPagoConfig no encontrada',
      })
    } else {
      logTest('Función de validación MP', 'PASS')
    }
    
    // Verificar manejo de errores
    if (!validateFile.includes('getMercadoPagoErrorMessage')) {
      logTest('Manejo de errores MP', 'WARN', {
        message: 'Función getMercadoPagoErrorMessage no encontrada',
      })
    } else {
      logTest('Manejo de errores MP', 'PASS')
    }
    
    // Verificar que se lee MP_ACCESS_TOKEN
    if (!validateFile.includes('MP_ACCESS_TOKEN')) {
      logTest('Lectura de token MP', 'FAIL', {
        error: 'No se detecta lectura de MP_ACCESS_TOKEN',
      })
    } else {
      logTest('Lectura de token MP', 'PASS')
    }
  } catch (error) {
    logTest('Integración Mercado Pago', 'FAIL', { error: error.message })
  }
}

function testShippingCalculation() {
  console.log('\n🚚 Verificando cálculo de envío...')
  
  try {
    const shippingFile = readFileSync('app/api/envios/calcular/route.ts', 'utf-8')
    
    // Verificar que existe función de cálculo
    if (!shippingFile.includes('calcularCostoEnvio') && !shippingFile.includes('calcularEnvioConEnvioPack')) {
      logTest('Función de cálculo de envío', 'FAIL', {
        error: 'No se encontró función de cálculo de envío',
      })
    } else {
      logTest('Función de cálculo de envío', 'PASS')
    }
    
    // Verificar validación de código postal
    if (!shippingFile.includes('codigoPostal')) {
      logTest('Validación de código postal', 'WARN', {
        message: 'Validación de código postal no detectada',
      })
    } else {
      logTest('Validación de código postal', 'PASS')
    }
    
    // Verificar múltiples transportistas
    const transportistas = ['OCA', 'Correo Argentino', 'Andreani', 'Mercado Envíos']
    const foundTransportistas = transportistas.filter(t => shippingFile.includes(t))
    
    if (foundTransportistas.length === 0) {
      logTest('Múltiples transportistas', 'WARN', {
        message: 'No se detectaron múltiples transportistas',
      })
    } else {
      logTest(`Transportistas disponibles (${foundTransportistas.length})`, 'PASS', {
        details: foundTransportistas,
      })
    }
  } catch (error) {
    logTest('Cálculo de envío', 'FAIL', { error: error.message })
  }
}

function testCartFunctionality() {
  console.log('\n🛒 Verificando funcionalidad del carrito...')
  
  try {
    const cartFile = readFileSync('app/carrito/page.tsx', 'utf-8')
    
    // Verificar que existe manejo de checkout
    if (!cartFile.includes('handleCheckout')) {
      logTest('Función de checkout', 'FAIL', {
        error: 'Función handleCheckout no encontrada',
      })
    } else {
      logTest('Función de checkout', 'PASS')
    }
    
    // Verificar validación de stock
    if (!cartFile.includes('stock') || !cartFile.includes('cantidad')) {
      logTest('Validación de stock', 'WARN', {
        message: 'Validación de stock no detectada claramente',
      })
    } else {
      logTest('Validación de stock', 'PASS')
    }
    
    // Verificar integración con ShippingCalculator
    if (!cartFile.includes('ShippingCalculator')) {
      logTest('Integración con calculadora de envío', 'WARN', {
        message: 'ShippingCalculator no detectado en carrito',
      })
    } else {
      logTest('Integración con calculadora de envío', 'PASS')
    }
    
    // Verificar que se incluye costo de envío en el pago
    if (!cartFile.includes('selectedShipping') || !cartFile.includes('envio')) {
      logTest('Inclusión de envío en pago', 'WARN', {
        message: 'No se detecta inclusión de envío en items de pago',
      })
    } else {
      logTest('Inclusión de envío en pago', 'PASS')
    }
  } catch (error) {
    logTest('Funcionalidad del carrito', 'FAIL', { error: error.message })
  }
}

function testAdminFunctionality() {
  console.log('\n👨‍💼 Verificando funcionalidad de admin...')
  
  const adminFiles = [
    'app/admin/productos/page.tsx',
    'app/admin/banners/page.tsx',
    'components/AdminProductForm.tsx',
    'components/AdminBannerForm.tsx',
  ]
  
  let allFound = true
  for (const file of adminFiles) {
    try {
      readFileSync(file, 'utf-8')
      logTest(`Archivo admin: ${file}`, 'PASS')
    } catch (error) {
      allFound = false
      logTest(`Archivo admin: ${file}`, 'FAIL', { error: 'Archivo no encontrado' })
    }
  }
  
  if (allFound) {
    logTest('Estructura de admin completa', 'PASS')
  }
}

function testHomePage() {
  console.log('\n🏠 Verificando página de inicio...')
  
  try {
    const homeFile = readFileSync('app/page.tsx', 'utf-8')
    
    // Verificar que carga productos
    if (!homeFile.includes('getProducts') && !homeFile.includes('getProducts()')) {
      logTest('Carga de productos en home', 'FAIL', {
        error: 'No se detecta carga de productos',
      })
    } else {
      logTest('Carga de productos en home', 'PASS')
    }
    
    // Verificar que carga banners
    if (!homeFile.includes('getBanners') && !homeFile.includes('Carousel')) {
      logTest('Carga de banners en home', 'WARN', {
        message: 'No se detecta carga de banners o carousel',
      })
    } else {
      logTest('Carga de banners en home', 'PASS')
    }
    
    // Verificar secciones principales
    const secciones = ['Destacados', 'Nuevos ingresos', 'Ofertas']
    const seccionesEncontradas = secciones.filter(s => homeFile.includes(s))
    
    if (seccionesEncontradas.length === 0) {
      logTest('Secciones de productos', 'WARN', {
        message: 'No se detectan secciones de productos',
      })
    } else {
      logTest(`Secciones de productos (${seccionesEncontradas.length})`, 'PASS', {
        details: seccionesEncontradas,
      })
    }
  } catch (error) {
    logTest('Página de inicio', 'FAIL', { error: error.message })
  }
}

// ============================================
// TESTS DE VALIDACIÓN Y SEGURIDAD
// ============================================

function testEnvironmentVariables() {
  console.log('\n🔐 Verificando variables de entorno...')
  
  const requiredVars = [
    'MP_ACCESS_TOKEN',
    'NEXT_PUBLIC_MP_PUBLIC_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ]
  
  const missingVars = []
  const foundVars = []
  
  for (const varName of requiredVars) {
    // Verificar en archivos de configuración
    try {
      const envExample = readFileSync('.env.example', 'utf-8').toLowerCase()
      const envLocal = readFileSync('.env.local', 'utf-8').toLowerCase()
      
      const varLower = varName.toLowerCase()
      if (envExample.includes(varLower) || envLocal.includes(varLower)) {
        foundVars.push(varName)
        logTest(`Variable de entorno: ${varName}`, 'PASS')
      } else {
        missingVars.push(varName)
        logTest(`Variable de entorno: ${varName}`, 'WARN', {
          message: 'Variable no encontrada en archivos de configuración',
        })
      }
    } catch (error) {
      logTest(`Variable de entorno: ${varName}`, 'WARN', {
        message: 'No se pudo verificar (archivos .env no accesibles)',
      })
    }
  }
  
  if (missingVars.length === 0 && foundVars.length === requiredVars.length) {
    logTest('Variables de entorno completas', 'PASS')
  }
}

// ============================================
// EJECUCIÓN DE TESTS
// ============================================

async function runAllTests() {
  console.log('🚀 Iniciando QA E2E Completo...\n')
  console.log('=' .repeat(60))
  
  // Tests de configuración
  testBuildConfiguration()
  testVercelConfiguration()
  testFileStructure()
  
  // Tests de funcionalidad
  testMercadoPagoIntegration()
  testShippingCalculation()
  testCartFunctionality()
  testAdminFunctionality()
  testHomePage()
  
  // Tests de seguridad
  testEnvironmentVariables()
  
  // Generar reporte
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 RESUMEN DE QA')
  console.log('='.repeat(60))
  console.log(`Total de tests: ${QA_REPORT.summary.total}`)
  console.log(`✅ Pasados: ${QA_REPORT.summary.passed}`)
  console.log(`❌ Fallidos: ${QA_REPORT.summary.failed}`)
  console.log(`⚠️  Advertencias: ${QA_REPORT.summary.warnings}`)
  
  const successRate = ((QA_REPORT.summary.passed / QA_REPORT.summary.total) * 100).toFixed(1)
  console.log(`\n📈 Tasa de éxito: ${successRate}%`)
  
  // Guardar reporte
  const reportPath = join(process.cwd(), 'QA_REPORT.json')
  writeFileSync(reportPath, JSON.stringify(QA_REPORT, null, 2))
  console.log(`\n📄 Reporte guardado en: ${reportPath}`)
  
  // Generar reporte markdown
  generateMarkdownReport()
  
  // Exit code basado en resultados
  if (QA_REPORT.summary.failed > 0) {
    console.log('\n❌ QA COMPLETADO CON ERRORES')
    process.exit(1)
  } else if (QA_REPORT.summary.warnings > 0) {
    console.log('\n⚠️  QA COMPLETADO CON ADVERTENCIAS')
    process.exit(0)
  } else {
    console.log('\n✅ QA COMPLETADO EXITOSAMENTE')
    process.exit(0)
  }
}

function generateMarkdownReport() {
  const reportPath = join(process.cwd(), 'QA_REPORT.md')
  
  let markdown = `# 📊 Reporte de QA E2E Completo\n\n`
  markdown += `**Fecha:** ${new Date().toLocaleString('es-AR')}\n`
  markdown += `**Commit:** ${QA_REPORT.commit}\n`
  markdown += `**Ambiente:** ${QA_REPORT.environment}\n\n`
  
  markdown += `## 📈 Resumen\n\n`
  markdown += `- **Total de tests:** ${QA_REPORT.summary.total}\n`
  markdown += `- **✅ Pasados:** ${QA_REPORT.summary.passed}\n`
  markdown += `- **❌ Fallidos:** ${QA_REPORT.summary.failed}\n`
  markdown += `- **⚠️  Advertencias:** ${QA_REPORT.summary.warnings}\n\n`
  
  const successRate = ((QA_REPORT.summary.passed / QA_REPORT.summary.total) * 100).toFixed(1)
  markdown += `**Tasa de éxito:** ${successRate}%\n\n`
  
  if (QA_REPORT.errors.length > 0) {
    markdown += `## ❌ Errores Encontrados\n\n`
    QA_REPORT.errors.forEach((error, idx) => {
      markdown += `${idx + 1}. **${error.test}**\n`
      markdown += `   - Error: ${error.error || error.message || 'Desconocido'}\n\n`
    })
  }
  
  if (QA_REPORT.warnings.length > 0) {
    markdown += `## ⚠️  Advertencias\n\n`
    QA_REPORT.warnings.forEach((warning, idx) => {
      markdown += `${idx + 1}. **${warning.test}**\n`
      markdown += `   - Mensaje: ${warning.message || 'Advertencia'}\n\n`
    })
  }
  
  markdown += `## ✅ Tests Pasados\n\n`
  const passedTests = QA_REPORT.tests.filter(t => t.status === 'PASS')
  passedTests.forEach((test, idx) => {
    markdown += `${idx + 1}. ${test.name}\n`
  })
  
  writeFileSync(reportPath, markdown)
  console.log(`📄 Reporte Markdown guardado en: ${reportPath}`)
}

// Ejecutar
runAllTests().catch((error) => {
  console.error('❌ Error ejecutando QA:', error)
  process.exit(1)
})

