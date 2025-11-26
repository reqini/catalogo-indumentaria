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
    console.log('[CHECKOUT][API] 📥 Request recibido')

    const body = await request.json()
    console.log('[CHECKOUT][API] 📋 Body recibido:', {
      comprador: body.comprador?.nombre,
      productosCount: body.productos?.length,
      total: body.total,
      envioTipo: body.envio?.tipo,
    })

    // Validar datos
    let validatedData
    try {
      validatedData = createOrderSchema.parse(body)
      console.log('[CHECKOUT][API] ✅ Validación exitosa')
    } catch (validationError: any) {
      console.error('[CHECKOUT][API] ❌ Error de validación:', validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            ok: false,
            code: 'CHECKOUT_VALIDATION_ERROR',
            message: 'Datos inválidos',
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
          {
            ok: false,
            code: 'CHECKOUT_PRODUCT_NOT_FOUND',
            message: `Producto no encontrado: ${producto.nombre}`,
          },
          { status: 404 }
        )
      }

      const stockRecord: Record<string, number> = prod.stock || {}
      if (producto.talle) {
        const stockTalle = stockRecord[producto.talle] || 0
        if (stockTalle < producto.cantidad) {
          return NextResponse.json(
            {
              ok: false,
              code: 'CHECKOUT_INSUFFICIENT_STOCK',
              message: `Stock insuficiente para ${producto.nombre} (Talle ${producto.talle}). Disponible: ${stockTalle}`,
            },
            { status: 400 }
          )
        }
      } else {
        const stockTotal = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        if (stockTotal < producto.cantidad) {
          return NextResponse.json(
            {
              ok: false,
              code: 'CHECKOUT_INSUFFICIENT_STOCK',
              message: `Stock insuficiente para ${producto.nombre}. Disponible: ${stockTotal}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Crear orden en BD
    let orderId: string | null = null
    const simpleOrderData: SimpleOrderData = {
      productos: validatedData.productos,
      comprador: validatedData.comprador,
      envio: validatedData.envio,
      total: validatedData.total,
      estado: 'pendiente',
    }

    try {
      console.log('[CHECKOUT][API] 📤 Creando orden en Supabase...')
      const order = await createSimpleOrder(simpleOrderData)

      if (!order || !order.id) {
        throw new Error('No se pudo crear la orden: respuesta vacía')
      }

      orderId = order.id
      console.log('[CHECKOUT][API] ✅ Orden creada exitosamente:', orderId)
      console.log('[CHECKOUT][API] 🎯 QA LOG - Orden creada:', {
        orderId,
        productosCount: validatedData.productos.length,
        total: validatedData.total,
        envioTipo: validatedData.envio.tipo,
        timestamp: new Date().toISOString(),
      })
    } catch (orderError: any) {
      console.error('[CHECKOUT][API] ❌ Error creando orden:', orderError)
      console.error('[CHECKOUT][API]   - Código:', orderError.code)
      console.error('[CHECKOUT][API]   - Mensaje:', orderError.message)
      console.error('[CHECKOUT][API]   - Stack:', orderError.stack)

      // Si es PGRST205, intentar crear tabla automáticamente
      if (
        orderError.code === 'PGRST205' ||
        orderError.message.includes('PGRST205') ||
        orderError.message.includes('schema cache')
      ) {
        console.log('[CHECKOUT-SIMPLE] 🔧 Intentando crear tabla automáticamente...')

        try {
          // Intentar crear tabla usando endpoint interno
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            request.headers.get('origin') ||
            'https://catalogo-indumentaria.vercel.app'
          const createTableResponse = await fetch(
            `${baseUrl}/api/admin/crear-tabla-ordenes-emergencia`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (createTableResponse.ok) {
            const createResult = await createTableResponse.json()
            if (createResult.success) {
              console.log('[CHECKOUT-SIMPLE] ✅ Tabla creada, reintentando creación de orden...')

              // Esperar un momento para que se actualice el cache
              await new Promise((resolve) => setTimeout(resolve, 2000))

              // Reintentar crear orden (simpleOrderData está en scope)
              const retryOrder = await createSimpleOrder(simpleOrderData)
              if (retryOrder && retryOrder.id) {
                orderId = retryOrder.id
                console.log('[CHECKOUT-SIMPLE] ✅ Orden creada después de crear tabla:', orderId)
              } else {
                throw new Error('No se pudo crear orden después de crear tabla')
              }
            } else {
              // Si no se pudo crear automáticamente, dar instrucciones
              return NextResponse.json(
                {
                  ok: false,
                  code: 'CHECKOUT_CREATE_ORDER_ERROR',
                  message: 'Error al crear la orden en la base de datos',
                  detail: 'La tabla ordenes no existe y no se pudo crear automáticamente',
                  errorCode: 'PGRST205',
                  hint: 'Ejecuta el SQL manualmente en Supabase Dashboard → SQL Editor',
                  migrationFile: 'supabase/schemas/checkout-schema-completo.sql',
                  instructions: createResult.instructions || [
                    '1. Ve a https://supabase.com/dashboard',
                    '2. Selecciona tu proyecto',
                    '3. Click en "SQL Editor"',
                    '4. Click en "New query"',
                    '5. Copia y pega el contenido de: supabase/schemas/checkout-schema-completo.sql',
                    '6. Click en "Run"',
                    '7. Verifica éxito',
                  ],
                },
                { status: 500 }
              )
            }
          } else {
            // Fallback a mensaje con SQL
            return NextResponse.json(
              {
                ok: false,
                code: 'CHECKOUT_CREATE_ORDER_ERROR',
                message: 'Error al crear la orden en la base de datos',
                detail: orderError.message || "Could not find the table 'public.ordenes'",
                errorCode: 'PGRST205',
                hint: 'Ejecuta el SQL en Supabase Dashboard → SQL Editor',
                migrationFile: 'supabase/schemas/checkout-schema-completo.sql',
                urgent: true,
              },
              { status: 500 }
            )
          }
        } catch (autoCreateError: any) {
          console.error(
            '[CHECKOUT-SIMPLE] ❌ Error al crear tabla automáticamente:',
            autoCreateError
          )

          return NextResponse.json(
            {
              ok: false,
              code: 'CHECKOUT_CREATE_ORDER_ERROR',
              message: 'Error al crear la orden en la base de datos',
              detail: orderError.message || "Could not find the table 'public.ordenes'",
              errorCode: 'PGRST205',
              hint: 'Ejecuta el SQL manualmente en Supabase Dashboard → SQL Editor',
              migrationFile: 'supabase/schemas/checkout-schema-completo.sql',
              urgent: true,
            },
            { status: 500 }
          )
        }
      } else {
        // Otro error
        return NextResponse.json(
          {
            ok: false,
            code: 'CHECKOUT_CREATE_ORDER_ERROR',
            message: 'Error al crear la orden',
            detail: orderError.message || 'Error desconocido',
            errorCode: orderError.code || 'UNKNOWN',
          },
          { status: 500 }
        )
      }
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
      console.error('[CHECKOUT][API] ❌ Error creando preferencia MP:', errorData)
      throw new Error(errorData.error || 'Error al crear la preferencia de pago')
    }

    const preference = await paymentResponse.json()

    if (!preference.init_point) {
      console.error('[CHECKOUT][API] ❌ Preferencia MP sin init_point:', preference)
      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_MP_PREFERENCE_ERROR',
          message: 'Error al crear la preferencia de pago',
          detail: 'La preferencia no contiene init_point',
        },
        { status: 500 }
      )
    }

    console.log(
      '[CHECKOUT][API] ✅ Preferencia MP creada:',
      preference.preference_id || preference.id
    )

    // Actualizar orden con preference ID
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      if (supabaseAdmin && orderId) {
        const { error: updateError } = await supabaseAdmin
          .from('ordenes')
          .update({
            pago_preferencia_id: preference.preference_id || preference.id,
            pago_estado: 'pendiente',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (updateError) {
          console.warn(
            '[CHECKOUT-SIMPLE] ⚠️ No se pudo actualizar orden con preference ID:',
            updateError.message
          )
          console.warn(
            '[CHECKOUT-SIMPLE] 💡 Ejecuta migración: supabase/migrations/007_add_pago_fields_to_ordenes.sql'
          )
        } else {
          console.log('[CHECKOUT-SIMPLE] ✅ Preference ID guardado en orden')
        }
      }
    } catch (updateError) {
      console.warn(
        '[CHECKOUT-SIMPLE] ⚠️ No se pudo actualizar orden con preference ID:',
        updateError
      )
    }

    console.log('[CHECKOUT][API] ✅ Checkout completado exitosamente:', {
      orderId,
      preferenceId: preference.preference_id || preference.id,
      initPoint: preference.init_point,
    })

    return NextResponse.json(
      {
        ok: true,
        code: 'CHECKOUT_SUCCESS',
        orderId: orderId,
        preferenceId: preference.preference_id || preference.id,
        initPoint: preference.init_point,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    )
  } catch (error: any) {
    console.error('[CHECKOUT][API] ❌ Error fatal:', error)
    console.error('[CHECKOUT][API]   - Stack:', error.stack)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        code: 'CHECKOUT_INTERNAL_ERROR',
        message: 'Error al procesar el checkout',
        detail: error.message || 'Error desconocido',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    )
  }
}
