import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import StockLog from '@/models/StockLog'
import { getAuthUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()

    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { talle, cantidad, accion } = body

    if (!talle || cantidad === undefined) {
      return NextResponse.json(
        { error: 'Talle y cantidad requeridos' },
        { status: 400 }
      )
    }

    if (cantidad < 0) {
      return NextResponse.json(
        { error: 'El stock no puede ser negativo' },
        { status: 400 }
      )
    }

    const producto = await Producto.findById(params.id)

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const stockMap = producto.stock as any
    const stockAnterior = (stockMap?.get(talle) as number) || 0
    stockMap.set(talle, cantidad)
    await producto.save()

    // Registrar en historial
    await StockLog.create({
      productoId: producto._id,
      accion: accion || 'reposicion',
      cantidad: cantidad - stockAnterior,
      talle,
      usuario: user.email,
    })

    const rawStock = producto.stock as any
    const stockRecord: Record<string, number> = rawStock
      ? Object.fromEntries(rawStock as any)
      : {}

    const productoFormateado = {
      ...producto.toObject(),
      stock: stockRecord,
      id: producto._id.toString(),
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar stock' },
      { status: 500 }
    )
  }
}
