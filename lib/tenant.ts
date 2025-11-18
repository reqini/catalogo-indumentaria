/**
 * Utilidades para manejo de tenants
 * Actualizado para usar Supabase
 */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { getTenantById, checkPlanLimits } from './supabase-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TenantContext {
  tenantId: string
  plan: 'free' | 'pro' | 'premium'
  activo: boolean
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    font?: string
    coverImage?: string
  }
}

/**
 * Obtiene el tenantId desde el JWT token
 */
export async function getTenantFromToken(token: string): Promise<TenantContext | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded.tenantId) {
      return null
    }

    const tenant = await getTenantById(decoded.tenantId)

    if (!tenant || !tenant.activo) {
      return null
    }

    return {
      tenantId: tenant.tenant_id,
      plan: tenant.plan as 'free' | 'pro' | 'premium',
      activo: tenant.activo,
      branding: tenant.branding as any,
    }
  } catch (error) {
    return null
  }
}

/**
 * Verifica los límites del plan del tenant
 */
export async function checkPlanLimits(
  tenantId: string,
  resource: 'productos' | 'banners'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  return await checkPlanLimitsFromHelpers(tenantId, resource)
}

/**
 * Obtiene el tenantId desde el path (ej: /[tenant]/catalogo)
 */
export async function getTenantFromPath(
  tenantSlug: string
): Promise<TenantContext | null> {
  // Buscar por subdomain o tenantId
  const { supabaseAdmin } = await import('./supabase')
  
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('tenant_id, plan, activo, branding')
    .or(`subdomain.eq.${tenantSlug},tenant_id.eq.${tenantSlug}`)
    .eq('activo', true)
    .single()

  if (!tenant) {
    return null
  }

  return {
    tenantId: tenant.tenant_id,
    plan: tenant.plan as 'free' | 'pro' | 'premium',
    activo: tenant.activo,
    branding: tenant.branding as any,
  }
}

/**
 * Obtiene información del tenant desde el request
 */
export async function getTenantFromRequest(request: NextRequest): Promise<TenantContext | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  return await getTenantFromToken(token)
}
