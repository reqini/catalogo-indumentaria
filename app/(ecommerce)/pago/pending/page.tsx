'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PagoPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
      >
        <Clock className="mx-auto mb-4 text-yellow-500" size={64} />
        <h1 className="mb-2 text-3xl font-bold text-black">Pago Pendiente</h1>
        <p className="mb-4 text-gray-600">
          Tu pago está siendo procesado. Esto puede tardar unos minutos.
        </p>
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            ⏳ Estamos verificando tu pago. Te notificaremos por email cuando se confirme.
          </p>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          No te preocupes, tu pedido está reservado y se procesará automáticamente cuando se
          confirme el pago.
        </p>
        <Link
          href="/catalogo"
          className="inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
        >
          Volver al Catálogo
        </Link>
      </motion.div>
    </main>
  )
}
