import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { createProducto, getCategorias, createCategoria } from '@/lib/supabase-helpers'
import { checkPlanLimits } from '@/lib/supabase-helpers'

const DEFAULT_PRODUCT_IMAGE_URL = '/images/default-product.svg'

interface EnhancedProductInput {
  nombre: string
  descripcion?: string
  descripcionLarga?: string
  categoria: string
  precio: number
  precioSugerido?: number
  stock: number
  stockPorTalle?: Record<string, number>
  talles?: string[]
  colores?: string[]
  sku?: string
  tags?: string[]
  imagenes?: string[]
  imagenPrincipal?: string
  activo?: boolean
}

export async function POST(request: Request) {
  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de productos' }, { status: 400 })
    }

    console.log('[BULK-CREATE-V2] Iniciando creación de', products.length, 'productos')

    // Verificar límites
    const limits = await checkPlanLimits(tenant.tenantId, 'productos')
    const productosActuales = limits.current
    const limiteProductos = limits.limit

    if (limiteProductos !== -1 && productosActuales + products.length > limiteProductos) {
      return NextResponse.json(
        {
          error: `No se pueden crear ${products.length} productos. Límite: ${limiteProductos}, actuales: ${productosActuales}`,
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
      const productInput: EnhancedProductInput = products[i]

      try {
        // Validaciones
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
          try {
            const nuevaCategoria = await createCategoria({
              nombre: categoriaNormalizada,
              slug: categoriaLower.replace(/\s+/g, '-'),
              tenantId: tenant.tenantId,
            })
            categoriaFinal = nuevaCategoria.nombre
            categoriasMap.set(categoriaLower, categoriaFinal)
            console.log(`[BULK-CREATE-V2] Categoría creada: ${categoriaFinal}`)
          } catch (catError: any) {
            console.error(
              `[BULK-CREATE-V2] Error creando categoría ${categoriaNormalizada}:`,
              catError
            )
            errors.push({ index: i, reason: `Error al crear categoría: ${categoriaNormalizada}` })
            continue
          }
        }

        // Preparar datos del producto con talles y stock por talle
        let stockData: Record<string, number> = {}
        let talles: string[] = ['M'] // Default

        // Si hay stock por talle, usarlo
        if (productInput.stockPorTalle && Object.keys(productInput.stockPorTalle).length > 0) {
          stockData = productInput.stockPorTalle
          talles = Object.keys(productInput.stockPorTalle)
        } else if (productInput.talles && productInput.talles.length > 0) {
          // Si hay talles pero no stock por talle, distribuir stock total
          talles = productInput.talles
          const stockTotal = productInput.stock || 0
          const stockPorTalleCalculado = Math.floor(stockTotal / talles.length)
          const resto = stockTotal % talles.length

          talles.forEach((talle, index) => {
            stockData[talle] = stockPorTalleCalculado + (index < resto ? 1 : 0)
          })
        } else {
          // Default: stock en talle M
          stockData = {
            M: productInput.stock || 0,
          }
        }

        // Usar imagen principal si existe, sino placeholder
        const imagenPrincipal =
          productInput.imagenPrincipal &&
          productInput.imagenPrincipal !== DEFAULT_PRODUCT_IMAGE_URL &&
          (productInput.imagenPrincipal.startsWith('http://') ||
            productInput.imagenPrincipal.startsWith('https://') ||
            productInput.imagenPrincipal.startsWith('/images/'))
            ? productInput.imagenPrincipal
            : DEFAULT_PRODUCT_IMAGE_URL

        // Procesar imágenes secundarias
        const imagenesSec = (productInput.imagenes || [])
          .filter((img) => img && img !== imagenPrincipal)
          .slice(0, 5) // Máximo 5 imágenes secundarias

        const productoData = {
          nombre: productInput.nombre.trim(),
          descripcion: productInput.descripcion?.trim() || '',
          categoria: categoriaFinal,
          precio: productInput.precio,
          stock: stockData,
          talles: talles,
          imagen_principal: imagenPrincipal,
          imagenes_sec: imagenesSec,
          activo: productInput.activo !== false,
          destacado: false,
          descuento: 0,
          tags: productInput.tags || [],
          tenant_id: tenant.tenantId,
          sku: productInput.sku?.trim() || null,
          color:
            productInput.colores && productInput.colores.length > 0
              ? productInput.colores[0]
              : null,
        }

        // Crear producto
        const producto = await createProducto(productoData)
        created.push(producto.id)

        console.log(`[BULK-CREATE-V2] Producto creado: ${productoData.nombre} (ID: ${producto.id})`)
      } catch (error: any) {
        console.error(`[BULK-CREATE-V2] Error creando producto ${i + 1}:`, error)
        errors.push({
          index: i,
          reason: error.message || 'Error desconocido al crear producto',
        })
      }
    }

    console.log('[BULK-CREATE-V2] Resultado:', {
      creados: created.length,
      errores: errors.length,
    })

    return NextResponse.json({
      created: created.length,
      errors: errors,
      total: products.length,
    })
  } catch (error: any) {
    console.error('[BULK-CREATE-V2] Error general:', error)
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
