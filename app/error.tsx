'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('GlobalError:', error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-black">
                Algo salió mal
              </h1>
            </div>

            <p className="text-gray-700 mb-4">
              No pudimos completar la acción. Podés intentar de nuevo o volver
              al inicio.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <Home size={16} />
                Volver al inicio
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              Si el problema persiste, contactanos con el detalle de lo que
              estabas haciendo.
            </p>
          </motion.div>
        </div>
      </body>
    </html>
  )
}


