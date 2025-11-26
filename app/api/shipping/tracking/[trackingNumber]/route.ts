import { NextResponse } from 'next/server'
import { getSimpleOrderByTracking } from '@/lib/ordenes-helpers-simple'
import { getShippingStatus } from '@/core/shipping/shipping-service'

/**
 * Endpoint para consultar estado de tracking de un envío
 * GET /api/shipping/tracking/[trackingNumber]
 */
export async function GET(request: Request, { params }: { params: { trackingNumber: string } }) {
  try {
    const { trackingNumber } = params

    if (!trackingNumber || trackingNumber.trim().length === 0) {
      return NextResponse.json({ error: 'Tracking number requerido' }, { status: 400 })
    }

    console.log('[SHIPPING-TRACKING] Consultando tracking:', trackingNumber)

    // Buscar orden por tracking (estructura simplificada primero)
    let order = await getSimpleOrderByTracking(trackingNumber)

    // Si no se encuentra, buscar en estructura completa
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!order && supabaseAdmin) {
      const { data: orders } = await supabaseAdmin
        .from('ordenes')
        .select('*')
        .or(`envio_tracking.eq.${trackingNumber},envio->>tracking.eq.${trackingNumber}`)
        .limit(1)

      if (orders && orders.length > 0) {
        order = orders[0] as any
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 })
    }

    // Obtener proveedor
    const provider =
      (order as any).envio_proveedor ||
      (order as any).envio?.proveedor ||
      (order as any).envio?.provider ||
      'OCA'

    // Consultar estado actualizado con proveedor
    const status = await getShippingStatus(trackingNumber, provider)

    // Preparar respuesta
    const response = {
      trackingNumber,
      orderId: order.id,
      status: status.status,
      location: status.location,
      estimatedDelivery: status.estimatedDelivery,
      lastUpdate: status.lastUpdate,
      provider,
      order: {
        id: order.id,
        cliente: (order as any).comprador?.nombre || (order as any).cliente_nombre || 'N/A',
        total: (order as any).total || 0,
        estado: (order as any).estado || 'pendiente',
      },
    }

    console.log('[SHIPPING-TRACKING] ✅ Estado obtenido:', status.status)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[SHIPPING-TRACKING] Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error al consultar tracking',
      },
      { status: 500 }
    )
  }
}
