'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ExternalLink,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface Order {
  id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string
  direccion_calle?: string | null
  direccion_numero?: string | null
  direccion_piso_depto?: string | null
  direccion_codigo_postal?: string | null
  direccion_localidad?: string | null
  direccion_provincia?: string | null
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

interface OrderLog {
  id: string
  orden_id: string
  accion: string
  datos_anteriores: any
  datos_nuevos: any
  notas?: string
  usuario?: string
  created_at: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [logs, setLogs] = useState<OrderLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${params.id}`)
      if (!response.ok) {
        throw new Error('Error al cargar orden')
      }

      const data = await response.json()
      setOrder(data.order)
      setLogs(data.logs || [])
    } catch (error: any) {
      console.error('Error fetching order:', error)
      toast.error('Error al cargar orden')
    } finally {
      setLoading(false)
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-black">Orden no encontrada</h1>
            <button
              onClick={() => router.push('/admin/orders')}
              className="text-blue-600 hover:text-blue-800"
            >
              Volver a órdenes
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Orden #{order.id.substring(0, 8)}</h1>
          <p className="mt-2 text-gray-600">Creada el {formatDate(order.created_at)}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Información Principal */}
          <div className="space-y-6 md:col-span-2">
            {/* Estado */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-black">Estado</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-lg px-4 py-2 font-semibold ${getStatusColor(order.estado)}`}
                >
                  {order.estado.toUpperCase()}
                </span>
                <span
                  className={`rounded-lg px-4 py-2 font-semibold ${getStatusColor(order.pago_estado)}`}
                >
                  Pago: {order.pago_estado.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Productos */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-black">Productos</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-black">{item.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad} {item.talle && `• Talle: ${item.talle}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Precio unitario: {formatPrice(item.precio)}
                      </p>
                    </div>
                    <p className="font-semibold text-black">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.descuento > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Descuento</span>
                    <span>-{formatPrice(order.descuento)}</span>
                  </div>
                )}
                {order.envio_costo_total > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>{formatPrice(order.envio_costo_total)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold text-black">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Información de Envío */}
            {order.envio_tipo !== 'retiro_local' && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
                  <Truck size={24} />
                  Información de Envío
                </h2>
                <div className="space-y-2">
                  <p>
                    <strong>Método:</strong> {order.envio_metodo || 'N/A'}
                  </p>
                  {order.envio_proveedor && (
                    <p>
                      <strong>Proveedor:</strong> {order.envio_proveedor}
                    </p>
                  )}
                  {order.envio_tracking && (
                    <p>
                      <strong>Número de seguimiento:</strong>{' '}
                      <span className="font-mono text-blue-600">{order.envio_tracking}</span>
                    </p>
                  )}
                  <p>
                    <strong>Costo:</strong> {formatPrice(order.envio_costo_total)}
                  </p>
                </div>
              </div>
            )}

            {/* Historial de Cambios */}
            {logs.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold text-black">Historial</h2>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border-l-2 border-gray-300 pl-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-black">{log.accion}</span>
                        <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                      </div>
                      {log.notas && <p className="mt-1 text-sm text-gray-600">{log.notas}</p>}
                      {log.usuario && (
                        <p className="mt-1 text-xs text-gray-500">Por: {log.usuario}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cliente */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-black">Cliente</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Package size={20} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-black">{order.cliente_nombre}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail size={20} className="mt-0.5 text-gray-400" />
                  <p className="text-sm text-gray-600">{order.cliente_email}</p>
                </div>
                {order.cliente_telefono && (
                  <div className="flex items-start gap-2">
                    <Phone size={20} className="mt-0.5 text-gray-400" />
                    <p className="text-sm text-gray-600">{order.cliente_telefono}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección o Tipo de Entrega */}
            {order.envio_tipo === 'retiro_local' ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-black">
                  <MapPin size={20} />
                  Tipo de Entrega
                </h2>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">Retiro en el local</p>
                  <p className="text-blue-700">
                    El cliente retirará el pedido por el local. Se debe contactar con la dirección y
                    horarios de retiro.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
                  <MapPin size={20} />
                  Dirección de Envío
                </h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    {order.direccion_calle} {order.direccion_numero}
                    {order.direccion_piso_depto && `, ${order.direccion_piso_depto}`}
                  </p>
                  <p>
                    {order.direccion_codigo_postal}, {order.direccion_localidad}
                  </p>
                  <p>{order.direccion_provincia}</p>
                </div>
              </div>
            )}

            {/* Pago */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
                <CreditCard size={20} />
                Pago
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Método:</strong> {order.pago_metodo}
                </p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`rounded px-2 py-1 ${getStatusColor(order.pago_estado)}`}>
                    {order.pago_estado}
                  </span>
                </p>
                {order.pago_id && (
                  <p>
                    <strong>Payment ID:</strong>{' '}
                    <span className="font-mono text-xs">{order.pago_id}</span>
                  </p>
                )}
                {order.pago_preferencia_id && (
                  <p>
                    <strong>Preference ID:</strong>{' '}
                    <span className="font-mono text-xs">{order.pago_preferencia_id}</span>
                  </p>
                )}
                {order.pago_fecha && (
                  <p>
                    <strong>Fecha de pago:</strong> {formatDate(order.pago_fecha)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
