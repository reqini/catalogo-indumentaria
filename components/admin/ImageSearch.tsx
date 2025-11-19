'use client'

import { useState, useEffect } from 'react'
import { X, Search, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { EnhancedProduct } from '@/app/admin/productos/carga-multiple-v2/page'

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
  }, [])

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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-black">
            Buscar Imagen para: {product.nombre}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchImages()}
              placeholder="Buscar imágenes..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={searchImages}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              <span>Buscar</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">Buscando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No se encontraron imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(imageUrl)}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-black transition-colors group"
                >
                  <Image
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">
                      Seleccionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Las imágenes son sugerencias. Asegurate de tener los derechos de uso o usar imágenes libres de derechos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

