'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, X, Trash2, Edit2, Save, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ParsedProduct {
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  sku?: string
  activo?: boolean
}

export default function AdminBulkImportPage() {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingProduct, setEditingProduct] = useState<ParsedProduct | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; errors: Array<{ index: number; reason: string }> } | null>(null)

  const exampleText = `Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10
Jean mom azul | categoría: Pantalones | precio: 35000 | stock: 5
Buzo hoodie gris | categoría: Buzos | precio: 30000 | stock: 8`

  const handleParse = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, ingresá texto para analizar')
      return
    }

    setIsParsing(true)
    setParsedProducts([])
    setImportResult(null)

    try {
      const response = await fetch('/api/admin/ia-bulk-parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al analizar el texto')
      }

      const data = await response.json()
      
      if (!data.products || data.products.length === 0) {
        toast.error('No se pudieron detectar productos en el texto. Intentá con un formato más estructurado.')
        return
      }

      setParsedProducts(data.products)
      toast.success(`Se detectaron ${data.products.length} productos`)
    } catch (error: any) {
      console.error('Error parsing:', error)
      toast.error(error.message || 'No se pudo analizar el texto. Revisá el formato o intentá con menos productos.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditingProduct({ ...parsedProducts[index] })
  }

  const handleSaveEdit = (index: number) => {
    if (!editingProduct) return

    // Validaciones básicas
    if (!editingProduct.nombre?.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!editingProduct.categoria?.trim()) {
      toast.error('La categoría es requerida')
      return
    }

    if (!editingProduct.precio || editingProduct.precio <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return
    }

    if (editingProduct.stock < 0) {
      toast.error('El stock no puede ser negativo')
      return
    }

    const updated = [...parsedProducts]
    updated[index] = editingProduct
    setParsedProducts(updated)
    setEditingIndex(null)
    setEditingProduct(null)
    toast.success('Producto actualizado')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingProduct(null)
  }

  const handleDelete = (index: number) => {
    if (!confirm(`¿Eliminar "${parsedProducts[index].nombre}" de la importación?`)) {
      return
    }

    const updated = parsedProducts.filter((_, i) => i !== index)
    setParsedProducts(updated)
    toast.success('Producto eliminado de la lista')
  }

  const handleImport = async () => {
    if (parsedProducts.length === 0) {
      toast.error('No hay productos para importar')
      return
    }

    // Validar todos los productos antes de importar
    const invalidProducts: Array<{ index: number; reason: string }> = []
    
    parsedProducts.forEach((product, index) => {
      if (!product.nombre?.trim()) {
        invalidProducts.push({ index, reason: 'Nombre requerido' })
      }
      if (!product.categoria?.trim()) {
        invalidProducts.push({ index, reason: 'Categoría requerida' })
      }
      if (!product.precio || product.precio <= 0) {
        invalidProducts.push({ index, reason: 'Precio inválido' })
      }
      if (product.stock < 0) {
        invalidProducts.push({ index, reason: 'Stock no puede ser negativo' })
      }
    })

    if (invalidProducts.length > 0) {
      toast.error(`Hay ${invalidProducts.length} productos con errores. Corregilos antes de importar.`)
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const response = await fetch('/api/admin/bulk-products-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ products: parsedProducts }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al importar productos')
      }

      const result = await response.json()
      setImportResult(result)

      if (result.created > 0) {
        toast.success(`Se crearon ${result.created} productos correctamente`)
      }

      if (result.errors && result.errors.length > 0) {
        toast.error(`${result.errors.length} productos fallaron al importar`)
      }
    } catch (error: any) {
      console.error('Error importing:', error)
      toast.error(error.message || 'Error al importar productos')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-black" size={24} />
            <h1 className="text-2xl font-bold text-black">Carga Múltiple con IA</h1>
          </div>
          <button
            onClick={() => router.push('/admin/productos')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Volver a Productos
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Paso 1: Input de texto */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">1. Ingresá la descripción de productos</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto de entrada
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Pegá aquí tu descripción de productos.

Ejemplo:
${exampleText}

También podés usar formato más natural:
"Quiero cargar: Remera oversize blanca talle único, categoría remeras, precio 21000, stock 8. Buzo hoodie gris, categoría buzos, 30000 pesos, 4 unidades en stock."`}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
              disabled={isParsing}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleParse}
              disabled={isParsing || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Analizar con IA</span>
                </>
              )}
            </button>

            {parsedProducts.length > 0 && (
              <button
                onClick={() => {
                  setInputText('')
                  setParsedProducts([])
                  setImportResult(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Paso 2: Vista previa editable */}
        {parsedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">
                2. Revisá y editá los productos ({parsedProducts.length} productos)
              </h2>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Importar Productos</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Importante:</strong> Las imágenes de estos productos se guardarán como placeholder por defecto. 
                Luego podés subir las fotos reales desde la sección de edición de productos.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {editingIndex === index ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editingProduct?.nombre || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct!, nombre: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editingProduct?.categoria || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct!, categoria: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editingProduct?.precio || 0}
                              onChange={(e) => setEditingProduct({ ...editingProduct!, precio: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editingProduct?.stock || 0}
                              onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editingProduct?.sku || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct!, sku: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Opcional"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="text-green-600 hover:text-green-800"
                                title="Guardar"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800"
                                title="Cancelar"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm font-medium text-black">{product.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.categoria}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">${product.precio.toLocaleString('es-AR')}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.sku || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(index)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paso 3: Resultado de importación */}
        {importResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4">3. Resultado de la importación</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold">
                ✅ Se crearon {importResult.created} productos correctamente
              </p>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold mb-2">
                  ❌ {importResult.errors.length} productos fallaron:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx}>
                      Producto #{error.index + 1}: {error.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/productos')}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
              >
                Ver Productos
              </button>
              <button
                onClick={() => {
                  setInputText('')
                  setParsedProducts([])
                  setImportResult(null)
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Nueva Importación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

