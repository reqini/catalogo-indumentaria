'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners } from '@/utils/api'

export default function Carousel() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Memoizar banners por defecto para evitar recreación
  const defaultBanners = useMemo(
    () => [
      {
        id: '1',
        imagen:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        titulo: 'Nueva Colección',
        subtitulo: 'Descubrí las últimas tendencias',
        link: '/catalogo',
      },
      {
        id: '2',
        imagen:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        titulo: 'Ofertas Especiales',
        subtitulo: 'Hasta 50% OFF',
        link: '/catalogo?precio=asc',
      },
    ],
    []
  )

  const getDefaultBanners = useCallback(() => defaultBanners, [defaultBanners])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBanners()
        setBanners(data.length > 0 ? data : getDefaultBanners())
      } catch (error) {
        console.error('Error fetching banners:', error)
        setBanners(getDefaultBanners())
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [getDefaultBanners])

  useEffect(() => {
    if (banners.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length, isHovered])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  // Memoizar banner actual para evitar recálculos (debe estar antes de cualquier return)
  const currentBanner = useMemo(() => {
    if (banners.length === 0) return null
    return banners[currentIndex]
  }, [banners, currentIndex])

  if (loading) {
    return <div className="relative h-64 w-full animate-pulse rounded-lg bg-gray-200 md:h-96" />
  }

  if (banners.length === 0 || !currentBanner) {
    return null
  }

  return (
    <div
      className="relative h-64 w-full overflow-hidden rounded-lg md:h-96"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 to-black/30" />
          {(currentBanner.imagen || currentBanner.imagenUrl || currentBanner.imagen_url) && (
            <Image
              src={currentBanner.imagen || currentBanner.imagenUrl || currentBanner.imagen_url}
              alt={currentBanner.titulo || 'Banner'}
              fill
              className="object-cover"
              sizes="100vw"
              priority={currentIndex === 0}
              quality={90}
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                // Si la imagen falla, ocultar y mostrar solo el gradiente
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
            <div>
              {currentBanner.titulo && (
                <h3 className="mb-2 text-2xl font-bold text-white md:text-4xl">
                  {currentBanner.titulo}
                </h3>
              )}
              {currentBanner.subtitulo && (
                <p className="text-lg text-gray-200 md:text-xl">{currentBanner.subtitulo}</p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white"
            aria-label="Banner siguiente"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
