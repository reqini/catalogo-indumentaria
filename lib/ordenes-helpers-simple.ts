/**
 * Helpers simplificados para gestión de órdenes en Supabase
 * Usa estructura simplificada: productos, comprador, envio como JSONB
 */

import { supabaseAdmin } from './supabase'

export interface SimpleOrderData {
  productos: Array<{
    id: string
    nombre: string
    precio: number
    cantidad: number
    talle?: string
    subtotal: number
    imagenPrincipal?: string
  }>
  comprador: {
    nombre: string
    email: string
    telefono?: string
  }
  envio: {
    tipo: 'estandar' | 'express' | 'retiro_local'
    metodo?: string
    costo: number
    direccion?: {
      calle?: string
      numero?: string
      pisoDepto?: string
      codigoPostal?: string
      localidad?: string
      provincia?: string
      pais?: string
    }
    demora?: string
    proveedor?: string
  }
  total: number
  estado?: string
}

export interface SimpleOrder {
  id: string
  productos: SimpleOrderData['productos']
  comprador: SimpleOrderData['comprador']
  envio: SimpleOrderData['envio']
  total: number
  estado: string
  created_at: string
}

/**
 * Crear una nueva orden con estructura simplificada
 */
export async function createSimpleOrder(orderData: SimpleOrderData): Promise<SimpleOrder | null> {
  try {
    console.log('[ORDENES-SIMPLE] 🔍 Iniciando creación de orden:', {
      comprador: orderData.comprador.nombre,
      email: orderData.comprador.email,
      productosCount: orderData.productos.length,
      total: orderData.total,
      envioTipo: orderData.envio.tipo,
    })

    if (!supabaseAdmin) {
      console.error('[ORDENES-SIMPLE] ❌ supabaseAdmin no está configurado')
      throw new Error('Supabase no está configurado correctamente')
    }

    const insertData = {
      productos: orderData.productos,
      comprador: orderData.comprador,
      envio: orderData.envio,
      total: Number(orderData.total),
      estado: orderData.estado || 'pendiente',
    }

    console.log('[ORDENES-SIMPLE] 📤 Insertando orden en BD:', {
      productosCount: insertData.productos.length,
      total: insertData.total,
      estado: insertData.estado,
    })

    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      console.error('[ORDENES-SIMPLE] ❌ Error creando orden en Supabase:')
      console.error('   - Código:', error.code)
      console.error('   - Mensaje:', error.message)
      console.error('   - Detalles:', error.details)
      console.error('   - Hint:', error.hint)

      // Mensaje de error más específico
      let errorMessage = 'Error al crear orden en BD'
      let hint = 'Verifica que la tabla "ordenes" exista y tenga la estructura correcta'

      if (
        error.code === 'PGRST205' ||
        error.message.includes('schema cache') ||
        error.message.includes('does not exist')
      ) {
        errorMessage = `Could not find the table 'public.ordenes' in the schema cache (PGRST205)`
        hint =
          'La tabla ordenes no existe en Supabase. Ejecuta la migración SQL en Supabase Dashboard: supabase/migrations/006_create_ordenes_simple.sql'

        const tableError = new Error(errorMessage)
        ;(tableError as any).code = 'PGRST205'
        ;(tableError as any).hint = hint
        ;(tableError as any).migrationFile = 'supabase/migrations/006_create_ordenes_simple.sql'
        throw tableError
      } else {
        errorMessage = `${error.message}`
        hint = error.hint || hint
      }

      const dbError = new Error(errorMessage)
      ;(dbError as any).code = error.code
      ;(dbError as any).hint = hint
      throw dbError
    }

    if (!data) {
      console.error('[ORDENES-SIMPLE] ❌ No se retornó data después de insert')
      throw new Error('No se pudo crear la orden: respuesta vacía de Supabase')
    }

    console.log('[ORDENES-SIMPLE] ✅ Orden creada exitosamente:', data.id)
    return data as SimpleOrder
  } catch (error: any) {
    console.error('[ORDENES-SIMPLE] ❌ Error inesperado creando orden:', error)
    console.error('[ORDENES-SIMPLE]   - Stack:', error.stack)
    throw error
  }
}

/**
 * Obtener orden por ID
 */
export async function getSimpleOrderById(orderId: string): Promise<SimpleOrder | null> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase no está configurado')
    }

    const { data, error } = await supabaseAdmin
      .from('ordenes')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('[ORDENES-SIMPLE] Error obteniendo orden:', error)
      return null
    }

    return data as SimpleOrder
  } catch (error) {
    console.error('[ORDENES-SIMPLE] Error:', error)
    return null
  }
}

/**
 * Actualizar estado de orden
 */
export async function updateSimpleOrderStatus(orderId: string, estado: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase no está configurado')
    }

    const { error } = await supabaseAdmin.from('ordenes').update({ estado }).eq('id', orderId)

    if (error) {
      console.error('[ORDENES-SIMPLE] Error actualizando orden:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[ORDENES-SIMPLE] Error:', error)
    return false
  }
}
