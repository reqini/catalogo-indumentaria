/**
 * Helpers para registro de historial de cambios de productos
 */

import { supabaseAdmin } from './supabase'

export interface HistorialEntry {
  producto_id: string
  tenant_id: string
  accion: 'crear' | 'editar' | 'eliminar' | 'activar' | 'desactivar' | 'stock'
  usuario_id: string
  datos_anteriores?: any
  datos_nuevos?: any
  campo_modificado?: string
  valor_anterior?: string
  valor_nuevo?: string
}

/**
 * Registra un cambio en el historial de productos
 */
export async function registrarHistorial(entry: HistorialEntry): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('producto_historial').insert([
      {
        producto_id: entry.producto_id,
        tenant_id: entry.tenant_id,
        accion: entry.accion,
        usuario_id: entry.usuario_id,
        datos_anteriores: entry.datos_anteriores || null,
        datos_nuevos: entry.datos_nuevos || null,
        campo_modificado: entry.campo_modificado || null,
        valor_anterior: entry.valor_anterior || null,
        valor_nuevo: entry.valor_nuevo || null,
      },
    ])

    if (error) {
      console.error('Error registrando historial:', error)
      // No lanzar error para no romper el flujo principal
    }
  } catch (error) {
    console.error('Error inesperado registrando historial:', error)
    // No lanzar error para no romper el flujo principal
  }
}

/**
 * Obtiene el historial de un producto
 */
export async function getHistorialProducto(
  productoId: string,
  tenantId?: string
): Promise<any[]> {
  try {
    let query = supabaseAdmin
      .from('producto_historial')
      .select('*')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error obteniendo historial:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error inesperado obteniendo historial:', error)
    return []
  }
}

/**
 * Compara dos objetos y detecta cambios
 */
export function detectarCambios(
  anterior: any,
  nuevo: any,
  camposIgnorar: string[] = ['updated_at', 'created_at', 'id']
): { campo: string; anterior: any; nuevo: any }[] {
  const cambios: { campo: string; anterior: any; nuevo: any }[] = []

  const todosLosCampos = new Set([
    ...Object.keys(anterior || {}),
    ...Object.keys(nuevo || {}),
  ])

  todosLosCampos.forEach((campo) => {
    if (camposIgnorar.includes(campo)) return

    const valorAnterior = anterior?.[campo]
    const valorNuevo = nuevo?.[campo]

    if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
      cambios.push({
        campo,
        anterior: valorAnterior,
        nuevo: valorNuevo,
      })
    }
  })

  return cambios
}

