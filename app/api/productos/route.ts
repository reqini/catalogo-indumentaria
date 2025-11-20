import { NextResponse } from 'next/server'
import { productoSchema } from '@/utils/validations'
import { checkPlanLimits } from '@/lib/supabase-helpers'
import {
  getProductos,
  createProducto,
  getProductoById,
} from '@/lib/supabase-helpers'
import { registrarHistorial } from '@/lib/historial-helpers'
import { getAuthToken, getTenantFromRequest } from '@/lib/auth-helpers'

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
      // Si no, intentar obtener del token (admin) - desde header o cookie
      const tenant = await getTenantFromRequest(request)
      if (tenant) {
        filters.tenantId = tenant.tenantId
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
    // Obtener tenant del token (desde header o cookie)
    const tokenResult = await getAuthToken(request)
    if (!tokenResult) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const tenant = await getTenantFromRequest(request)

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
    // CRÍTICO: Preservar imagen real si existe, solo usar placeholder si realmente no hay imagen
    // Verificar ambos campos posibles (imagenPrincipal e imagen_principal)
    const imagenPrincipalRaw = validatedData.imagenPrincipal || validatedData.imagen_principal || ''
    const imagenPrincipalTrimmed = imagenPrincipalRaw?.trim() || ''
    
    console.log('🔍 [API Productos POST] Procesando imagen:')
    console.log('  - validatedData.imagenPrincipal:', validatedData.imagenPrincipal?.substring(0, 150) || '(vacío)')
    console.log('  - validatedData.imagen_principal:', validatedData.imagen_principal?.substring(0, 150) || '(vacío)')
    console.log('  - imagenPrincipalRaw:', imagenPrincipalRaw?.substring(0, 150) || '(vacío)')
    console.log('  - imagenPrincipalTrimmed:', imagenPrincipalTrimmed?.substring(0, 150) || '(vacío)')
    console.log('  - Tipo:', typeof imagenPrincipalTrimmed)
    console.log('  - Longitud:', imagenPrincipalTrimmed?.length || 0)
    
    // Verificar si es una URL válida (http/https) o ruta válida (/images/)
    // IMPORTANTE: Las URLs de Supabase Storage empiezan con https://
    // También aceptar URLs que contengan 'supabase.co' en el dominio
    // CRÍTICO: NO aceptar base64 (data:) como imagen válida final
    const tieneImagenValida = imagenPrincipalTrimmed && 
                              imagenPrincipalTrimmed !== '' &&
                              imagenPrincipalTrimmed.trim() !== '' &&
                              !imagenPrincipalTrimmed.startsWith('data:') && // NO base64
                              imagenPrincipalTrimmed !== '/images/default-product.svg' && // No es placeholder
                              (imagenPrincipalTrimmed.startsWith('http://') || 
                               imagenPrincipalTrimmed.startsWith('https://') ||
                               imagenPrincipalTrimmed.startsWith('/images/') ||
                               imagenPrincipalTrimmed.includes('supabase.co')) // URLs de Supabase
    
    console.log('🔍 [API Productos POST] Validación de imagen:')
    console.log('  - tieneImagenValida:', tieneImagenValida)
    console.log('  - Empieza con http://:', imagenPrincipalTrimmed?.startsWith('http://'))
    console.log('  - Empieza con https://:', imagenPrincipalTrimmed?.startsWith('https://'))
    console.log('  - Empieza con /images/:', imagenPrincipalTrimmed?.startsWith('/images/'))
    console.log('  - Contiene supabase.co:', imagenPrincipalTrimmed?.includes('supabase.co'))
    console.log('  - Es placeholder:', imagenPrincipalTrimmed === '/images/default-product.svg')
    
    // Solo usar placeholder si NO hay imagen válida
    const imagenPrincipal = tieneImagenValida 
      ? imagenPrincipalTrimmed 
      : '/images/default-product.svg'
    
    console.log('✅ [API Productos POST] Imagen final a guardar:', imagenPrincipal.substring(0, 150))
    console.log('  - Es placeholder:', imagenPrincipal === '/images/default-product.svg')
    console.log('  - Es URL real:', imagenPrincipal.startsWith('http://') || imagenPrincipal.startsWith('https://'))
    console.log('  - URL completa (primeros 200 chars):', imagenPrincipal.substring(0, 200))
    
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
      imagen_principal: imagenPrincipal, // Usar imagen real o placeholder según corresponda
      imagenes_sec: validatedData.imagenesSec || validatedData.imagenes || [],
      id_mercado_pago: validatedData.idMercadoPago || validatedData.id_mercado_pago,
      tags: Array.isArray(validatedData.tags) ? validatedData.tags.filter(tag => tag && tag.trim() !== '') : [],
      destacado: validatedData.destacado || false,
      activo: validatedData.activo !== false,
    }

    console.log('Creando producto con datos:', {
      ...productoData,
      imagen_principal: productoData.imagen_principal?.substring(0, 50) + '...',
      tags: productoData.tags,
    })

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

    // Registrar en historial
    try {
      await registrarHistorial({
        producto_id: producto.id,
        tenant_id: tenant.tenantId,
        accion: 'crear',
        usuario_id: tenant.tenantId,
        datos_anteriores: null,
        datos_nuevos: producto,
      })
    } catch (historialError) {
      console.error('Error registrando historial:', historialError)
      // No fallar si el historial falla
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
