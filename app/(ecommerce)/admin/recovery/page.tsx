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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
        >
          <Mail className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="mb-2 text-2xl font-bold text-black">Email Enviado</h1>
          <p className="mb-6 text-gray-600">
            Revisá tu correo para continuar con la recuperación de contraseña.
          </p>
          <Link href="/admin/login" className="font-semibold text-blue-600 hover:text-blue-800">
            Volver al login
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
      >
        <Link
          href="/admin/login"
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-black">Recuperar Contraseña</h1>
        <p className="mb-6 text-gray-600">
          Ingresá tu email y te enviaremos un link para resetear tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </form>
      </motion.div>
    </main>
  )
}
