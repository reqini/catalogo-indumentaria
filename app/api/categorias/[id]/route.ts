import { NextResponse } from 'next/server'
import { getCategoriaById, updateCategoria, deleteCategoria } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { getProductos } from '@/lib/supabase-helpers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoria = await getCategoriaById(params.id)

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error: any) {
    console.error('Error fetching categoria:', error)
    return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, slug, descripcion, orden, activa } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const updateData: any = {
      nombre,
      slug,
      descripcion,
      orden: orden || 0,
      activa: activa !== false,
    }

    const categoria = await updateCategoria(params.id, updateData)

    return NextResponse.json(categoria)
  } catch (error: any) {
    console.error('Error updating categoria:', error)
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
    console.log('[API-CATEGORIAS] DELETE - Eliminar categoría:', params.id)
    
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      console.error('[API-CATEGORIAS] ❌ Token no proporcionado')
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    console.log('[API-CATEGORIAS] ✅ Tenant autenticado:', tenant.tenantId)

    // Verificar que la categoría existe
    const categoria = await getCategoriaById(params.id)
    if (!categoria) {
      console.warn('[API-CATEGORIAS] ⚠️ Categoría no encontrada:', params.id)
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    console.log('[API-CATEGORIAS] Categoría encontrada:', categoria.nombre)

    // Verificar si hay productos asociados a esta categoría
    const productos = await getProductos({ tenantId: tenant.tenantId })
    const productosConCategoria = productos.filter(
      (p: any) => p.categoria === categoria.slug
    )

    console.log('[API-CATEGORIAS] Productos con esta categoría:', productosConCategoria.length)

    if (productosConCategoria.length > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. Hay ${productosConCategoria.length} producto(s) usando esta categoría. Re-asigná los productos primero.`,
          productosAsociados: productosConCategoria.length,
        },
        { status: 400 }
      )
    }

    // Eliminar la categoría
    await deleteCategoria(params.id)
    console.log('[API-CATEGORIAS] ✅ Categoría eliminada exitosamente')

    return NextResponse.json({ message: 'Categoría eliminada correctamente' })
  } catch (error: any) {
    console.error('[API-CATEGORIAS] ❌ Error deleting categoria:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Error al eliminar categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
