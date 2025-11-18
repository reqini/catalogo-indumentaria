'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PagoPendingPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        <Clock className="mx-auto text-yellow-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-black mb-2">Pago Pendiente</h1>
        <p className="text-gray-600 mb-4">
          Tu pago está siendo procesado. Esto puede tardar unos minutos.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ⏳ Estamos verificando tu pago. Te notificaremos por email cuando se confirme.
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          No te preocupes, tu pedido está reservado y se procesará automáticamente cuando se confirme el pago.
        </p>
        <Link
          href="/catalogo"
          className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
        >
          Volver al Catálogo
        </Link>
      </motion.div>
    </main>
  )
}

