import { NextResponse } from 'next/server'
import { createOrder, OrderData } from '@/lib/ordenes-helpers'
import { createPayment } from '@/utils/api'
import { getProductById } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'
import { z } from 'zod'

// Schema de validación
const createOrderSchema = z.object({
  cliente: z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().optional(),
  }),
  direccion: z.object({
    calle: z.string().min(3),
    numero: z.string().min(1),
    pisoDepto: z.string().optional(),
    codigoPostal: z.string().min(4),
    localidad: z.string().min(2),
    provincia: z.string().min(2),
    pais: z.string().optional(),
  }),
  envio: z.object({
    tipo: z.enum(['estandar', 'express', 'retiro_local']),
    metodo: z.string(),
    costo: z.number().min(0),
    demora: z.string().optional(),
    proveedor: z.string().optional(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      nombre: z.string(),
      precio: z.number(),
      cantidad: z.number().min(1),
      talle: z.string().optional(),
      subtotal: z.number(),
      imagenPrincipal: z.string().optional(),
    })
  ),
  subtotal: z.number().min(0),
  descuento: z.number().min(0).optional(),
  envioCosto: z.number().min(0),
  total: z.number().min(0),
  notas: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos
    const validatedData = createOrderSchema.parse(body)

    // Validar stock antes de crear orden
    for (const item of validatedData.items) {
      if (item.id === 'envio') continue

      const producto = await getProductById(item.id)
      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.nombre}` },
          { status: 404 }
        )
      }

      const stockRecord: Record<string, number> = producto.stock || {}
      if (item.talle) {
        const stockTalle = stockRecord[item.talle] || 0
        if (stockTalle < item.cantidad) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${item.nombre} (Talle ${item.talle}). Disponible: ${stockTalle}`,
            },
            { status: 400 }
          )
        }
      } else {
        const stockTotal = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        if (stockTotal < item.cantidad) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${item.nombre}. Disponible: ${stockTotal}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Crear orden en la base de datos
    const order = await createOrder(validatedData as OrderData)

    if (!order) {
      return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
    }

    console.log('[CHECKOUT] ✅ Orden creada:', order.id)

    // Preparar items para Mercado Pago (sin el item de envío, se agrega después)
    const mpItems = validatedData.items
      .filter((item) => item.id !== 'envio')
      .map((item) => ({
        title: item.nombre + (item.talle ? ` (Talle ${item.talle})` : ''),
        quantity: item.cantidad,
        unit_price: item.precio,
        id: item.id,
        talle: item.talle,
      }))

    // Agregar envío como item si existe
    if (validatedData.envio.costo > 0) {
      mpItems.push({
        title: `Envío - ${validatedData.envio.metodo}`,
        quantity: 1,
        unit_price: validatedData.envio.costo,
        id: 'envio',
        talle: '',
      })
    }

    // Crear preferencia de Mercado Pago
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catalogo-indumentaria.vercel.app'
    const origin = request.headers.get('origin') || baseUrl

    // Llamar directamente a la API de pago con todos los datos
    const paymentResponse = await fetch(`${origin}/api/pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: mpItems,
        back_urls: {
          success: `${origin}/pago/success?orderId=${order.id}`,
          failure: `${origin}/pago/failure?orderId=${order.id}`,
          pending: `${origin}/pago/pending?orderId=${order.id}`,
        },
        payer: {
          name: validatedData.cliente.nombre,
          email: validatedData.cliente.email,
          phone: validatedData.cliente.telefono
            ? {
                area_code: '',
                number: validatedData.cliente.telefono,
              }
            : undefined,
          address: {
            street_name: validatedData.direccion.calle,
            street_number: parseInt(validatedData.direccion.numero) || 0,
            zip_code: validatedData.direccion.codigoPostal,
          },
        },
        external_reference: order.id,
      }),
    })

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json()
      throw new Error(errorData.error || 'Error al crear la preferencia de pago')
    }

    const preference = await paymentResponse.json()

    if (!preference.init_point) {
      return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 })
    }

    // Actualizar orden con preference ID
    const { updateOrderPayment } = await import('@/lib/ordenes-helpers')
    await updateOrderPayment(order.id, {
      pago_estado: 'pendiente',
      pago_preferencia_id: preference.preference_id || preference.id,
    })

    console.log('[CHECKOUT] ✅ Preferencia creada:', preference.preference_id || preference.id)
    console.log('[CHECKOUT] 🎯 QA LOG - Orden y preferencia creadas:', {
      orderId: order.id,
      preferenceId: preference.preference_id || preference.id,
      itemsCount: mpItems.length,
      total: validatedData.total,
      hasShipping: validatedData.envio.costo > 0,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      orderId: order.id,
      preferenceId: preference.preference_id || preference.id,
      initPoint: preference.init_point,
    })
  } catch (error: any) {
    console.error('[CHECKOUT] Error:', error)

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
        error: error.message || 'Error al procesar el checkout',
      },
      { status: 500 }
    )
  }
}
