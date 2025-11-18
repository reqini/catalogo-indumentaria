'use client'

import { useEffect, useState } from 'react'
import { Package, TrendingDown, AlertCircle, Tag, Image as ImageIcon, ShoppingBag, RefreshCw, DollarSign, TrendingUp } from 'lucide-react'
import { getProducts, getBanners } from '@/utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
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
        axios.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => ({ data: null })),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={18} />
            Refrescar
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Ventas</p>
                <p className="text-3xl font-bold text-black">{stats.totalVentas}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.cantidadProductosVendidos} productos vendidos</p>
              </div>
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Monto Total</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.montoTotal.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ticket promedio: ${stats.ticketPromedio.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Productos Activos</p>
                <p className="text-3xl font-bold text-black">{stats.productosActivos}</p>
                <p className="text-xs text-gray-500 mt-1">Total: {stats.totalProductos}</p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Stock Crítico</p>
                <p className="text-3xl font-bold text-orange-500">{stats.productosStockCritico.length}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.productosAgotados} agotados</p>
              </div>
              <AlertCircle className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Productos */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-4">Top 5 Productos Más Vendidos</h2>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-4">Productos por Categoría</h2>
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
                      <Cell key={`cell-${index}`} fill={['#000', '#333', '#666', '#999', '#ccc'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Productos Stock Crítico y Últimas Ventas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos Stock Crítico */}
          {stats.productosStockCritico.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-4">Productos con Stock Crítico</h2>
              <div className="space-y-2">
                {stats.productosStockCritico.map((producto: any) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-black">{producto.nombre}</span>
                    <span className="text-sm text-orange-600 font-bold">{producto.stock} unidades</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas Ventas */}
          {stats.ultimasVentas.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-4">Últimas Ventas</h2>
              <div className="space-y-2">
                {stats.ultimasVentas.map((venta: any) => (
                  <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-black">{venta.producto}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(venta.fecha).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <span className="text-sm text-green-600 font-bold">${venta.monto.toLocaleString('es-AR')}</span>
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

