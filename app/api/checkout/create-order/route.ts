import { NextResponse } from 'next/server'
import { createOrder, OrderData, Order } from '@/lib/ordenes-helpers'
import { createSimpleOrder, SimpleOrderData } from '@/lib/ordenes-helpers-simple'
import { createPayment } from '@/utils/api'
import { getProductById } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'
import { z } from 'zod'

// Schema de validación con validación condicional para retiro en local
const createOrderSchema = z
  .object({
    cliente: z.object({
      nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      telefono: z.string().optional(),
    }),
    direccion: z.object({
      calle: z.string(),
      numero: z.string(),
      pisoDepto: z.string().optional(),
      codigoPostal: z.string(),
      localidad: z.string(),
      provincia: z.string(),
      pais: z.string().optional(),
    }),
    envio: z.object({
      tipo: z.enum(['estandar', 'express', 'retiro_local']),
      metodo: z.string().min(1, 'El método de envío es requerido'),
      costo: z.number().min(0),
      demora: z.string().optional(),
      proveedor: z.string().nullable().optional(),
    }),
    items: z
      .array(
        z.object({
          id: z.string().min(1, 'El ID del producto es requerido'),
          nombre: z.string().min(1, 'El nombre del producto es requerido'),
          precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
          cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
          talle: z.string().optional(),
          subtotal: z.number().min(0),
          imagenPrincipal: z.string().optional(),
        })
      )
      .min(1, 'Debe haber al menos un producto en la orden'),
    subtotal: z.number().min(0),
    descuento: z.number().min(0).optional(),
    envioCosto: z.number().min(0),
    total: z.number().min(0),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si es retiro_local, no validar dirección
      if (data.envio.tipo === 'retiro_local') {
        return true
      }
      // Si es envío, validar que todos los campos de dirección estén completos
      return (
        data.direccion.calle &&
        data.direccion.calle.length >= 3 &&
        data.direccion.numero &&
        data.direccion.numero.length >= 1 &&
        data.direccion.codigoPostal &&
        data.direccion.codigoPostal.length >= 4 &&
        data.direccion.localidad &&
        data.direccion.localidad.length >= 2 &&
        data.direccion.provincia &&
        data.direccion.provincia.length >= 2
      )
    },
    {
      message:
        'Si elegiste envío a domicilio, completá todos los campos de dirección (calle, número, código postal, localidad y provincia)',
      path: ['direccion'],
    }
  )

export async function POST(request: Request) {
  try {
    console.log('[CHECKOUT] 📥 Request recibido en /api/checkout/create-order')

    const body = await request.json()
    console.log('[CHECKOUT] 📋 Body recibido completo:', JSON.stringify(body, null, 2))
    console.log('[CHECKOUT] 📋 Resumen:', {
      cliente: body.cliente?.nombre,
      email: body.cliente?.email,
      itemsCount: body.items?.length,
      envioTipo: body.envio?.tipo,
      envioMetodo: body.envio?.metodo,
      envioCosto: body.envioCosto,
      total: body.total,
      direccionCompleta: body.direccion?.calle ? 'Sí' : 'No',
    })

    // Validar datos
    let validatedData
    try {
      validatedData = createOrderSchema.parse(body)
      console.log('[CHECKOUT] ✅ Validación de datos exitosa')
    } catch (validationError: any) {
      console.error('[CHECKOUT] ❌ Error de validación completo:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('[CHECKOUT] ❌ Errores de validación detallados:')
        validationError.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
        return NextResponse.json(
          {
            error: 'Datos inválidos',
            details: validationError.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
            hint: 'Verifica que todos los campos requeridos estén completos',
          },
          { status: 400 }
        )
      }
      throw validationError
    }

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

    // Crear orden en la base de datos (usar estructura simplificada)
    let orderId: string | null = null

    try {
      // Convertir datos a estructura simplificada
      const simpleOrderData: SimpleOrderData = {
        productos: validatedData.items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          talle: item.talle,
          subtotal: item.subtotal,
          imagenPrincipal: item.imagenPrincipal,
        })),
        comprador: {
          nombre: validatedData.cliente.nombre,
          email: validatedData.cliente.email,
          telefono: validatedData.cliente.telefono,
        },
        envio: {
          tipo: validatedData.envio.tipo,
          metodo: validatedData.envio.metodo,
          costo: validatedData.envio.costo,
          direccion:
            validatedData.envio.tipo === 'retiro_local'
              ? undefined
              : {
                  calle: validatedData.direccion.calle,
                  numero: validatedData.direccion.numero,
                  pisoDepto: validatedData.direccion.pisoDepto,
                  codigoPostal: validatedData.direccion.codigoPostal,
                  localidad: validatedData.direccion.localidad,
                  provincia: validatedData.direccion.provincia,
                  pais: validatedData.direccion.pais,
                },
          demora: validatedData.envio.demora,
          proveedor: validatedData.envio.proveedor || undefined,
        },
        total: validatedData.total,
        estado: 'pendiente',
      }

      console.log('[CHECKOUT] 📤 Creando orden con estructura simplificada...')
      const simpleOrder = await createSimpleOrder(simpleOrderData)

      if (!simpleOrder || !simpleOrder.id) {
        throw new Error('No se pudo crear la orden: respuesta vacía')
      }

      orderId = simpleOrder.id
      console.log('[CHECKOUT] ✅ Orden creada:', orderId)
    } catch (orderError: any) {
      console.error('[CHECKOUT] ❌ Error detallado al crear orden:', orderError)
      console.error('[CHECKOUT]   - Mensaje:', orderError.message)
      console.error('[CHECKOUT]   - Código:', orderError.code)
      console.error('[CHECKOUT]   - Hint:', orderError.hint)
      console.error('[CHECKOUT]   - Stack:', orderError.stack)

      // Si es error de tabla no encontrada, dar instrucciones claras
      if (
        orderError.code === 'PGRST205' ||
        orderError.message.includes('PGRST205') ||
        orderError.message.includes('schema cache')
      ) {
        return NextResponse.json(
          {
            error: 'Error al crear la orden en la base de datos',
            details:
              orderError.message ||
              "Could not find the table 'public.ordenes' in the schema cache (PGRST205)",
            code: 'PGRST205',
            hint:
              orderError.hint ||
              'La tabla ordenes no existe en Supabase. Ejecuta la migración SQL en Supabase Dashboard: supabase/migrations/006_create_ordenes_simple.sql',
            migrationFile: 'supabase/migrations/006_create_ordenes_simple.sql',
            actionRequired: 'Ejecutar migración SQL en Supabase Dashboard → SQL Editor',
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: 'Error al crear la orden en la base de datos',
          details: orderError.message || 'Error desconocido',
          code: orderError.code || 'UNKNOWN',
          hint:
            orderError.hint ||
            'Verifica que la tabla "ordenes" exista y tenga la estructura correcta',
        },
        { status: 500 }
      )
    }

    if (!orderId) {
      console.error('[CHECKOUT] ❌ createSimpleOrder retornó null sin lanzar error')
      return NextResponse.json(
        {
          error: 'Error al crear la orden',
          details: 'La función createSimpleOrder retornó null sin información adicional',
        },
        { status: 500 }
      )
    }

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
          success: `${origin}/pago/success?orderId=${orderId}`,
          failure: `${origin}/pago/failure?orderId=${orderId}`,
          pending: `${origin}/pago/pending?orderId=${orderId}`,
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
          address:
            validatedData.envio.tipo === 'retiro_local'
              ? undefined
              : {
                  street_name: validatedData.direccion.calle || '',
                  street_number: parseInt(validatedData.direccion.numero || '0') || 0,
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
