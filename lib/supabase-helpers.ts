/**
 * Helpers para trabajar con Supabase
 * Reemplaza las funciones de MongoDB/Mongoose
 */

import { supabaseAdmin } from './supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ==================== TENANTS ====================

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

export async function getTenantFromToken(token: string): Promise<TenantContext | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded.tenantId) {
      return null
    }

    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('tenant_id, plan, activo, branding')
      .eq('tenant_id', decoded.tenantId)
      .eq('activo', true)
      .single()

    if (error || !tenant) {
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

export async function getTenantById(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return null
  }

  return data
}

// ==================== PLAN LIMITS ====================

export async function checkPlanLimits(
  tenantId: string,
  resource: 'productos' | 'banners'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const tenant = await getTenantById(tenantId)
  if (!tenant) {
    return { allowed: false, current: 0, limit: 0 }
  }

  const { data: plan } = await supabaseAdmin
    .from('planes')
    .select('limite_productos, limite_banners')
    .eq('nombre', tenant.plan)
    .single()

  if (!plan) {
    return { allowed: false, current: 0, limit: 0 }
  }

  const limitField = resource === 'productos' ? 'limite_productos' : 'limite_banners'
  const limit = plan[limitField] || 0

  // Contar recursos actuales
  const tableName = resource === 'productos' ? 'productos' : 'banners'
  const { count } = await supabaseAdmin
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const current = count || 0

  return {
    allowed: limit === -1 || current < limit, // -1 = ilimitado
    current,
    limit,
  }
}

// ==================== PRODUCTOS ====================

export async function getProductos(filters?: {
  tenantId?: string
  categoria?: string
  color?: string
  destacado?: boolean
  activo?: boolean
}) {
  let query = supabaseAdmin.from('productos').select('*')

  if (filters?.tenantId) {
    query = query.eq('tenant_id', filters.tenantId)
  }
  if (filters?.categoria) {
    query = query.eq('categoria', filters.categoria)
  }
  if (filters?.color) {
    query = query.eq('color', filters.color)
  }
  if (filters?.destacado !== undefined) {
    query = query.eq('destacado', filters.destacado)
  }
  if (filters?.activo !== undefined) {
    query = query.eq('activo', filters.activo)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function getProductoById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createProducto(producto: any) {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert([producto])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProducto(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteProducto(id: string) {
  const { error } = await supabaseAdmin.from('productos').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ==================== BANNERS ====================

export async function getBanners(filters?: { tenantId?: string; activo?: boolean }) {
  let query = supabaseAdmin.from('banners').select('*')

  if (filters?.tenantId) {
    query = query.eq('tenant_id', filters.tenantId)
  }
  if (filters?.activo !== undefined) {
    query = query.eq('activo', filters.activo)
  }

  const { data, error } = await query.order('orden', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function getBannerById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createBanner(banner: any) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert([banner])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateBanner(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteBanner(id: string) {
  const { error } = await supabaseAdmin.from('banners').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ==================== PLANES ====================

export async function getPlanes(activo: boolean = true) {
  let query = supabaseAdmin.from('planes').select('*')

  if (activo) {
    query = query.eq('activo', true)
  }

  const { data, error } = await query.order('precio', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// ==================== COMPRA LOGS ====================

export async function createCompraLog(log: any) {
  const { data, error } = await supabaseAdmin
    .from('compra_logs')
    .insert([log])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getCompraLogs(filters?: { estado?: string; productoId?: string }) {
  let query = supabaseAdmin.from('compra_logs').select('*')

  if (filters?.estado) {
    query = query.eq('estado', filters.estado)
  }
  if (filters?.productoId) {
    query = query.eq('producto_id', filters.productoId)
  }

  const { data, error } = await query.order('fecha', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// ==================== CATEGORIAS ====================

export async function getCategorias(activa: boolean = true) {
  let query = supabaseAdmin.from('categorias').select('*')

  if (activa) {
    query = query.eq('activa', true)
  }

  const { data, error } = await query.order('orden', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// ==================== STOCK LOGS ====================

export async function createStockLog(log: any) {
  const { data, error } = await supabaseAdmin
    .from('stock_logs')
    .insert([log])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// ==================== TENANTS (funciones adicionales) ====================

export async function createTenant(tenant: any) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .insert([tenant])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getTenantByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    return null
  }

  return data
}

export async function updateTenant(tenantId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .update(updates)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

