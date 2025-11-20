'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { createProduct, updateProduct } from '@/utils/api'
import { useAuthContext } from '@/context/AuthContext'
import ImageUploader from '@/components/ImageUploader'
import toast from 'react-hot-toast'

interface AdminProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export default function AdminProductForm({
  product,
  onClose,
  onSuccess,
}: AdminProductFormProps) {
  const { tenant } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    descuento: '',
    categoria: '',
    color: '',
    talles: [] as string[],
    stock: {} as { [key: string]: number },
    imagen_principal: '',
    imagenes: [] as string[],
    idMercadoPago: '',
    tags: [] as string[],
    destacado: false,
    activo: true,
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedTalle, setSelectedTalle] = useState('')
  const [newTag, setNewTag] = useState('')
  const availableTalles = ['S', 'M', 'L', 'XL', 'XXL']

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio?.toString() || '',
        descuento: product.descuento?.toString() || '',
        categoria: product.categoria || '',
        color: product.color || '',
        talles: product.talles || [],
        stock: product.stock || {},
        imagen_principal: product.imagenPrincipal || product.imagen_principal || '',
        imagenes: product.imagenes || product.imagenesSec || [],
        idMercadoPago: product.idMercadoPago || '',
        tags: product.tags || [],
        destacado: product.destacado || false,
        activo: product.activo !== false,
      })
      setImagePreview(product.imagenPrincipal || product.imagen_principal || '')
    }
  }, [product])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // NOTA: Esta función ya no se usa. El componente ImageUploader maneja todo el flujo de upload.
  // Se mantiene comentada por si se necesita en el futuro, pero ImageUploader es la implementación oficial.
  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file) {
  //     const reader = new FileReader()
  //     reader.onloadend = () => {
  //       const result = reader.result as string
  //       setImagePreview(result)
  //       setFormData((prev) => ({ ...prev, imagen_principal: result }))
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }

  const handleAddTalle = () => {
    if (selectedTalle && !formData.talles.includes(selectedTalle)) {
      setFormData((prev) => ({
        ...prev,
        talles: [...prev.talles, selectedTalle],
        stock: { ...prev.stock, [selectedTalle]: 0 },
      }))
      setSelectedTalle('')
    }
  }

  const handleRemoveTalle = (talle: string) => {
    setFormData((prev) => {
      const newStock = { ...prev.stock }
      delete newStock[talle]
      return {
        ...prev,
        talles: prev.talles.filter((t) => t !== talle),
        stock: newStock,
      }
    })
  }

  const handleUpdateStock = (talle: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      stock: { ...prev.stock, [talle]: parseInt(value) || 0 },
    }))
  }

  const handleAddTag = () => {
    if (newTag && newTag.trim() !== '' && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones mejoradas
      const errors: string[] = []

      if (!formData.nombre || formData.nombre.trim() === '') {
        errors.push('El nombre es requerido')
      } else if (formData.nombre.trim().length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres')
      }

      if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
        errors.push('El precio debe ser un número mayor a 0')
      }

      if (formData.descuento && (isNaN(parseFloat(formData.descuento)) || parseFloat(formData.descuento) < 0 || parseFloat(formData.descuento) > 100)) {
        errors.push('El descuento debe ser un número entre 0 y 100')
      }

      if (!formData.categoria || formData.categoria.trim() === '') {
        errors.push('La categoría es requerida')
      }

      if (!formData.talles || formData.talles.length === 0) {
        errors.push('Debe tener al menos un talle')
      }

      // NO validar imagen - se usará placeholder automáticamente si no hay

      // Validar que todos los talles tengan stock definido
      if (formData.talles.length > 0) {
        const tallesSinStock = formData.talles.filter(
          (talle) => formData.stock[talle] === undefined || formData.stock[talle] === null
        )

        if (tallesSinStock.length > 0) {
          errors.push(`Los talles ${tallesSinStock.join(', ')} deben tener stock definido`)
        }

        // Validar que el stock no sea negativo
        const tallesConStockNegativo = formData.talles.filter(
          (talle) => formData.stock[talle] < 0
        )

        if (tallesConStockNegativo.length > 0) {
          errors.push(`Los talles ${tallesConStockNegativo.join(', ')} no pueden tener stock negativo`)
        }
      }

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
        setLoading(false)
        return
      }

      // Manejo de imagen: preservar URL real si existe, solo usar placeholder si realmente no hay imagen
      let imagenPrincipal = formData.imagen_principal?.trim() || ''
      
      // Validar que la imagen sea una URL válida (no base64)
      if (imagenPrincipal && imagenPrincipal.startsWith('data:')) {
        toast.error('La imagen aún se está subiendo. Por favor, espera a que termine.')
        setLoading(false)
        return
      }

      // Verificar si es una URL válida (http/https) o ruta válida (/images/)
      const tieneImagenValida = imagenPrincipal && 
                                imagenPrincipal !== '' && 
                                (imagenPrincipal.startsWith('http://') || 
                                 imagenPrincipal.startsWith('https://') ||
                                 imagenPrincipal.startsWith('/images/'))
      
      // Solo usar placeholder si NO hay imagen válida
      if (!tieneImagenValida) {
        imagenPrincipal = '/images/default-product.svg'
        console.log('⚠️ No hay imagen válida, usando placeholder automático')
      } else {
        console.log('✅ Imagen válida detectada, preservando URL:', imagenPrincipal.substring(0, 50) + '...')
      }

      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        descuento: formData.descuento ? parseFloat(formData.descuento) : undefined,
        categoria: formData.categoria,
        color: formData.color.trim(),
        talles: formData.talles,
        stock: formData.stock,
        imagenPrincipal: imagenPrincipal,
        imagenesSec: formData.imagenes.filter(img => img.trim() !== ''),
        idMercadoPago: formData.idMercadoPago.trim(),
        tags: formData.tags.filter(tag => tag.trim() !== ''), // Filtrar tags vacíos
        destacado: formData.destacado,
        activo: formData.activo,
      }

      console.log('Enviando producto:', {
        ...productData,
        imagenPrincipal: productData.imagenPrincipal.substring(0, 50) + '...',
        tags: productData.tags,
      })

      if (product) {
        await updateProduct(product.id, productData)
        toast.success(`Producto "${formData.nombre}" actualizado exitosamente`)
      } else {
        await createProduct(productData)
        toast.success(`Producto "${formData.nombre}" creado exitosamente`)
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error submitting form:', error)
      
      // Manejo de errores más detallado
      if (error.response?.data?.error) {
        const errorData = error.response.data
        if (errorData.details && Array.isArray(errorData.details)) {
          // Errores de validación Zod
          errorData.details.forEach((detail: any) => {
            const field = detail.path?.join('.') || 'campo'
            toast.error(`${field}: ${detail.message}`)
          })
        } else {
          toast.error(errorData.error)
        }
      } else if (error.response?.status === 403 && error.response?.data?.limit) {
        // Error de límite de plan
        const limit = error.response.data.limit
        toast.error(`Límite alcanzado: ${limit.current}/${limit.limit} productos. Actualizá tu plan.`)
      } else {
        toast.error(error.message || 'Error al guardar producto. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-black">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento (%)
              </label>
              <input
                type="number"
                name="descuento"
                value={formData.descuento}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Seleccionar...</option>
                <option value="remeras">Remeras</option>
                <option value="pantalones">Pantalones</option>
                <option value="buzos">Buzos</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Mercado Pago
              </label>
              <input
                type="text"
                name="idMercadoPago"
                value={formData.idMercadoPago}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen Principal <span className="text-gray-400 text-xs font-normal">(opcional - se usará placeholder si no hay)</span>
            </label>
            <ImageUploader
              value={formData.imagen_principal}
              onChange={(url) => {
                console.log('✅ Imagen subida, URL recibida:', url)
                setFormData((prev) => ({ ...prev, imagen_principal: url }))
                setImagePreview(url)
              }}
              tenantId={tenant?.tenantId}
              label=""
              required={false}
            />
            {(!formData.imagen_principal || formData.imagen_principal === '') && (
              <p className="mt-2 text-xs text-gray-500">
                💡 Si no subes imagen, se usará automáticamente la imagen por defecto.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talles y Stock
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedTalle}
                  onChange={(e) => setSelectedTalle(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Seleccionar talle...</option>
                  {availableTalles
                    .filter((t) => !formData.talles.includes(t))
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddTalle}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Agregar
                </button>
              </div>

              {formData.talles.length > 0 && (
                <div className="space-y-2">
                  {formData.talles.map((talle) => (
                    <div
                      key={talle}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium w-12">{talle}</span>
                      <input
                        type="number"
                        value={formData.stock[talle] || 0}
                        onChange={(e) => handleUpdateStock(talle, e.target.value)}
                        min="0"
                        className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-sm text-gray-600">unidades</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTalle(talle)}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Escribe un tag y presiona Enter o click en Agregar"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Agregar
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Eliminar tag ${tag}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Agrega tags uno por uno para mejor organización
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleInputChange}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label className="text-sm font-medium text-gray-700">
                Producto destacado
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

