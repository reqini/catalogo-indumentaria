'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

export default function PagoSuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [paymentId, setPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const paymentIdParam = searchParams.get('payment_id')
    const preferenceId = searchParams.get('preference_id')
    setPaymentId(paymentIdParam || preferenceId)
    
    // Limpiar carrito después de pago exitoso
    clearCart()
  }, [searchParams, clearCart])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-black mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-4">
          Tu pago fue procesado correctamente. Tu pedido está siendo preparado.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Recibirás un email de confirmación con los detalles de tu pedido en breve.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            ✅ Tu compra fue confirmada y el stock fue actualizado automáticamente.
          </p>
        </div>
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">ID de Pago:</p>
            <p className="font-mono text-sm text-black">{paymentId}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/catalogo"
            className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
          >
            Seguir Comprando
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

