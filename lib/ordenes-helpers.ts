/**
 * Helpers para gestión de órdenes en Supabase
 * Funciones CRUD completas para el circuito de compra
 */

import { supabaseAdmin } from './supabase'

export interface OrderItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
  talle?: string
  subtotal: number
  imagenPrincipal?: string
}

export interface ShippingAddress {
  calle: string
  numero: string
  pisoDepto?: string
  codigoPostal: string
  localidad: string
  provincia: string
  pais?: string
}

export interface CustomerData {
  nombre: string
  email: string
  telefono?: string
}

export interface ShippingData {
  tipo: 'estandar' | 'express' | 'retiro_local'
  metodo: string
  costo: number
  demora?: string
  proveedor?: string
}

export interface OrderData {
  cliente: CustomerData
  direccion: ShippingAddress
  envio: ShippingData
  items: OrderItem[]
  subtotal: number
  descuento?: number
  envioCosto: number
  total: number
  notas?: string
}

export interface Order {
  id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  direccion_calle: string
  direccion_numero: string
  direccion_piso_depto?: string
  direccion_codigo_postal: string
  direccion_localidad: string
  direccion_provincia: string
  direccion_pais: string
  envio_tipo: string
  envio_metodo?: string
  envio_costo: number
  envio_tracking?: string
  envio_proveedor?: string
  items: OrderItem[]
  subtotal: number
  descuento: number
  envio_costo_total: number
  total: number
  pago_metodo: string
  pago_estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
  pago_preferencia_id?: string
  pago_id?: string
  pago_fecha?: string
  estado: 'pendiente' | 'pagada' | 'enviada' | 'entregada' | 'cancelada'
  estado_fecha: string
  notas?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Crear una nueva orden desde datos de checkout
 */
export async function createOrder(orderData: OrderData): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .insert({
        cliente_nombre: orderData.cliente.nombre,
        cliente_email: orderData.cliente.email,
        cliente_telefono: orderData.cliente.telefono,
        direccion_calle: orderData.direccion.calle,
        direccion_numero: orderData.direccion.numero,
        direccion_piso_depto: orderData.direccion.pisoDepto,
        direccion_codigo_postal: orderData.direccion.codigoPostal,
        direccion_localidad: orderData.direccion.localidad,
        direccion_provincia: orderData.direccion.provincia,
        direccion_pais: orderData.direccion.pais || 'Argentina',
        envio_tipo: orderData.envio.tipo,
        envio_metodo: orderData.envio.metodo,
        envio_costo: orderData.envio.costo,
        envio_proveedor: orderData.envio.proveedor,
        items: orderData.items,
        subtotal: orderData.subtotal,
        descuento: orderData.descuento || 0,
        envio_costo_total: orderData.envioCosto,
        total: orderData.total,
        pago_metodo: 'mercadopago',
        pago_estado: 'pendiente',
        estado: 'pendiente',
        notas: orderData.notas,
        metadata: {},
      })
      .select()
      .single()

    if (error) {
      console.error('[ORDENES] Error creando orden:', error)
      return null
    }

    console.log('[ORDENES] ✅ Orden creada:', data.id)
    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado creando orden:', error)
    return null
  }
}

/**
 * Obtener orden por ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !data) {
      console.error('[ORDENES] Error obteniendo orden:', error)
      return null
    }

    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado obteniendo orden:', error)
    return null
  }
}

/**
 * Obtener orden por Payment ID de Mercado Pago
 */
export async function getOrderByPaymentId(paymentId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .select('*')
      .eq('pago_id', paymentId)
      .single()

    if (error || !data) {
      console.error('[ORDENES] Error obteniendo orden por payment ID:', error)
      return null
    }

    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado obteniendo orden por payment ID:', error)
    return null
  }
}

/**
 * Obtener orden por Preference ID de Mercado Pago
 */
