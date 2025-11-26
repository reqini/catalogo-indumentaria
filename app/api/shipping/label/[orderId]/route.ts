import { NextResponse } from 'next/server'
import { getSimpleOrderById } from '@/lib/ordenes-helpers-simple'
import { getOrderById } from '@/lib/ordenes-helpers'

/**
 * Endpoint para generar y descargar etiqueta de envío
 * GET /api/shipping/label/[orderId]
 *
 * Por ahora retorna información del tracking, en producción
 * debería generar PDF desde Envíopack API
 */
export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID requerido' }, { status: 400 })
    }

    console.log('[SHIPPING-LABEL] Generando etiqueta para orden:', orderId)

    // Buscar orden (estructura simplificada primero)
    let simpleOrder = await getSimpleOrderById(orderId)
    let fullOrder: any = null
    let trackingNumber: string | null = null
    let provider: string | null = null

    if (simpleOrder) {
      trackingNumber =
        (simpleOrder.envio as any)?.tracking || (simpleOrder.envio as any)?.tracking_number || null
      provider =
        (simpleOrder.envio as any)?.proveedor || (simpleOrder.envio as any)?.provider || null
    } else {
      fullOrder = await getOrderById(orderId)
      if (fullOrder) {
        trackingNumber = fullOrder.envio_tracking || null
        provider = fullOrder.envio_proveedor || null
      }
    }

    if (!simpleOrder && !fullOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'La orden no tiene número de tracking asignado' },
        { status: 400 }
      )
    }

    // Si Envíopack está configurado, intentar obtener etiqueta real
    const tieneEnvioPack = !!process.env.ENVIOPACK_API_KEY && !!process.env.ENVIOPACK_API_SECRET

    if (tieneEnvioPack && provider === 'Envíopack') {
      try {
        const apiKey = process.env.ENVIOPACK_API_KEY!
        const response = await fetch(
          `https://api.enviopack.com/envios/${trackingNumber}/etiqueta`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(10000),
          }
        )

        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer()
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="etiqueta-${trackingNumber}.pdf"`,
            },
          })
        }
      } catch (error: any) {
        console.warn('[SHIPPING-LABEL] Error obteniendo etiqueta de Envíopack:', error.message)
        // Continuar con fallback
      }
    }

    // Fallback: Retornar información del tracking
    // En producción, esto debería generar un PDF básico o redirigir a Envíopack
    return NextResponse.json({
      orderId,
      trackingNumber,
      provider,
      message: 'Etiqueta no disponible. Consultá el tracking en el sitio del proveedor.',
      trackingUrl: `/envio/${trackingNumber}`,
      providerUrl:
        provider === 'OCA'
          ? `https://www.oca.com.ar/envios/consulta-envios`
          : provider === 'Andreani'
            ? `https://www.andreani.com/`
            : provider === 'Envíopack'
              ? `https://enviopack.com/tracking/${trackingNumber}`
              : null,
    })
  } catch (error: any) {
    console.error('[SHIPPING-LABEL] Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error al generar etiqueta',
      },
      { status: 500 }
    )
  }
}
