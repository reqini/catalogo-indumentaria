#!/usr/bin/env node

/**
 * Script para verificar que el dominio principal de producción
 * está apuntando al deploy más reciente de main
 */

import { execSync } from 'child_process'

const DOMAIN_PRINCIPAL = 'https://catalogo-indumentaria.vercel.app'
const GITHUB_REPO = 'reqini/catalogo-indumentaria'

console.log('🔍 Verificando estado de deploy en producción...\n')

try {
  // Obtener último commit en main local
  const lastCommitLocal = execSync('git log main --oneline -1', { encoding: 'utf-8' }).trim()
  const commitHash = lastCommitLocal.split(' ')[0]
  
  console.log(`📦 Commit local más reciente: ${lastCommitLocal}`)
  console.log(`🔗 Hash: ${commitHash}\n`)

  // Verificar versión en dominio principal
  console.log(`🌐 Verificando dominio principal: ${DOMAIN_PRINCIPAL}`)
  
  try {
    const response = await fetch(DOMAIN_PRINCIPAL)
    const html = await response.text()
    
    // Buscar versión en el HTML (formato: v903d85b o Build: 903d85b)
    const versionMatch = html.match(/v([0-9a-f]{7})|Build:\s*([0-9a-f]{7})/i)
    
    if (versionMatch) {
      const deployedVersion = versionMatch[1] || versionMatch[2]
      console.log(`✅ Versión desplegada en producción: v${deployedVersion}`)
      
      if (deployedVersion === commitHash.substring(0, 7)) {
        console.log(`\n✅ ✅ ✅ Sincronizado: El dominio principal está en la versión más reciente`)
      } else {
        console.log(`\n⚠️ ⚠️ ⚠️ DESINCRONIZADO: El dominio principal está en una versión antigua`)
        console.log(`   Esperado: ${commitHash.substring(0, 7)}`)
        console.log(`   Actual: ${deployedVersion}`)
        console.log(`\n💡 Solución: Hacer redeploy desde main`)
      }
    } else {
      console.log(`⚠️ No se pudo detectar versión en la página`)
    }
  } catch (error) {
    console.error(`❌ Error al verificar dominio: ${error.message}`)
  }

  console.log(`\n📋 Resumen:`)
  console.log(`   - Dominio: ${DOMAIN_PRINCIPAL}`)
  console.log(`   - Commit esperado: ${commitHash}`)
  console.log(`   - Branch: main`)
  console.log(`\n🚀 Para forzar redeploy:`)
  console.log(`   git commit --allow-empty -m "chore: redeploy producción"`)
  console.log(`   git push origin main`)

} catch (error) {
  console.error(`❌ Error: ${error.message}`)
  process.exit(1)
}

