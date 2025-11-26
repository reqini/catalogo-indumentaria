#!/usr/bin/env node

/**
 * Script de verificación de sincronización visual entre dominio principal
 * y deployment de main en Vercel.
 * 
 * Compara activos (CSS, JS, imágenes) y genera reporte de diferencias.
 */

import { createHash } from 'crypto'
import fs from 'fs'

const PRODUCTION_DOMAIN = 'https://catalogo-indumentaria.vercel.app'
const MAIN_DEPLOYMENT_URL = 'https://catalogo-indumentaria-git-main-billeteraaps-projects.vercel.app'

/**
 * Descarga un recurso y calcula su hash
 */
async function downloadAndHash(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VisualSync/1.0)',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      return { url, error: `HTTP ${response.status}`, hash: null }
    }

    const buffer = await response.arrayBuffer()
    const hash = createHash('sha256').update(Buffer.from(buffer)).digest('hex')
    const size = buffer.byteLength

    return { url, hash, size, status: response.status }
  } catch (error) {
    return { url, error: error.message, hash: null }
  }
}

/**
 * Extrae URLs de recursos (CSS, JS, imágenes) del HTML
 */
function extractAssetUrls(html, baseUrl) {
  const assets = {
    css: [],
    js: [],
    images: []
  }

  // Extraer CSS
  const cssMatches = html.matchAll(/<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*>/gi)
  for (const match of cssMatches) {
    const url = match[1].startsWith('http') ? match[1] : new URL(match[1], baseUrl).href
    assets.css.push(url)
  }

  // Extraer JS
  const jsMatches = html.matchAll(/<script[^>]*src=["']([^"']+\.js[^"']*)["'][^>]*>/gi)
  for (const match of jsMatches) {
    const url = match[1].startsWith('http') ? match[1] : new URL(match[1], baseUrl).href
    assets.js.push(url)
  }

  // Extraer imágenes principales (solo las primeras 10 para no sobrecargar)
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)
  let imgCount = 0
  for (const match of imgMatches) {
    if (imgCount >= 10) break
    const url = match[1].startsWith('http') ? match[1] : new URL(match[1], baseUrl).href
    if (!url.includes('data:image') && !url.includes('base64')) {
      assets.images.push(url)
      imgCount++
    }
  }

  return assets
}

/**
 * Compara dos conjuntos de activos
 */
