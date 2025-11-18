'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Store, Mail, Lock, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '@/context/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombreNegocio: '',
    email: '',
    password: '',
    mpId: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login: authLogin } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar')
      }

      // Guardar token
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }),
      })

      authLogin(data.token, data.tenant)
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Empezá tu catálogo en minutos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombreNegocio" className="block text-sm font-medium text-gray-700 mb-2">
              <Store size={16} className="inline mr-2" />
              Nombre del Negocio
            </label>
            <input
              type="text"
              id="nombreNegocio"
              value={formData.nombreNegocio}
              onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Mi Tienda"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="inline mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="mpId" className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard size={16} className="inline mr-2" />
              ID Mercado Pago (Opcional)
            </label>
            <input
              type="text"
              id="mpId"
              value={formData.mpId}
              onChange={(e) => setFormData({ ...formData, mpId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="MP-XXXXX"
            />
            <p className="text-xs text-gray-500 mt-1">
              Podés agregarlo más tarde desde el panel
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/admin/login" className="text-black font-semibold hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

