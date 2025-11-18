import { NextResponse } from 'next/server'
import { productoSchema } from '@/utils/validations'
import { getTenantFromToken, checkPlanLimits } from '@/lib/supabase-helpers'
import {
  getProductos,
  createProducto,
  getProductoById,
} from '@/lib/supabase-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const color = searchParams.get('color')
    const destacado = searchParams.get('destacado')
    const activo = searchParams.get('activo') !== 'false'
    const tenantId = searchParams.get('tenantId')

    const filters: any = {}

    // Si hay tenantId en query (catálogo público), filtrar por ese tenant
    if (tenantId) {
      filters.tenantId = tenantId
      filters.activo = true
    } else {
      // Si no, intentar obtener del token (admin)
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const tenant = await getTenantFromToken(token)
        if (tenant) {
          filters.tenantId = tenant.tenantId
        }
      } else {
        // Si no hay token ni tenantId, mostrar todos los productos activos (catálogo público)
        filters.activo = activo !== false
      }
    }

    if (categoria) filters.categoria = categoria
    if (color) filters.color = color
    if (destacado === 'true') filters.destacado = true

    const productos = await getProductos(filters)

    // Formatear productos para el frontend
    const productosFormateados = productos.map((p: any) => ({
      ...p,
      id: p.id,
      imagenPrincipal: p.imagen_principal || p.imagenPrincipal || '/images/default-product.svg',
      imagenes: p.imagenes_sec || p.imagenes || [],
      tags: p.tags || [],
      stock: p.stock || {},
      createdAt: p.created_at || p.createdAt,
      updatedAt: p.updated_at || p.updatedAt,
    }))

    return NextResponse.json(productosFormateados)
  } catch (error: any) {
    console.error('[API Productos] Error fetching productos:', error)
    const errorMessage = error.message || 'Error al obtener productos'
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

    // Verificar límites
    const limits = await checkPlanLimits(tenant.tenantId, 'productos')
    if (!limits.allowed) {
      return NextResponse.json(
        {
          error: `Límite de productos alcanzado (${limits.current}/${limits.limit}). Actualizá tu plan para continuar.`,
          limit: limits,
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar con Zod
    const validatedData = productoSchema.parse(body)

    // Validar que todos los talles tengan stock
    const tallesSinStock = validatedData.talles.filter(
      (talle) => validatedData.stock[talle] === undefined
    )

    if (tallesSinStock.length > 0) {
      return NextResponse.json(
        { error: `Los talles ${tallesSinStock.join(', ')} no tienen stock definido` },
        { status: 400 }
      )
    }

    // Preparar datos para Supabase
    const productoData = {
      tenant_id: tenant.tenantId,
      nombre: validatedData.nombre,
      descripcion: validatedData.descripcion,
      precio: validatedData.precio,
      descuento: validatedData.descuento,
      categoria: validatedData.categoria,
      color: validatedData.color,
      talles: validatedData.talles,
      stock: validatedData.stock,
      imagen_principal: validatedData.imagenPrincipal || validatedData.imagen_principal,
      imagenes_sec: validatedData.imagenesSec || validatedData.imagenes || [],
      id_mercado_pago: validatedData.idMercadoPago || validatedData.id_mercado_pago,
      tags: validatedData.tags || [],
      destacado: validatedData.destacado || false,
      activo: validatedData.activo !== false,
    }

    const producto = await createProducto(productoData)

    // Registrar alta en historial de stock
    const { createStockLog } = await import('@/lib/supabase-helpers')
    for (const [talle, cantidad] of Object.entries(validatedData.stock)) {
      await createStockLog({
        producto_id: producto.id,
        accion: 'alta',
        cantidad,
        talle,
        usuario: 'sistema',
      })
    }

    // Formatear respuesta
    const productoFormateado = {
      ...producto,
      id: producto.id,
      imagenPrincipal: producto.imagen_principal,
      imagenes: producto.imagenes_sec || [],
      stock: producto.stock || {},
    }

    return NextResponse.json(productoFormateado, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error creating producto:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    )
  }
}
