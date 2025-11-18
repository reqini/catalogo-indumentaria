'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import toast from 'react-hot-toast'

interface AdminFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export default function AdminForm({ product, onClose, onSuccess }: AdminFormProps) {
  const { handleCreateProduct, handleUpdateProduct } = useAdmin()
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
    imagenPrincipal: '',
    imagenes: [] as string[],
    mercadoPagoId: '',
    featured: false,
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedTalle, setSelectedTalle] = useState('')
  const [stockValue, setStockValue] = useState('')

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
        imagenPrincipal: product.imagenPrincipal || '',
        imagenes: product.imagenes || [],
        mercadoPagoId: product.mercadoPagoId || '',
        featured: product.featured || false,
      })
      setImagePreview(product.imagenPrincipal || '')
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagenPrincipal: result }))
      }
      reader.readAsDataURL(file)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        descuento: formData.descuento ? parseFloat(formData.descuento) : undefined,
        stock: formData.stock,
      }

      let success = false
      if (product) {
        success = await handleUpdateProduct(product.id, productData)
      } else {
        success = await handleCreateProduct(productData)
      }

      if (success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  const availableTalles = ['S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
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
          {/* Información Básica */}
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
                name="mercadoPagoId"
                value={formData.mercadoPagoId}
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

          {/* Imagen Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen Principal
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={20} />
                Subir Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Talles y Stock */}
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

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label className="text-sm font-medium text-gray-700">
              Producto destacado
            </label>
          </div>

          {/* Botones */}
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



