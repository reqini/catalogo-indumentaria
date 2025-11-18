import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Categoria from '@/models/Categoria'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const categorias = await Categoria.find({ activa: true })
      .sort({ orden: 1 })
      .lean()

    return NextResponse.json(categorias)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const user = await getAuthUser()

    if (!user || (user.rol !== 'admin' && user.rol !== 'editor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre } = body

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const slug = nombre.toLowerCase().replace(/\s+/g, '-')

    const categoria = await Categoria.create({
      nombre,
      slug,
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'La categoría ya existe' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Error al crear categoría' },
      { status: 500 }
    )
  }
}

