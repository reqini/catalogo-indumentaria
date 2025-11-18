import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const ordenSchema = z.array(
  z.object({
    id: z.string(),
    orden: z.number().int().min(0),
  })
)

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const banners = ordenSchema.parse(body)

    await db.updateBannerOrder(banners)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating banner order:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}



