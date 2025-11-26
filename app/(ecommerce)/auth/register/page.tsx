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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-black">Crear Cuenta</h1>
          <p className="text-gray-600">Empezá tu catálogo en minutos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombreNegocio" className="mb-2 block text-sm font-medium text-gray-700">
              <Store size={16} className="mr-2 inline" />
              Nombre del Negocio
            </label>
            <input
              type="text"
              id="nombreNegocio"
              value={formData.nombreNegocio}
              onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Mi Tienda"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              <Mail size={16} className="mr-2 inline" />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              <Lock size={16} className="mr-2 inline" />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="mpId" className="mb-2 block text-sm font-medium text-gray-700">
              <CreditCard size={16} className="mr-2 inline" />
              ID Mercado Pago (Opcional)
            </label>
            <input
              type="text"
              id="mpId"
              value={formData.mpId}
              onChange={(e) => setFormData({ ...formData, mpId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="MP-XXXXX"
            />
            <p className="mt-1 text-xs text-gray-500">Podés agregarlo más tarde desde el panel</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link href="/admin/login" className="font-semibold text-black hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
