import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import CompraLog from '@/models/CompraLog'
import StockLog from '@/models/StockLog'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

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
      return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 500 })
    }

    const bodyText = await request.text()
    const signature = request.headers.get('x-signature')
    
    // Validar firma del webhook
    if (MP_WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(bodyText, signature, MP_WEBHOOK_SECRET)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)
    const { type, data } = body

    // Solo procesar pagos aprobados
    if (type === 'payment' && data?.id) {
      await connectDB()

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
        console.error('Error fetching payment from MP')
        return NextResponse.json({ error: 'Error fetching payment' }, { status: 500 })
      }

      const payment = await paymentResponse.json()

      console.log(`[MP-PAYMENT] Estado del pago: ${payment.status}`)
      console.log(`[MP-PAYMENT] Payment ID: ${payment.id}`)
      console.log(`[MP-PAYMENT] Preference ID: ${payment.preference_id}`)
      console.log(`[MP-PAYMENT] Transaction Amount: ${payment.transaction_amount}`)
      
      // Solo procesar si está aprobado y no se procesó antes
      if (payment.status === 'approved') {
        console.log(`[MP-PAYMENT] Pago aprobado: ${payment.id}`)
        
        const existingLog = await CompraLog.findOne({
          mpPaymentId: payment.id.toString(),
          estado: 'aprobado',
        })

        if (existingLog) {
          // Idempotencia: ya se procesó este pago
          console.log(`[MP-PAYMENT] Pago ya procesado anteriormente: ${payment.id}`)
          return NextResponse.json({ message: 'Payment already processed' })
        }

        // Procesar items del pago
        const items = payment.additional_info?.items || []
        const itemsProcesados: Array<{ producto: any; talle: string; cantidad: number }> = []

        for (const item of items) {
          // Buscar producto por ID (preferido) o por nombre (fallback)
          let producto = null
          if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
            producto = await Producto.findById(item.id)
          }
          if (!producto && item.title) {
            producto = await Producto.findOne({ nombre: item.title })
          }

          if (!producto) {
            console.error(`[MP-PAYMENT] Producto no encontrado para item: ${item.title || item.id}`)
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
            const compraLogPendiente = await CompraLog.findOne({
              productoId: producto._id,
              preferenciaId: payment.preference_id,
              estado: 'pendiente',
            }).lean()
            
            if (compraLogPendiente && (compraLogPendiente as any).metadata?.talle) {
              talle = (compraLogPendiente as any).metadata.talle
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
            console.warn(`[MP-PAYMENT] No se encontró talle específico para ${item.title}, usando: ${talle}`)
          }

          // Decrementar stock de forma transaccional
          const session = await mongoose.startSession()
          session.startTransaction()

          try {
            // Obtener producto con lock
            const productoLock = await Producto.findById(producto._id).session(session)
            
            if (!productoLock) {
              throw new Error('Producto no encontrado')
            }

            // Validar que el talle existe
            const tallesDisponibles = productoLock.talles || []
            if (!talle || !tallesDisponibles.includes(talle)) {
              throw new Error(`Talle ${talle} no válido para este producto`)
            }

            // Obtener stock del talle específico
            const stockMap = productoLock.stock as any
            let stockActual = 0
            
            if (stockMap instanceof Map) {
              stockActual = (stockMap.get(talle) as number) || 0
            } else if (typeof stockMap === 'object' && stockMap !== null) {
              stockActual = stockMap[talle] || 0
            }
            
            const cantidad = item.quantity || 1

            console.log(`[MP-PAYMENT] Verificando stock para ${item.title} (Talle ${talle}): Disponible: ${stockActual}, Solicitado: ${cantidad}`)

            if (stockActual >= cantidad) {
              // Actualizar stock
              if (stockMap instanceof Map) {
                stockMap.set(talle, stockActual - cantidad)
              } else if (typeof stockMap === 'object' && stockMap !== null) {
                stockMap[talle] = stockActual - cantidad
                productoLock.stock = new Map(Object.entries(stockMap)) as any
              }
              
              await productoLock.save({ session })

                // Crear log de compra
                await CompraLog.create(
                  [
                    {
                      productoId: productoLock._id,
                      preferenciaId: payment.preference_id,
                      mpPaymentId: payment.id.toString(),
                      estado: 'aprobado',
                      fecha: new Date(),
                      metadata: talle ? { talle } : undefined,
                    },
                  ],
                  { session }
                )

                // Registrar en historial de stock
                await StockLog.create(
                  [
                    {
                      productoId: productoLock._id,
                      accion: 'venta',
                      cantidad: -cantidad,
                      talle,
                      usuario: 'sistema',
                    },
                  ],
                  { session }
                )

                await session.commitTransaction()
                console.log(`[MP-PAYMENT] Stock actualizado correctamente para ${item.title} (Talle ${talle}, cantidad: -${cantidad})`)
                
                // Guardar información para el email
                itemsProcesados.push({
                  producto: productoLock,
                  talle,
                  cantidad,
                })
              } else {
                await session.abortTransaction()
                console.error(`[MP-PAYMENT] Stock insuficiente para ${item.title} (Talle ${talle}). Disponible: ${stockActual}, Solicitado: ${cantidad}`)
                // No lanzar error, solo loguear para no bloquear otros items
              }
            } catch (error) {
              await session.abortTransaction()
              console.error(`[MP-PAYMENT] Error en transacción para ${item.title}:`, error)
              // No lanzar error para no bloquear otros items, solo loguear
            } finally {
              session.endSession()
            }
        }

        // Enviar email de confirmación con resumen de todos los items (no bloquea el flujo si falla)
        try {
          const emailCliente = payment.payer?.email || payment.additional_info?.payer?.email
          if (emailCliente && itemsProcesados.length > 0) {
            const itemsList = itemsProcesados.map((itemProc) => {
              return `<li><strong>${itemProc.producto.nombre}</strong> - Cantidad: ${itemProc.cantidad}, Talle: ${itemProc.talle}</li>`
            }).join('')
            
            const totalAmount = payment.transaction_amount || payment.transaction_details?.total_paid_amount || 0
            
            await sendEmail({
              to: emailCliente,
              subject: `Confirmación de compra - Pedido #${payment.id}`,
              html: `
                <h2>¡Gracias por tu compra!</h2>
                <p>Tu pedido ha sido confirmado:</p>
                <ul>
                  ${itemsList}
                </ul>
                <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
                <p><strong>Pago ID:</strong> ${payment.id}</p>
                <p>Te contactaremos pronto para coordinar el envío.</p>
              `,
              text: `Gracias por tu compra. Pago ID: ${payment.id}, Total: $${totalAmount.toFixed(2)}`,
              type: 'compra',
            })
            console.log(`[MP-PAYMENT] Email de confirmación enviado a ${emailCliente}`)
          }
        } catch (emailError) {
          console.error('[MP-PAYMENT] Error enviando email (no crítico):', emailError)
          // No fallar el webhook por error de email
        }

        console.log('[MP-PAYMENT] Pago procesado exitosamente')
        return NextResponse.json({ message: 'Payment processed successfully' })
      } else {
        console.log(`[MP-PAYMENT] Pago no aprobado, estado: ${payment.status}`)
      }
    }

    return NextResponse.json({ message: 'Event received' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing webhook' },
      { status: 500 }
    )
  }
}

