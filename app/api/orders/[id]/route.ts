import { NextResponse } from 'next/server'
import { getSimpleOrderById } from '@/lib/ordenes-helpers-simple'
import { getOrderById } from '@/lib/ordenes-helpers'

/**
 * Endpoint público para obtener información de una orden
 * GET /api/orders/[id]
 *
 * Permite al cliente ver su orden después del pago
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Order ID requerido' }, { status: 400 })
    }

    // Intentar obtener orden simplificada primero
    let simpleOrder = await getSimpleOrderById(id)
    let fullOrder: any = null

    // Si no se encuentra, intentar estructura completa
    if (!simpleOrder) {
      fullOrder = await getOrderById(id)
    }

    if (!simpleOrder && !fullOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Retornar orden (sin datos sensibles)
    return NextResponse.json({
      order: simpleOrder || fullOrder,
    })
  } catch (error: any) {
    console.error('[API-ORDERS] Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error al obtener orden',
      },
      { status: 500 }
    )
  }
}
