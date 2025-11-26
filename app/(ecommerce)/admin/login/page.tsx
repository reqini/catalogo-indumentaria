'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { login } from '@/utils/api'
import { useAuthContext } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@catalogo.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login: loginContext } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login(email, password)

      if (response.token && response.tenant) {
        // 1. Guardar token en cookie httpOnly vía API (para middleware y SSR)
        try {
          await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.token }),
          })
        } catch (cookieError) {
          console.warn('Error guardando token en cookie:', cookieError)
          // Continuar aunque falle, el token se guardará en localStorage
        }

        // 2. Actualizar AuthContext y localStorage (para cliente)
        loginContext(response.token, response.tenant)

        toast.success('Inicio de sesión exitoso')
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        toast.error('Credenciales inválidas')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-black">Panel de Administración</h1>
          <p className="text-gray-600">Ingresá tus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="admin@catalogo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@catalogo.com')
              setPassword('admin123')
            }}
            className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Usar credenciales demo
          </button>
          <p className="text-center text-xs text-gray-500">
            Estas credenciales son de demostración temporal. Cambialas en Admin.
          </p>

          <Link
            href="/admin/recovery"
            className="block text-center text-sm text-blue-600 hover:text-blue-800"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
