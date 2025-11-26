#!/usr/bin/env node

/**
 * Script de verificación de configuración de producción
 * Verifica estado de Envíopack, Mercado Pago y Retiro en Local
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catalogo-indumentaria.vercel.app'

console.log('🔍 Verificando configuración de producción...\n')
console.log('URL Base:', BASE_URL)
console.log('='.repeat(60))

// Verificar endpoint de status si existe
async function verificarStatus() {
  try {
    const response = await fetch(`${BASE_URL}/status`)
    if (response.ok) {
      const data = await response.json()
      console.log('\n✅ Endpoint /status disponible')
      console.log('Estado:', JSON.stringify(data, null, 2))
      return data
    }
  } catch (error) {
    console.log('\n⚠️ Endpoint /status no disponible o error:', error.message)
  }
  return null
}

// Verificar configuración de Mercado Pago
async function verificarMercadoPago() {
  try {
    const response = await fetch(`${BASE_URL}/api/mp/verify-config`)
    if (response.ok) {
      const data = await response.json()
      console.log('\n📊 MERCADO PAGO:')
      console.log('  Estado:', data.isValid ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO')
      console.log('  Modo:', data.isProduction ? 'PRODUCCIÓN' : 'SANDBOX/TEST')
      console.log('  Token presente:', data.hasAccessToken ? '✅' : '❌')
      console.log('  Public Key presente:', data.hasPublicKey ? '✅' : '❌')
      if (data.errors && data.errors.length > 0) {
        console.log('  Errores:', data.errors.join(', '))
      }
      return data
    }
  } catch (error) {
    console.log('\n⚠️ No se pudo verificar Mercado Pago:', error.message)
  }
  return null
}

// Verificar cálculo de envío (para ver si Envíopack está configurado)
async function verificarEnvioPack() {
  try {
    const response = await fetch(`${BASE_URL}/api/envios/calcular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigoPostal: 'C1000',
        peso: 1,
        precio: 10000,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('\n📦 ENVÍOPACK:')
      
      // Verificar si los métodos tienen transportista real o son simulados
      const metodos = data.metodos || []
      const tieneEnvioPackReal = metodos.some(m => 
        m.transportista && 
        (m.transportista.includes('Envíopack') || m.nombre.includes('Envíopack'))
      )
      
      if (tieneEnvioPackReal) {
        console.log('  Estado: ✅ CONFIGURADO (usando API real)')
      } else {
        console.log('  Estado: ⚠️ SIMULADO (no hay credenciales configuradas)')
        console.log('  Métodos disponibles:', metodos.length)
        console.log('  Transportistas:', metodos.map(m => m.transportista || m.nombre).join(', '))
      }
      
      return { configurado: tieneEnvioPackReal, metodos }
    }
  } catch (error) {
    console.log('\n⚠️ No se pudo verificar Envíopack:', error.message)
  }
  return null
}

// Verificar retiro en local
async function verificarRetiroLocal() {
  console.log('\n🏪 RETIRO EN LOCAL:')
  console.log('  Estado: ⚠️ Funcional pero requiere configuración de variables')
  console.log('  Variables requeridas:')
  console.log('    - LOCAL_RETIRO_DIRECCION')
  console.log('    - LOCAL_RETIRO_HORARIOS')
  console.log('    - LOCAL_RETIRO_TELEFONO')
  console.log('  Nota: Estas variables deben configurarse en Vercel Dashboard')
}

// Función principal
async function main() {
  console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN\n')
  
  await verificarStatus()
  await verificarMercadoPago()
  await verificarEnvioPack()
  await verificarRetiroLocal()
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 RESUMEN:')
  console.log('\nPara verificar completamente:')
  console.log('1. Revisa los logs de Vercel para ver si las variables están presentes')
  console.log('2. Verifica en Vercel Dashboard → Settings → Environment Variables')
  console.log('3. Asegúrate de que las variables estén en el entorno correcto (Production)')
  console.log('4. Si agregaste variables nuevas, haz REDEPLOY')
  console.log('\n✅ Verificación completada\n')
}

main().catch(console.error)

