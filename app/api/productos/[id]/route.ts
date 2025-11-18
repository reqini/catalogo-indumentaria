import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import { productoSchema } from '@/utils/validations'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const producto = await Producto.findById(params.id).lean()

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const rawStock = producto.stock as any
    let stockRecord: Record<string, number> = {}
    
    if (rawStock) {
      if (rawStock instanceof Map) {
        stockRecord = Object.fromEntries(rawStock.entries())
      } else if (typeof rawStock === 'object' && rawStock !== null) {
        stockRecord = rawStock
      }
    }

    const productoFormateado = {
      ...producto,
      stock: stockRecord,
      id: producto._id.toString(),
      imagenPrincipal: producto.imagenPrincipal || '/images/default-product.svg',
      imagenes: producto.imagenesSec || [],
      tags: producto.tags || [],
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    console.error('Error fetching producto:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener producto' },
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
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()

    // Validar parcialmente
    const partialSchema = productoSchema.partial()
    const validatedData = partialSchema.parse(body)

    // Convertir stock a Map si viene
    if (validatedData.stock) {
      validatedData.stock = new Map(Object.entries(validatedData.stock)) as any
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (validatedData.nombre !== undefined) updateData.nombre = validatedData.nombre
    if (validatedData.descripcion !== undefined) updateData.descripcion = validatedData.descripcion
    if (validatedData.precio !== undefined) updateData.precio = validatedData.precio
    if (validatedData.descuento !== undefined) updateData.descuento = validatedData.descuento
    if (validatedData.categoria !== undefined) updateData.categoria = validatedData.categoria
    if (validatedData.color !== undefined) updateData.color = validatedData.color
    if (validatedData.talles !== undefined) updateData.talles = validatedData.talles
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags
    if (validatedData.destacado !== undefined) updateData.destacado = validatedData.destacado
    if (validatedData.activo !== undefined) updateData.activo = validatedData.activo
    
    // Normalizar campos de imagen
    if (validatedData.imagenPrincipal !== undefined || validatedData.imagen_principal !== undefined) {
      updateData.imagenPrincipal = validatedData.imagenPrincipal || validatedData.imagen_principal
    }
    if (validatedData.imagenesSec !== undefined || validatedData.imagenes !== undefined) {
      updateData.imagenesSec = validatedData.imagenesSec || validatedData.imagenes
    }
    if (validatedData.idMercadoPago !== undefined || validatedData.id_mercado_pago !== undefined) {
      updateData.idMercadoPago = validatedData.idMercadoPago || validatedData.id_mercado_pago
    }
    
    // Convertir stock a Map si viene
    if (validatedData.stock) {
      updateData.stock = new Map(Object.entries(validatedData.stock)) as any
    }

    const producto = await Producto.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const rawStock = producto.stock as any
    let stockRecord: Record<string, number> = {}
    
    if (rawStock) {
      if (rawStock instanceof Map) {
        stockRecord = Object.fromEntries(rawStock.entries())
      } else if (typeof rawStock === 'object' && rawStock !== null) {
        stockRecord = rawStock
      }
    }

    const productoFormateado = {
      ...producto,
      stock: stockRecord,
      id: producto._id.toString(),
      imagenPrincipal: producto.imagenPrincipal || '/images/default-product.svg',
      imagenes: producto.imagenesSec || [],
      tags: producto.tags || [],
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating producto:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
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
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const producto = await Producto.findByIdAndDelete(params.id)

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting producto:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
