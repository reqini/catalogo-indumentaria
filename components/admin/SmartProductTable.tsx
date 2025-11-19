'use client'

import { useState } from 'react'
import { Edit2, Trash2, ImageIcon, AlertCircle, CheckCircle2, X } from 'lucide-react'
import Image from 'next/image'
import { EnhancedProduct } from '@/app/admin/productos/carga-inteligente/page'
import ImageSearch from './ImageSearch'

interface SmartProductTableProps {
  products: EnhancedProduct[]
  onUpdate: (index: number, updates: Partial<EnhancedProduct>) => void
  onDelete: (index: number) => void
  onImageSearch: (index: number, query: string) => void
}

export default function SmartProductTable({
  products,
  onUpdate,
  onDelete,
  onImageSearch,
}: SmartProductTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingProduct, setEditingProduct] = useState<EnhancedProduct | null>(null)
  const [imageSearchIndex, setImageSearchIndex] = useState<number | null>(null)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditingProduct({ ...products[index] })
  }

  const handleSaveEdit = (index: number) => {
    if (!editingProduct) return

    // Validaciones
    if (!editingProduct.nombre?.trim()) {
      alert('El nombre es requerido')
      return
    }

    if (!editingProduct.categoria?.trim()) {
      alert('La categoría es requerida')
      return
    }

    if (!editingProduct.precio || editingProduct.precio <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }

    onUpdate(index, editingProduct)
    setEditingIndex(null)
    setEditingProduct(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingProduct(null)
  }

  const getQualityColor = (calidad?: number) => {
    if (!calidad) return 'text-gray-500'
    if (calidad >= 80) return 'text-green-600'
    if (calidad >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityBadge = (calidad?: number) => {
    if (!calidad) return null
    
    if (calidad >= 80) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Excelente</span>
    }
    if (calidad >= 60) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Buena</span>
    }
    return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Mejorable</span>
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr 
                key={index} 
                className={`hover:bg-gray-50 transition-colors ${
                  (product.errores?.length || 0) > 0 
                    ? 'bg-red-50 border-l-4 border-red-500' 
                    : (product.advertencias?.length || 0) > 0
                    ? 'bg-yellow-50 border-l-4 border-yellow-500'
                    : 'border-l-4 border-green-500'
                }`}
              >
                {/* Imagen */}
                <td className="px-4 py-3">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.imagenPrincipal ? (
                      <Image
                        src={product.imagenPrincipal}
                        alt={product.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setImageSearchIndex(index)}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Buscar imagen
                  </button>
                </td>

                {/* Nombre */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingProduct?.nombre || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct!, nombre: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium text-black">
                      {product.nombre}
                      {product.errores && product.errores.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle size={14} className="text-red-500" />
                          <span className="text-xs text-red-600">{product.errores[0]}</span>
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Categoría */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingProduct?.categoria || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct!, categoria: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{product.categoria}</span>
                  )}
                </td>

                {/* Precio */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      value={editingProduct?.precio || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct!, precio: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <div className="text-sm">
                      <span className="font-medium text-black">${product.precio.toLocaleString('es-AR')}</span>
                      {product.precioSugerido && product.precioSugerido !== product.precio && (
                        <div className="text-xs text-gray-500">
                          Sugerido: ${product.precioSugerido.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      value={editingProduct?.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{product.stock}</span>
                  )}
                </td>

                {/* SKU */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingProduct?.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct!, sku: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Opcional"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{product.sku || '-'}</span>
                  )}
                </td>

                {/* Calidad */}
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-sm font-semibold ${getQualityColor(product.calidad)}`}>
                      {product.calidad || 0}/100
                    </span>
                    {getQualityBadge(product.calidad)}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="text-green-600 hover:text-green-800"
                        title="Guardar"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-800"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de búsqueda de imágenes */}
      {imageSearchIndex !== null && (
        <ImageSearch
          product={products[imageSearchIndex]}
          onSelect={(imageUrl) => {
            onUpdate(imageSearchIndex, { imagenPrincipal: imageUrl })
            setImageSearchIndex(null)
          }}
          onClose={() => setImageSearchIndex(null)}
        />
      )}
    </div>
  )
}

