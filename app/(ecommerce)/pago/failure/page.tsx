'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PagoFailurePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
      >
        <XCircle className="mx-auto mb-4 text-red-500" size={64} />
        <h1 className="mb-2 text-3xl font-bold text-black">Pago No Procesado</h1>
        <p className="mb-4 text-gray-600">
          Tu pago no pudo completarse. Podés intentar nuevamente con otro método de pago.
        </p>
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="mb-2 text-sm text-yellow-800">
            <strong>Posibles causas:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1 text-left text-sm text-yellow-700">
            <li>Fondos insuficientes</li>
            <li>Tarjeta rechazada por el banco</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Límite de compra excedido</li>
          </ul>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Si el problema persiste, contactanos para ayudarte.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/carrito"
            className="flex-1 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
          >
            Reintentar Pago
          </Link>
          <Link
            href="/catalogo"
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Ver Catálogo
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
