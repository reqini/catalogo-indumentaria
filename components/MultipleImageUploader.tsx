'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Check, ImagePlus } from 'lucide-react'
import { validateImageFile } from '@/lib/supabase-storage'
import toast from 'react-hot-toast'

interface MultipleImageUploaderProps {
  value?: string[] // URLs de imágenes existentes
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
  className?: string
}

export default function MultipleImageUploader({
  value = [],
  onChange,
  label = 'Imágenes del Producto',
  maxImages = 10,
  className = '',
}: MultipleImageUploaderProps) {
  const [images, setImages] = useState<string[]>(value || [])
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar con value externo
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      setImages(value)
    }
  }, [value])

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const filesArray = Array.from(files)

      // Validar cantidad máxima
      if (images.length + filesArray.length > maxImages) {
        toast.error(`Máximo ${maxImages} imágenes permitidas`)
        return
      }

      // Validar cada archivo
      for (const file of filesArray) {
        const validation = validateImageFile(file)
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`)
          return
        }
      }

      // Subir cada archivo secuencialmente
      const newImageUrls: string[] = []

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i]
        const index = images.length + i

        setUploadingIndex(index)
        setUploadProgress((prev) => ({ ...prev, [index]: 0 }))

        try {
          // Crear FormData
          const formData = new FormData()
          formData.append('file', file)

          // Obtener token
          let token = localStorage.getItem('token')
          if (!token && typeof window !== 'undefined') {
            const cookies = document.cookie.split(';')
            const authCookie = cookies.find((cookie) => cookie.trim().startsWith('auth_token='))
            if (authCookie) {
              token = authCookie.split('=')[1]
            }
          }

          const headers: HeadersInit = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          setUploadProgress((prev) => ({ ...prev, [index]: 30 }))

          // Subir archivo
          const response = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData,
          })

          setUploadProgress((prev) => ({ ...prev, [index]: 70 }))

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Error al subir imagen')
          }

          const result = await response.json()

          if (!result.url || typeof result.url !== 'string' || !result.url.trim()) {
            throw new Error('URL de imagen inválida recibida del servidor')
          }

          if (!result.url.startsWith('http://') && !result.url.startsWith('https://')) {
            throw new Error('URL de imagen no válida (debe ser http:// o https://)')
          }

          newImageUrls.push(result.url.trim())
          setUploadProgress((prev) => ({ ...prev, [index]: 100 }))
        } catch (error: any) {
          console.error(`Error uploading image ${file.name}:`, error)
          toast.error(`Error al subir ${file.name}: ${error.message || 'Error desconocido'}`)
          setUploadingIndex(null)
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[index]
            return newProgress
          })
          return // Detener si hay error
        }
      }

      // Actualizar imágenes
      const updatedImages = [...images, ...newImageUrls]
      setImages(updatedImages)
      onChange(updatedImages)

      setUploadingIndex(null)
      setUploadProgress({})
      toast.success(`${newImageUrls.length} imagen(es) subida(s) exitosamente`)
    },
    [images, maxImages, onChange]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const updatedImages = images.filter((_, i) => i !== index)
      setImages(updatedImages)
      onChange(updatedImages)
      toast.success('Imagen eliminada')
    },
    [images, onChange]
  )

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newImages = [...images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      setImages(newImages)
      onChange(newImages)
    },
    [images, onChange]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
      // Resetear input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFileSelect]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const canAddMore = images.length < maxImages

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label} ({images.length}/{maxImages})
        </label>
      )}

      {/* Grid de imágenes */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100"
          >
            <Image
              src={imageUrl || '/images/default-product.svg'}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/images/default-product.svg'
              }}
            />

            {/* Overlay con controles */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
              <div className="flex gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="rounded-full bg-white p-2 transition-colors hover:bg-gray-100"
                    title="Mover izquierda"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="rounded-full bg-white p-2 transition-colors hover:bg-gray-100"
                    title="Mover derecha"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                  title="Eliminar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Indicador de carga */}
            {uploadingIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                  <p className="text-xs">{uploadProgress[index] || 0}%</p>
                </div>
              </div>
            )}

            {/* Indicador de éxito */}
            {uploadingIndex !== index && uploadProgress[index] === 100 && (
              <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1 text-white">
                <Check size={12} />
              </div>
            )}

            {/* Badge de posición */}
            <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Botón para agregar más imágenes */}
        {canAddMore && (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploadingIndex !== null}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="mb-2 text-gray-400" size={32} />
            <span className="text-xs text-gray-600">Agregar</span>
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploadingIndex !== null || !canAddMore}
      />

      {/* Información */}
      {images.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="mb-1 text-sm font-medium text-gray-700">
            Haz clic para seleccionar imágenes
          </p>
          <p className="text-xs text-gray-500">JPG, PNG o WebP (máx. 5MB cada una)</p>
        </div>
      )}

      {images.length > 0 && canAddMore && (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploadingIndex !== null}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar más imágenes ({maxImages - images.length} restantes)
        </button>
      )}
    </div>
  )
}
