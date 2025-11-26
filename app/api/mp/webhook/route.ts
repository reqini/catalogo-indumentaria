import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'
import {
  getProductById,
  getProductos,
  updateProducto,
  createCompraLog,
  getCompraLogs,
  createStockLog,
} from '@/lib/supabase-helpers'
import {
  getOrderByPreferenceId,
  getOrderByPaymentId,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderShipping,
  createOrderLog,
  getOrderById,
} from '@/lib/ordenes-helpers'
import { getSimpleOrderById, updateSimpleOrderStatus } from '@/lib/ordenes-helpers-simple'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'
import { createShippingRequest } from '@/core/shipping/shipping-service'

// CRÍTICO: NO validar al cargar el módulo, validar en runtime
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return hash === signature
}

export async function POST(request: Request) {
  try {
    // CRÍTICO: Validar configuración en runtime
    const mpConfig = validateMercadoPagoConfig()
    const MP_ACCESS_TOKEN = mpConfig.accessToken

    if (!mpConfig.isValid || !MP_ACCESS_TOKEN) {
      console.error('[MP-WEBHOOK] ❌ Mercado Pago no configurado')
      console.error('[MP-WEBHOOK] Errores:', mpConfig.errors)
      return NextResponse.json(
        {
          error: 'Mercado Pago no configurado',
          details: mpConfig.errors.join(', '),
        },
        { status: 500 }
      )
    }

    const bodyText = await request.text()
    const signature = request.headers.get('x-signature')

    // Validar firma del webhook
    if (MP_WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(bodyText, signature, MP_WEBHOOK_SECRET)
      if (!isValid) {
        console.error('[MP-WEBHOOK] ❌ Firma inválida')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)
    const { type, data } = body

    console.log('[MP-WEBHOOK] Evento recibido:', { type, dataId: data?.id })

    // Solo procesar pagos
    if (type === 'payment' && data?.id) {
      // Obtener información del pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      })

      if (!paymentResponse.ok) {
        console.error('[MP-WEBHOOK] ❌ Error fetching payment from MP')
        return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 })
      }

      const payment = await paymentResponse.json()

      console.log(`[MP-WEBHOOK] Estado del pago: ${payment.status}`)
      console.log(`[MP-WEBHOOK] Payment ID: ${payment.id}`)
      console.log(`[MP-WEBHOOK] Preference ID: ${payment.preference_id}`)
      console.log(`[MP-WEBHOOK] External Reference: ${payment.external_reference}`)
      console.log(`[MP-WEBHOOK] Transaction Amount: ${payment.transaction_amount}`)
      console.log(`[MP-WEBHOOK] 🎯 QA LOG - Webhook recibido:`, {
        paymentId: payment.id,
        status: payment.status,
        preferenceId: payment.preference_id,
        externalReference: payment.external_reference,
        amount: payment.transaction_amount,
        itemsCount: payment.additional_info?.items?.length || 0,
        timestamp: new Date().toISOString(),
      })

      // Buscar orden por external_reference (orderId) - primero estructura simplificada
      let order = null
      let simpleOrder = null

      if (payment.external_reference) {
        // Intentar primero con estructura simplificada
        simpleOrder = await getSimpleOrderById(payment.external_reference)
        if (!simpleOrder) {
          // Fallback a estructura completa
          order = await getOrderById(payment.external_reference)
        }
        if (!order && !simpleOrder && payment.preference_id) {
          order = await getOrderByPreferenceId(payment.preference_id)
        }
      } else if (payment.preference_id) {
        order = await getOrderByPreferenceId(payment.preference_id)
      }

      // Verificar idempotencia (solo para estructura completa por ahora)
      if (order && order.pago_id === payment.id.toString() && order.pago_estado === 'aprobado') {
        console.log(`[MP-WEBHOOK] ⚠️ Pago ya procesado anteriormente: ${payment.id}`)
        return NextResponse.json({ message: 'Payment already processed' })
      }

      // Si tenemos orden simplificada, actualizar estado
      if (simpleOrder && payment.status === 'approved') {
        await updateSimpleOrderStatus(simpleOrder.id, 'pagada')
        console.log(`[MP-WEBHOOK] ✅ Orden simplificada ${simpleOrder.id} actualizada a pagada`)

        // Si es retiro en local, enviar notificación
        if (simpleOrder.envio?.tipo === 'retiro_local') {
          try {
            const { notifyLocalPickupReady } = await import('@/lib/notifications')
            await notifyLocalPickupReady({
              orderId: simpleOrder.id,
              clienteEmail: simpleOrder.comprador.email,
              clienteNombre: simpleOrder.comprador.nombre,
              clienteTelefono: simpleOrder.comprador.telefono,
            })
            console.log(`[MP-WEBHOOK] ✅ Notificación de retiro en local enviada`)
          } catch (notifError) {
            console.error('[MP-WEBHOOK] ⚠️ Error enviando notificación de retiro:', notifError)
          }
        }
      }

      // Procesar según el estado del pago
      if (payment.status === 'approved') {
        console.log(`[MP-WEBHOOK] ✅ Pago aprobado: ${payment.id}`)

        // Si hay orden, actualizarla
        if (order) {
          await updateOrderPayment(order.id, {
            pago_estado: 'aprobado',
            pago_id: payment.id.toString(),
            pago_fecha: new Date().toISOString(),
          })

          await updateOrderStatus(
            order.id,
            'pagada',
            'aprobado',
            payment.id.toString(),
            new Date().toISOString()
          )

          await createOrderLog(
            order.id,
            'pago_aprobado',
            {
              pago_estado: 'pendiente',
            },
            {
              pago_estado: 'aprobado',
              pago_id: payment.id.toString(),
            },
            `Pago aprobado por Mercado Pago`
          )

          console.log(`[MP-WEBHOOK] ✅ Orden ${order.id} actualizada a pagada`)
        }

        // Procesar items del pago y actualizar stock
        const items = payment.additional_info?.items || []
        const itemsProcesados: Array<{
          producto: any
          talle: string
          cantidad: number
          precio: number
        }> = []

        // Detectar costo de envío
        let costoEnvio = 0
        let metodoEnvio: string | null = null
        const envioItem = items.find(
          (item: any) =>
            item.id === 'envio' ||
            (item.title && item.title.toLowerCase().includes('envío')) ||
            (item.title && item.title.toLowerCase().includes('envio'))
        )

        if (envioItem) {
          costoEnvio = (envioItem.unit_price || 0) * (envioItem.quantity || 1)
          metodoEnvio = envioItem.title || 'Envío estándar'
          console.log(`[MP-WEBHOOK] 📦 Envío detectado: ${metodoEnvio}, Costo: $${costoEnvio}`)
        }

        for (const item of items) {
          // Saltar el item de envío
          if (item.id === 'envio' || (item.title && item.title.toLowerCase().includes('envío'))) {
            continue
          }

          try {
            let producto = null

            if (item.id) {
              producto = await getProductById(item.id)
            }
            if (!producto && item.title) {
              const productos = await getProductos({ nombre: item.title })
              producto = productos.length > 0 ? productos[0] : null
            }

            if (!producto) {
              console.error(
                `[MP-WEBHOOK] ❌ Producto no encontrado para item: ${item.title || item.id}`
              )
              continue
            }

            // Obtener talle
            let talle: string | undefined = undefined
            const additionalItems = payment.additional_info?.items || []
            const additionalItem = additionalItems.find(
              (ai: any) => (ai.id && ai.id === item.id) || ai.title === item.title
            )

            if (additionalItem?.description && additionalItem.description.includes('Talle:')) {
              talle = additionalItem.description.replace('Talle:', '').trim()
            }

            if (!talle && item.description && item.description.includes('Talle:')) {
              talle = item.description.replace('Talle:', '').trim()
            }

            if (!talle) {
              const talles = producto.talles || []
              talle = talles[0] || 'M'
              console.warn(
                `[MP-WEBHOOK] ⚠️ No se encontró talle específico para ${item.title}, usando: ${talle}`
              )
            }

            const tallesDisponibles = producto.talles || []
            if (!talle || !tallesDisponibles.includes(talle)) {
              console.error(`[MP-WEBHOOK] ❌ Talle ${talle} no válido para este producto`)
              continue
            }

            // Actualizar stock
            const stockRecord: Record<string, number> = producto.stock || {}
            const stockActual = stockRecord[talle] || 0
            const cantidad = item.quantity || 1

            if (stockActual >= cantidad) {
              const nuevoStock = { ...stockRecord }
              nuevoStock[talle] = stockActual - cantidad

              await updateProducto(producto.id, {
                stock: nuevoStock,
              })

              await createCompraLog({
                producto_id: producto.id,
                preferencia_id: payment.preference_id,
                mp_payment_id: payment.id.toString(),
                estado: 'aprobado',
                fecha: new Date().toISOString(),
                cantidad,
                precio_total: (item.unit_price || 0) * cantidad,
                metadata: {
                  ...(talle ? { talle } : {}),
                  ...(costoEnvio > 0 ? { costo_envio: costoEnvio, metodo_envio: metodoEnvio } : {}),
                  orden_id: order?.id,
                },
              })

              await createStockLog({
                producto_id: producto.id,
                accion: 'venta',
                cantidad: -cantidad,
                talle,
                usuario: 'sistema',
              })

              itemsProcesados.push({
                producto,
                talle,
                cantidad,
                precio: item.unit_price || 0,
              })

              console.log(
                `[MP-WEBHOOK] ✅ Stock actualizado para ${item.title} (Talle ${talle}, cantidad: -${cantidad})`
              )
            } else {
              console.error(
                `[MP-WEBHOOK] ❌ Stock insuficiente para ${item.title} (Talle ${talle}). Disponible: ${stockActual}, Solicitado: ${cantidad}`
              )
            }
          } catch (error: any) {
            console.error(`[MP-WEBHOOK] ❌ Error procesando item ${item.title}:`, error)
          }
        }

        // Crear solicitud de envío real (funciona con ambas estructuras)
        const orderForShipping = order || simpleOrder
        const envioData = order
          ? {
              costo: order.envio_costo_total,
              tipo: order.envio_tipo,
              metodo: order.envio_metodo,
              direccion: {
                calle: order.direccion_calle,
                numero: order.direccion_numero,
                pisoDepto: order.direccion_piso_depto,
                codigoPostal: order.direccion_codigo_postal,
                localidad: order.direccion_localidad,
                provincia: order.direccion_provincia,
              },
              cliente: {
                nombre: order.cliente_nombre,
                email: order.cliente_email,
                telefono: order.cliente_telefono,
              },
              productos: order.items || [],
              subtotal: order.subtotal,
            }
          : simpleOrder
            ? {
                costo: simpleOrder.envio?.costo || 0,
                tipo: simpleOrder.envio?.tipo,
                metodo: simpleOrder.envio?.metodo,
                direccion: simpleOrder.envio?.direccion,
                cliente: simpleOrder.comprador,
                productos: simpleOrder.productos || [],
                subtotal: simpleOrder.total - (simpleOrder.envio?.costo || 0),
              }
            : null

        if (
          orderForShipping &&
          envioData &&
          envioData.costo > 0 &&
          envioData.tipo !== 'retiro_local' &&
          envioData.direccion?.codigoPostal
        ) {
          try {
            console.log(
              `[MP-WEBHOOK] 📦 Creando solicitud de envío para orden ${orderForShipping.id}`
            )

            // Calcular peso real desde productos (estimado: 0.5kg por producto)
            const pesoEstimado = Math.max((envioData.productos?.length || 1) * 0.5, 0.5)

            const shippingRequest = {
              codigoPostal: envioData.direccion.codigoPostal,
              peso: pesoEstimado,
              precio: envioData.subtotal,
              provincia: envioData.direccion.provincia,
              direccion: {
                calle: envioData.direccion.calle || '',
                numero: envioData.direccion.numero || '',
                pisoDepto: envioData.direccion.pisoDepto,
                localidad: envioData.direccion.localidad || '',
                provincia: envioData.direccion.provincia || '',
              },
              cliente: {
                nombre: envioData.cliente.nombre,
                email: envioData.cliente.email,
                telefono: envioData.cliente.telefono,
              },
            }

            const shippingResult = await createShippingRequest(
              shippingRequest,
              envioData.metodo || 'OCA Estándar'
            )

            if (shippingResult.success && shippingResult.trackingNumber) {
              // Actualizar según tipo de orden
              if (order) {
                await updateOrderShipping(order.id, {
                  envio_tracking: shippingResult.trackingNumber,
                  envio_proveedor: shippingResult.provider,
                  estado: 'enviada',
                })

                await createOrderLog(
                  order.id,
                  'envio_creado',
                  {},
                  {
                    envio_tracking: shippingResult.trackingNumber,
                    envio_proveedor: shippingResult.provider,
                  },
                  `Envío creado con tracking: ${shippingResult.trackingNumber}`
                )
              } else if (simpleOrder) {
                // Actualizar estructura simplificada
                const { updateSimpleOrderWithTracking } = await import(
                  '@/lib/ordenes-helpers-simple'
                )
                await updateSimpleOrderWithTracking(simpleOrder.id, {
                  tracking: shippingResult.trackingNumber!,
                  provider: shippingResult.provider || 'Envíopack',
                  status: 'en_transito',
                })
              }

              console.log(`[MP-WEBHOOK] ✅ Envío creado: ${shippingResult.trackingNumber}`)

              // Enviar notificación al cliente con tracking
              try {
                const { notifyShippingCreated } = await import('@/lib/notifications')
                await notifyShippingCreated({
                  orderId: orderForShipping.id,
                  trackingNumber: shippingResult.trackingNumber,
                  clienteEmail: envioData.cliente.email,
                  clienteNombre: envioData.cliente.nombre,
                  envioMetodo: envioData.metodo || 'OCA Estándar' || '',
                  envioProveedor: shippingResult.provider,
                })
                console.log(`[MP-WEBHOOK] ✅ Notificación de envío enviada al cliente`)
              } catch (notifError) {
                console.error('[MP-WEBHOOK] ⚠️ Error enviando notificación de envío:', notifError)
                // No fallar el flujo por error de notificación
              }
            } else {
              console.error(`[MP-WEBHOOK] ❌ Error creando envío: ${shippingResult.error}`)
            }
          } catch (error: any) {
            console.error(`[MP-WEBHOOK] ❌ Error creando solicitud de envío:`, error)
            // No fallar el webhook por error de envío
          }
        }

        // Enviar notificaciones usando el sistema de notificaciones
        try {
          // Usar orden completa si está disponible, sino usar simpleOrder
          const orderForNotification = order || simpleOrder
          if (orderForNotification && itemsProcesados.length > 0) {
            // Adaptar datos según tipo de orden
            const orderData = order || {
              id: simpleOrder?.id || '',
              cliente_nombre: simpleOrder?.comprador?.nombre || '',
              cliente_email: simpleOrder?.comprador?.email || '',
              cliente_telefono: simpleOrder?.comprador?.telefono || '',
              subtotal: (simpleOrder?.total || 0) - (simpleOrder?.envio?.costo || 0),
              envio_costo_total: simpleOrder?.envio?.costo || 0,
              total: simpleOrder?.total || 0,
              envio_metodo: simpleOrder?.envio?.metodo || '',
              envio_tracking: null,
              envio_proveedor: simpleOrder?.envio?.proveedor || '',
              direccion_calle: simpleOrder?.envio?.direccion?.calle || '',
              direccion_numero: simpleOrder?.envio?.direccion?.numero || '',
              direccion_localidad: simpleOrder?.envio?.direccion?.localidad || '',
              direccion_provincia: simpleOrder?.envio?.direccion?.provincia || '',
              direccion_codigo_postal: simpleOrder?.envio?.direccion?.codigoPostal || '',
            }
            const { notifyOrderConfirmed, notifyAdminNewOrder } = await import(
              '@/lib/notifications'
            )

            // Notificar al cliente
            await notifyOrderConfirmed({
              orderId: orderData.id,
              clienteNombre: orderData.cliente_nombre,
              clienteEmail: orderData.cliente_email,
              clienteTelefono: orderData.cliente_telefono,
              items: itemsProcesados.map((item) => ({
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                talle: item.talle,
                precio: item.precio,
              })),
              subtotal: orderData.subtotal,
              envioCosto: orderData.envio_costo_total,
              total: orderData.total,
              envioMetodo: orderData.envio_metodo,
              envioTracking: orderData.envio_tracking || undefined,
              envioProveedor: orderData.envio_proveedor,
              direccion: {
                calle: orderData.direccion_calle,
                numero: orderData.direccion_numero,
                localidad: orderData.direccion_localidad,
                provincia: orderData.direccion_provincia,
                codigoPostal: orderData.direccion_codigo_postal,
              },
            })

            // Notificar al admin
            await notifyAdminNewOrder({
              orderId: orderData.id,
              clienteNombre: orderData.cliente_nombre,
              clienteEmail: orderData.cliente_email,
              clienteTelefono: orderData.cliente_telefono,
              items: itemsProcesados.map((item) => ({
                nombre: item.producto.nombre,
                cantidad: item.cantidad,
                talle: item.talle,
                precio: item.precio,
              })),
              subtotal: orderData.subtotal,
              envioCosto: orderData.envio_costo_total,
              total: orderData.total,
              envioMetodo: orderData.envio_metodo,
              envioTracking: orderData.envio_tracking || undefined,
              envioProveedor: orderData.envio_proveedor,
            })

            console.log(`[MP-WEBHOOK] ✅ Notificaciones enviadas`)
          }
        } catch (notifError) {
          console.error('[MP-WEBHOOK] ❌ Error enviando notificaciones (no crítico):', notifError)
        }

        console.log('[MP-WEBHOOK] ✅ Pago procesado exitosamente')
        return NextResponse.json({ message: 'Payment processed successfully' })
      } else if (payment.status === 'pending') {
        console.log(`[MP-WEBHOOK] ⏳ Pago pendiente: ${payment.id}`)

        if (order) {
          await updateOrderPayment(order.id, {
            pago_estado: 'pendiente',
            pago_id: payment.id.toString(),
          })
        } else if (simpleOrder) {
          // Para orden simplificada, solo actualizar estado
          await updateSimpleOrderStatus(simpleOrder.id, 'pendiente')
        }

        return NextResponse.json({ message: 'Payment pending' })
      } else if (payment.status === 'rejected') {
        console.log(`[MP-WEBHOOK] ❌ Pago rechazado: ${payment.id}`)

        if (order) {
          await updateOrderPayment(order.id, {
            pago_estado: 'rechazado',
            pago_id: payment.id.toString(),
          })

          await createOrderLog(
            order.id,
            'pago_rechazado',
            {},
            {
              pago_estado: 'rechazado',
              pago_id: payment.id.toString(),
            },
            `Pago rechazado por Mercado Pago`
          )
        } else if (simpleOrder) {
          await updateSimpleOrderStatus(simpleOrder.id, 'rechazada')
        }

        return NextResponse.json({ message: 'Payment rejected' })
      } else {
        console.log(`[MP-WEBHOOK] ⚠️ Pago con estado desconocido: ${payment.status}`)
      }
    }

    return NextResponse.json({ message: 'Event received' })
  } catch (error: any) {
    console.error('[MP-WEBHOOK] ❌ Error procesando webhook:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error processing webhook',
      },
      { status: 500 }
    )
  }
}
