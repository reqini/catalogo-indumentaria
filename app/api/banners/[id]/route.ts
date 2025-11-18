import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Banner from '@/models/Banner'
import { bannerSchema } from '@/utils/validations'
import { getTenantFromToken } from '@/lib/tenant'
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

    const banner = await Banner.findById(params.id).lean()

    if (!banner) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    const bannerFormateado = {
      ...banner,
      id: banner._id.toString(),
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(bannerFormateado)
  } catch (error: any) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener banner' },
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

    // Obtener tenant del token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const tenant = await getTenantFromToken(token)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar parcialmente
    const partialSchema = bannerSchema.partial()
    const validatedData = partialSchema.parse(body)

    const banner = await Banner.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    ).lean()

    if (!banner) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    const bannerFormateado = {
      ...banner,
      id: banner._id.toString(),
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(bannerFormateado)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar banner' },
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

    // Obtener tenant del token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const tenant = await getTenantFromToken(token)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
    }

    const banner = await Banner.findByIdAndDelete(params.id)

    if (!banner) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar banner' },
      { status: 500 }
    )
  }
}
