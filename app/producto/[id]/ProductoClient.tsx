'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import ProductCard from '@/components/ProductCard'
import TalleSelector from '@/components/TalleSelector'
import { getProductById, getProducts } from '@/utils/api'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { getStockStatus } from '@/utils/getStockStatus'
import { createPayment } from '@/utils/api'
import toast from 'react-hot-toast'

export default function ProductoClient() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedTalle, setSelectedTalle] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(params.id as string)
        setProduct(data)
        if (data.talles && data.talles.length > 0) {
          setSelectedTalle(data.talles[0])
        }

        // Obtener productos relacionados (misma categoría o tags similares)
        try {
          const allProducts = await getProducts({ categoria: data.categoria })
          const related = allProducts
            .filter((p: any) => p.id !== data.id && p.activo !== false)
            .slice(0, 4)
          setRelatedProducts(related)
        } catch (error) {
          console.error('Error fetching related products:', error)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Producto no encontrado')
        router.push('/catalogo')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

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

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return null
  }

  const finalPrice = calculateDiscount(product.precio, product.descuento)
  const images = [
    product.imagenPrincipal || product.imagen_principal || '/images/default-product.svg',
    ...(product.imagenesSec || product.imagenes || [])
  ].filter(Boolean).map((img: string) => img || '/images/default-product.svg')

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={images[selectedImage] || '/images/default-product.svg'}
                alt={product.nombre}
                fill
                className="object-cover cursor-pointer"
                onClick={() => setShowModal(true)}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/images/default-product.svg'
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
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
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/images/default-product.svg'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                {product.nombre}
              </h1>
              <p className="text-gray-600 text-lg">{product.categoria}</p>
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
                <p className="text-gray-600 leading-relaxed">{product.descripcion}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-black mb-2">Color</h3>
              <p className="text-gray-600 capitalize">{product.color || 'N/A'}</p>
            </div>

            <TalleSelector
              talles={product.talles || []}
              stock={product.stock || {}}
              selectedTalle={selectedTalle}
              onTalleChange={setSelectedTalle}
            />

            <div className="pt-4 space-y-3">
              <button
                onClick={handleComprar}
                disabled={getStockStatus(product, selectedTalle) === 'agotado'}
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
                  disabled={getStockStatus(product, selectedTalle) === 'agotado'}
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
          </motion.div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-gray-200"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={product}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}

