import { NextResponse } from 'next/server'
import { createSimpleOrder, SimpleOrderData } from '@/lib/ordenes-helpers-simple'
import { createPayment } from '@/utils/api'
import { getProductById } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'
import { z } from 'zod'

// Schema de validación simplificado
const createOrderSchema = z.object({
  productos: z
    .array(
      z.object({
        id: z.string().min(1),
        nombre: z.string().min(1),
        precio: z.number().min(0),
        cantidad: z.number().min(1),
        talle: z.string().optional(),
        subtotal: z.number().min(0),
        imagenPrincipal: z.string().optional(),
      })
    )
    .min(1),
  comprador: z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().optional(),
  }),
  envio: z.object({
    tipo: z.enum(['estandar', 'express', 'retiro_local']),
    metodo: z.string().optional(),
    costo: z.number().min(0),
    direccion: z
      .object({
        calle: z.string().optional(),
        numero: z.string().optional(),
        pisoDepto: z.string().optional(),
        codigoPostal: z.string().optional(),
        localidad: z.string().optional(),
        provincia: z.string().optional(),
        pais: z.string().optional(),
      })
      .optional(),
    demora: z.string().optional(),
    proveedor: z.string().optional(),
  }),
  total: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    console.log('[CHECKOUT-SIMPLE] 📥 Request recibido')

    const body = await request.json()
    console.log('[CHECKOUT-SIMPLE] 📋 Body recibido:', {
      comprador: body.comprador?.nombre,
      productosCount: body.productos?.length,
      total: body.total,
      envioTipo: body.envio?.tipo,
    })

    // Validar datos
    let validatedData
    try {
      validatedData = createOrderSchema.parse(body)
      console.log('[CHECKOUT-SIMPLE] ✅ Validación exitosa')
    } catch (validationError: any) {
      console.error('[CHECKOUT-SIMPLE] ❌ Error de validación:', validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Datos inválidos',
            details: validationError.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        )
      }
      throw validationError
    }

    // Validar stock
    for (const producto of validatedData.productos) {
      const prod = await getProductById(producto.id)
      if (!prod) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${producto.nombre}` },
          { status: 404 }
        )
      }

      const stockRecord: Record<string, number> = prod.stock || {}
      if (producto.talle) {
        const stockTalle = stockRecord[producto.talle] || 0
        if (stockTalle < producto.cantidad) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${producto.nombre} (Talle ${producto.talle}). Disponible: ${stockTalle}`,
            },
            { status: 400 }
          )
        }
      } else {
        const stockTotal = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        if (stockTotal < producto.cantidad) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${producto.nombre}. Disponible: ${stockTotal}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Crear orden en BD
    let orderId: string | null = null
    try {
      const simpleOrderData: SimpleOrderData = {
        productos: validatedData.productos,
        comprador: validatedData.comprador,
        envio: validatedData.envio,
        total: validatedData.total,
        estado: 'pendiente',
      }

      console.log('[CHECKOUT-SIMPLE] 📤 Creando orden...')
      const order = await createSimpleOrder(simpleOrderData)

      if (!order || !order.id) {
        throw new Error('No se pudo crear la orden: respuesta vacía')
      }

      orderId = order.id
      console.log('[CHECKOUT-SIMPLE] ✅ Orden creada:', orderId)
    } catch (orderError: any) {
      console.error('[CHECKOUT-SIMPLE] ❌ Error creando orden:', orderError)

      if (
        orderError.code === 'PGRST205' ||
        orderError.message.includes('PGRST205') ||
        orderError.message.includes('schema cache')
      ) {
        return NextResponse.json(
          {
            error: 'Error al crear la orden en la base de datos',
            details: orderError.message || "Could not find the table 'public.ordenes'",
            code: 'PGRST205',
            hint: 'Ejecuta la migración SQL en Supabase Dashboard: supabase/migrations/006_create_ordenes_simple.sql',
            migrationFile: 'supabase/migrations/006_create_ordenes_simple.sql',
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: 'Error al crear la orden',
          details: orderError.message || 'Error desconocido',
        },
        { status: 500 }
      )
    }

    // Crear preferencia de Mercado Pago
    const mpItems = validatedData.productos.map((item) => ({
      title: item.nombre + (item.talle ? ` (Talle ${item.talle})` : ''),
      quantity: item.cantidad,
      unit_price: item.precio,
      id: item.id,
      talle: item.talle,
    }))

    if (validatedData.envio.costo > 0) {
      mpItems.push({
        title: `Envío - ${validatedData.envio.metodo || 'Estándar'}`,
        quantity: 1,
        unit_price: validatedData.envio.costo,
        id: 'envio',
        talle: '',
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catalogo-indumentaria.vercel.app'
    const origin = request.headers.get('origin') || baseUrl

    const paymentResponse = await fetch(`${origin}/api/pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: mpItems,
        back_urls: {
          success: `${origin}/pago/success?orderId=${orderId}`,
          failure: `${origin}/pago/failure?orderId=${orderId}`,
          pending: `${origin}/pago/pending?orderId=${orderId}`,
        },
        payer: {
          name: validatedData.comprador.nombre,
          email: validatedData.comprador.email,
          phone: validatedData.comprador.telefono
            ? {
                area_code: '',
                number: validatedData.comprador.telefono,
              }
            : undefined,
          address:
            validatedData.envio.tipo === 'retiro_local'
              ? undefined
              : validatedData.envio.direccion
                ? {
                    street_name: validatedData.envio.direccion.calle || '',
                    street_number: parseInt(validatedData.envio.direccion.numero || '0') || 0,
                    zip_code: validatedData.envio.direccion.codigoPostal || '',
                  }
                : undefined,
        },
        external_reference: orderId,
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

    console.log(
      '[CHECKOUT-SIMPLE] ✅ Preferencia creada:',
      preference.preference_id || preference.id
    )

    return NextResponse.json(
      {
        status: 'ok',
        orderId: orderId,
        preferenceId: preference.preference_id || preference.id,
        initPoint: preference.init_point,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[CHECKOUT-SIMPLE] Error:', error)

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
