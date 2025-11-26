'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  TrendingDown,
  AlertCircle,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  RefreshCw,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { getProducts, getBanners } from '@/utils/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import axios from 'axios'
import { useAuthContext } from '@/context/AuthContext'

export default function AdminDashboard() {
  const { tenant } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVentas: 0,
    cantidadProductosVendidos: 0,
    montoTotal: 0,
    ticketPromedio: 0,
    topProductos: [] as any[],
    productosStockCritico: [] as any[],
    ultimasVentas: [] as any[],
    bannersActivos: 0,
    productosActivos: 0,
    productosAgotados: 0,
    totalProductos: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [categoriaChartData, setCategoriaChartData] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Obtener token para autenticación
      const token = localStorage.getItem('auth_token') || ''

      const [statsResponse, productos] = await Promise.all([
        axios
          .get('/api/admin/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(() => ({ data: null })),
        getProducts(),
      ])

      if (statsResponse.data) {
        setStats(statsResponse.data)

        // Gráfico de top productos
        const topChartData = statsResponse.data.topProductos.map((p: any, index: number) => ({
          name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
          cantidad: p.cantidad,
          monto: p.monto,
        }))
        setChartData(topChartData)
      }

      // Gráfico por categoría
      const categoriasData: { [key: string]: number } = {}
      productos.forEach((p: any) => {
        const cat = p.categoria || 'Sin categoría'
        categoriasData[cat] = (categoriasData[cat] || 0) + 1
      })

      const categoriaChartDataArray = Object.entries(categoriasData).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        cantidad: value,
      }))
      setCategoriaChartData(categoriaChartDataArray)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refrescar
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* KPIs */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Ventas</p>
                <p className="text-3xl font-bold text-black">{stats.totalVentas}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.cantidadProductosVendidos} productos vendidos
                </p>
              </div>
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Monto Total</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.montoTotal.toLocaleString('es-AR')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Ticket promedio: ${stats.ticketPromedio.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Productos Activos</p>
                <p className="text-3xl font-bold text-black">{stats.productosActivos}</p>
                <p className="mt-1 text-xs text-gray-500">Total: {stats.totalProductos}</p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Stock Crítico</p>
                <p className="text-3xl font-bold text-orange-500">
                  {stats.productosStockCritico.length}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stats.productosAgotados} agotados</p>
              </div>
              <AlertCircle className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Productos */}
          {chartData.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Top 5 Productos Más Vendidos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Productos por Categoría */}
          {categoriaChartData.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Productos por Categoría</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriaChartData}
                    dataKey="cantidad"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#000"
                    label
                  >
                    {categoriaChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#000', '#333', '#666', '#999', '#ccc'][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Productos Stock Crítico y Últimas Ventas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Productos Stock Crítico */}
          {stats.productosStockCritico.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Productos con Stock Crítico</h2>
              <div className="space-y-2">
                {stats.productosStockCritico.map((producto: any) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
                  >
                    <span className="font-medium text-black">{producto.nombre}</span>
                    <span className="text-sm font-bold text-orange-600">
                      {producto.stock} unidades
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas Ventas */}
          {stats.ultimasVentas.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Últimas Ventas</h2>
              <div className="space-y-2">
                {stats.ultimasVentas.map((venta: any) => (
                  <div
                    key={venta.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-black">{venta.producto}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(venta.fecha).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ${venta.monto.toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
