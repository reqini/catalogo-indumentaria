/**
 * Validación robusta de credenciales de Mercado Pago
 */

export interface MercadoPagoConfig {
  accessToken: string | undefined
  publicKey: string | undefined
  isProduction: boolean
  isValid: boolean
  errors: string[]
}

/**
 * Valida las credenciales de Mercado Pago
 *
 * CRÍTICO: Esta función NO debe romper el build si falta el token.
 * Solo valida y reporta errores, pero permite que el código continúe.
 */
export function validateMercadoPagoConfig(): MercadoPagoConfig {
  // CRÍTICO: Leer variables de entorno en runtime, no al cargar módulo
  // Usar múltiples formas de lectura para asegurar compatibilidad
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env['MP_ACCESS_TOKEN']
  const publicKey =
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || process.env['NEXT_PUBLIC_MP_PUBLIC_KEY']

  const VERCEL_ENV = process.env.VERCEL_ENV || 'local'
  const NODE_ENV = process.env.NODE_ENV || 'development'
  const IS_VERCEL = !!process.env.VERCEL

  // Logs de diagnóstico SIEMPRE cuando falta el token (incluso en producción)
  if (!accessToken) {
    console.error('[MP-VALIDATE] ❌ MP_ACCESS_TOKEN NO ENCONTRADO')
    console.error('[MP-VALIDATE] ==========================================')
    console.error('[MP-VALIDATE] Entorno:', NODE_ENV)
    console.error('[MP-VALIDATE] VERCEL_ENV:', VERCEL_ENV)
    console.error('[MP-VALIDATE] VERCEL:', IS_VERCEL ? 'SÍ' : 'NO')
    console.error('[MP-VALIDATE] VERCEL_URL:', process.env.VERCEL_URL || 'no definido')

    // Listar TODAS las variables que contienen "MP" para debugging
    const mpRelatedVars = Object.keys(process.env).filter(
      (key) => key.toUpperCase().includes('MP') || key.toUpperCase().includes('MERCADO')
    )

    if (mpRelatedVars.length > 0) {
      console.warn('[MP-VALIDATE] ⚠️ Variables relacionadas encontradas:', mpRelatedVars.length)
      mpRelatedVars.forEach((key) => {
        const value = process.env[key]
        console.warn(
          `[MP-VALIDATE]   - ${key}: ${value ? `${value.substring(0, 20)}...` : 'undefined'}`
        )
      })
      console.warn('[MP-VALIDATE] ⚠️ Pero MP_ACCESS_TOKEN específicamente NO está presente')
      console.warn('[MP-VALIDATE] ⚠️ Verifica que el nombre sea exactamente: MP_ACCESS_TOKEN')
    } else {
      console.error('[MP-VALIDATE] ❌ No se encontraron variables relacionadas con MP')
      console.error('[MP-VALIDATE] ❌ Esto significa que las variables NO están disponibles')
      console.error('[MP-VALIDATE] ❌ Posibles causas:')
      console.error('[MP-VALIDATE]    1. Variables no agregadas en Vercel Dashboard')
      console.error('[MP-VALIDATE]    2. Variables agregadas pero NO se hizo REDEPLOY')
      console.error('[MP-VALIDATE]    3. Variables en entorno incorrecto (Preview vs Production)')
      console.error('[MP-VALIDATE]    4. Nombre de variable incorrecto')
    }
    console.error('[MP-VALIDATE] ==========================================')
  } else {
    // Log solo en desarrollo cuando el token está presente
    const isDevelopment = NODE_ENV === 'development' || !IS_VERCEL
    if (isDevelopment) {
      console.log('[MP-VALIDATE] ✅ MP_ACCESS_TOKEN encontrado')
      console.log('[MP-VALIDATE]   - Longitud:', accessToken.length)
      console.log('[MP-VALIDATE]   - Empieza con:', accessToken.substring(0, 15) + '...')
    }
  }

  const errors: string[] = []
  let isProduction = false
  let isValid = false

  // Validar Access Token
  if (!accessToken) {
    errors.push('MP_ACCESS_TOKEN no está configurado')
  } else if (accessToken === 'TEST-xxxxxxxxxxxxxxxxxxxx' || accessToken.includes('xxxxx')) {
    errors.push('MP_ACCESS_TOKEN es un placeholder, debe ser reemplazado por un token real')
  } else if (accessToken.startsWith('TEST-')) {
    // Token de TEST es válido para desarrollo
    isProduction = false
    // CRÍTICO: Solo marcar error si estamos en producción real de Vercel
    // No marcar error si estamos en preview o development
    const isVercelProduction = process.env.VERCEL_ENV === 'production'
    const isNodeProduction = process.env.NODE_ENV === 'production'

    if (isVercelProduction && isNodeProduction) {
      errors.push(
        'MP_ACCESS_TOKEN es de TEST pero estamos en producción. Se requiere token de PRODUCCIÓN'
      )
    }
  } else if (accessToken.startsWith('APP_USR-') || accessToken.length > 50) {
    // Token de producción válido
    isProduction = true
  } else {
    errors.push('MP_ACCESS_TOKEN tiene formato inválido')
  }

  // Validar Public Key (opcional pero recomendado)
  // CRÍTICO: No marcar como error crítico, solo warning
  if (!publicKey) {
    // No agregar a errors, solo loggear
    console.warn(
      '[MP-VALIDATE] NEXT_PUBLIC_MP_PUBLIC_KEY no está configurado (recomendado para frontend)'
    )
  } else if (publicKey === 'TEST-xxxxxxxxxxxxxxxxxxxx' || publicKey.includes('xxxxx')) {
    // No agregar a errors críticos, solo warning
    console.warn('[MP-VALIDATE] NEXT_PUBLIC_MP_PUBLIC_KEY es un placeholder')
  }

  // Determinar si es válido
  // CRÍTICO: Considerar válido si tiene accessToken aunque tenga warnings
  isValid = !!accessToken && accessToken.length > 20 && !accessToken.includes('xxxxx')

  return {
    accessToken,
    publicKey,
    isProduction,
    isValid,
    errors,
  }
}

/**
 * Obtiene mensaje de error amigable para el usuario
 */
export function getMercadoPagoErrorMessage(config: MercadoPagoConfig): string {
  if (config.isValid) {
    return ''
  }

  if (config.errors.length === 0) {
    return 'Mercado Pago no está configurado correctamente'
  }

  const mainError = config.errors[0]

  if (mainError.includes('no está configurado')) {
    return `Mercado Pago no está configurado. ${mainError}. Por favor, configura las variables de entorno en .env.local (local) o Vercel (producción).`
  }

  if (mainError.includes('placeholder')) {
    return `Mercado Pago tiene valores de ejemplo. ${mainError}. Por favor, reemplaza con credenciales reales de Mercado Pago.`
  }

  if (mainError.includes('TEST') && mainError.includes('producción')) {
    return 'Mercado Pago está usando token de TEST en producción. Se requiere token de PRODUCCIÓN. Obtén uno en https://www.mercadopago.com.ar/developers/panel'
  }

  return `Error en configuración de Mercado Pago: ${mainError}`
}
