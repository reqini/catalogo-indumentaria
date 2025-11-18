'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners } from '@/utils/api'

export default function Carousel() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

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
  }, [])

  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (banners.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length, isHovered])

  const getDefaultBanners = () => [
    {
      id: '1',
      imagen: '/banner-1.jpg',
      titulo: 'Nueva Colección',
      subtitulo: 'Descubrí las últimas tendencias',
      link: '/catalogo',
    },
    {
      id: '2',
      imagen: '/banner-2.jpg',
      titulo: 'Ofertas Especiales',
      subtitulo: 'Hasta 50% OFF',
      link: '/catalogo?precio=asc',
    },
  ]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (loading) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-lg animate-pulse" />
    )
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden"
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
          className="relative w-full h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
          {currentBanner.imagen && (
            <Image
              src={currentBanner.imagen}
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
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
            <div>
              {currentBanner.titulo && (
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {currentBanner.titulo}
                </h3>
              )}
              {currentBanner.subtitulo && (
                <p className="text-lg md:text-xl text-gray-200">
                  {currentBanner.subtitulo}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
            aria-label="Banner siguiente"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
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

