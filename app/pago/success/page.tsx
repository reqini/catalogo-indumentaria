'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

function PagoSuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIdParam = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    const orderIdParam = searchParams.get('orderId')

    setPaymentId(paymentIdParam || preferenceId)
    setOrderId(orderIdParam)

    // Limpiar carrito después de pago exitoso
    clearCart()

    // Si hay orderId, obtener información de la orden
    if (orderIdParam) {
      fetchOrder(orderIdParam)
    } else {
      setLoading(false)
    }
  }, [searchParams, clearCart])

  const fetchOrder = async (id: string) => {
    try {
      // Intentar primero con endpoint de admin (puede requerir auth)
      let response = await fetch(`/api/admin/orders/${id}`)

      // Si falla, intentar con endpoint público simplificado
      if (!response.ok) {
        response = await fetch(`/api/orders/${id}`)
      }

      if (response.ok) {
        const data = await response.json()
        const orderData = data.order || data

        // Adaptar estructura simplificada a formato esperado
        if (orderData.envio && typeof orderData.envio === 'object') {
          setOrder({
            ...orderData,
            envio_tipo: orderData.envio.tipo,
            envio_metodo: orderData.envio.metodo,
            envio_costo: orderData.envio.costo || 0,
            envio_tracking: orderData.envio.tracking || orderData.envio.tracking_number,
            envio_proveedor: orderData.envio.proveedor || orderData.envio.provider,
            direccion_calle: orderData.envio.direccion?.calle,
            direccion_numero: orderData.envio.direccion?.numero,
            direccion_codigo_postal: orderData.envio.direccion?.codigoPostal,
            direccion_localidad: orderData.envio.direccion?.localidad,
            direccion_provincia: orderData.envio.direccion?.provincia,
            cliente_nombre: orderData.comprador?.nombre || orderData.cliente_nombre,
            cliente_email: orderData.comprador?.email || orderData.cliente_email,
            cliente_telefono: orderData.comprador?.telefono || orderData.cliente_telefono,
            items: orderData.productos || orderData.items || [],
            subtotal: orderData.total - (orderData.envio.costo || 0),
            envio_costo_total: orderData.envio.costo || 0,
            total: orderData.total,
          })
        } else {
          setOrder(orderData)
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
      >
        <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
        <h1 className="mb-2 text-3xl font-bold text-black">¡Pago Exitoso!</h1>
        <p className="mb-4 text-gray-600">
          Tu pago fue procesado correctamente. Tu pedido está siendo preparado.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Recibirás un email de confirmación con los detalles de tu pedido en breve.
        </p>
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            ✅ Tu compra fue confirmada y el stock fue actualizado automáticamente.
          </p>
        </div>
        {orderId && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-1 text-sm text-blue-800">ID de Orden:</p>
            <p className="font-mono text-sm font-semibold text-blue-900">
              #{orderId.substring(0, 8)}
            </p>
          </div>
        )}
        {paymentId && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-sm text-gray-600">ID de Pago:</p>
            <p className="font-mono text-sm text-black">{paymentId}</p>
          </div>
        )}
        {order?.envio_tipo === 'retiro_local' ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-1 text-sm font-semibold text-blue-800">📍 Retiro en el Local</p>
            <p className="text-sm text-blue-700">
              Tu pedido está listo para retirar. Te contactaremos con la dirección y horarios de
              retiro.
            </p>
            <p className="mt-2 text-xs text-blue-600">ID de Orden: #{orderId?.substring(0, 8)}</p>
          </div>
        ) : order?.envio_tracking ? (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="mb-1 text-sm font-semibold text-green-800">📦 Número de seguimiento:</p>
            <p className="font-mono text-sm font-semibold text-green-900">{order.envio_tracking}</p>
            <p className="mt-2 text-xs text-green-700">
              Podés rastrear tu pedido en:{' '}
              <Link
                href={`/envio/${order.envio_tracking}`}
                className="inline-flex items-center gap-1 font-medium underline hover:text-green-900"
              >
                Rastrear mi pedido
                <ExternalLink size={14} />
              </Link>
            </p>
            {order.envio_proveedor && (
              <p className="mt-1 text-xs text-green-600">Proveedor: {order.envio_proveedor}</p>
            )}
          </div>
        ) : order?.envio_tipo === 'envio' || order?.envio_metodo ? (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="mb-1 text-sm text-yellow-800">📦 Envío en proceso</p>
            <p className="text-sm text-yellow-700">
              Tu pedido será enviado por {order.envio_metodo || 'método estándar'}. Recibirás el
              número de seguimiento por email cuando el envío sea creado.
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/catalogo"
            className="flex-1 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
          >
            Seguir Comprando
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Volver al Inicio
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

export default function PagoSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <p className="text-gray-600">Cargando...</p>
          </div>
        </main>
      }
    >
      <PagoSuccessContent />
    </Suspense>
  )
}