export async function getOrderByPreferenceId(preferenceId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .select('*')
      .eq('pago_preferencia_id', preferenceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error('[ORDENES] Error obteniendo orden por preference ID:', error)
      return null
    }

    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado obteniendo orden por preference ID:', error)
    return null
  }
}

/**
 * Actualizar estado de orden
 */
export async function updateOrderStatus(
  orderId: string,
  estado: 'pendiente' | 'pagada' | 'enviada' | 'entregada' | 'cancelada',
  pagoEstado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
  pagoId?: string,
  pagoFecha?: string
): Promise<Order | null> {
  try {
    const updateData: any = {
      estado,
      estado_fecha: new Date().toISOString(),
    }

    if (pagoEstado) {
      updateData.pago_estado = pagoEstado
    }
    if (pagoId) {
      updateData.pago_id = pagoId
    }
    if (pagoFecha) {
      updateData.pago_fecha = pagoFecha
    }

    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('[ORDENES] Error actualizando estado de orden:', error)
      return null
    }

    console.log('[ORDENES] ✅ Estado de orden actualizado:', orderId, estado)
    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado actualizando estado:', error)
    return null
  }
}

/**
 * Actualizar información de pago
 */
export async function updateOrderPayment(
  orderId: string,
  paymentData: {
    pago_estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
    pago_id?: string
    pago_preferencia_id?: string
    pago_fecha?: string
  }
): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .update({
        ...paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('[ORDENES] Error actualizando pago de orden:', error)
      return null
    }

    console.log('[ORDENES] ✅ Pago de orden actualizado:', orderId)
    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado actualizando pago:', error)
    return null
  }
}

/**
 * Actualizar información de envío
 */
export async function updateOrderShipping(
  orderId: string,
  shippingData: {
    envio_tracking?: string
    envio_proveedor?: string
    estado?: 'enviada' | 'entregada'
  }
): Promise<Order | null> {
  try {
    const updateData: any = {
      ...shippingData,
      updated_at: new Date().toISOString(),
    }

    if (shippingData.estado) {
      updateData.estado = shippingData.estado
      updateData.estado_fecha = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('[ORDENES] Error actualizando envío de orden:', error)
      return null
    }

    console.log('[ORDENES] ✅ Envío de orden actualizado:', orderId)
    return data as Order
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado actualizando envío:', error)
    return null
  }
}

/**
 * Listar todas las órdenes (con filtros opcionales)
 */
export async function listOrders(filters?: {
  estado?: string
  pago_estado?: string
  cliente_email?: string
  limit?: number
  offset?: number
}): Promise<Order[]> {
  try {
    let query = supabaseAdmin.from('ordenes').select('*')

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }
    if (filters?.pago_estado) {
      query = query.eq('pago_estado', filters.pago_estado)
    }
    if (filters?.cliente_email) {
      query = query.eq('cliente_email', filters.cliente_email)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('[ORDENES] Error listando órdenes:', error)
      return []
    }

    return (data || []) as Order[]
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado listando órdenes:', error)
    return []
  }
}

/**
 * Crear log de orden manualmente
 */
export async function createOrderLog(
  orderId: string,
  accion: string,
  datosAnteriores?: any,
  datosNuevos?: any,
  notas?: string,
  usuario?: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('ordenes_logs').insert({
      orden_id: orderId,
      accion,
      datos_anteriores: datosAnteriores || {},
      datos_nuevos: datosNuevos || {},
      notas,
      usuario,
    })

    if (error) {
      console.error('[ORDENES] Error creando log:', error)
      return false
    }

    return true
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado creando log:', error)
    return false
  }
}

/**
 * Obtener logs de una orden
 */
export async function getOrderLogs(orderId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ordenes_logs')
      .select('*')
      .eq('orden_id', orderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ORDENES] Error obteniendo logs:', error)
      return []
    }

    return data || []
  } catch (error: any) {
    console.error('[ORDENES] Error inesperado obteniendo logs:', error)
    return []
  }
}
