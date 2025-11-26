/**
 * Sistema de notificaciones completo
 * Email + WhatsApp (si está disponible) + Notificaciones internas
 */

import { sendEmail } from './email'
import { createOrderLog } from './ordenes-helpers'
import { Logger } from './logger'

const logger = new Logger('NOTIFICATIONS')

interface OrderNotificationData {
  orderId: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono?: string
  items: Array<{ nombre: string; cantidad: number; talle?: string; precio: number }>
  subtotal: number
  envioCosto: number
  total: number
  envioMetodo?: string
  envioTracking?: string
  envioProveedor?: string
  direccion?: {
    calle: string
    numero: string
    localidad: string
    provincia: string
    codigoPostal: string
  }
}

/**
 * Enviar notificación de compra confirmada al cliente
 */
export async function notifyOrderConfirmed(data: OrderNotificationData): Promise<void> {
  try {
    // Email al cliente
    const itemsList = data.items
      .map(
        (item) =>
          `<li><strong>${item.nombre}</strong>${item.talle ? ` (Talle ${item.talle})` : ''} - Cantidad: ${item.cantidad}, Precio: $${item.precio.toFixed(2)}</li>`
      )
      .join('')

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">¡Gracias por tu compra!</h2>
        <p>Tu pedido ha sido confirmado y el pago procesado exitosamente.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Resumen de tu pedido:</h3>
          <ul style="list-style: none; padding: 0;">
            ${itemsList}
          </ul>
          <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 15px;">
            <p><strong>Subtotal:</strong> $${data.subtotal.toFixed(2)}</p>
            ${data.envioCosto > 0 ? `<p><strong>Envío (${data.envioMetodo || 'estándar'}):</strong> $${data.envioCosto.toFixed(2)}</p>` : ''}
            <p style="font-size: 18px; font-weight: bold; margin-top: 10px;"><strong>Total:</strong> $${data.total.toFixed(2)}</p>
          </div>
        </div>

        ${
          data.envioTracking
            ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📦 Información de Envío</h3>
            <p><strong>Número de seguimiento:</strong> ${data.envioTracking}</p>
            <p><strong>Proveedor:</strong> ${data.envioProveedor || data.envioMetodo || 'N/A'}</p>
            <p>Podés rastrear tu pedido en el sitio del proveedor.</p>
          </div>
        `
            : ''
        }

        ${
          data.direccion
            ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📍 Dirección de Envío</h3>
            <p>${data.direccion.calle} ${data.direccion.numero}</p>
            <p>${data.direccion.codigoPostal}, ${data.direccion.localidad}, ${data.direccion.provincia}</p>
          </div>
        `
            : ''
        }

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📋 Datos de tu pedido</h3>
          <p><strong>ID de Orden:</strong> ${data.orderId}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        </div>

        <p style="margin-top: 20px;">Te contactaremos pronto para coordinar el envío.</p>
        <p>Si tenés alguna consulta, respondé a este email.</p>
      </div>
    `

    await sendEmail({
      to: data.clienteEmail,
      subject: `✅ Compra confirmada - Pedido #${data.orderId.substring(0, 8)}`,
      html: emailHtml,
      text: `Gracias por tu compra. Orden ID: ${data.orderId}, Total: $${data.total.toFixed(2)}${data.envioTracking ? `, Tracking: ${data.envioTracking}` : ''}`,
      type: 'compra',
    })

    logger.info(`Email de confirmación enviado a ${data.clienteEmail}`, { orderId: data.orderId })

    // WhatsApp (si está configurado)
    if (data.clienteTelefono && process.env.WHATSAPP_API_KEY) {
      try {
        await sendWhatsAppNotification(
          data.clienteTelefono,
          data.orderId,
          data.total,
          data.envioTracking
        )
      } catch (error) {
        logger.warn('Error enviando WhatsApp (no crítico)', { error })
      }
    }
  } catch (error: any) {
    logger.error('Error enviando notificación al cliente', error)
    throw error
  }
}

/**
 * Enviar notificación de nueva orden al admin
 */
