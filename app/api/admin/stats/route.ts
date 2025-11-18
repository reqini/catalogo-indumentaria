import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Producto from '@/models/Producto'
import CompraLog from '@/models/CompraLog'
import Banner from '@/models/Banner'
import { getTenantFromToken } from '@/lib/tenant'
import mongoose from 'mongoose'

export async function GET(request: Request) {
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

    // Obtener productos del tenant
    const productos = await Producto.find({ tenantId: tenant.tenantId }).lean()

    // Obtener compras aprobadas del tenant (usando preferenciaId para identificar tenant)
    const compras = await CompraLog.find({ estado: 'aprobado' })
      .populate('productoId')
      .sort({ fecha: -1 })
      .lean()

    // Filtrar compras que pertenecen a productos del tenant
    const comprasDelTenant = compras.filter((compra: any) => {
      if (!compra.productoId) return false
      const producto = productos.find((p: any) => p._id.toString() === compra.productoId._id.toString())
      return !!producto
    })

    // Calcular estadísticas
    const totalVentas = comprasDelTenant.length
    const montoTotal = comprasDelTenant.reduce((acc: number, compra: any) => {
      // Intentar obtener monto del pago (si está disponible)
      return acc + (compra.monto || 0)
    }, 0)

    // Productos más vendidos
    const productosVendidos: { [key: string]: { nombre: string; cantidad: number; monto: number } } = {}
    comprasDelTenant.forEach((compra: any) => {
      if (compra.productoId) {
        const productoId = compra.productoId._id.toString()
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            nombre: compra.productoId.nombre || 'Sin nombre',
            cantidad: 0,
            monto: 0,
          }
        }
        productosVendidos[productoId].cantidad += 1
        productosVendidos[productoId].monto += compra.monto || 0
      }
    })

    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    // Productos con stock crítico (< 5 unidades)
    const productosStockCritico = productos
      .filter((p: any) => {
        const stock = p.stock as any
        const stockRecord: Record<string, number> = stock
          ? typeof stock === 'object' && stock.constructor === Map
            ? Object.fromEntries(stock as Map<string, number>)
            : typeof stock === 'object'
            ? stock
            : {}
          : {}
        const totalStock = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        return totalStock > 0 && totalStock < 5
      })
      .map((p: any) => {
        const stock = p.stock as any
        const stockRecord: Record<string, number> = stock
          ? typeof stock === 'object' && stock.constructor === Map
            ? Object.fromEntries(stock as Map<string, number>)
            : typeof stock === 'object'
            ? stock
            : {}
          : {}
        const totalStock = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        return {
          id: p._id.toString(),
          nombre: p.nombre,
          stock: totalStock,
        }
      })
      .slice(0, 5)

    // Últimas ventas
    const ultimasVentas = comprasDelTenant.slice(0, 10).map((compra: any) => ({
      id: compra._id.toString(),
      producto: compra.productoId?.nombre || 'Producto eliminado',
      fecha: compra.fecha,
      estado: compra.estado,
      monto: compra.monto || 0,
    }))

    // Tickets promedio (monto promedio por venta)
    const ticketPromedio = totalVentas > 0 ? montoTotal / totalVentas : 0

    // Banners activos
    const bannersActivos = await Banner.countDocuments({
      tenantId: tenant.tenantId,
      activo: true,
    })

    // Productos activos
    const productosActivos = productos.filter((p: any) => p.activo !== false).length

    // Productos agotados
    const productosAgotados = productos.filter((p: any) => {
      const stock = p.stock as any
      const stockRecord: Record<string, number> = stock
        ? typeof stock === 'object' && stock.constructor === Map
          ? Object.fromEntries(stock as Map<string, number>)
          : typeof stock === 'object'
          ? stock
          : {}
        : {}
      const totalStock = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
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

