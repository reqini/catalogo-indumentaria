'use client'

import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  const handleReconnect = () => {
    if (navigator.onLine) {
      router.push('/')
      router.refresh()
    } else {
      alert('Aún no hay conexión a internet')
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
        <WifiOff className="mx-auto mb-4 text-gray-400" size={64} />
        <h1 className="mb-2 text-3xl font-bold text-black">Sin Conexión</h1>
        <p className="mb-6 text-gray-600">
          No tenés conexión a internet. Revisá tu conexión e intentá nuevamente.
        </p>
        <button
          onClick={handleReconnect}
          className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
        >
          <RefreshCw size={20} />
          Reconectar
        </button>
      </motion.div>
    </main>
  )
}
