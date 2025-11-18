'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { createPayment } from '@/utils/api'
import toast from 'react-hot-toast'

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    if (isProcessing) {
      return // Evitar múltiples clicks
    }

    setIsProcessing(true)

    // Validar stock antes de checkout
    for (const item of cart) {
      if (item.stock && item.talle) {
        const stockDisponible = item.stock[item.talle] || 0
        if (stockDisponible < item.cantidad) {
          toast.error(
            `Stock insuficiente para ${item.nombre} (Talle ${item.talle}). Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}`
          )
          setIsProcessing(false)
          return
        }
        if (stockDisponible === 0) {
          toast.error(`El producto ${item.nombre} (Talle ${item.talle}) no tiene stock disponible`)
          setIsProcessing(false)
          return
        }
      }
    }

    try {
      const items = cart.map((item) => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: calculateDiscount(item.precio, item.descuento),
        // Incluir información adicional para el webhook
        id: item.id,
        talle: item.talle,
      }))

      // Construir back_urls explícitamente para asegurar formato correcto
      const origin = window.location.origin
      const backUrls = {
        success: `${origin}/pago/success`,
        failure: `${origin}/pago/failure`,
        pending: `${origin}/pago/pending`,
      }
      
      console.log('[MP-PAYMENT] Frontend - Enviando back_urls:', JSON.stringify(backUrls, null, 2))
      
      const preference = await createPayment({
        items,
        back_urls: backUrls,
      })

      if (preference.init_point) {
        window.location.href = preference.init_point
      } else {
        toast.error('Error al crear el pago')
        setIsProcessing(false)
      }
    } catch (error: any) {
      console.error('[MP-PAYMENT] Error en frontend:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al procesar el pago'
      const errorDetails = error?.response?.data?.details || ''
      
      if (errorMessage.includes('Stock insuficiente')) {
        toast.error(errorMessage)
      } else if (errorMessage.includes('No se pudo iniciar el pago') || errorMessage.includes('Error al crear preferencia')) {
        // Mostrar detalles del error si están disponibles
        const mpError = error?.response?.data?.mpError
        if (mpError?.message) {
          toast.error(`Error de Mercado Pago: ${mpError.message}`)
        } else {
          toast.error('No se pudo iniciar el pago. Intentalo nuevamente en unos minutos.')
        }
        console.error('[MP-PAYMENT] Error completo:', error)
      } else {
        toast.error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage)
      }
      setIsProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-black mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">Agregá productos para comenzar</p>
            <button
              onClick={() => router.push('/catalogo')}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">Carrito de Compras</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const finalPrice = calculateDiscount(item.precio, item.descuento)

              return (
                <motion.div
                  key={`${item.id}-${item.talle}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-6"
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.imagenPrincipal || '/images/default-product.svg'}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                        loading="lazy"
                        quality={80}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{item.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2">Talle: {item.talle}</p>

                      <div className="flex items-center gap-2 mb-4">
                        {item.descuento ? (
                          <>
                            <span className="font-bold text-black">
                              {formatPrice(finalPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.precio)}
                            </span>
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                              -{item.descuento}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-black">
                            {formatPrice(item.precio)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              try {
                                updateQuantity(item.id, item.talle, item.cantidad - 1)
                              } catch (error: any) {
                                toast.error(error.message || 'Error al actualizar cantidad')
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => {
                              try {
                                updateQuantity(item.id, item.talle, item.cantidad + 1)
                              } catch (error: any) {
                                toast.error(error.message || 'Error al actualizar cantidad')
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            disabled={item.stock && item.talle ? (item.stock[item.talle] || 0) < item.cantidad + 1 : false}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-black">
                            {formatPrice(finalPrice * item.cantidad)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.talle)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-black mb-4">Resumen</h2>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Calculado al finalizar</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-black text-lg">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Finalizar Compra'
                )}
              </button>

              <button
                onClick={() => router.push('/catalogo')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}



