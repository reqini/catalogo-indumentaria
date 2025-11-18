import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import { productoSchema } from '@/utils/validations'
import { getTenantFromToken } from '@/lib/tenant'
import { checkPlanLimits } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const color = searchParams.get('color')
    const destacado = searchParams.get('destacado')
    const activo = searchParams.get('activo') !== 'false'
    const tenantId = searchParams.get('tenantId') // Para catálogos públicos

    const query: any = {}
    
    // Si hay tenantId en query (catálogo público), filtrar por ese tenant
    if (tenantId) {
      query.tenantId = tenantId
      query.activo = true
    } else {
      // Si no, intentar obtener del token (admin)
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const tenant = await getTenantFromToken(token)
        if (tenant) {
          query.tenantId = tenant.tenantId
        }
      } else {
        // Si no hay token ni tenantId, mostrar todos los productos activos (catálogo público)
        // No filtrar por tenantId para mostrar todos los productos públicos
        query.activo = activo !== false
      }

    if (categoria) query.categoria = categoria
    if (color) query.color = color
    if (destacado === 'true') query.destacado = true

    const productos = await Producto.find(query)
      .sort({ createdAt: -1 })
      .lean()

    // Convertir Map de stock a objeto
    const productosFormateados = productos.map((p: any) => {
      let stockRecord: Record<string, number> = {}
      
      if (p.stock) {
        // Si es un Map de Mongoose, convertirlo a objeto
        if (p.stock instanceof Map) {
          stockRecord = Object.fromEntries(p.stock.entries())
        } else if (typeof p.stock === 'object' && p.stock !== null) {
          // Si ya es un objeto, usarlo directamente
          stockRecord = p.stock
        }
      }

      return {
        ...p,
        stock: stockRecord,
        id: p._id.toString(),
        imagenPrincipal: p.imagenPrincipal || '/images/default-product.svg',
        imagenes: p.imagenesSec || [],
        tags: p.tags || [],
        _id: undefined,
        __v: undefined,
      }
    })

    return NextResponse.json(productosFormateados)
  } catch (error: any) {
    console.error('Error fetching productos:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener productos' },
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

    // Convertir stock a Map para MongoDB
    const stockMap = new Map(Object.entries(validatedData.stock))

    // Normalizar campos de imagen
    const imagenPrincipal = validatedData.imagenPrincipal || validatedData.imagen_principal
    const imagenesSec = validatedData.imagenesSec || validatedData.imagenes || []
    const idMercadoPago = validatedData.idMercadoPago || validatedData.id_mercado_pago

    const producto = await Producto.create({
      nombre: validatedData.nombre,
      descripcion: validatedData.descripcion,
      precio: validatedData.precio,
      descuento: validatedData.descuento,
      categoria: validatedData.categoria,
      color: validatedData.color,
      talles: validatedData.talles,
      stock: stockMap,
      imagenPrincipal,
      imagenesSec,
      idMercadoPago,
      tags: validatedData.tags || [],
      destacado: validatedData.destacado || false,
      activo: validatedData.activo !== false,
      tenantId: tenant.tenantId,
    })

    // Registrar alta en historial de stock
    const StockLog = (await import('@/models/StockLog')).default
    for (const [talle, cantidad] of stockMap.entries()) {
      await StockLog.create({
        productoId: producto._id,
        accion: 'alta',
        cantidad,
        talle,
        usuario: 'sistema',
      })
    }

    const rawStock = producto.stock as any
    const stockRecord: Record<string, number> = rawStock
      ? Object.fromEntries(rawStock as any)
      : {}

    const productoFormateado = {
      ...producto.toObject(),
      stock: stockRecord,
      id: producto._id.toString(),
      _id: undefined,
      __v: undefined,
    }

    return NextResponse.json(productoFormateado, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating producto:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    )
  }
}
