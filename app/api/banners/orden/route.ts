import { NextResponse } from 'next/server'
import { updateBanner } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { z } from 'zod'

const ordenSchema = z.array(
  z.object({
    id: z.string(),
    orden: z.number().int().min(0),
  })
)

export async function PUT(request: Request) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const banners = ordenSchema.parse(body)

    // Actualizar orden de cada banner
    for (const banner of banners) {
      await updateBanner(banner.id, { orden: banner.orden })
    }

    console.log('[API Banners Orden] ✅ Orden actualizado para', banners.length, 'banners')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API Banners Orden] ❌ Error updating banner order:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}



