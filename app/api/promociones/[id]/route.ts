import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { promocionSchema } from '@/utils/validations'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = promocionSchema.partial().parse(body)

    const promocion = await db.updatePromocion(params.id, validatedData)

    return NextResponse.json(promocion)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating promocion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar promoción' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.deletePromocion(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting promocion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar promoción' },
      { status: 500 }
    )
  }
}



