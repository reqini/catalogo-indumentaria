import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import mongoose from 'mongoose'

// Ruta legacy para compatibilidad: usa la misma colección de productos

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const producto = await Producto.findById(params.id).lean()

    if (!producto) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const rawStock = producto.stock as any
    const stockRecord: Record<string, number> = rawStock
      ? Object.fromEntries(rawStock as any)
      : {}

    return NextResponse.json({
      ...producto,
      stock: stockRecord,
      id: producto._id.toString(),
      _id: undefined,
      __v: undefined,
    })
  } catch (error: any) {
    console.error('Error in legacy products GET:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const producto = await Producto.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!producto) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const rawStock = producto.stock as any
    const stockRecord: Record<string, number> = rawStock
      ? Object.fromEntries(rawStock as any)
      : {}

    return NextResponse.json({
      ...producto,
      stock: stockRecord,
      id: producto._id.toString(),
      _id: undefined,
      __v: undefined,
    })
  } catch (error: any) {
    console.error('Error in legacy products PUT:', error)
    return NextResponse.json(
      { error: error.message || 'Error updating product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const producto = await Producto.findByIdAndDelete(params.id)

    if (!producto) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in legacy products DELETE:', error)
    return NextResponse.json(
      { error: error.message || 'Error deleting product' },
      { status: 500 }
    )
  }
}

