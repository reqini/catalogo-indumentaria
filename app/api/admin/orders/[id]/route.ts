import { NextResponse } from 'next/server'
import { getOrderById, getOrderLogs } from '@/lib/ordenes-helpers'
import { getAuthToken } from '@/lib/auth-helpers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const order = await getOrderById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const logs = await getOrderLogs(params.id)

    return NextResponse.json({ order, logs })
  } catch (error: any) {
    console.error('[ADMIN-ORDERS] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al obtener orden' }, { status: 500 })
  }
}
