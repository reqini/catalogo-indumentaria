import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { createProducto, getCategorias, createCategoria } from '@/lib/supabase-helpers'
import { checkPlanLimits } from '@/lib/supabase-helpers'

const DEFAULT_PRODUCT_IMAGE_URL = '/images/default-product.svg'

interface ProductInput {
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  sku?: string
  activo?: boolean
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de productos' },
        { status: 400 }
      )
    }

    console.log('[BULK-CREATE] Iniciando creación de', products.length, 'productos')

    // Verificar límites del plan
    const limits = await checkPlanLimits(tenant.tenantId, 'productos')
    const productosActuales = limits.current
    const limiteProductos = limits.limit

    // Verificar si hay espacio suficiente
    if (limiteProductos !== -1 && productosActuales + products.length > limiteProductos) {
      return NextResponse.json(
        {
          error: `No se pueden crear ${products.length} productos. Límite del plan: ${limiteProductos}, productos actuales: ${productosActuales}`,
          created: 0,
          errors: [],
        },
        { status: 403 }
      )
    }

    // Obtener categorías existentes
    const categoriasExistentes = await getCategorias({ tenantId: tenant.tenantId })
    const categoriasMap = new Map(
      categoriasExistentes.map((cat: any) => [cat.nombre.toLowerCase(), cat.nombre])
    )

    const created: string[] = []
    const errors: Array<{ index: number; reason: string }> = []

    // Procesar cada producto
    for (let i = 0; i < products.length; i++) {
      const productInput: ProductInput = products[i]

      try {
        // Validaciones básicas
        if (!productInput.nombre || !productInput.nombre.trim()) {
          errors.push({ index: i, reason: 'Nombre requerido' })
          continue
        }

        if (!productInput.categoria || !productInput.categoria.trim()) {
          errors.push({ index: i, reason: 'Categoría requerida' })
          continue
        }

        if (!productInput.precio || productInput.precio <= 0) {
          errors.push({ index: i, reason: 'Precio inválido (debe ser mayor a 0)' })
          continue
        }

        if (productInput.stock < 0) {
          errors.push({ index: i, reason: 'Stock no puede ser negativo' })
          continue
        }

        // Verificar o crear categoría
        const categoriaNormalizada = productInput.categoria.trim()
        const categoriaLower = categoriaNormalizada.toLowerCase()

        let categoriaFinal = categoriasMap.get(categoriaLower)

        if (!categoriaFinal) {
          // Crear categoría si no existe
          try {
            const nuevaCategoria = await createCategoria({
              nombre: categoriaNormalizada,
              slug: categoriaLower.replace(/\s+/g, '-'),
              tenantId: tenant.tenantId,
            })
            categoriaFinal = nuevaCategoria.nombre
            categoriasMap.set(categoriaLower, categoriaFinal)
            console.log(`[BULK-CREATE] Categoría creada: ${categoriaFinal}`)
          } catch (catError: any) {
            console.error(`[BULK-CREATE] Error creando categoría ${categoriaNormalizada}:`, catError)
            errors.push({ index: i, reason: `Error al crear categoría: ${categoriaNormalizada}` })
            continue
          }
        }

        // Preparar datos del producto
        // Stock se distribuye en un solo talle "M" por defecto (puede ajustarse después)
        const stockData: Record<string, number> = {
          M: productInput.stock || 0,
        }

        const productoData = {
          nombre: productInput.nombre.trim(),
          descripcion: productInput.descripcion?.trim() || '',
          categoria: categoriaFinal,
          precio: productInput.precio,
          stock: stockData,
          talles: ['M'], // Talle por defecto
          imagen_principal: DEFAULT_PRODUCT_IMAGE_URL,
          imagenes_sec: [],
          activo: productInput.activo !== false,
          destacado: false,
          descuento: 0,
          tags: [],
          tenant_id: tenant.tenantId,
          sku: productInput.sku?.trim() || null,
        }

        // Crear producto
        const producto = await createProducto(productoData)
        created.push(producto.id)

        console.log(`[BULK-CREATE] Producto creado: ${productoData.nombre} (ID: ${producto.id})`)
      } catch (error: any) {
        console.error(`[BULK-CREATE] Error creando producto ${i + 1}:`, error)
        errors.push({
          index: i,
          reason: error.message || 'Error desconocido al crear producto',
        })
      }
    }

    console.log('[BULK-CREATE] Resultado:', {
      creados: created.length,
      errores: errors.length,
    })

    return NextResponse.json({
      created: created.length,
      errors: errors,
      total: products.length,
    })
  } catch (error: any) {
    console.error('[BULK-CREATE] Error general:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error al crear productos',
        created: 0,
        errors: [],
      },
      { status: 500 }
    )
  }
}

