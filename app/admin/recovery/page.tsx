'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecoveryPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular envío (en producción usar servicio de email)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Guardar token dummy en localStorage para desarrollo
      const token = `recovery_${Date.now()}`
      localStorage.setItem('recovery_token', token)
      localStorage.setItem('recovery_email', email)
      
      toast.success('Email de recuperación enviado (check localStorage en dev)')
      setSent(true)
    } catch (error) {
      toast.error('Error al enviar email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center"
        >
          <Mail className="mx-auto text-green-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-black mb-2">Email Enviado</h1>
          <p className="text-gray-600 mb-6">
            Revisá tu correo para continuar con la recuperación de contraseña.
          </p>
          <Link
            href="/admin/login"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Volver al login
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
      >
        <Link
          href="/admin/login"
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </Link>

        <h1 className="text-2xl font-bold text-black mb-2">Recuperar Contraseña</h1>
        <p className="text-gray-600 mb-6">
          Ingresá tu email y te enviaremos un link para resetear tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-400"
          >
            {loading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </form>
      </motion.div>
    </main>
  )
}

