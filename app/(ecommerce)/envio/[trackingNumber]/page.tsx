'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface TrackingInfo {
  trackingNumber: string
  orderId: string
  status: string
  location?: string
  estimatedDelivery?: string
  lastUpdate?: string
  provider?: string
  order?: {
    id: string
    cliente: string
    total: number
    estado: string
  }
}

function TrackingContent() {
  const params = useParams()
  const trackingNumber = params.trackingNumber as string
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
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
        if (response.status === 404) {
          setError('Envío no encontrado. Verificá que el número de seguimiento sea correcto.')
        } else {
          setError('Error al consultar el seguimiento. Intentá nuevamente más tarde.')
        }
        return
      }

      const data = await response.json()
      setTracking(data)
    } catch (err: any) {
      console.error('Error fetching tracking:', err)
      setError('Error al consultar el seguimiento. Intentá nuevamente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'entregada':
        return <CheckCircle2 className="text-green-500" size={32} />
      case 'en_transito':
      case 'enviada':
        return <Truck className="text-blue-500" size={32} />
      case 'pendiente':
        return <Clock className="text-yellow-500" size={32} />
      default:
        return <Package className="text-gray-500" size={32} />
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

  const getStatusLabel = (status: string) => {
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

  const getProviderTrackingUrl = (provider?: string, trackingNumber?: string) => {
    if (!provider || !trackingNumber) return null

    const urls: Record<string, string> = {
      OCA: `https://www.oca.com.ar/envios/consulta-envios?numero=${trackingNumber}`,
      Andreani: `https://www.andreani.com/#!/envio/${trackingNumber}`,
      'Correo Argentino': `https://www.correoargentino.com.ar/formularios/cpaenvio`,
      Envíopack: `https://www.enviopack.com/seguimiento/${trackingNumber}`,
    }

    return urls[provider] || null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-black" size={32} />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg"
          >
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="mb-2 text-2xl font-bold text-black">Error al Consultar Seguimiento</h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/"
                className="flex-1 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
              >
                Volver al Inicio
              </Link>
              <button
                onClick={fetchTracking}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Reintentar
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  if (!tracking) {
    return null
  }

  const providerUrl = getProviderTrackingUrl(tracking.provider, tracking.trackingNumber)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-black">Seguimiento de Envío</h1>
            <p className="text-gray-600">Número de seguimiento: {tracking.trackingNumber}</p>
          </div>

          {/* Estado Actual */}
          <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(tracking.status)}
                <div>
                  <h2 className="text-xl font-bold text-black">Estado Actual</h2>
                  <p className="text-sm text-gray-600">
                    Última actualización: {formatDate(tracking.lastUpdate)}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-lg border px-4 py-2 font-semibold ${getStatusColor(tracking.status)}`}
              >
                {getStatusLabel(tracking.status)}
              </span>
            </div>

            {tracking.location && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-4">
                <MapPin className="mt-0.5 text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Ubicación Actual</p>
                  <p className="text-sm text-gray-600">{tracking.location}</p>
                </div>
              </div>
            )}

            {tracking.estimatedDelivery && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-4">
                <Clock className="mt-0.5 text-blue-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-700">Fecha Estimada de Entrega</p>
                  <p className="text-sm text-blue-600">{tracking.estimatedDelivery}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información de la Orden */}
          {tracking.order && (
            <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">Información de la Orden</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Número de Orden</p>
                  <p className="font-mono font-semibold text-black">
                    #{tracking.orderId.substring(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold text-black">{tracking.order.cliente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-black">{formatPrice(tracking.order.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado de la Orden</p>
                  <p className="font-semibold text-black">{tracking.order.estado}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información del Proveedor */}
          {tracking.provider && (
            <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-black">Información del Transportista</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="font-semibold text-black">{tracking.provider}</p>
                </div>
                {providerUrl && (
                  <a
                    href={providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Ver en sitio del proveedor
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-lg bg-black px-6 py-3 text-center font-semibold text-white transition-all hover:bg-gray-800"
            >
              Volver al Inicio
            </Link>
            <button
              onClick={fetchTracking}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Actualizar Estado
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-black" size={32} />
            </div>
          </div>
        </main>
      }
    >
      <TrackingContent />
    </Suspense>
  )
}
