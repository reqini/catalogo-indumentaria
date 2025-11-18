'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import ProductModal from './ProductModal'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { getStockStatus } from '@/utils/getStockStatus'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    nombre: string
    precio: number
    descuento?: number
    imagenPrincipal: string
    categoria?: string
    color?: string
    talles?: string[]
    stock?: { [key: string]: number }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const { addToCart } = useCart()
  const finalPrice = calculateDiscount(product.precio, product.descuento)
  // Determinar estado de stock (usar el primer talle disponible o 'agotado')
  const firstAvailableTalle = product.talles && product.talles.length > 0 
    ? product.talles[0] 
    : ''
  const stockStatus = firstAvailableTalle 
    ? getStockStatus(product, firstAvailableTalle)
    : 'agotado'

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.talles || product.talles.length === 0) {
      toast.error('Este producto no tiene talles disponibles')
      return
    }

    const firstTalle = product.talles[0]
    const status = getStockStatus(product, firstTalle)
    
    if (status === 'agotado') {
      toast.error('Este producto está agotado')
      return
    }

    try {
      addToCart({
        ...product,
        talle: firstTalle,
        cantidad: 1,
      })
      toast.success('Producto agregado al carrito')
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar al carrito')
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all"
        data-testid="product-card"
      >
        <Link href={`/producto/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.imagenPrincipal || '/images/default-product.svg'}
              alt={product.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
              onError={(e) => {
                // Si la imagen falla, usar imagen por defecto
                ;(e.target as HTMLImageElement).src = '/images/default-product.svg'
              }}
            />
            {product.descuento && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                -{product.descuento}% OFF
              </div>
            )}
            {stockStatus === 'ultimas_unidades' && (
              <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                Últimas unidades
              </div>
            )}
            {stockStatus === 'agotado' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="bg-white text-black px-4 py-2 rounded-full font-semibold">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/producto/${product.id}`}>
            <h3 className="font-semibold text-black mb-1 line-clamp-2 group-hover:text-gray-600 transition-colors">
              {product.nombre}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            {product.descuento ? (
              <>
                <span className="text-lg font-bold text-black">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.precio)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-black">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={stockStatus === 'agotado'}
            className="w-full py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Agregar
          </button>
        </div>
      </motion.div>

      {showModal && (
        <ProductModal
          product={product}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

