import { formatPrice, calculateDiscount } from './formatPrice'
import type { Promocion } from '@/lib/db'

export interface ProductoConPromocion {
  id: string
  nombre: string
  precio: number
  descuento?: number
  categoria: string
  [key: string]: any
}

/**
 * Calcula el descuento aplicable a un producto considerando todas las promociones activas
 */
export function calcularDescuentoFinal(
  producto: ProductoConPromocion,
  promociones: Promocion[]
): number {
  // Descuento individual del producto (prioridad más alta)
  if (producto.descuento && producto.descuento > 0) {
    return producto.descuento
  }

  // Buscar promociones aplicables
  const ahora = new Date()

  for (const promo of promociones) {
    if (!promo.activa) continue

    // Promoción por producto específico
    if (promo.tipo === 'producto' && promo.producto_id === producto.id) {
      // Verificar fechas si aplica
      if (promo.fecha_inicio && promo.fecha_fin) {
        const inicio = new Date(promo.fecha_inicio)
        const fin = new Date(promo.fecha_fin)
        if (ahora >= inicio && ahora <= fin) {
          return promo.valor
        }
      } else {
        return promo.valor
      }
    }

    // Promoción por categoría
    if (promo.tipo === 'categoria' && promo.categoria === producto.categoria) {
      if (promo.fecha_inicio && promo.fecha_fin) {
        const inicio = new Date(promo.fecha_inicio)
        const fin = new Date(promo.fecha_fin)
        if (ahora >= inicio && ahora <= fin) {
          return promo.valor
        }
      } else {
        return promo.valor
      }
    }

    // Promoción por fecha (aplicable a todos)
    if (promo.tipo === 'fecha') {
      if (promo.fecha_inicio && promo.fecha_fin) {
        const inicio = new Date(promo.fecha_inicio)
        const fin = new Date(promo.fecha_fin)
        if (ahora >= inicio && ahora <= fin) {
          return promo.valor
        }
      }
    }
  }

  return 0
}

/**
 * Obtiene el precio final de un producto con todas las promociones aplicadas
 */
export function obtenerPrecioFinal(
  producto: ProductoConPromocion,
  promociones: Promocion[]
): number {
  const descuento = calcularDescuentoFinal(producto, promociones)
  return calculateDiscount(producto.precio, descuento)
}

/**
 * Verifica si una promoción por cantidad aplica
 */
export function verificarPromocionCantidad(
  promociones: Promocion[],
  cantidad: number
): Promocion | null {
  const ahora = new Date()

  for (const promo of promociones) {
    if (!promo.activa || promo.tipo !== 'cantidad') continue

    if (promo.cantidad_minima && cantidad >= promo.cantidad_minima) {
      if (promo.fecha_inicio && promo.fecha_fin) {
        const inicio = new Date(promo.fecha_inicio)
        const fin = new Date(promo.fecha_fin)
        if (ahora >= inicio && ahora <= fin) {
          return promo
        }
      } else {
        return promo
      }
    }
  }

  return null
}

/**
 * Formatea el texto de descuento para mostrar
 */
export function formatearDescuento(descuento: number): string {
  if (descuento >= 1 && descuento <= 100) {
    return `-${Math.round(descuento)}% OFF`
  }
  return ''
}

/**
 * Obtiene promociones que deben mostrarse en el home
 */
export function getPromocionesHome(promociones: Promocion[]): Promocion[] {
  const ahora = new Date()

  return promociones.filter((promo) => {
    if (!promo.activa || !promo.mostrar_en_home) return false

    if (promo.fecha_inicio && promo.fecha_fin) {
      const inicio = new Date(promo.fecha_inicio)
      const fin = new Date(promo.fecha_fin)
      return ahora >= inicio && ahora <= fin
    }

    return true
  })
}



