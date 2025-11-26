import { NextResponse } from 'next/server'
import { createShippingRequest, ShippingRequest } from '@/core/shipping/shipping-service'
import { getSimpleOrderById } from '@/lib/ordenes-helpers-simple'
import { getOrderById } from '@/lib/ordenes-helpers'
import { z } from 'zod'

/**
 * Endpoint para crear envío manualmente (desde admin o después de pago)
 * POST /api/shipping/create
 */
const createShippingSchema = z.object({
  orderId: z.string().uuid(),
  metodo: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createShippingSchema.parse(body)

    const { orderId, metodo } = validatedData

    console.log('[SHIPPING-CREATE] 📦 Creando envío para orden:', orderId)

    // Buscar orden (estructura simplificada primero)
    let simpleOrder = await getSimpleOrderById(orderId)
    let fullOrder: any = null
    let envioData: any = null

    if (simpleOrder) {
      // Estructura simplificada
      if (simpleOrder.envio?.tipo === 'retiro_local') {
        return NextResponse.json(
          { error: 'No se puede crear envío para retiro en local' },
          { status: 400 }
        )
      }

      if (!simpleOrder.envio?.direccion?.codigoPostal) {
        return NextResponse.json(
          { error: 'La orden no tiene dirección de envío completa' },
          { status: 400 }
        )
      }

      // Calcular peso estimado
      const pesoEstimado = Math.max((simpleOrder.productos?.length || 1) * 0.5, 0.5)

      envioData = {
        codigoPostal: simpleOrder.envio.direccion.codigoPostal,
        peso: pesoEstimado,
        precio: simpleOrder.total - (simpleOrder.envio?.costo || 0),
        provincia: simpleOrder.envio.direccion.provincia,
        direccion: {
          calle: simpleOrder.envio.direccion.calle || '',
          numero: simpleOrder.envio.direccion.numero || '',
          pisoDepto: simpleOrder.envio.direccion.pisoDepto,
          localidad: simpleOrder.envio.direccion.localidad || '',
          provincia: simpleOrder.envio.direccion.provincia || '',
        },
        cliente: {
          nombre: simpleOrder.comprador.nombre,
          email: simpleOrder.comprador.email,
          telefono: simpleOrder.comprador.telefono,
        },
      }
    } else {
      // Buscar en estructura completa
      fullOrder = await getOrderById(orderId)
      if (!fullOrder) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }

      if (fullOrder.envio_tipo === 'retiro_local') {
        return NextResponse.json(
          { error: 'No se puede crear envío para retiro en local' },
          { status: 400 }
        )
      }

      if (!fullOrder.direccion_codigo_postal) {
        return NextResponse.json(
          { error: 'La orden no tiene dirección de envío completa' },
          { status: 400 }
        )
      }

      // Calcular peso estimado
      const items = Array.isArray(fullOrder.items) ? fullOrder.items : []
      const pesoEstimado = Math.max(items.length * 0.5, 0.5)

      envioData = {
        codigoPostal: fullOrder.direccion_codigo_postal,
        peso: pesoEstimado,
        precio: fullOrder.subtotal,
        provincia: fullOrder.direccion_provincia,
        direccion: {
          calle: fullOrder.direccion_calle || '',
          numero: fullOrder.direccion_numero || '',
          pisoDepto: fullOrder.direccion_piso_depto,
          localidad: fullOrder.direccion_localidad || '',
          provincia: fullOrder.direccion_provincia || '',
        },
        cliente: {
          nombre: fullOrder.cliente_nombre,
          email: fullOrder.cliente_email,
          telefono: fullOrder.cliente_telefono,
        },
      }
    }

    // Crear envío
    const shippingResult = await createShippingRequest(envioData, metodo)

    if (!shippingResult.success || !shippingResult.trackingNumber) {
      return NextResponse.json(
        {
          error: shippingResult.error || 'Error al crear envío',
          details: shippingResult,
        },
        { status: 500 }
      )
    }

    // Actualizar orden con tracking
    if (simpleOrder) {
      // Estructura simplificada
      const { updateSimpleOrderWithTracking } = await import('@/lib/ordenes-helpers-simple')
      await updateSimpleOrderWithTracking(orderId, {
        tracking: shippingResult.trackingNumber!,
        provider: shippingResult.provider || 'Envíopack',
        status: 'en_transito',
      })
    } else if (fullOrder) {
      // Estructura completa
      const { updateOrderShipping } = await import('@/lib/ordenes-helpers')
      await updateOrderShipping(orderId, {
        envio_tracking: shippingResult.trackingNumber!,
        envio_proveedor: shippingResult.provider || 'Envíopack',
        estado: 'enviada',
      })
    }

    // Enviar notificación
    try {
      const { notifyShippingCreated } = await import('@/lib/notifications')
      await notifyShippingCreated({
        orderId,
        trackingNumber: shippingResult.trackingNumber,
        clienteEmail: envioData.cliente.email,
        clienteNombre: envioData.cliente.nombre,
        envioMetodo: metodo,
        envioProveedor: shippingResult.provider,
      })
    } catch (notifError) {
      console.error('[SHIPPING-CREATE] ⚠️ Error enviando notificación:', notifError)
      // No fallar si falla la notificación
    }

    console.log('[SHIPPING-CREATE] ✅ Envío creado exitosamente:', shippingResult.trackingNumber)

    return NextResponse.json({
      success: true,
      trackingNumber: shippingResult.trackingNumber,
      provider: shippingResult.provider,
      estimatedDelivery: shippingResult.estimatedDelivery,
      cost: shippingResult.cost,
    })
  } catch (error: any) {
    console.error('[SHIPPING-CREATE] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: error.message || 'Error al crear envío',
      },
      { status: 500 }
    )
  }
}
