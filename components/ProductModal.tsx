'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingCart, CreditCard } from 'lucide-react'
import TalleSelector from './TalleSelector'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { getStockStatus } from '@/utils/getStockStatus'
import { useCart } from '@/hooks/useCart'
import { createPayment } from '@/utils/api'
import toast from 'react-hot-toast'

interface ProductModalProps {
  product: {
    id: string
    nombre: string
    precio: number
    descuento?: number
    imagenPrincipal: string
    imagenes?: string[]
    descripcion?: string
    categoria?: string
    color?: string
    talles?: string[]
    stock?: { [key: string]: number }
    idMercadoPago?: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedTalle, setSelectedTalle] = useState<string>('')
  const { addToCart } = useCart()

  const images =
    product.imagenes || [product.imagenPrincipal || '/images/default-product.svg']
  const finalPrice = calculateDiscount(product.precio, product.descuento)

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleComprar = () => {
    if (!selectedTalle) {
      toast.error('Seleccioná un talle')
      return
    }

    const stockStatus = getStockStatus(product, selectedTalle)
    if (stockStatus === 'agotado') {
      toast.error('Este talle está agotado')
      return
    }

    try {
      addToCart({
        ...product,
        talle: selectedTalle,
        cantidad: 1,
      })
      toast.success('Producto agregado al carrito')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar al carrito')
    }
  }

  const handleComprarMP = async () => {
    if (!selectedTalle) {
      toast.error('Seleccioná un talle')
      return
    }

    if (!product.idMercadoPago) {
      toast.error('Este producto no tiene ID de Mercado Pago configurado')
      return
    }

    const stockStatus = getStockStatus(product, selectedTalle)
    if (stockStatus === 'agotado') {
      toast.error('Este talle está agotado')
      return
    }

    try {
      const finalPrice = calculateDiscount(product.precio, product.descuento)
      const preference = await createPayment({
        items: [
          {
            title: product.nombre,
            quantity: 1,
            unit_price: finalPrice,
          },
        ],
        back_urls: {
          success: `${window.location.origin}/pago/success`,
          failure: `${window.location.origin}/pago/failure`,
          pending: `${window.location.origin}/pago/pending`,
        },
      })

      if (preference.init_point) {
        window.location.href = preference.init_point
      } else {
        toast.error('Error al crear el pago')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Error al procesar el pago')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Galería */}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={images[currentImageIndex] || '/images/default-product.svg'}
                  alt={product.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-black'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                  src={img || '/images/default-product.svg'}
                        alt={`${product.nombre} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  {product.nombre}
                </h2>
                {product.categoria && (
                  <p className="text-gray-600">{product.categoria}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {product.descuento ? (
                  <>
                    <span className="text-3xl font-bold text-black">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.precio)}
                    </span>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                      -{product.descuento}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-black">
                    {formatPrice(product.precio)}
                  </span>
                )}
              </div>

              {product.descripcion && (
                <div>
                  <h3 className="font-semibold text-black mb-2">Descripción</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              {product.color && (
                <div>
                  <h3 className="font-semibold text-black mb-2">Color</h3>
                  <p className="text-gray-600 capitalize">{product.color}</p>
                </div>
              )}

              {product.talles && product.talles.length > 0 && (
                <TalleSelector
                  talles={product.talles}
                  stock={product.stock || {}}
                  selectedTalle={selectedTalle}
                  onTalleChange={setSelectedTalle}
                />
              )}

              <div className="space-y-3">
                <button
                  onClick={handleComprar}
                  disabled={
                    !selectedTalle ||
                    getStockStatus(product, selectedTalle) === 'agotado'
                  }
                  className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {getStockStatus(product, selectedTalle) === 'agotado'
                    ? 'Agotado'
                    : 'Agregar al Carrito'}
                </button>
                
                {product.idMercadoPago ? (
                  <button
                    onClick={handleComprarMP}
                    disabled={
                      !selectedTalle ||
                      getStockStatus(product, selectedTalle) === 'agotado'
                    }
                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} />
                    Comprar con Mercado Pago
                  </button>
                ) : (
                  <div className="relative group">
                    <button
                      disabled
                      className="w-full py-4 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Comprar con Mercado Pago
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      ID de Mercado Pago no configurado
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

