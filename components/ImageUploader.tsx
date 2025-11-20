'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Check } from 'lucide-react'
import { validateImageFile } from '@/lib/supabase-storage'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  tenantId?: string // Opcional porque ahora se obtiene del token en la API
  label?: string
  required?: boolean
  className?: string
}

export default function ImageUploader({
  value,
  onChange,
  tenantId, // Mantener para compatibilidad pero ya no es crítico
  label = 'Imagen Principal',
  required = false,
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string>(value || '')
  
  // Actualizar preview cuando cambia el value externo
  // IMPORTANTE: No resetear si ya hay una URL válida subida
  useEffect(() => {
    // Solo actualizar si el value cambió Y es diferente al preview actual
    // Esto evita que se resetee la imagen después de un upload exitoso
    if (value && value !== preview && value.trim() !== '') {
      console.log('🔄 [ImageUploader] Actualizando preview desde value externo:', value.substring(0, 100))
      setPreview(value)
    } else if (!value && preview && !preview.startsWith('data:')) {
      // Si value se borra pero preview tiene una URL válida (no base64), mantenerla
      // Solo limpiar si explícitamente se pasa string vacío
      console.log('🔄 [ImageUploader] Manteniendo preview válido aunque value esté vacío')
    }
  }, [value]) // Removido 'preview' de dependencias para evitar loops
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validar archivo
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast.error(validation.error || 'Archivo inválido')
        return
      }

      // Mostrar preview inmediato
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Subir archivo
      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Simular progreso inicial
        setUploadProgress(10)

        // Crear FormData para enviar el archivo
        const formData = new FormData()
        formData.append('file', file)

        setUploadProgress(30)

        // Intentar obtener token de localStorage o cookies (opcional, la API validará)
        let token = localStorage.getItem('token')
        if (!token && typeof window !== 'undefined') {
          const cookies = document.cookie.split(';')
          const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
          if (authCookie) {
            token = authCookie.split('=')[1]
          }
        }

        // Preparar headers (el token puede estar en cookie httpOnly, así que no es crítico)
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Subir archivo a través de la API interna
        // La API validará la autenticación (cookie o header)
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers,
          credentials: 'include', // Incluir cookies automáticamente
          body: formData,
        })

        setUploadProgress(70)

        const result = await response.json()

        if (!response.ok) {
          console.error('❌ Error en upload-image API:', result)
          console.error('Response status:', response.status)
          
          // Manejar errores específicos con mensajes claros
          if (response.status === 401) {
            toast.error('Sesión expirada. Por favor, recarga la página e inicia sesión nuevamente.', {
              duration: 5000,
            })
          } else if (response.status === 400) {
            // Error de validación (tipo, tamaño, etc.)
            const errorMessage = result.error || 'El archivo no es válido'
            toast.error(errorMessage, { duration: 4000 })
          } else if (response.status === 500) {
            // Error del servidor (bucket, Storage, etc.)
            const errorMessage = result.error || 'Error del servidor al subir la imagen'
            toast.error(errorMessage, { duration: 5000 })
          } else {
            const errorMessage = result.error || 'Error al subir la imagen'
            toast.error(errorMessage, { duration: 4000 })
          }
          
          // Restaurar preview anterior o limpiar
          setPreview(value || '')
          setIsUploading(false)
          return
        }

        if (!result.url || !result.url.trim()) {
          console.error('No se obtuvo URL de la imagen:', result)
          toast.error('Error: No se pudo obtener la URL de la imagen. Intenta nuevamente.', {
            duration: 4000,
          })
          setPreview(value || '')
          setIsUploading(false)
          return
        }

        setUploadProgress(100)
        
        // CRÍTICO: Verificar que la URL sea válida antes de llamar onChange
        if (!result.url || typeof result.url !== 'string' || result.url.trim() === '') {
          console.error('❌ URL inválida recibida del servidor:', result)
          toast.error('Error: URL de imagen inválida recibida del servidor')
          setPreview(value || '')
          setIsUploading(false)
          return
        }
        
        const imageUrl = result.url.trim()
        console.log('✅ [ImageUploader] URL recibida del servidor:', imageUrl.substring(0, 100))
        console.log('✅ [ImageUploader] Tipo de URL:', typeof imageUrl)
        console.log('✅ [ImageUploader] Es URL válida:', imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
        
        // Actualizar preview y llamar onChange
        setPreview(imageUrl)
        console.log('✅ [ImageUploader] Llamando onChange con URL:', imageUrl.substring(0, 100))
        onChange(imageUrl)
        toast.success('Imagen subida exitosamente')
      } catch (error: any) {
        console.error('Error uploading image:', error)
        
        // Mensajes de error más específicos según el tipo de error
        let errorMessage = 'Error al subir la imagen'
        if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage, {
          duration: 5000,
        })
        setPreview(value || '')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [onChange, value]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(() => {
    console.log('🗑️ [ImageUploader] Eliminando imagen')
    setPreview('')
    onChange('') // Pasar string vacío explícitamente para indicar que se eliminó
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${
            isDragging
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={(e) => {
                console.error('Error cargando imagen preview:', preview)
                // Si falla la imagen, usar placeholder
                const target = e.target as HTMLImageElement
                target.src = '/images/default-product.svg'
              }}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                  <p className="text-sm">{uploadProgress}%</p>
                </div>
              </div>
            )}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Eliminar imagen"
              >
                <X size={18} />
              </button>
            )}
            {!isUploading && uploadProgress === 100 && (
              <div className="absolute top-2 left-2 p-2 bg-green-500 text-white rounded-full">
                <Check size={18} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="py-8">
                <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-sm text-gray-600">Subiendo {uploadProgress}%...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG o WebP (máx. 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {preview && !isUploading && (
        <p className="mt-2 text-xs text-gray-500">
          Imagen cargada correctamente. Haz clic para cambiar.
        </p>
      )}
    </div>
  )
}

