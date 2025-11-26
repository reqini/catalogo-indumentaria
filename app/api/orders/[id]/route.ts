import { NextResponse } from 'next/server'
import { getOrderById } from '@/lib/ordenes-helpers'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('[ORDERS] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al obtener orden' }, { status: 500 })
  }
}
