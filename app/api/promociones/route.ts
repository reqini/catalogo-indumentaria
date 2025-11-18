import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { promocionSchema } from '@/utils/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activas = searchParams.get('activas') === 'true' ? true : undefined

    const promociones = await db.getPromociones(activas)

    return NextResponse.json(promociones)
  } catch (error: any) {
    console.error('Error fetching promociones:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener promociones' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = promocionSchema.parse(body)

    const promocion = await db.createPromocion(validatedData)

    return NextResponse.json(promocion, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating promocion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear promoción' },
      { status: 500 }
    )
  }
}



