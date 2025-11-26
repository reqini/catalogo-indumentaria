'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import ShippingCalculator from '@/components/ShippingCalculator'
import toast from 'react-hot-toast'
import { z } from 'zod'

interface ShippingMethod {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista?: string
  tipo?: 'envio' | 'retiro_local'
}

// Schema de validación con Zod (campos de dirección opcionales si es retiro en local)
const checkoutSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
    calle: z
      .string()
      .min(3, 'La calle debe tener al menos 3 caracteres')
      .optional()
      .or(z.literal('')),
    numero: z.string().min(1, 'El número es obligatorio').optional().or(z.literal('')),
    pisoDepto: z.string().optional(),
    codigoPostal: z
      .string()
      .min(4, 'El código postal debe tener al menos 4 caracteres')
      .optional()
      .or(z.literal('')),
    localidad: z.string().min(2, 'La localidad es obligatoria').optional().or(z.literal('')),
    provincia: z.string().min(2, 'La provincia es obligatoria').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Si hay código postal, todos los campos de dirección son obligatorios
      if (data.codigoPostal && data.codigoPostal.length >= 4) {
        return (
          data.calle &&
          data.calle.length >= 3 &&
          data.numero &&
          data.numero.length >= 1 &&
          data.localidad &&
          data.localidad.length >= 2 &&
          data.provincia &&
          data.provincia.length >= 2
        )
      }
      return true
    },
    {
      message: 'Si ingresás código postal, todos los campos de dirección son obligatorios',
      path: ['codigoPostal'],
    }
  )

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<'datos' | 'envio' | 'resumen'>('datos')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null)
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localidadProvincia, setLocalidadProvincia] = useState<{
    localidad: string
    provincia: string
  } | null>(null)
  const [isRetiroLocal, setIsRetiroLocal] = useState(false)

  // Calcular peso total
  const totalWeight = cart.reduce((total, item) => total + item.cantidad * 0.5, 0) || 1

  // Calcular total con envío
  const subtotal = getTotalPrice()
  const totalWithShipping = subtotal + (selectedShipping?.precio || 0)

  // Autocompletar localidad/provincia desde código postal (simulado - en producción usar API real)
  useEffect(() => {
    if (formData.codigoPostal && formData.codigoPostal.length >= 4) {
      // Simulación de autocompletado - en producción usar API de códigos postales
      const cp = formData.codigoPostal.toUpperCase()
      if (cp.startsWith('C')) {
        setLocalidadProvincia({
          localidad: 'Ciudad Autónoma de Buenos Aires',
          provincia: 'Buenos Aires',
        })
        if (!formData.localidad) {
          setFormData((prev) => ({
            ...prev,
            localidad: 'Ciudad Autónoma de Buenos Aires',
            provincia: 'Buenos Aires',
          }))
        }
      } else if (cp.startsWith('B')) {
        setLocalidadProvincia({ localidad: 'Buenos Aires', provincia: 'Buenos Aires' })
        if (!formData.localidad) {
          setFormData((prev) => ({ ...prev, localidad: 'Buenos Aires', provincia: 'Buenos Aires' }))
        }
      } else if (cp.startsWith('X')) {
        setLocalidadProvincia({ localidad: 'Córdoba', provincia: 'Córdoba' })
        if (!formData.localidad) {
          setFormData((prev) => ({ ...prev, localidad: 'Córdoba', provincia: 'Córdoba' }))
        }
      } else if (cp.startsWith('S')) {
        setLocalidadProvincia({ localidad: 'Rosario', provincia: 'Santa Fe' })
        if (!formData.localidad) {
          setFormData((prev) => ({ ...prev, localidad: 'Rosario', provincia: 'Santa Fe' }))
        }
      }
    }
  }, [formData.codigoPostal])

  // Validar formulario
  const validateForm = (): boolean => {
    try {
      checkoutSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // Avanzar al paso de envío
  const handleNextToShipping = () => {
    if (validateForm()) {
      setStep('envio')
    } else {
      toast.error('Por favor, completá todos los campos obligatorios')
    }
  }

  // Avanzar al resumen
  const handleNextToSummary = () => {
    // Si es retiro en local, no requiere shipping seleccionado
    if (selectedShipping?.tipo === 'retiro_local') {
      setStep('resumen')
      return
    }

    // Si es envío, requiere shipping seleccionado
    if (!selectedShipping && formData.codigoPostal) {
      toast.error('Por favor, calculá y seleccioná un método de envío')
      return
    }

    setStep('resumen')
  }

  // Procesar checkout completo
  const handleCheckout = async () => {
    if (isProcessing) return

    if (!validateForm()) {
      toast.error('Por favor, completá todos los campos obligatorios')
      return
    }

    // Validar según tipo de entrega
    if (selectedShipping?.tipo === 'retiro_local') {
      // Retiro en local: no requiere validación adicional
      setIsRetiroLocal(true)
    } else if (!selectedShipping && formData.codigoPostal) {
      // Envío requiere método seleccionado
      toast.error('Por favor, seleccioná un método de envío')
      return
    } else if (!selectedShipping && !formData.codigoPostal) {
      // Si no hay CP ni shipping, puede ser retiro en local
      setIsRetiroLocal(true)
    }

    setIsProcessing(true)

    try {
      // Crear orden en la base de datos
      const orderItems = cart.map((item) => {
        const finalPrice = calculateDiscount(item.precio, item.descuento)
        return {
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          talle: item.talle,
          subtotal: finalPrice * item.cantidad,
          imagenPrincipal: item.imagenPrincipal,
        }
      })

      // Si hay envío, agregarlo como item (pero NO incluirlo en items de la orden)
      // El envío se maneja por separado en el campo envio
      // No agregar envío a orderItems porque se filtra después

      const orderData = {
        cliente: {
          nombre: formData.nombre!,
          email: formData.email!,
          telefono: formData.telefono,
        },
        direccion:
          selectedShipping?.tipo === 'retiro_local'
            ? {
                calle: '',
                numero: '',
                pisoDepto: '',
                codigoPostal: '',
                localidad: '',
                provincia: '',
                pais: 'Argentina',
              }
            : {
                calle: formData.calle!,
                numero: formData.numero!,
                pisoDepto: formData.pisoDepto,
                codigoPostal: formData.codigoPostal!,
                localidad: formData.localidad!,
                provincia: formData.provincia!,
                pais: 'Argentina',
              },
        envio:
          selectedShipping?.tipo === 'retiro_local'
            ? {
                tipo: 'retiro_local' as const,
                metodo: 'Retiro en el local',
                costo: 0,
                demora: 'Disponible de lunes a viernes de 9 a 18hs',
                proveedor: null,
              }
            : selectedShipping
              ? {
                  tipo: selectedShipping.nombre.toLowerCase().includes('express')
                    ? 'express'
                    : 'estandar',
                  metodo: selectedShipping.nombre,
                  costo: selectedShipping.precio,
                  demora: selectedShipping.demora,
                  proveedor: selectedShipping.transportista,
                }
              : {
                  tipo: 'retiro_local' as const,
                  metodo: 'Retiro en el local',
                  costo: 0,
                },
        items: orderItems.filter((item) => item.id !== 'envio'),
        subtotal,
        descuento: 0,
        envioCosto: selectedShipping?.precio || 0,
        total: totalWithShipping,
      }

      // Crear orden en backend
      const orderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        let errorData
        try {
          errorData = await orderResponse.json()
        } catch {
          errorData = { error: `Error HTTP ${orderResponse.status}` }
        }

        console.error('[CHECKOUT] ❌ Error del servidor:', errorData)

        // Mostrar mensaje de error más detallado
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Error al crear la orden'

        throw new Error(errorMessage)
      }

      const { orderId, preferenceId, initPoint } = await orderResponse.json()

      if (!initPoint) {
        throw new Error('No se pudo crear la preferencia de pago')
      }

      // Redirigir a Mercado Pago
      window.location.href = initPoint
    } catch (error: any) {
      console.error('[CHECKOUT] Error:', error)
      toast.error(error.message || 'Error al procesar el checkout')
      setIsProcessing(false)
    }
  }

  // Si el carrito está vacío, redirigir
  useEffect(() => {
    if (cart.length === 0 && step === 'datos') {
      router.push('/carrito')
    }
  }, [cart, router, step])

  if (cart.length === 0) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
          >
            <ArrowLeft size={20} />
            <span>Volver al carrito</span>
          </button>
          <h1 className="text-3xl font-bold text-black md:text-4xl">Checkout</h1>
          <p className="mt-2 text-gray-600">Completá tus datos para finalizar la compra</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${step === 'datos' ? 'font-semibold text-black' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'datos' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              1
            </div>
            <span>Datos</span>
          </div>
          <div className="h-1 w-16 bg-gray-200"></div>
          <div
            className={`flex items-center gap-2 ${step === 'envio' ? 'font-semibold text-black' : step === 'resumen' ? 'text-black' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'envio' || step === 'resumen' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              2
            </div>
            <span>Envío</span>
          </div>
          <div className="h-1 w-16 bg-gray-200"></div>
          <div
            className={`flex items-center gap-2 ${step === 'resumen' ? 'font-semibold text-black' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'resumen' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              3
            </div>
            <span>Resumen</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Formulario Principal */}
          <div className="space-y-6 md:col-span-2">
            {/* Paso 1: Datos Personales */}
            {step === 'datos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h2 className="mb-6 text-xl font-bold text-black">Datos Personales</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Juan Pérez"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="juan@example.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono || ''}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="+54 11 1234-5678"
                      />
                      {errors.telefono && (
                        <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="mb-4 text-lg font-semibold text-black">Dirección de Envío</h3>

                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Calle *
                          </label>
                          <input
                            type="text"
                            value={formData.calle || ''}
                            onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.calle ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Av. Corrientes"
                          />
                          {errors.calle && (
                            <p className="mt-1 text-sm text-red-600">{errors.calle}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Número *
                          </label>
                          <input
                            type="text"
                            value={formData.numero || ''}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.numero ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="1234"
                          />
                          {errors.numero && (
                            <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Piso / Departamento (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.pisoDepto || ''}
                          onChange={(e) => setFormData({ ...formData, pisoDepto: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="2° A"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            value={formData.codigoPostal || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/[^A-Za-z0-9]/g, '')
                                .toUpperCase()
                                .substring(0, 8)
                              setFormData({ ...formData, codigoPostal: value })
                            }}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.codigoPostal ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="C1000"
                          />
                          {errors.codigoPostal && (
                            <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Localidad *
                          </label>
                          <input
                            type="text"
                            value={formData.localidad || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, localidad: e.target.value })
                            }
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.localidad ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="CABA"
                            readOnly={!!localidadProvincia}
                          />
                          {errors.localidad && (
                            <p className="mt-1 text-sm text-red-600">{errors.localidad}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Provincia *
                          </label>
                          <input
                            type="text"
                            value={formData.provincia || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, provincia: e.target.value })
                            }
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.provincia ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Buenos Aires"
                            readOnly={!!localidadProvincia}
                          />
                          {errors.provincia && (
                            <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextToShipping}
                    className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Continuar a Envío
                  </button>
                </div>
              </motion.div>
            )}

            {/* Paso 2: Envío */}
            {step === 'envio' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h2 className="mb-6 text-xl font-bold text-black">Método de Envío</h2>

                  <ShippingCalculator
                    onSelectMethod={setSelectedShipping}
                    selectedMethod={selectedShipping}
                    totalPrice={subtotal}
                    totalWeight={totalWeight}
                  />

                  {selectedShipping && (
                    <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2 className="text-green-600" size={20} />
                        <span className="font-semibold text-green-800">
                          Envío seleccionado: {selectedShipping.nombre}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Costo: {formatPrice(selectedShipping.precio)} • {selectedShipping.demora}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => setStep('datos')}
                      className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleNextToSummary}
                      disabled={!selectedShipping}
                      className="flex-1 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continuar a Resumen
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Paso 3: Resumen */}
            {step === 'resumen' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h2 className="mb-6 text-xl font-bold text-black">Resumen de Compra</h2>

                  {/* Datos del Cliente */}
                  <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-3 font-semibold text-black">Datos de Contacto</h3>
                    <p className="text-sm text-gray-600">{formData.nombre}</p>
                    <p className="text-sm text-gray-600">{formData.email}</p>
                    {formData.telefono && (
                      <p className="text-sm text-gray-600">{formData.telefono}</p>
                    )}
                  </div>

                  {/* Dirección o Tipo de Entrega */}
                  {selectedShipping?.tipo === 'retiro_local' ? (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h3 className="mb-3 font-semibold text-black">Tipo de Entrega</h3>
                      <p className="text-sm font-medium text-blue-800">Retiro en el local</p>
                      <p className="mt-1 text-sm text-blue-700">
                        Te vamos a contactar con la dirección y horarios de retiro.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-3 font-semibold text-black">Dirección de Envío</h3>
                      <p className="text-sm text-gray-600">
                        {formData.calle} {formData.numero}
                        {formData.pisoDepto && `, ${formData.pisoDepto}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.codigoPostal}, {formData.localidad}, {formData.provincia}
                      </p>
                    </div>
                  )}

                  {/* Productos */}
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-black">Productos</h3>
                    <div className="space-y-2">
                      {cart.map((item) => {
                        const finalPrice = calculateDiscount(item.precio, item.descuento)
                        return (
                          <div
                            key={`${item.id}-${item.talle}`}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.nombre} {item.talle && `(Talle ${item.talle})`} x{' '}
                              {item.cantidad}
                            </span>
                            <span className="font-medium text-black">
                              {formatPrice(finalPrice * item.cantidad)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Envío o Retiro */}
                  {selectedShipping && (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          {selectedShipping.tipo === 'retiro_local' ? 'Tipo de entrega:' : 'Envío:'}
                        </span>
                        <span className="text-sm font-semibold text-blue-900">
                          {selectedShipping.nombre}
                        </span>
                      </div>
                      {selectedShipping.tipo !== 'retiro_local' && (
                        <>
                          <div className="mt-2 flex justify-between">
                            <span className="text-sm text-blue-700">Costo de envío:</span>
                            <span className="text-sm font-semibold text-blue-900">
                              {formatPrice(selectedShipping.precio)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-blue-600">{selectedShipping.demora}</p>
                        </>
                      )}
                      {selectedShipping.tipo === 'retiro_local' && (
                        <p className="mt-2 text-sm text-blue-700">{selectedShipping.demora}</p>
                      )}
                    </div>
                  )}

                  {/* Totales */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-2 flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {selectedShipping && (
                      <div className="mb-2 flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span>{formatPrice(selectedShipping.precio)}</span>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between border-t border-gray-300 pt-4">
                      <span className="text-lg font-bold text-black">Total</span>
                      <span className="text-lg font-bold text-black">
                        {formatPrice(totalWithShipping)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => setStep('envio')}
                      className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        'Pagar Ahora'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Resumen */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-black">Resumen</h3>

              <div className="mb-4 space-y-2">
                {cart.map((item) => {
                  const finalPrice = calculateDiscount(item.precio, item.descuento)
                  return (
                    <div key={`${item.id}-${item.talle}`} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.nombre} x {item.cantidad}
                      </span>
                      <span className="font-medium text-black">
                        {formatPrice(finalPrice * item.cantidad)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>
                    {selectedShipping ? formatPrice(selectedShipping.precio) : 'Pendiente'}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-300 pt-2">
                  <span className="text-lg font-bold text-black">Total</span>
                  <span className="text-lg font-bold text-black">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
