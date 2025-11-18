/**
 * Utilidades para manejo de tenants
 */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import Tenant from '@/models/Tenant'
import connectDB from '@/lib/mongodb'

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

    await connectDB()
    const tenant = await Tenant.findOne({ tenantId: decoded.tenantId }).lean()

    if (!tenant || !tenant.activo) {
      return null
    }

    return {
      tenantId: tenant.tenantId,
      plan: tenant.plan,
      activo: tenant.activo,
      branding: tenant.branding,
    }
  } catch (error) {
    return null
  }
}

/**
 * Obtiene el tenantId desde el request (JWT o subdominio)
 */
export async function getTenantFromRequest(
  request: NextRequest
): Promise<TenantContext | null> {
  // Intentar desde JWT token
  const token = request.cookies.get('token')?.value
  if (token) {
    const tenant = await getTenantFromToken(token)
    if (tenant) {
      return tenant
    }
  }

  // Intentar desde subdominio
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0]

  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    await connectDB()
    const tenant = await Tenant.findOne({ subdomain, activo: true }).lean()

    if (tenant) {
      return {
        tenantId: tenant.tenantId,
        plan: tenant.plan,
        activo: tenant.activo,
        branding: tenant.branding,
      }
    }
  }

  return null
}

/**
 * Obtiene el tenantId desde el path (ej: /[tenant]/catalogo)
 */
export async function getTenantFromPath(
  tenantSlug: string
): Promise<TenantContext | null> {
  await connectDB()

  // Buscar por subdomain o tenantId
  const tenant = await Tenant.findOne({
    $or: [{ subdomain: tenantSlug }, { tenantId: tenantSlug }],
    activo: true,
  }).lean()

  if (tenant) {
    return {
      tenantId: tenant.tenantId,
      plan: tenant.plan,
      activo: tenant.activo,
      branding: tenant.branding,
    }
  }

  return null
}

/**
 * Verifica límites según el plan
 */
export async function checkPlanLimits(
  tenantId: string,
  type: 'productos' | 'banners'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  await connectDB()

  const tenant = await Tenant.findOne({ tenantId }).lean()
  if (!tenant) {
    return { allowed: false, current: 0, limit: 0 }
  }

  const Plan = (await import('@/models/Plan')).default
  const plan = await Plan.findOne({ nombre: tenant.plan }).lean()

  if (!plan) {
    return { allowed: false, current: 0, limit: 0 }
  }

  let current = 0
  if (type === 'productos') {
    const Producto = (await import('@/models/Producto')).default
    current = await Producto.countDocuments({ tenantId, activo: true })
  } else if (type === 'banners') {
    const Banner = (await import('@/models/Banner')).default
    current = await Banner.countDocuments({ tenantId, activo: true })
  }

  const limit = type === 'productos' ? plan.limiteProductos : plan.limiteBanners

  return {
    allowed: current < limit,
    current,
    limit,
  }
}

