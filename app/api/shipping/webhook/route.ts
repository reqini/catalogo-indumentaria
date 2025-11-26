import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateSimpleOrderWithTracking } from '@/lib/ordenes-helpers-simple'
import { updateOrderShipping } from '@/lib/ordenes-helpers'
import { getSimpleOrderByTracking } from '@/lib/ordenes-helpers-simple'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Webhook para recibir actualizaciones de estado de envíos desde proveedores
 * POST /api/shipping/webhook
 *
 * Soporta:
 * - Envíopack
 * - OCA (con configuración)
 * - Andreani (con configuración)
 */

const ENVIOPACK_WEBHOOK_SECRET = process.env.ENVIOPACK_WEBHOOK_SECRET

function verifyEnviopackSignature(body: string, signature: string | null): boolean {
  if (!signature || !ENVIOPACK_WEBHOOK_SECRET) {
    // Si no hay secret configurado, permitir (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SHIPPING-WEBHOOK] ⚠️ Webhook secret no configurado, permitiendo en desarrollo')
      return true
    }
    return false
  }

  const hash = crypto.createHmac('sha256', ENVIOPACK_WEBHOOK_SECRET).update(body).digest('hex')
  return hash === signature
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    const signature =
      request.headers.get('x-signature') || request.headers.get('x-enviopack-signature')

    // Validar firma
    if (!verifyEnviopackSignature(bodyText, signature)) {
      console.error('[SHIPPING-WEBHOOK] ❌ Firma inválida')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(bodyText)
    const {
      tracking_number,
      trackingNumber,
      status,
      location,
      estimated_delivery,
      estimatedDelivery,
      provider,
    } = data

    const tracking = tracking_number || trackingNumber
    const estimatedDeliveryDate = estimated_delivery || estimatedDelivery

    if (!tracking) {
      return NextResponse.json({ error: 'Tracking number requerido' }, { status: 400 })
    }

    console.log('[SHIPPING-WEBHOOK] 📦 Actualización de envío recibida:', {
      tracking,
      status,
      location,
      provider,
    })

    // Buscar orden por tracking
    let order = await getSimpleOrderByTracking(tracking)

    // Si no se encuentra en estructura simplificada, buscar en completa
    if (!order && supabaseAdmin) {
      const { data: orders } = await supabaseAdmin
        .from('ordenes')
        .select('*')
        .or(`envio_tracking.eq.${tracking},envio->>tracking.eq.${tracking}`)
        .limit(1)

      if (orders && orders.length > 0) {
        order = orders[0] as any
      }
    }

    if (!order) {
      console.warn('[SHIPPING-WEBHOOK] ⚠️ Orden no encontrada para tracking:', tracking)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Mapear estado del proveedor a estado interno
    const estadoMap: Record<string, string> = {
      pendiente: 'pendiente',
      en_transito: 'enviada',
      en_camino: 'enviada',
      entregado: 'entregada',
      entregada: 'entregada',
      cancelado: 'cancelada',
      devuelto: 'cancelada',
    }

    const estadoOrden = estadoMap[status?.toLowerCase()] || 'enviada'

    // Actualizar orden según tipo
    if ((order as any).envio) {
      // Estructura simplificada
      await updateSimpleOrderWithTracking(order.id, {
        tracking,
        provider: provider || 'Envíopack',
        status: estadoOrden,
      })
    } else {
      // Estructura completa
      await updateOrderShipping(order.id, {
        envio_tracking: tracking,
        envio_proveedor: provider || 'Envíopack',
        estado: estadoOrden,
      })
    }

    // Notificar cliente si el estado cambió significativamente
    if (status === 'entregado' || status === 'entregada') {
      try {
        const { notifyShippingDelivered } = await import('@/lib/notifications')
        await notifyShippingDelivered({
          orderId: order.id,
          trackingNumber: tracking,
          clienteEmail: (order as any).comprador?.email || (order as any).cliente_email || '',
          clienteNombre: (order as any).comprador?.nombre || (order as any).cliente_nombre || '',
        })
      } catch (notifError) {
        console.error('[SHIPPING-WEBHOOK] ⚠️ Error enviando notificación:', notifError)
        // No fallar el webhook por error de notificación
      }
    }

    console.log('[SHIPPING-WEBHOOK] ✅ Estado actualizado:', {
      orderId: order.id,
      tracking,
      status: estadoOrden,
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: estadoOrden,
    })
  } catch (error: any) {
    console.error('[SHIPPING-WEBHOOK] ❌ Error procesando webhook:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error processing webhook',
      },
      { status: 500 }
    )
  }
}
