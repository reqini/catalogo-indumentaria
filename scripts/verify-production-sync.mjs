#!/usr/bin/env node

/**
 * Script de verificación de sincronización entre dominio principal
 * y deployment de main en Vercel.
 * 
 * Compara el contenido de ambas URLs y valida que apunten a la misma versión.
 */

// Usar fetch nativo de Node.js 18+ (no requiere import)

const PRODUCTION_DOMAIN = 'https://catalogo-indumentaria.vercel.app'
const MAIN_DEPLOYMENT_URL = 'https://catalogo-indumentaria-git-main-billeteraaps-projects.vercel.app'

/**
 * Extrae información técnica de una URL
 */
async function extractBuildInfo(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductionSync/1.0)'
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Intentar extraer build ID desde meta tags o comentarios HTML
    const buildIdMatch = html.match(/build[_-]?id["\s:=]+([a-f0-9]{7,40})/i) ||
                        html.match(/<!--\s*build[:\s]+([a-f0-9]{7,40})\s*-->/i) ||
                        html.match(/data-build-id=["']([^"']+)["']/i)
    
    // Intentar extraer commit hash
    const commitMatch = html.match(/commit[_-]?hash["\s:=]+([a-f0-9]{7,40})/i) ||
                       html.match(/<!--\s*commit[:\s]+([a-f0-9]{7,40})\s*-->/i) ||
                       html.match(/data-commit=["']([^"']+)["']/i)
    
    // Generar fingerprint del contenido (primeros 1000 caracteres del body)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]{1,1000})/i)
    const fingerprint = bodyMatch 
      ? Buffer.from(bodyMatch[1]).toString('base64').substring(0, 100)
      : Buffer.from(html.substring(0, 500)).toString('base64').substring(0, 100)
    
    // Extraer timestamp de headers
    const lastModified = response.headers.get('last-modified') || 
                         response.headers.get('date') || 
                         'unknown'
    
    return {
      url,
      buildId: buildIdMatch ? buildIdMatch[1] : 'not-found',
      commitHash: commitMatch ? commitMatch[1] : 'not-found',
      fingerprint,
      timestamp: lastModified,
      status: response.status,
      contentLength: html.length,
      headers: {
        'x-vercel-id': response.headers.get('x-vercel-id') || 'not-found',
        'x-vercel-deployment-url': response.headers.get('x-vercel-deployment-url') || 'not-found'
      }
    }
  } catch (error) {
    return {
      url,
      error: error.message,
      buildId: 'error',
      commitHash: 'error',
      fingerprint: 'error',
      timestamp: new Date().toISOString(),
      status: 'error'
    }
  }
}

/**
 * Compara dos builds y determina si están sincronizados
 */
function compareBuilds(refBuild, mainBuild) {
  const comparison = {
    synchronized: false,
    differences: [],
    warnings: []
  }

  // Comparar fingerprints
  if (refBuild.fingerprint !== mainBuild.fingerprint) {
    comparison.differences.push('fingerprint')
  }

  // Comparar commit hash si está disponible
  if (refBuild.commitHash !== 'not-found' && mainBuild.commitHash !== 'not-found') {
    if (refBuild.commitHash !== mainBuild.commitHash) {
      comparison.differences.push('commit-hash')
    }
  }

  // Comparar build ID si está disponible
  if (refBuild.buildId !== 'not-found' && mainBuild.buildId !== 'not-found') {
    if (refBuild.buildId !== mainBuild.buildId) {
      comparison.differences.push('build-id')
    }
  }

  // Comparar headers de Vercel
  if (refBuild.headers['x-vercel-id'] !== 'not-found' && 
      mainBuild.headers['x-vercel-id'] !== 'not-found') {
    if (refBuild.headers['x-vercel-id'] !== mainBuild.headers['x-vercel-id']) {
      comparison.differences.push('vercel-id')
    }
  }

  // Si no hay diferencias críticas, considerar sincronizado
  if (comparison.differences.length === 0) {
    comparison.synchronized = true
  } else {
    // Si solo hay diferencia en fingerprint pero los IDs coinciden, es warning
    if (comparison.differences.length === 1 && comparison.differences[0] === 'fingerprint') {
      comparison.warnings.push('Fingerprint diferente pero IDs coinciden - posible diferencia menor en contenido')
    }
  }

  return comparison
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Iniciando verificación de sincronización de producción...\n')

  console.log('📦 Extrayendo información del deployment de main...')
  const mainBuild = await extractBuildInfo(MAIN_DEPLOYMENT_URL)
  console.log(`   URL: ${mainBuild.url}`)
  console.log(`   Build ID: ${mainBuild.buildId}`)
  console.log(`   Commit Hash: ${mainBuild.commitHash}`)
  console.log(`   Timestamp: ${mainBuild.timestamp}`)
  console.log(`   Vercel ID: ${mainBuild.headers['x-vercel-id']}`)
  console.log(`   Status: ${mainBuild.status}\n`)

  console.log('🌐 Extrayendo información del dominio principal...')
  const productionBuild = await extractBuildInfo(PRODUCTION_DOMAIN)
  console.log(`   URL: ${productionBuild.url}`)
  console.log(`   Build ID: ${productionBuild.buildId}`)
  console.log(`   Commit Hash: ${productionBuild.commitHash}`)
  console.log(`   Timestamp: ${productionBuild.timestamp}`)
  console.log(`   Vercel ID: ${productionBuild.headers['x-vercel-id']}`)
  console.log(`   Status: ${productionBuild.status}\n`)

  console.log('🔬 Comparando builds...')
  const comparison = compareBuilds(productionBuild, mainBuild)

  if (comparison.synchronized) {
    console.log('✅ RESULTADO: Production domain synced')
    console.log('   Ambos deployments apuntan a la misma versión.\n')
  } else {
    console.log('❌ RESULTADO: Resync required')
    console.log(`   Diferencias detectadas: ${comparison.differences.join(', ')}\n`)
    
    if (comparison.warnings.length > 0) {
      comparison.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`)
      })
      console.log()
    }
  }

  // Generar resultado estructurado
  const result = {
    timestamp: new Date().toISOString(),
    productionDomain: PRODUCTION_DOMAIN,
    mainDeploymentUrl: MAIN_DEPLOYMENT_URL,
    productionBuild,
    mainBuild,
    comparison,
    synchronized: comparison.synchronized,
    actionRequired: !comparison.synchronized
  }

  return result
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verify-production-sync.mjs')) {
  main()
    .then(result => {
      console.log('\n📊 Resumen:')
      console.log(`   Sincronizado: ${result.synchronized ? '✅ Sí' : '❌ No'}`)
      console.log(`   Acción requerida: ${result.actionRequired ? 'Sí - Reasignar dominio' : 'No'}`)
      
      // Guardar resultado en JSON para uso posterior
      const fs = await import('fs')
      fs.writeFileSync(
        'production-sync-result.json',
        JSON.stringify(result, null, 2)
      )
      console.log('   Resultado guardado en: production-sync-result.json')
      
      process.exit(result.synchronized ? 0 : 1)
    })
    .catch(error => {
      console.error('\n❌ Error durante la verificación:', error)
      process.exit(1)
    })
}

export { main, extractBuildInfo, compareBuilds }

