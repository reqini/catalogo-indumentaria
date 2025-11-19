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

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return hash === signature
}

export async function POST(request: Request) {
  try {
    if (!MP_ACCESS_TOKEN) {
      console.error('[MP-WEBHOOK] ❌ Mercado Pago no configurado')
      return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 500 })
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

    // Solo procesar pagos aprobados
    if (type === 'payment' && data?.id) {
      // Obtener información del pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          },
        }
      )

      if (!paymentResponse.ok) {
        console.error('[MP-WEBHOOK] ❌ Error fetching payment from MP')
        return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 })
      }

      const payment = await paymentResponse.json()

      console.log(`[MP-WEBHOOK] Estado del pago: ${payment.status}`)
      console.log(`[MP-WEBHOOK] Payment ID: ${payment.id}`)
      console.log(`[MP-WEBHOOK] Preference ID: ${payment.preference_id}`)
      console.log(`[MP-WEBHOOK] Transaction Amount: ${payment.transaction_amount}`)
      
      // Procesar según el estado del pago
      if (payment.status === 'approved') {
        console.log(`[MP-WEBHOOK] ✅ Pago aprobado: ${payment.id}`)
        
        // Verificar idempotencia: buscar si ya se procesó este pago
        const comprasExistentes = await getCompraLogs({ estado: 'aprobado' })
        const existingLog = comprasExistentes.find(
          (log: any) => log.mp_payment_id === payment.id.toString() && log.estado === 'aprobado'
        )

        if (existingLog) {
          // Idempotencia: ya se procesó este pago
          console.log(`[MP-WEBHOOK] ⚠️ Pago ya procesado anteriormente: ${payment.id}`)
          return NextResponse.json({ message: 'Payment already processed' })
        }

        // Procesar items del pago
        const items = payment.additional_info?.items || []
        const itemsProcesados: Array<{ producto: any; talle: string; cantidad: number; precio: number }> = []

        for (const item of items) {
          try {
            // Buscar producto por ID (preferido) o por nombre (fallback)
            let producto = null
            
            if (item.id) {
              producto = await getProductById(item.id)
              console.log(`[MP-WEBHOOK] Buscando producto por ID: ${item.id}`, producto ? '✅ Encontrado' : '❌ No encontrado')
            }
            
            if (!producto && item.title) {
              const productos = await getProductos({ nombre: item.title })
              producto = productos.length > 0 ? productos[0] : null
              console.log(`[MP-WEBHOOK] Buscando producto por nombre: ${item.title}`, producto ? '✅ Encontrado' : '❌ No encontrado')
            }

            if (!producto) {
              console.error(`[MP-WEBHOOK] ❌ Producto no encontrado para item: ${item.title || item.id}`)
              continue
            }

            // Obtener talle del item o del metadata de la preferencia
            let talle: string | undefined = undefined
            
            // Intentar obtener talle de additional_info.items (preferencia)
            const additionalItems = payment.additional_info?.items || []
            const additionalItem = additionalItems.find((ai: any) => 
              (ai.id && ai.id === item.id) || ai.title === item.title
            )
            
            if (additionalItem?.description && additionalItem.description.includes('Talle:')) {
              talle = additionalItem.description.replace('Talle:', '').trim()
            }
            
            // Si no se encontró, buscar en CompraLog pendiente
            if (!talle) {
              const comprasPendientes = await getCompraLogs({ estado: 'pendiente' })
              const compraLogPendiente = comprasPendientes.find(
                (log: any) => log.producto_id === producto.id && log.preferencia_id === payment.preference_id
              )
              
              if (compraLogPendiente && compraLogPendiente.metadata?.talle) {
                talle = compraLogPendiente.metadata.talle
              }
            }
            
            // Si aún no se encontró, intentar de la descripción del item
            if (!talle && item.description && item.description.includes('Talle:')) {
              talle = item.description.replace('Talle:', '').trim()
            }
            
            // Fallback: usar primer talle disponible
            if (!talle) {
              const talles = producto.talles || []
              talle = talles[0] || 'M'
              console.warn(`[MP-WEBHOOK] ⚠️ No se encontró talle específico para ${item.title}, usando: ${talle}`)
            }

            // Obtener stock del talle específico
            const stockRecord: Record<string, number> = producto.stock || {}
            const stockActual = stockRecord[talle] || 0
            const cantidad = item.quantity || 1

            console.log(`[MP-WEBHOOK] Verificando stock para ${item.title} (Talle ${talle}): Disponible: ${stockActual}, Solicitado: ${cantidad}`)

            // Validar que el talle existe
            const tallesDisponibles = producto.talles || []
            if (!talle || !tallesDisponibles.includes(talle)) {
              console.error(`[MP-WEBHOOK] ❌ Talle ${talle} no válido para este producto`)
              continue
            }

            if (stockActual >= cantidad && talle) {
              // Actualizar stock en Supabase
              const nuevoStock = { ...stockRecord }
              nuevoStock[talle] = stockActual - cantidad
              
              await updateProducto(producto.id, {
                stock: nuevoStock,
              })

              // Crear log de compra
              await createCompraLog({
                producto_id: producto.id,
                preferencia_id: payment.preference_id,
                mp_payment_id: payment.id.toString(),
                estado: 'aprobado',
                fecha: new Date().toISOString(),
                cantidad,
                precio_total: (item.unit_price || 0) * cantidad,
                metadata: talle ? { talle } : {},
              })

              // Registrar en historial de stock
              await createStockLog({
                producto_id: producto.id,
                accion: 'venta',
                cantidad: -cantidad,
                talle,
                usuario: 'sistema',
              })

              console.log(`[MP-WEBHOOK] ✅ Stock actualizado correctamente para ${item.title} (Talle ${talle}, cantidad: -${cantidad})`)
              
              // Guardar información para el email
              itemsProcesados.push({
                producto,
                talle,
                cantidad,
                precio: item.unit_price || 0,
              })
            } else {
              console.error(`[MP-WEBHOOK] ❌ Stock insuficiente para ${item.title} (Talle ${talle}). Disponible: ${stockActual}, Solicitado: ${cantidad}`)
              // No lanzar error, solo loguear para no bloquear otros items
            }
          } catch (error: any) {
            console.error(`[MP-WEBHOOK] ❌ Error procesando item ${item.title}:`, error)
            // No lanzar error para no bloquear otros items, solo loguear
          }
        }

        // Enviar email de confirmación con resumen de todos los items (no bloquea el flujo si falla)
        try {
          const emailCliente = payment.payer?.email || payment.additional_info?.payer?.email
          if (emailCliente && itemsProcesados.length > 0) {
            const itemsList = itemsProcesados.map((itemProc) => {
              return `<li><strong>${itemProc.producto.nombre}</strong> - Cantidad: ${itemProc.cantidad}, Talle: ${itemProc.talle}, Precio: $${itemProc.precio.toFixed(2)}</li>`
            }).join('')
            
            const totalAmount = payment.transaction_amount || payment.transaction_details?.total_paid_amount || 0
            
            await sendEmail({
              to: emailCliente,
              subject: `Confirmación de compra - Pedido #${payment.id}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #000;">¡Gracias por tu compra!</h2>
                  <p>Tu pedido ha sido confirmado:</p>
                  <ul style="list-style: none; padding: 0;">
                    ${itemsList}
                  </ul>
                  <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
                  <p><strong>Pago ID:</strong> ${payment.id}</p>
                  <p>Te contactaremos pronto para coordinar el envío.</p>
                </div>
              `,
              text: `Gracias por tu compra. Pago ID: ${payment.id}, Total: $${totalAmount.toFixed(2)}`,
              type: 'compra',
            })
            console.log(`[MP-WEBHOOK] ✅ Email de confirmación enviado a ${emailCliente}`)
          }
        } catch (emailError) {
          console.error('[MP-WEBHOOK] ❌ Error enviando email (no crítico):', emailError)
          // No fallar el webhook por error de email
        }

        console.log('[MP-WEBHOOK] ✅ Pago procesado exitosamente')
        return NextResponse.json({ message: 'Payment processed successfully' })
      } else if (payment.status === 'pending') {
        console.log(`[MP-WEBHOOK] ⏳ Pago pendiente: ${payment.id}`)
        // Opcional: crear log de pago pendiente
        return NextResponse.json({ message: 'Payment pending' })
      } else if (payment.status === 'rejected') {
        console.log(`[MP-WEBHOOK] ❌ Pago rechazado: ${payment.id}`)
        // Opcional: crear log de pago rechazado
        return NextResponse.json({ message: 'Payment rejected' })
      } else {
        console.log(`[MP-WEBHOOK] ⚠️ Pago con estado desconocido: ${payment.status}`)
      }
    }

    return NextResponse.json({ message: 'Event received' })
  } catch (error: any) {
    console.error('[MP-WEBHOOK] ❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing webhook' },
      { status: 500 }
    )
  }
}
