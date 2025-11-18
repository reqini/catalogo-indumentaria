import { NextResponse } from 'next/server'
import { bannerSchema } from '@/utils/validations'
import { getTenantFromToken } from '@/lib/supabase-helpers'
import { getBannerById, updateBanner, deleteBanner } from '@/lib/supabase-helpers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await getBannerById(params.id)

    if (!banner) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    // Formatear banner para el frontend
    const bannerFormateado = {
      ...banner,
      id: banner.id,
      imagen: banner.imagen_url,
      imagenUrl: banner.imagen_url,
    }

    return NextResponse.json(bannerFormateado)
  } catch (error: any) {
    console.error('Error fetching banner:', error)
    return NextResponse.json({ error: 'Error al obtener banner' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verificar que el banner pertenece al tenant
    const bannerExistente = await getBannerById(params.id)
    if (!bannerExistente) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    if (bannerExistente.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bannerSchema.parse(body)

    const updateData: any = {
      titulo: validatedData.titulo,
      imagen_url: validatedData.imagenUrl || validatedData.imagen,
      activo: validatedData.activo !== false,
      orden: validatedData.orden || 0,
      link: validatedData.link,
    }

    const banner = await updateBanner(params.id, updateData)

    // Formatear respuesta
    const bannerFormateado = {
      ...banner,
      id: banner.id,
      imagen: banner.imagen_url,
      imagenUrl: banner.imagen_url,
    }

    return NextResponse.json(bannerFormateado)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Error al actualizar banner' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verificar que el banner pertenece al tenant
    const banner = await getBannerById(params.id)
    if (!banner) {
      return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
    }

    if (banner.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await deleteBanner(params.id)

    return NextResponse.json({ message: 'Banner eliminado' })
  } catch (error: any) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Error al eliminar banner' }, { status: 500 })
  }
}
