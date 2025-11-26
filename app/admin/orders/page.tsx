'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, CheckCircle2, Clock, XCircle, Truck, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  direccion_calle: string
  direccion_numero: string
  direccion_piso_depto?: string
  direccion_codigo_postal: string
  direccion_localidad: string
  direccion_provincia: string
  envio_tipo: string
  envio_metodo?: string
  envio_costo: number
  envio_tracking?: string
  envio_proveedor?: string
  items: Array<{
    id: string
    nombre: string
    precio: number
    cantidad: number
    talle?: string
    subtotal: number
  }>
  subtotal: number
  descuento: number
  envio_costo_total: number
  total: number
  pago_metodo: string
  pago_estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
  pago_preferencia_id?: string
  pago_id?: string
  pago_fecha?: string
  estado: 'pendiente' | 'pagada' | 'enviada' | 'entregada' | 'cancelada'
  estado_fecha: string
  created_at: string
  updated_at: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'pagada' | 'enviada' | 'entregada'>(
    'all'
  )
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('estado', filter)
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Error al cargar órdenes')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'enviada' | 'entregada') => {
    try {
      setUpdatingOrder(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      toast.success(`Orden marcada como ${newStatus}`)
      await fetchOrders()
    } catch (error: any) {
      console.error('Error updating order:', error)
      toast.error('Error al actualizar estado')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'enviada':
        return <Truck className="text-blue-500" size={20} />
      case 'entregada':
        return <Package className="text-purple-500" size={20} />
      case 'pendiente':
        return <Clock className="text-yellow-500" size={20} />
      case 'cancelada':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <Clock className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return 'bg-green-100 text-green-800'
      case 'enviada':
        return 'bg-blue-100 text-blue-800'
      case 'entregada':
        return 'bg-purple-100 text-purple-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-black" size={32} />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Gestión de Órdenes</h1>
            <p className="mt-2 text-gray-600">Administrá y seguí todas las órdenes de compra</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pendiente', 'pagada', 'enviada', 'entregada'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                filter === f
                  ? 'bg-black text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabla de órdenes */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    ID / Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Envío
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No hay órdenes para mostrar
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-black">
                          #{order.id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-black">{order.cliente_nombre}</div>
                        <div className="text-xs text-gray-500">{order.cliente_email}</div>
                        {order.cliente_telefono && (
                          <div className="text-xs text-gray-500">{order.cliente_telefono}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.nombre)
                            .join(', ')}
                          {order.items.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold text-black">
                          {formatPrice(order.total)}
                        </div>
                        {order.envio_costo_total > 0 && (
                          <div className="text-xs text-gray-500">
                            + {formatPrice(order.envio_costo_total)} envío
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.estado)}
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(order.estado)}`}
                          >
                            {order.estado}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">Pago: {order.pago_estado}</div>
                      </td>
                      <td className="px-6 py-4">
                        {order.envio_tipo !== 'retiro_local' ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {order.envio_metodo || 'N/A'}
                            </div>
                            {order.envio_tracking && (
                              <div className="font-mono text-xs text-blue-600">
                                {order.envio_tracking}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Retiro en local</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
                            Ver
                          </button>
                          {order.estado === 'pagada' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'enviada')}
                              disabled={updatingOrder === order.id}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {updatingOrder === order.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Truck size={16} />
                              )}
                              Enviar
                            </button>
                          )}
                          {order.estado === 'enviada' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'entregada')}
                              disabled={updatingOrder === order.id}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                            >
                              {updatingOrder === order.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Package size={16} />
                              )}
                              Entregar
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Total Órdenes</div>
            <div className="text-2xl font-bold text-black">{orders.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.estado === 'pendiente').length}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Enviadas</div>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.estado === 'enviada').length}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Entregadas</div>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.estado === 'entregada').length}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
