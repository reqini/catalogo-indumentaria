import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CompraLog from '@/models/CompraLog'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()

    if (!user || (user.rol !== 'admin' && user.rol !== 'viewer')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const compras = await CompraLog.find()
      .populate('productoId', 'nombre precio')
      .sort({ fecha: -1 })
      .limit(50)
      .lean()

    const comprasFormateadas = compras.map((compra: any) => ({
      id: compra._id.toString(),
      producto: compra.productoId?.nombre || 'Producto eliminado',
      precio: compra.productoId?.precio || 0,
      preferenciaId: compra.preferenciaId,
      mpPaymentId: compra.mpPaymentId,
      estado: compra.estado,
      fecha: compra.fecha,
    }))

    return NextResponse.json(comprasFormateadas)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener compras' },
      { status: 500 }
    )
  }
}