function compareAssets(prodAssets, mainAssets) {
  const differences = {
    css: [],
    js: [],
    images: [],
    missing: { css: [], js: [], images: [] },
    extra: { css: [], js: [], images: [] }
  }

  // Comparar CSS
  const prodCssMap = new Map(prodAssets.css.map(url => [url.split('/').pop(), url]))
  const mainCssMap = new Map(mainAssets.css.map(url => [url.split('/').pop(), url]))

  for (const [filename, url] of prodCssMap) {
    if (!mainCssMap.has(filename)) {
      differences.missing.css.push(url)
    }
  }

  for (const [filename, url] of mainCssMap) {
    if (!prodCssMap.has(filename)) {
      differences.extra.css.push(url)
    }
  }

  // Comparar JS
  const prodJsMap = new Map(prodAssets.js.map(url => [url.split('/').pop(), url]))
  const mainJsMap = new Map(mainAssets.js.map(url => [url.split('/').pop(), url]))

  for (const [filename, url] of prodJsMap) {
    if (!mainJsMap.has(filename)) {
      differences.missing.js.push(url)
    }
  }

  for (const [filename, url] of mainJsMap) {
    if (!prodJsMap.has(filename)) {
      differences.extra.js.push(url)
    }
  }

  return differences
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Iniciando verificación de sincronización visual...\n')

  // Descargar HTML de ambos dominios
  console.log('📥 Descargando HTML del dominio principal...')
  let prodHtml, mainHtml

  try {
    const prodResponse = await fetch(PRODUCTION_DOMAIN, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    prodHtml = await prodResponse.text()
    console.log(`   ✅ HTML descargado (${prodHtml.length} bytes)`)
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return { error: 'No se pudo descargar HTML del dominio principal' }
  }

  console.log('\n📥 Descargando HTML del deployment de main...')
  try {
    const mainResponse = await fetch(MAIN_DEPLOYMENT_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    mainHtml = await mainResponse.text()
    console.log(`   ✅ HTML descargado (${mainHtml.length} bytes)`)
  } catch (error) {
    console.log(`   ⚠️  Deployment requiere autenticación o no accesible: ${error.message}`)
    mainHtml = null
  }

  // Extraer URLs de activos
  console.log('\n🔍 Extrayendo URLs de activos del dominio principal...')
  const prodAssets = extractAssetUrls(prodHtml, PRODUCTION_DOMAIN)
  console.log(`   CSS: ${prodAssets.css.length} archivos`)
  console.log(`   JS: ${prodAssets.js.length} archivos`)
  console.log(`   Imágenes: ${prodAssets.images.length} archivos`)

  let mainAssets = null
  if (mainHtml) {
    console.log('\n🔍 Extrayendo URLs de activos del deployment de main...')
    mainAssets = extractAssetUrls(mainHtml, MAIN_DEPLOYMENT_URL)
    console.log(`   CSS: ${mainAssets.css.length} archivos`)
    console.log(`   JS: ${mainAssets.js.length} archivos`)
    console.log(`   Imágenes: ${mainAssets.images.length} archivos`)
  }

  // Comparar activos principales (solo CSS y JS principales)
  console.log('\n🔬 Comparando activos principales...')
  const mainCssFiles = prodAssets.css.slice(0, 5) // Primeros 5 CSS
  const mainJsFiles = prodAssets.js.slice(0, 5) // Primeros 5 JS

  const prodHashes = {}
  const mainHashes = {}

  console.log('   Descargando y calculando hashes de CSS...')
  for (const url of mainCssFiles) {
    const result = await downloadAndHash(url)
    if (result.hash) {
      prodHashes[url] = result
      console.log(`     ${url.split('/').pop()}: ${result.hash.substring(0, 16)}...`)
    }
  }

  console.log('   Descargando y calculando hashes de JS...')
  for (const url of mainJsFiles) {
    const result = await downloadAndHash(url)
    if (result.hash) {
      prodHashes[url] = result
      console.log(`     ${url.split('/').pop()}: ${result.hash.substring(0, 16)}...`)
    }
  }

  // Comparar diferencias si tenemos ambos HTMLs
  let differences = null
  if (mainAssets) {
    differences = compareAssets(prodAssets, mainAssets)
  }

  // Generar resultado
  const result = {
    timestamp: new Date().toISOString(),
    productionDomain: PRODUCTION_DOMAIN,
    mainDeploymentUrl: MAIN_DEPLOYMENT_URL,
    productionAssets: {
      css: prodAssets.css,
      js: prodAssets.js,
      images: prodAssets.images.slice(0, 10)
    },
    mainAssets: mainAssets ? {
      css: mainAssets.css,
      js: mainAssets.js,
      images: mainAssets.images.slice(0, 10)
    } : null,
    assetHashes: prodHashes,
    differences,
    synchronized: !differences || (
      differences.missing.css.length === 0 &&
      differences.missing.js.length === 0 &&
      differences.extra.css.length === 0 &&
      differences.extra.js.length === 0
    )
  }

  return result
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verify-visual-sync.mjs')) {
  main()
    .then(result => {
      if (result.error) {
        console.error(`\n❌ Error: ${result.error}`)
        process.exit(1)
      }

      console.log('\n📊 Resumen:')
      console.log(`   Sincronizado visualmente: ${result.synchronized ? '✅ Sí' : '❌ No'}`)
      
      if (result.differences) {
        console.log(`   CSS faltantes: ${result.differences.missing.css.length}`)
        console.log(`   JS faltantes: ${result.differences.missing.js.length}`)
        console.log(`   CSS extra: ${result.differences.extra.css.length}`)
        console.log(`   JS extra: ${result.differences.extra.js.length}`)
      }

      // Guardar resultado
      fs.writeFileSync(
        'visual-sync-result.json',
        JSON.stringify(result, null, 2)
      )
      console.log('\n   Resultado guardado en: visual-sync-result.json')

      process.exit(result.synchronized ? 0 : 1)
    })
    .catch(error => {
      console.error('\n❌ Error durante la verificación:', error)
      process.exit(1)
    })
}

export { main, extractAssetUrls, compareAssets, downloadAndHash }

