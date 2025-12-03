import { NextResponse } from 'next/server'
import { createSimpleOrder, SimpleOrderData } from '@/lib/ordenes-helpers-simple'
import { createPayment } from '@/utils/api'
import { getProductById } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig, getMercadoPagoErrorMessage } from '@/lib/mercadopago/validate'
import { getCheckoutMonitor } from '@/lib/checkout-monitor'
import { getSystemGuardian } from '@/lib/system-guardian'
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
  const monitor = getCheckoutMonitor()
  const guardian = getSystemGuardian()

  try {
    console.log('[CHECKOUT][API] 📥 Request recibido')

    // Monitorear checkout con wrapper
    const body = await request.json()
    const { result, monitorResult } = await monitor.monitorCheckoutRequest(body, async () => {
      return await processCheckout(request, body)
    })

    // Si hay errores en el monitoreo, registrar pero continuar
    if (!monitorResult.success && monitorResult.errors.length > 0) {
      monitorResult.errors.forEach((error) => {
        guardian.detectError('critical', 'checkout', error.message, {
          details: error.details,
          file: error.file,
          line: error.line,
          solution: error.solution,
        })
      })
    }

    return result
  } catch (error: any) {
    // El error ya fue manejado por el monitor
    guardian.detectCheckoutFailure(error)
    throw error
  }
}

