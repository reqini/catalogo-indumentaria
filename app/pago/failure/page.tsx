'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PagoFailurePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        <XCircle className="mx-auto text-red-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-black mb-2">Pago No Procesado</h1>
        <p className="text-gray-600 mb-4">
          Tu pago no pudo completarse. Podés intentar nuevamente con otro método de pago.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Posibles causas:</strong>
          </p>
          <ul className="text-sm text-yellow-700 text-left list-disc list-inside space-y-1">
            <li>Fondos insuficientes</li>
            <li>Tarjeta rechazada por el banco</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Límite de compra excedido</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Si el problema persiste, contactanos para ayudarte.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/carrito"
            className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
          >
            Reintentar Pago
          </Link>
          <Link
            href="/catalogo"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Ver Catálogo
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

