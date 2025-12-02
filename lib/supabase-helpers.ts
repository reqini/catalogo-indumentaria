/**
 * Helpers para trabajar con Supabase
 * Reemplaza las funciones de MongoDB/Mongoose
 */

import { requireSupabase, isSupabaseEnabled } from './supabase'
import jwt from 'jsonwebtoken'
import type { SupabaseClient } from '@supabase/supabase-js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper para obtener supabaseAdmin de forma segura
function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseEnabled) {
    throw new Error(
      'Supabase no está configurado. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.'
    )
  }
  return requireSupabase().supabaseAdmin
}

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

    const { data: tenant, error } = await getSupabaseAdmin()
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
  const { count } = await getSupabaseAdmin()
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
  nombre?: string
}) {
  let query = getSupabaseAdmin().from('productos').select('*')

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
  if (filters?.nombre) {
    query = query.ilike('nombre', `%${filters.nombre}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function getProductoById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

// Alias para compatibilidad
export async function getProductById(id: string) {
  return getProductoById(id)
}

export async function createProducto(producto: any) {
  const { data, error } = await getSupabaseAdmin()
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
  const { error } = await getSupabaseAdmin().from('productos').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ==================== BANNERS ====================

export async function getBanners(filters?: { tenantId?: string; activo?: boolean }) {
  let query = getSupabaseAdmin().from('banners').select('*')

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
  const { data, error } = await getSupabaseAdmin().from('banners').select('*').eq('id', id).single()

  if (error) {
    return null
  }

  return data
}

export async function createBanner(banner: any) {
  const { data, error } = await getSupabaseAdmin()
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
  const { error } = await getSupabaseAdmin().from('banners').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ==================== PLANES ====================

export async function getPlanes(activo: boolean = true) {
  let query = getSupabaseAdmin().from('planes').select('*')

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
  const { data, error } = await getSupabaseAdmin()
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
  let query = getSupabaseAdmin().from('compra_logs').select('*')

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

export async function getCategorias(filters?: { activa?: boolean; tenantId?: string }) {
  let query = getSupabaseAdmin().from('categorias').select('*')

  // Si activa es explícitamente false, obtener todas (activas e inactivas)
  // Si activa es true o undefined, solo activas
  if (filters?.activa === false) {
    // Obtener todas, no filtrar por activa
  } else if (filters?.activa !== undefined) {
    query = query.eq('activa', filters.activa)
  } else {
    // Por defecto, solo activas si no se especifica
    query = query.eq('activa', true)
  }

  if (filters?.tenantId) {
    query = query.eq('tenant_id', filters.tenantId)
  }

  const { data, error } = await query.order('orden', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function getCategoriaById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createCategoria(categoria: any) {
  const { data, error } = await supabaseAdmin
    .from('categorias')
    .insert([categoria])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategoria(id: string, updates: any) {
  // Asegurar que tenant_id esté presente si viene en updates
  const updateData = { ...updates }

  const { data, error } = await supabaseAdmin
    .from('categorias')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategoria(id: string) {
  const { error } = await getSupabaseAdmin().from('categorias').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ==================== STOCK LOGS ====================

export async function createStockLog(log: any) {
  const { data, error } = await getSupabaseAdmin()
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
  const { data, error } = await getSupabaseAdmin()
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
