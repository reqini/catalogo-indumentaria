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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        <WifiOff className="mx-auto text-gray-400 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-black mb-2">Sin Conexión</h1>
        <p className="text-gray-600 mb-6">
          No tenés conexión a internet. Revisá tu conexión e intentá nuevamente.
        </p>
        <button
          onClick={handleReconnect}
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Reconectar
        </button>
      </motion.div>
    </main>
  )
}
