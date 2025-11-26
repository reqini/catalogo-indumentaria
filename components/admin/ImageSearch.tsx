'use client'

import { useState, useEffect } from 'react'
import { X, Search, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { EnhancedProduct } from '@/app/(ecommerce)/admin/productos/carga-inteligente/page'

interface ImageSearchProps {
  product: EnhancedProduct
  onSelect: (imageUrl: string) => void
  onClose: () => void
}

export default function ImageSearch({ product, onSelect, onClose }: ImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState(product.nombre)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery) {
      searchImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar al montar con el nombre inicial del producto

  const searchImages = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)

    try {
      // Usar Unsplash API (gratuita con límites)
      // En producción, usar API key de Unsplash
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12&client_id=YOUR_UNSPLASH_ACCESS_KEY`
      )

      if (!response.ok) {
        // Fallback: usar placeholder o imágenes de ejemplo
        setImages([
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        ])
        setLoading(false)
        return
      }

      const data = await response.json()
      const imageUrls = data.results?.map((img: any) => img.urls?.regular || img.urls?.small) || []
      setImages(imageUrls)
    } catch (error) {
      console.error('Error searching images:', error)
      // Fallback a imágenes de ejemplo
      setImages([
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-black">Buscar Imagen para: {product.nombre}</h2>
          <button onClick={onClose} className="text-gray-600 transition-colors hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchImages()}
              placeholder="Buscar imágenes..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={searchImages}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              <span>Buscar</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto animate-spin text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">Buscando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No se encontraron imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(imageUrl)}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-black"
                >
                  <Image
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <span className="font-semibold text-white opacity-0 group-hover:opacity-100">
                      Seleccionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Las imágenes son sugerencias. Asegurate de tener los derechos
              de uso o usar imágenes libres de derechos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
