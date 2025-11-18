import { calcularDescuentoFinal, obtenerPrecioFinal } from './promociones'
import type { Promocion } from '@/lib/db'

/**
 * Aplica descuentos a un producto considerando promociones activas
 */
export function applyDiscount(
  producto: {
    precio: number
    descuento?: number
    categoria?: string
    id?: string
  },
  promociones: Promocion[] = []
): {
  precioOriginal: number
  descuento: number
  precioFinal: number
  tieneDescuento: boolean
} {
  const descuento = calcularDescuentoFinal(producto as any, promociones)
  const precioFinal = obtenerPrecioFinal(producto as any, promociones)

  return {
    precioOriginal: producto.precio,
    descuento,
    precioFinal,
    tieneDescuento: descuento > 0,
  }
}



