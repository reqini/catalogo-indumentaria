'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="flex items-center gap-4 rounded-lg bg-black p-4 text-white shadow-xl">
          <Download size={24} />
          <div className="flex-1">
            <p className="font-semibold">Instalar App</p>
            <p className="text-sm text-gray-300">Instalá nuestra app para una mejor experiencia</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
