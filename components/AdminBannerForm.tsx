'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createBanner, updateBanner } from '@/utils/api'
import { useAuthContext } from '@/context/AuthContext'
import ImageUploader from '@/components/ImageUploader'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface AdminBannerFormProps {
  banner?: any
  onClose: () => void
  onSuccess: () => void
}

export default function AdminBannerForm({
  banner,
  onClose,
  onSuccess,
}: AdminBannerFormProps) {
  const { tenant } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    imagenUrl: '',
    link: '',
    activo: true,
    orden: 0,
  })
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (banner) {
      setFormData({
        titulo: banner.titulo || '',
        imagenUrl: banner.imagenUrl || '',
        link: banner.link || '',
        activo: banner.activo !== false,
        orden: banner.orden || 0,
      })
      setImagePreview(banner.imagenUrl || '')
    }
  }, [banner])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.imagenUrl || formData.imagenUrl.trim() === '') {
        toast.error('La imagen es requerida')
        setLoading(false)
        return
      }

      const bannerData = {
        ...formData,
        orden: parseInt(formData.orden.toString()) || 0,
      }

      if (banner) {
        await updateBanner(banner.id, bannerData)
        toast.success('Banner actualizado exitosamente')
      } else {
        await createBanner(bannerData)
        toast.success('Banner creado exitosamente')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(error.response?.data?.error || 'Error al guardar banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-black">
            {banner ? 'Editar Banner' : 'Nuevo Banner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Previsualización de imagen */}
          {imagePreview && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen * (JPG, PNG o WebP, max 5MB)
            </label>
            <ImageUploader
              value={formData.imagenUrl}
              onChange={(url) => {
                setFormData((prev) => ({ ...prev, imagenUrl: url }))
                setImagePreview(url)
              }}
              tenantId={tenant?.tenantId}
              label=""
              required={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Nueva Colección"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link (opcional)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/catalogo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <input
                type="number"
                name="orden"
                value={formData.orden}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">Activo</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : banner ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

