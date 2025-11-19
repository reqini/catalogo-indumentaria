/**
 * Helpers para autenticación y manejo de tokens
 * Funciones reutilizables para obtener y validar tokens en API routes
 */

import { cookies } from 'next/headers'
import { getTenantFromToken } from './supabase-helpers'

export interface TokenResult {
  token: string
  source: 'header' | 'cookie'
}

/**
 * Obtiene el token de autenticación desde el header Authorization o cookies
 * Prioriza el header Authorization sobre las cookies
 */
export async function getAuthToken(request: Request): Promise<TokenResult | null> {
  // 1. Intentar obtener del header Authorization (prioridad)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    if (token) {
      return { token, source: 'header' }
    }
  }

  // 2. Si no está en el header, intentar obtener de cookies
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get('auth_token')?.value
    if (tokenCookie) {
      return { token: tokenCookie, source: 'cookie' }
    }
  } catch (error) {
    // En algunos contextos (edge runtime) cookies() puede fallar
    console.warn('Error obteniendo token de cookies:', error)
  }

  return null
}

/**
 * Obtiene el tenant desde el token (header o cookie)
 * Retorna null si no hay token válido
 */
export async function getTenantFromRequest(request: Request) {
  const tokenResult = await getAuthToken(request)
  
  if (!tokenResult) {
    return null
  }

  try {
    const tenant = await getTenantFromToken(tokenResult.token)
    return tenant
  } catch (error) {
    console.error('Error obteniendo tenant desde token:', error)
    return null
  }
}

/**
 * Valida que haya un token y retorna el tenant
 * Lanza error si no hay token o es inválido
 */
export async function requireAuth(request: Request) {
  const tokenResult = await getAuthToken(request)
  
  if (!tokenResult) {
    throw new Error('Token no proporcionado')
  }

  const tenant = await getTenantFromToken(tokenResult.token)
  
  if (!tenant) {
    throw new Error('Token inválido o expirado')
  }

  return { token: tokenResult.token, tenant }
}

