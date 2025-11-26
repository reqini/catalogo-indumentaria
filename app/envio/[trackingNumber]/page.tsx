'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Package, MapPin, Clock, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TrackingStatus {
  trackingNumber: string
  orderId: string
  status: string
  location?: string
  estimatedDelivery?: string
  lastUpdate?: string
  provider: string
  order: {
    id: string
    cliente: string
    total: number
    estado: string
  }
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const trackingNumber = params.trackingNumber as string

  const [tracking, setTracking] = useState<TrackingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (trackingNumber) {
      fetchTracking()
    }
  }, [trackingNumber])

  const fetchTracking = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/shipping/tracking/${trackingNumber}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al consultar tracking')
      }

      const data = await response.json()
      setTracking(data)
    } catch (err: any) {
      console.error('Error fetching tracking:', err)
      setError(err.message || 'Error al consultar el seguimiento')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'entregada':
        return <CheckCircle2 className="text-green-600" size={24} />
      case 'en_transito':
      case 'enviada':
        return <Package className="text-blue-600" size={24} />
      case 'pendiente':
        return <Clock className="text-yellow-600" size={24} />
      default:
        return <Package className="text-gray-600" size={24} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'entregada':
        return 'Entregado'
      case 'en_transito':
      case 'enviada':
        return 'En Tránsito'
      case 'pendiente':
        return 'Pendiente'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'entregada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'en_transito':
      case 'enviada':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-black" size={48} />
          <p className="text-gray-600">Consultando estado del envío...</p>
        </div>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <Package className="mx-auto mb-4 text-red-600" size={48} />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Envío no encontrado</h1>
          <p className="mb-6 text-gray-600">
            {error || 'No se encontró información para este número de seguimiento.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-black">Seguimiento de Envío</h1>
          <p className="text-gray-600">
            Número de seguimiento:{' '}
            <span className="font-mono font-semibold">{tracking.trackingNumber}</span>
          </p>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg bg-white p-6 shadow-lg"
        >
          <div className="mb-6 flex items-center gap-4">
            {getStatusIcon(tracking.status)}
            <div className="flex-1">
              <h2 className="mb-1 text-xl font-bold text-black">
                Estado: {getStatusText(tracking.status)}
              </h2>
              <p className="text-sm text-gray-600">Proveedor: {tracking.provider}</p>
            </div>
            <div className={`rounded-lg border px-4 py-2 ${getStatusColor(tracking.status)}`}>
              {getStatusText(tracking.status)}
            </div>
          </div>

          {/* Location */}
          {tracking.location && (
            <div className="mb-4 flex items-start gap-3">
              <MapPin className="mt-1 text-gray-400" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-700">Ubicación actual</p>
                <p className="text-gray-600">{tracking.location}</p>
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          {tracking.estimatedDelivery && (
            <div className="mb-4 flex items-start gap-3">
              <Clock className="mt-1 text-gray-400" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-700">Entrega estimada</p>
                <p className="text-gray-600">{tracking.estimatedDelivery}</p>
              </div>
            </div>
          )}

          {/* Last Update */}
          {tracking.lastUpdate && (
            <div className="text-xs text-gray-500">
              Última actualización: {new Date(tracking.lastUpdate).toLocaleString('es-AR')}
            </div>
          )}
        </motion.div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-white p-6 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-bold text-black">Información de la Orden</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Número de orden</p>
              <p className="font-semibold text-black">{tracking.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-semibold text-black">{tracking.order.cliente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold text-black">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(tracking.order.total)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado de la orden</p>
              <p className="font-semibold capitalize text-black">{tracking.order.estado}</p>
            </div>
          </div>
        </motion.div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchTracking}
            disabled={loading}
            className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 inline animate-spin" size={18} />
                Actualizando...
              </>
            ) : (
              'Actualizar Estado'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
