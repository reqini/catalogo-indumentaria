import { NextResponse } from 'next/server'
import { listOrders } from '@/lib/ordenes-helpers'
import { getAuthToken } from '@/lib/auth-helpers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const pago_estado = searchParams.get('pago_estado')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const orders = await listOrders({
      estado: estado || undefined,
      pago_estado: pago_estado || undefined,
      limit,
      offset,
    })

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('[ADMIN-ORDERS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}
