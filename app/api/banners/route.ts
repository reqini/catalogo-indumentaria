import { NextResponse } from 'next/server'
import { bannerSchema } from '@/utils/validations'
import { checkPlanLimits } from '@/lib/supabase-helpers'
import { getBanners, createBanner } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    const filters: any = { activo: true }

    // Si hay tenantId en query (catálogo público), filtrar por ese tenant
    if (tenantId) {
      filters.tenantId = tenantId
    } else {
      // Si no, intentar obtener del token (admin) - desde header o cookie
      const tenant = await getTenantFromRequest(request)
      if (tenant) {
        filters.tenantId = tenant.tenantId
      }
    }

    const banners = await getBanners(filters)

    // Formatear banners para el frontend
    const bannersFormateados = banners.map((b: any) => ({
      ...b,
      id: b.id,
      imagen: b.imagen_url,
      imagenUrl: b.imagen_url,
    }))

    return NextResponse.json(bannersFormateados)
  } catch (error: any) {
    console.error('[API Banners] Error fetching banners:', error)
    const errorMessage = error.message || 'Error al obtener banners'
    const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined

    return NextResponse.json(
      {
        error: errorMessage,
        ...(errorDetails && { details: errorDetails }),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    // Verificar límites (solo para planes free y pro)
    if (tenant.plan !== 'premium') {
      const limits = await checkPlanLimits(tenant.tenantId, 'banners')
      if (!limits.allowed) {
        return NextResponse.json(
          {
            error: `Límite de banners alcanzado (${limits.current}/${limits.limit}). Actualizá tu plan para continuar.`,
            limit: limits,
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validatedData = bannerSchema.parse(body)

    const bannerData = {
      tenant_id: tenant.tenantId,
      titulo: validatedData.titulo,
      imagen_url: validatedData.imagenUrl || validatedData.imagen,
      activo: validatedData.activo !== false,
      orden: validatedData.orden || 0,
      link: validatedData.link,
    }

    const banner = await createBanner(bannerData)

    // Formatear respuesta
    const bannerFormateado = {
      ...banner,
      id: banner.id,
      imagen: banner.imagen_url,
      imagenUrl: banner.imagen_url,
    }

    return NextResponse.json(bannerFormateado, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error creating banner:', error)
    return NextResponse.json({ error: error.message || 'Error al crear banner' }, { status: 500 })
  }
}
