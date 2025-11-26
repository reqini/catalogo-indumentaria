'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuthContext } from '@/context/AuthContext'

interface Plan {
  _id: string
  nombre: string
  precio: number
  limiteProductos: number
  limiteBanners: number
  beneficios: string[]
}

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthContext()

  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    try {
      const response = await fetch('/api/planes')
      const data = await response.json()
      setPlanes(data)
    } catch (error) {
      console.error('Error fetching planes:', error)
      toast.error('Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planNombre: string) => {
    if (!isAuthenticated) {
      toast.error('Debés iniciar sesión para suscribirte')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/suscripcion/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planNombre }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear suscripción')
      }

      if (data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
      } else {
        toast.success('Plan actualizado exitosamente')
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al suscribirse')
    }
  }

  const formatPrice = (centavos: number) => {
    if (centavos === 0) return 'Gratis'
    return `$${(centavos / 100).toLocaleString('es-AR')}/mes`
  }

  const getPlanIcon = (nombre: string) => {
    switch (nombre) {
      case 'free':
        return null
      case 'pro':
        return <Zap className="text-blue-500" size={24} />
      case 'premium':
        return <Crown className="text-yellow-500" size={24} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando planes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-black">Elegí tu Plan</h1>
          <p className="text-lg text-gray-600">Planes flexibles para hacer crecer tu negocio</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {planes.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-lg bg-white p-8 shadow-lg ${
                plan.nombre === 'pro' ? 'scale-105 border-2 border-black' : ''
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold capitalize text-black">{plan.nombre}</h2>
                {getPlanIcon(plan.nombre)}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-black">{formatPrice(plan.precio)}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.beneficios.map((beneficio, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={20} className="mt-0.5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-700">{beneficio}</span>
                  </li>
                ))}
              </ul>

              {plan.nombre === 'free' ? (
                <Link
                  href="/auth/register"
                  className="block w-full rounded-lg bg-gray-200 py-3 text-center font-semibold text-gray-800 transition-colors hover:bg-gray-300"
                >
                  Empezar Gratis
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.nombre)}
                  className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Suscribirme
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            ¿Necesitás ayuda?{' '}
            <Link href="/contacto" className="font-semibold text-black hover:underline">
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
