'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Trash2, Copy, Plus, Minus, Eye, EyeOff } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'
import { getStockStatus } from '@/utils/getStockStatus'

interface AdminProductTableProps {
  products: any[]
  onEdit: (product: any) => void
  onDelete: (id: string) => void
  onDuplicate?: (product: any) => void
  onStockUpdate: (productId: string, talle: string, cantidad: number) => void
  onToggleActive?: (product: any) => void
}

export default function AdminProductTable({
  products,
  onEdit,
  onDelete,
  onDuplicate,
  onStockUpdate,
  onToggleActive,
}: AdminProductTableProps) {
  const [editingStock, setEditingStock] = useState<{ [key: string]: { talle: string; cantidad: number } }>({})

  const handleStockChange = (productId: string, talle: string, newCantidad: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [`${productId}-${talle}`]: { talle, cantidad: newCantidad },
    }))
  }

  const handleStockSave = (productId: string, talle: string) => {
    const key = `${productId}-${talle}`
    const edit = editingStock[key]
    if (edit) {
      onStockUpdate(productId, talle, edit.cantidad)
      setEditingStock((prev) => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
    }
  }

  const getTotalStock = (stock: { [key: string]: number }) => {
    return Object.values(stock || {}).reduce((a, b) => a + b, 0)
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600">No hay productos</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const totalStock = getTotalStock(product.stock)
              const stockStatus = totalStock === 0
                ? 'agotado'
                : totalStock <= 5
                ? 'ultimas-unidades'
                : 'disponible'

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {(product.imagenPrincipal || product.imagen_principal) ? (
                        <Image
                          src={product.imagenPrincipal || product.imagen_principal}
                          alt={product.nombre}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, mostrar placeholder
                            ;(e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent && !parent.querySelector('.placeholder')) {
                              const placeholder = document.createElement('div')
                              placeholder.className = 'placeholder w-full h-full flex items-center justify-center text-gray-400 text-xs'
                              placeholder.textContent = 'Sin imagen'
                              parent.appendChild(placeholder)
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black">{product.nombre}</div>
                    <div className="text-sm text-gray-500">{product.categoria}</div>
                    {product.destacado && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black">
                      {formatPrice(product.precio)}
                    </div>
                    {product.descuento && (
                      <div className="text-sm text-red-500">
                        -{product.descuento}% OFF
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-black">
                        Total: {totalStock}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        {product.talles?.map((talle: string) => {
                          const key = `${product.id}-${talle}`
                          const isEditing = editingStock[key]
                          const cantidad = isEditing
                            ? isEditing.cantidad
                            : product.stock?.[talle] || 0

                          return (
                            <div key={talle} className="flex items-center gap-2">
                              <span className="w-8">{talle}:</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      handleStockChange(product.id, talle, Math.max(0, cantidad - 1))
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input
                                    type="number"
                                    value={cantidad}
                                    onChange={(e) =>
                                      handleStockChange(
                                        product.id,
                                        talle,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                    min="0"
                                  />
                                  <button
                                    onClick={() =>
                                      handleStockChange(product.id, talle, cantidad + 1)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Plus size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleStockSave(product.id, talle)}
                                    className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{cantidad}</span>
                                  <button
                                    onClick={() =>
                                      setEditingStock((prev) => ({
                                        ...prev,
                                        [key]: { talle, cantidad },
                                      }))
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Editar
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {stockStatus === 'agotado' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Agotado
                        </span>
                      )}
                      {stockStatus === 'ultimas-unidades' && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                          Últimas unidades
                        </span>
                      )}
                      {stockStatus === 'disponible' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Disponible
                        </span>
                      )}
                      {product.activo === false && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {onToggleActive && (
                        <button
                          onClick={() => onToggleActive(product)}
                          className={`${
                            product.activo
                              ? 'text-gray-600 hover:text-gray-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={product.activo ? 'Desactivar' : 'Activar'}
                        >
                          {product.activo ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="Editar producto"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDuplicate && onDuplicate(product)}
                        className="text-gray-600 hover:text-gray-900"
                        aria-label="Duplicar producto"
                        title="Duplicar"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="Eliminar producto"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

