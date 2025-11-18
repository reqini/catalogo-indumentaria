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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando planes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Elegí tu Plan</h1>
          <p className="text-lg text-gray-600">
            Planes flexibles para hacer crecer tu negocio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {planes.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.nombre === 'pro' ? 'border-2 border-black scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-black capitalize">{plan.nombre}</h2>
                {getPlanIcon(plan.nombre)}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-black">
                  {formatPrice(plan.precio)}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.beneficios.map((beneficio, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{beneficio}</span>
                  </li>
                ))}
              </ul>

              {plan.nombre === 'free' ? (
                <Link
                  href="/auth/register"
                  className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-center"
                >
                  Empezar Gratis
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.nombre)}
                  className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
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
            <Link href="/contacto" className="text-black font-semibold hover:underline">
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

