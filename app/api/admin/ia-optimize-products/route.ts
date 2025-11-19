import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'

interface Product {
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  sku?: string
  tags?: string[]
}

export async function POST(request: Request) {
  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Se requiere un array de productos' },
        { status: 400 }
      )
    }

    console.log('[IA-OPTIMIZE] Optimizando', products.length, 'productos')

    // Optimizar cada producto
    const optimized = products.map((product: Product) => {
      // Mejorar descripción si es muy corta
      let descripcion = product.descripcion || ''
      if (descripcion.length < 20) {
        descripcion = `${product.nombre} de alta calidad en la categoría ${product.categoria}. Diseño moderno y confortable.`
      }

      // Generar descripción larga si no existe
      const descripcionLarga = `${descripcion}

Características:
- Material de primera calidad
- Diseño moderno y versátil
- Perfecto para uso diario
- Disponible en múltiples talles`

      // Mejorar tags si faltan
      let tags = product.tags || []
      if (tags.length === 0) {
        tags = [
          product.categoria.toLowerCase(),
          ...product.nombre.toLowerCase().split(' ').filter(w => w.length > 3),
          'indumentaria',
          'moda',
        ].slice(0, 10)
      }

      // Sugerir precio optimizado
      const precioSugerido = suggestOptimizedPrice(product.precio, product.categoria)

      return {
        ...product,
        descripcion,
        descripcionLarga,
        tags,
        precioSugerido,
      }
    })

    return NextResponse.json({
      products: optimized,
      count: optimized.length,
    })
  } catch (error: any) {
    console.error('[IA-OPTIMIZE] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al optimizar productos' },
      { status: 500 }
    )
  }
}

function suggestOptimizedPrice(precio: number, categoria: string): number {
  // Lógica de optimización de precio basada en categoría y mercado
  const multipliers: Record<string, number> = {
    'Remeras': 1.0,
    'Pantalones': 1.1,
    'Buzos': 1.15,
    'Zapatillas': 1.2,
  }
  
  const multiplier = multipliers[categoria] || 1.0
  return Math.round(precio * multiplier)
}

