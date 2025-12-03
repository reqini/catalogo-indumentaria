'use client'

import { useState, memo, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatPrice, calculateDiscount } from '@/utils/formatPrice'
import { getStockStatus } from '@/utils/getStockStatus'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

// Lazy load del modal (solo se carga cuando se necesita)
const ProductModal = dynamic(() => import('./ProductModal'), {
  loading: () => null,
  ssr: false,
})

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

function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const { addToCart } = useCart()

  // Memoizar cálculos costosos
  const finalPrice = useMemo(
    () => calculateDiscount(product.precio, product.descuento),
    [product.precio, product.descuento]
  )

  // Determinar estado de stock (usar el primer talle disponible o 'agotado')
  const firstAvailableTalle = useMemo(
    () => (product.talles && product.talles.length > 0 ? product.talles[0] : ''),
    [product.talles]
  )

  const stockStatus = useMemo(
    () => (firstAvailableTalle ? getStockStatus(product, firstAvailableTalle) : 'agotado'),
    [firstAvailableTalle, product]
  )

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [product, addToCart]
  )

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-lg"
        data-testid="product-card"
      >
        <Link href={`/producto/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.imagenPrincipal || '/images/default-product.svg'}
              alt={product.nombre}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className="absolute right-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                -{product.descuento}% OFF
              </div>
            )}
            {stockStatus === 'ultimas_unidades' && (
              <div className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                Últimas unidades
              </div>
            )}
            {stockStatus === 'agotado' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-white px-4 py-2 font-semibold text-black">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/producto/${product.id}`}>
            <h3 className="mb-1 line-clamp-2 font-semibold text-black transition-colors group-hover:text-gray-600">
              {product.nombre}
            </h3>
          </Link>

          <div className="mb-2 flex items-center gap-2">
            {product.descuento ? (
              <>
                <span className="text-lg font-bold text-black">{formatPrice(finalPrice)}</span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.precio)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-black">{formatPrice(product.precio)}</span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={stockStatus === 'agotado'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <ShoppingCart size={16} />
            Agregar
          </button>
        </div>
      </motion.div>

      {showModal && (
        <ProductModal product={product} isOpen={showModal} onClose={handleCloseModal} />
      )}
    </>
  )
}

// Memoizar componente para evitar re-renders innecesarios
export default memo(ProductCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian propiedades relevantes
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.precio === nextProps.product.precio &&
    prevProps.product.descuento === nextProps.product.descuento &&
    prevProps.product.imagenPrincipal === nextProps.product.imagenPrincipal &&
    JSON.stringify(prevProps.product.stock) === JSON.stringify(nextProps.product.stock)
  )
})
