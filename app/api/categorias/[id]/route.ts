import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Categoria from '@/models/Categoria'
import { getAuthUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const user = await getAuthUser()

    if (!user || (user.rol !== 'admin' && user.rol !== 'editor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const categoria = await Categoria.findByIdAndUpdate(params.id, body, {
      new: true,
    })

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar categoría' },
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
    const user = await getAuthUser()

    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Desactivar en lugar de eliminar
    const categoria = await Categoria.findByIdAndUpdate(
      params.id,
      { activa: false },
      { new: true }
    )

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Categoría desactivada' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}

