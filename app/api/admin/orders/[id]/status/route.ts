import { NextResponse } from 'next/server'
import {
  updateOrderStatus,
  updateOrderShipping,
  createOrderLog,
  getOrderById,
} from '@/lib/ordenes-helpers'
import { getAuthToken } from '@/lib/auth-helpers'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const updateStatusSchema = z.object({
  estado: z.enum(['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada']),
  envio_tracking: z.string().optional(),
  envio_proveedor: z.string().optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const tokenResult = await getAuthToken(request)
    if (!tokenResult) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const decodedToken = jwt.verify(tokenResult.token, JWT_SECRET) as any
    if (decodedToken.rol !== 'admin' && decodedToken.rol !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    const order = await getOrderById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Actualizar estado
    const updatedOrder = await updateOrderStatus(params.id, validatedData.estado)

    // Si se actualiza tracking, actualizar también envío
    if (validatedData.envio_tracking || validatedData.envio_proveedor) {
      await updateOrderShipping(params.id, {
        envio_tracking: validatedData.envio_tracking,
        envio_proveedor: validatedData.envio_proveedor,
        estado:
          validatedData.estado === 'enviada' || validatedData.estado === 'entregada'
            ? validatedData.estado
            : undefined,
      })
    }

    // Crear log
    await createOrderLog(
      params.id,
      'estado_actualizado',
      { estado: order.estado },
      { estado: validatedData.estado },
      `Estado actualizado a ${validatedData.estado} por admin`,
      decodedToken.email || 'admin'
    )

    // Enviar notificación al cliente si el estado cambió a enviada o entregada
    if (
      (validatedData.estado === 'enviada' || validatedData.estado === 'entregada') &&
      order.cliente_email
    ) {
      try {
        const { notifyOrderStatusChange } = await import('@/lib/notifications')
        await notifyOrderStatusChange(
          params.id,
          order.cliente_email,
          order.cliente_telefono,
          validatedData.estado,
          validatedData.envio_tracking
        )
      } catch (error) {
        console.error('[ADMIN-ORDERS] Error enviando notificación (no crítico):', error)
      }
    }

    console.log(
      `[ADMIN-ORDERS] ✅ Estado de orden ${params.id} actualizado a ${validatedData.estado}`
    )

    return NextResponse.json({ order: updatedOrder })
  } catch (error: any) {
    console.error('[ADMIN-ORDERS] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado' },
      { status: 500 }
    )
  }
}
