import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import {
  getTenantFromToken,
  getProductos,
  getCompraLogs,
  getBanners,
} from '@/lib/supabase-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Forzar ruta dinámica para evitar prerendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Obtener token de la cookie (admin usa cookies, no Authorization header)
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get('auth_token')?.value

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    // Decodificar token para obtener tenantId
    let tenantId: string | null = null
    try {
      const decoded = jwt.verify(tokenCookie, JWT_SECRET) as any
      tenantId = decoded.tenantId || decoded.id || null
    } catch (error) {
      console.error('Error decodificando token:', error)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (!tenantId) {
      // Intentar obtener tenant usando getTenantFromToken
      const tenant = await getTenantFromToken(tokenCookie)
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
      }
      tenantId = tenant.tenantId
    }

    // Obtener productos del tenant
    const productos = await getProductos({ tenantId, activo: undefined })

    // Obtener compras aprobadas del tenant
    const comprasAprobadas = await getCompraLogs({ estado: 'aprobado' })

    // Filtrar compras que pertenecen a productos del tenant
    const productosIds = productos.map((p: any) => p.id)
    const comprasDelTenant = comprasAprobadas.filter((compra: any) => {
      return productosIds.includes(compra.producto_id)
    })

    // Calcular estadísticas
    const totalVentas = comprasDelTenant.length
    const montoTotal = comprasDelTenant.reduce((acc: number, compra: any) => {
      return acc + (compra.precio_total || compra.monto || 0)
    }, 0)

    // Productos más vendidos
    const productosVendidos: {
      [key: string]: { nombre: string; cantidad: number; monto: number }
    } = {}

    comprasDelTenant.forEach((compra: any) => {
      const productoId = compra.producto_id
      const producto = productos.find((p: any) => p.id === productoId)

      if (producto) {
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            nombre: producto.nombre || 'Sin nombre',
            cantidad: 0,
            monto: 0,
          }
        }
        productosVendidos[productoId].cantidad += compra.cantidad || 1
        productosVendidos[productoId].monto += compra.precio_total || compra.monto || 0
      }
    })

    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    // Productos con stock crítico (< 5 unidades)
    const productosStockCritico = productos
      .filter((p: any) => {
        const stock = p.stock || {}
        const stockRecord: Record<string, number> =
          typeof stock === 'object' && stock !== null ? stock : {}
        const totalStock = Object.values(stockRecord).reduce(
          (a: number, b: number) => a + b,
          0
        )
        return totalStock > 0 && totalStock < 5
      })
      .map((p: any) => {
        const stock = p.stock || {}
        const stockRecord: Record<string, number> =
          typeof stock === 'object' && stock !== null ? stock : {}
        const totalStock = Object.values(stockRecord).reduce(
          (a: number, b: number) => a + b,
          0
        )
        return {
          id: p.id,
          nombre: p.nombre,
          stock: totalStock,
        }
      })
      .slice(0, 5)

    // Últimas ventas
    const ultimasVentas = comprasDelTenant.slice(0, 10).map((compra: any) => {
      const producto = productos.find((p: any) => p.id === compra.producto_id)
      return {
        id: compra.id,
        producto: producto?.nombre || 'Producto eliminado',
        fecha: compra.fecha || compra.fecha_creacion || compra.created_at,
        estado: compra.estado,
        monto: compra.precio_total || compra.monto || 0,
      }
    })

    // Tickets promedio (monto promedio por venta)
    const ticketPromedio = totalVentas > 0 ? montoTotal / totalVentas : 0

    // Banners activos
    const banners = await getBanners({ tenantId, activo: true })
    const bannersActivos = banners.length

    // Productos activos
    const productosActivos = productos.filter((p: any) => p.activo !== false).length

    // Productos agotados
    const productosAgotados = productos.filter((p: any) => {
      const stock = p.stock || {}
      const stockRecord: Record<string, number> =
        typeof stock === 'object' && stock !== null ? stock : {}
      const totalStock = Object.values(stockRecord).reduce(
        (a: number, b: number) => a + b,
        0
      )
      return totalStock === 0
    }).length

    return NextResponse.json({
      totalVentas,
      cantidadProductosVendidos: Object.keys(productosVendidos).length,
      montoTotal,
      ticketPromedio,
      topProductos,
      productosStockCritico,
      ultimasVentas,
      bannersActivos,
      productosActivos,
      productosAgotados,
      totalProductos: productos.length,
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
