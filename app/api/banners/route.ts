import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Banner from '@/models/Banner'
import { bannerSchema } from '@/utils/validations'
import { getTenantFromToken } from '@/lib/tenant'
import { checkPlanLimits } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    await connectDB()
  } catch (dbError: any) {
    console.error('[API Banners] Error de conexión a MongoDB:', dbError.message)
    return NextResponse.json(
      { error: 'Error de conexión a la base de datos', details: process.env.NODE_ENV === 'development' ? dbError.message : undefined },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') // Para catálogos públicos

    const query: any = { activo: true }

    // Si hay tenantId en query (catálogo público), filtrar por ese tenant
    if (tenantId) {
      query.tenantId = tenantId
    } else {
      // Si no, intentar obtener del token (admin)
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const tenant = await getTenantFromToken(token)
        if (tenant) {
          query.tenantId = tenant.tenantId
        }
      }
    }

    const banners = await Banner.find(query)
      .sort({ orden: 1 })
      .lean()

    const bannersFormateados = banners.map((b: any) => ({
      ...b,
      id: b._id.toString(),
      _id: undefined,
      __v: undefined,
    }))

    return NextResponse.json(bannersFormateados)
  } catch (error: any) {
    console.error('[API Banners] Error fetching banners:', error)
    const errorMessage = error.message || 'Error al obtener banners'
    const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(errorDetails && { details: errorDetails })
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()

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

    const banner = await Banner.create({
      ...validatedData,
      tenantId: tenant.tenantId, // Agregar tenantId
    })

    const bannerFormateado = {
      ...banner.toObject(),
      id: banner._id.toString(),
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(bannerFormateado, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear banner' },
      { status: 500 }
    )
  }
}
