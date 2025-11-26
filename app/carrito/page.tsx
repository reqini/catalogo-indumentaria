'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { createPayment } from '@/utils/api'
import toast from 'react-hot-toast'
import ShippingCalculator from '@/components/ShippingCalculator'

interface ShippingMethod {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
}

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null)

  // Calcular peso total (estimado: 0.5kg por producto)
  const totalWeight = useMemo(() => {
    return cart.reduce((total, item) => total + item.cantidad * 0.5, 0) || 1
  }, [cart])

  // Calcular total con envío
  const totalWithShipping = useMemo(() => {
    const subtotal = getTotalPrice()
    const shippingCost = selectedShipping?.precio || 0
    return subtotal + shippingCost
  }, [getTotalPrice, selectedShipping])

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    if (isProcessing) {
      return // Evitar múltiples clicks
    }

    // Redirigir a checkout en vez de procesar directamente
    router.push('/checkout')
    return

    setIsProcessing(true)

    // Validar stock antes de checkout
    for (const item of cart) {
      if (item.stock && item.talle) {
        const stockDisponible = (item.stock ?? {})[item.talle] || 0
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

      // Incluir costo de envío si está seleccionado
      if (selectedShipping !== null && selectedShipping.precio > 0) {
        // TypeScript narrowing: sabemos que selectedShipping no es null aquí
        const shipping: ShippingMethod = selectedShipping
        items.push({
          title: `Envío - ${shipping.nombre}`,
          quantity: 1,
          unit_price: shipping.precio,
          id: 'envio', // ID especial para envío
          talle: '', // No aplica para envío
        })
      }

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
      const errorData = error?.response?.data || {}
      const errorMessage = errorData.error || error?.message || 'Error al procesar el pago'
      const errorDetails = errorData.details || errorData.message || ''
      const statusCode = error?.response?.status || 500

      // Manejo específico de errores
      if (errorMessage === 'checkout-disabled' || statusCode === 503) {
        // Servicio temporalmente deshabilitado - mensaje amigable
        toast.error(
          'El servicio de pago está temporalmente deshabilitado. Estamos actualizando la configuración. Por favor, intentá nuevamente en unos minutos.',
          {
            duration: 5000,
          }
        )
        console.error('[MP-PAYMENT] Checkout deshabilitado:', errorData)
      } else if (errorMessage.includes('Stock insuficiente')) {
        toast.error(errorMessage)
      } else if (
        errorMessage.includes('No se pudo iniciar el pago') ||
        errorMessage.includes('Error al crear preferencia') ||
        errorMessage.includes('Mercado Pago no configurado')
      ) {
        // Error de configuración de Mercado Pago
        const mpError = errorData.mpError || errorData.technical
        if (mpError?.message) {
          toast.error(`Error de Mercado Pago: ${mpError.message}`)
        } else {
          toast.error(
            'No se pudo iniciar el pago. Por favor, intentá nuevamente en unos minutos.',
            {
              duration: 5000,
            }
          )
        }
        console.error('[MP-PAYMENT] Error completo:', error)
        console.error('[MP-PAYMENT] Error data:', errorData)
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
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="mb-2 text-2xl font-bold text-black">Tu carrito está vacío</h2>
            <p className="mb-8 text-gray-600">Agregá productos para comenzar</p>
            <button
              onClick={() => router.push('/catalogo')}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
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
        <h1 className="mb-8 text-3xl font-bold text-black md:text-4xl">Carrito de Compras</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {cart.map((item, index) => {
              const finalPrice = calculateDiscount(item.precio, item.descuento)

              return (
                <motion.div
                  key={`${item.id}-${item.talle}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-lg border border-gray-200 bg-white p-4 md:p-6"
                >
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-32 md:w-32">
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
                      <h3 className="mb-1 font-semibold text-black">{item.nombre}</h3>
                      <p className="mb-2 text-sm text-gray-600">Talle: {item.talle}</p>

                      <div className="mb-4 flex items-center gap-2">
                        {item.descuento ? (
                          <>
                            <span className="font-bold text-black">{formatPrice(finalPrice)}</span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.precio)}
                            </span>
                            <span className="rounded bg-red-500 px-2 py-1 text-xs text-white">
                              -{item.descuento}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-black">{formatPrice(item.precio)}</span>
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
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.cantidad}</span>
                          <button
                            onClick={() => {
                              try {
                                updateQuantity(item.id, item.talle, item.cantidad + 1)
                              } catch (error: any) {
                                toast.error(error.message || 'Error al actualizar cantidad')
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-100"
                            disabled={
                              item.stock && item.talle
                                ? (item.stock[item.talle] || 0) < item.cantidad + 1
                                : false
                            }
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
                          className="text-red-600 transition-colors hover:text-red-800"
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

          <div className="space-y-6 md:col-span-1">
            {/* Calculadora de Envío */}
            <ShippingCalculator
              onSelectMethod={setSelectedShipping}
              selectedMethod={selectedShipping}
              totalPrice={getTotalPrice()}
              totalWeight={totalWeight}
            />

            {/* Resumen */}
            <div className="sticky top-24 rounded-lg bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-bold text-black">Resumen</h2>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>
                    {selectedShipping ? formatPrice(selectedShipping.precio) : 'Calculado arriba'}
                  </span>
                </div>
                <div className="mt-2 border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg font-bold text-black">
                    <span>Total</span>
                    <span>{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-4 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Finalizar Compra'
                )}
              </button>

              {!selectedShipping && getTotalPrice() > 0 && (
                <p className="mb-4 text-center text-xs text-amber-600">
                  💡 Podés calcular el envío arriba o continuar sin envío (retiro en local)
                </p>
              )}

              <button
                onClick={() => router.push('/catalogo')}
                className="w-full rounded-lg border border-gray-300 py-3 text-gray-700 transition-colors hover:bg-gray-100"
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