async function processCheckout(request: Request, body: any) {
  try {
    // CRÍTICO: Validar configuración de Mercado Pago ANTES de procesar la orden
    // Esto evita crear órdenes cuando sabemos que fallará el pago
    const mpConfig = validateMercadoPagoConfig()
    const MP_ACCESS_TOKEN =
      process.env.MP_ACCESS_TOKEN ||
      process.env['MP_ACCESS_TOKEN'] ||
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      process.env['MERCADOPAGO_ACCESS_TOKEN'] ||
      mpConfig.accessToken

    if (!MP_ACCESS_TOKEN || !mpConfig.isValid) {
      console.error(
        '[CHECKOUT][API] ❌ [ERROR CRÍTICO] MP_ACCESS_TOKEN no configurado ANTES de procesar orden'
      )
      console.error('[CHECKOUT][API] Errores de validación:', mpConfig.errors)
      const IS_VERCEL = !!process.env.VERCEL
      const VERCEL_ENV = process.env.VERCEL_ENV || 'local'

      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_MP_CONFIG_ERROR',
          message: 'No se pudo generar el pago. La configuración de Mercado Pago no está completa.',
          detail: IS_VERCEL
            ? 'MP_ACCESS_TOKEN no está configurado en Vercel Dashboard. Configura la variable y haz REDEPLOY.'
            : 'MP_ACCESS_TOKEN no está configurado. Configura la variable en .env.local para desarrollo local.',
          help: {
            message: IS_VERCEL
              ? 'Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables → Production y haz REDEPLOY'
              : 'Configura MP_ACCESS_TOKEN en .env.local',
            redeploy: IS_VERCEL
              ? 'Después de agregar la variable, haz REDEPLOY en Vercel'
              : undefined,
            panel: 'https://www.mercadopago.com.ar/developers/panel',
            errors: mpConfig.errors,
            environment: VERCEL_ENV,
            docs: '/docs/SOLUCION_MP_ACCESS_TOKEN.md',
            steps: IS_VERCEL
              ? [
                  '1. Ve a https://vercel.com/dashboard',
                  '2. Selecciona proyecto: catalogo-indumentaria',
                  '3. Settings → Environment Variables',
                  '4. Agrega: MP_ACCESS_TOKEN = tu-token-aqui',
                  '5. Selecciona: Production, Preview, Development',
                  '6. Guarda y haz REDEPLOY',
                ]
              : [
                  '1. Crea archivo .env.local en la raíz del proyecto',
                  '2. Agrega: MP_ACCESS_TOKEN=tu-token-aqui',
                ],
          },
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      )
    }

    console.log('[CHECKOUT][API] ✅ Configuración de Mercado Pago válida')

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

    console.log('[CHECKOUT][API] 📤 Creando preferencia MP...')
    console.log('[CHECKOUT][API]   - Origin:', origin)
    console.log('[CHECKOUT][API]   - Base URL:', baseUrl)
    console.log('[CHECKOUT][API]   - Items:', mpItems.length)
    console.log('[CHECKOUT][API]   - Order ID:', orderId)

    let paymentResponse
    try {
      paymentResponse = await fetch(`${origin}/api/pago`, {
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
    } catch (fetchError: any) {
      console.error('[CHECKOUT][API] ❌ Error en fetch a /api/pago:', fetchError)
      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_MP_CONNECTION_ERROR',
          message: 'Error de conexión al crear preferencia de pago',
          detail: fetchError.message || 'Error desconocido',
        },
        { status: 500 }
      )
    }

    if (!paymentResponse.ok) {
      let errorData
      try {
        errorData = await paymentResponse.json()
      } catch (parseError) {
        const errorText = await paymentResponse.text().catch(() => 'Error desconocido')
        console.error('[CHECKOUT][API] ❌ Error parseando respuesta de MP:', parseError)
        console.error('[CHECKOUT][API] ❌ Respuesta raw:', errorText)
        errorData = {
          error: `Error HTTP ${paymentResponse.status}`,
          details: errorText.substring(0, 200),
        }
      }

      console.error('[CHECKOUT][API] ❌ Error creando preferencia MP:')
      console.error('[CHECKOUT][API]   - Status:', paymentResponse.status)
      console.error('[CHECKOUT][API]   - Error data:', errorData)

      // Manejar diferentes tipos de errores de Mercado Pago
      if (paymentResponse.status === 503) {
        // Si es 503, puede ser mantenimiento manual o error de configuración
        if (errorData.code === 'CHECKOUT_DISABLED') {
          // Mantenimiento manual activado
          console.warn('[CHECKOUT][API] ⚠️ Checkout deshabilitado manualmente')
          return NextResponse.json(
            {
              ok: false,
              code: 'CHECKOUT_DISABLED',
              message:
                errorData.message ||
                'El checkout está temporalmente deshabilitado por mantenimiento.',
              detail: errorData.detail || 'manual-toggle',
            },
            { status: 503 }
          )
        } else {
          // Error de configuración de MP
          console.error('[CHECKOUT][API] ❌ Error de configuración de Mercado Pago:', errorData)
          return NextResponse.json(
            {
              ok: false,
              code: errorData.code || 'CHECKOUT_MP_CONFIG_ERROR',
              message:
                errorData.message ||
                'No se pudo generar el pago. Verificá la configuración de Mercado Pago.',
              detail: errorData.detail || errorData.details || null,
              help: errorData.help || {
                message:
                  'Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables',
              },
            },
            { status: 500 } // Error de configuración, no mantenimiento
          )
        }
      }

      // Si es error 500 y código específico de token faltante
      if (paymentResponse.status === 500 && errorData.code === 'MP_ACCESS_TOKEN_MISSING') {
        console.error('[CHECKOUT][API] ❌ [ERROR] MP_ACCESS_TOKEN no configurado:', errorData)
        return NextResponse.json(
          {
            ok: false,
            code: 'CHECKOUT_MP_CONFIG_ERROR',
            message:
              'No se pudo generar el pago. La configuración de Mercado Pago no está completa.',
            detail: errorData.detail || 'MP_ACCESS_TOKEN no configurado',
            help: errorData.help || {
              message: 'Configura MP_ACCESS_TOKEN en Vercel Dashboard y haz REDEPLOY',
            },
          },
          { status: 500 }
        )
      }

      // Otros errores de MP (400, 401, 500, etc.)
      const mpErrorCode = errorData.code || 'CHECKOUT_MP_ERROR'
      const mpErrorMsg =
        errorData.message ||
        errorData.error ||
        'No pudimos generar el pago con Mercado Pago. Intentalo de nuevo en unos minutos.'

      console.error('[CHECKOUT][API] ❌ [ERROR] Error de Mercado Pago:', {
        code: mpErrorCode,
        message: mpErrorMsg,
        status: paymentResponse.status,
        detail: errorData.detail || errorData.details,
      })

      return NextResponse.json(
        {
          ok: false,
          code: mpErrorCode,
          message: mpErrorMsg,
          detail: errorData.detail || errorData.details || errorData.mpError || null,
        },
        { status: paymentResponse.status >= 400 && paymentResponse.status < 500 ? 502 : 500 } // Bad Gateway si es error 4xx, Internal Server Error si es 5xx
      )
    }

    const preference = await paymentResponse.json()

    // Validar que la respuesta sea exitosa y tenga init_point
    if (!preference.ok && preference.ok !== undefined) {
      console.error('[CHECKOUT][API] ❌ [ERROR] Respuesta de MP indica error:', preference)
      return NextResponse.json(
        {
          ok: false,
          code: preference.code || 'CHECKOUT_MP_PREFERENCE_ERROR',
          message: preference.message || 'Error al crear la preferencia de pago',
          detail: preference.detail || null,
        },
        { status: 500 }
      )
    }

    if (!preference.init_point) {
      console.error('[CHECKOUT][API] ❌ [ERROR] Preferencia MP sin init_point:', {
        hasInitPoint: !!preference.init_point,
        hasPreferenceId: !!preference.preference_id,
        responseKeys: Object.keys(preference),
      })
      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_MP_PREFERENCE_ERROR',
          message: 'No se recibió una URL válida de pago de Mercado Pago.',
          detail: 'La preferencia no contiene init_point',
        },
        { status: 500 }
      )
    }

    const preferenceId = preference.preference_id || preference.id
    const initPoint = preference.init_point

    console.log('[CHECKOUT][API] ✅ [SUCCESS] Preferencia MP creada:', preferenceId)

    // Actualizar orden con preference ID
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      if (supabaseAdmin && orderId) {
        const { error: updateError } = await supabaseAdmin
          .from('ordenes')
          .update({
            pago_preferencia_id: preferenceId,
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

    console.log('[CHECKOUT][API] ✅ [SUCCESS] Checkout completado exitosamente:', {
      orderId,
      preferenceId,
      initPoint: initPoint?.substring(0, 50) + '...',
      itemsCount: validatedData.productos.length,
      total: validatedData.total,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        ok: true,
        code: 'CHECKOUT_SUCCESS',
        orderId: orderId,
        preferenceId: preferenceId,
        initPoint: initPoint,
        totals: {
          subtotal: validatedData.productos.reduce((sum, p) => sum + p.subtotal, 0),
          shipping: validatedData.envio.costo,
          total: validatedData.total,
        },
        shipping: {
          tipo: validatedData.envio.tipo,
          metodo: validatedData.envio.metodo,
          costo: validatedData.envio.costo,
        },
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