export async function notifyAdminNewOrder(data: OrderNotificationData): Promise<void> {
  try {
    const adminEmail =
      process.env.ADMIN_EMAIL || process.env.SMTP_FROM || 'admin@catalogo-indumentaria.com'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catalogo-indumentaria.vercel.app'

    const itemsList = data.items
      .map(
        (item) =>
          `<li>${item.nombre} x ${item.cantidad}${item.talle ? ` (Talle ${item.talle})` : ''}</li>`
      )
      .join('')

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #000;">🛒 Nueva orden recibida</h2>
        <p>Se recibió una nueva orden con pago aprobado.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de la orden:</h3>
          <p><strong>ID de Orden:</strong> ${data.orderId}</p>
          <p><strong>Cliente:</strong> ${data.clienteNombre}</p>
          <p><strong>Email:</strong> ${data.clienteEmail}</p>
          ${data.clienteTelefono ? `<p><strong>Teléfono:</strong> ${data.clienteTelefono}</p>` : ''}
          <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
          <p><strong>Método de envío:</strong> ${data.envioMetodo || 'N/A'}</p>
          ${data.envioTracking ? `<p><strong>Tracking:</strong> ${data.envioTracking}</p>` : ''}
          
          <h4 style="margin-top: 15px;">Productos:</h4>
          <ul>
            ${itemsList}
          </ul>
        </div>

        <p><a href="${baseUrl}/admin/orders/${data.orderId}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver orden en admin</a></p>
      </div>
    `

    await sendEmail({
      to: adminEmail,
      subject: `🛒 Nueva orden recibida - #${data.orderId.substring(0, 8)}`,
      html: emailHtml,
      text: `Nueva orden recibida. ID: ${data.orderId}, Cliente: ${data.clienteNombre}, Total: $${data.total.toFixed(2)}`,
      type: 'compra',
    })

    logger.info(`Notificación de nueva orden enviada a admin`, { orderId: data.orderId })

    // Notificación interna (log)
    await createOrderLog(
      data.orderId,
      'notificacion_admin',
      {},
      { admin_notified: true },
      `Notificación de nueva orden enviada a admin`
    )
  } catch (error: any) {
    logger.error('Error enviando notificación al admin', error)
    // No fallar si falla la notificación al admin
  }
}

/**
 * Enviar notificación de cambio de estado de orden
 */
export async function notifyOrderStatusChange(
  orderId: string,
  clienteEmail: string,
  clienteTelefono: string | undefined,
  nuevoEstado: string,
  tracking?: string
): Promise<void> {
  try {
    const statusMessages: Record<string, { subject: string; message: string }> = {
      enviada: {
        subject: '📦 Tu pedido fue enviado',
        message: `Tu pedido ha sido enviado${tracking ? ` con número de seguimiento: ${tracking}` : ''}.`,
      },
      entregada: {
        subject: '✅ Tu pedido fue entregado',
        message: 'Tu pedido ha sido entregado exitosamente. ¡Esperamos que lo disfrutes!',
      },
    }

    const statusInfo = statusMessages[nuevoEstado as keyof typeof statusMessages]
    if (!statusInfo) {
      return // No notificar estados que no tienen mensaje
    }

    await sendEmail({
      to: clienteEmail,
      subject: `${statusInfo.subject} - Orden #${orderId.substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">${statusInfo.subject}</h2>
          <p>${statusInfo.message}</p>
          ${
            tracking
              ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Número de seguimiento:</strong> ${tracking}</p>
              <p>Podés rastrear tu pedido en el sitio del proveedor.</p>
            </div>
          `
              : ''
          }
          <p><strong>ID de Orden:</strong> ${orderId}</p>
        </div>
      `,
      text: `${statusInfo.message}${tracking ? ` Tracking: ${tracking}` : ''} Orden ID: ${orderId}`,
      type: 'compra',
    })

    logger.info(`Notificación de cambio de estado enviada`, { orderId, nuevoEstado })
  } catch (error: any) {
    logger.error('Error enviando notificación de cambio de estado', error)
  }
}

/**
 * Enviar notificación por WhatsApp (si está configurado)
 */
async function sendWhatsAppNotification(
  telefono: string,
  orderId: string,
  total: number,
  tracking?: string
): Promise<void> {
  // En producción, integrar con API de WhatsApp Business
  // Por ahora, solo loguear
  logger.info(`WhatsApp notification (simulado)`, {
    telefono,
    orderId,
    total,
    tracking,
  })

  // Ejemplo de integración con Twilio WhatsApp API:
  /*
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${telefono}`,
      body: `✅ Tu compra fue confirmada. Orden #${orderId.substring(0, 8)}. Total: $${total.toFixed(2)}${tracking ? `. Tracking: ${tracking}` : ''}`
    })
  }
  */
}
