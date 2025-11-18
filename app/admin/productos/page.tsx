'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, RefreshCw, Filter, X } from 'lucide-react'
import { getProducts, deleteProduct, createProduct, updateProduct } from '@/utils/api'
import { updateStock } from '@/utils/api'
import AdminProductForm from '@/components/AdminProductForm'
import AdminProductTable from '@/components/AdminProductTable'
import toast from 'react-hot-toast'

export default function AdminProductosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [filterCategoria, setFilterCategoria] = useState<string>('')
  const [filterPrecioMin, setFilterPrecioMin] = useState<string>('')
  const [filterPrecioMax, setFilterPrecioMax] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDuplicate = async (product: any) => {
    if (!confirm(`¿Duplicar "${product.nombre}"?`)) {
      return
    }

    try {
      // Crear copia limpia del producto sin campos de sistema
      const duplicated: any = {
        nombre: `${product.nombre} (Copia)`,
        descripcion: product.descripcion || '',
        precio: product.precio || 0,
        descuento: product.descuento || null,
        categoria: product.categoria || '',
        color: product.color || '',
        talles: product.talles ? [...product.talles] : [],
        stock: product.stock ? { ...product.stock } : {},
        imagenPrincipal: product.imagenPrincipal || product.imagen_principal || '',
        imagenesSec: product.imagenesSec || product.imagenes || [],
        idMercadoPago: product.idMercadoPago || '',
        tags: product.tags ? [...product.tags] : [],
        destacado: product.destacado || false,
        activo: product.activo !== false,
      }

      // Remover campos de sistema que no deben duplicarse
      const fieldsToRemove = [
        'id',
        '_id',
        'tenant_id',
        'created_at',
        'createdAt',
        'updated_at',
        'updatedAt',
        'imagen_principal',
        'imagenes_sec',
        'id_mercado_pago',
      ]
      
      fieldsToRemove.forEach((field) => {
        delete duplicated[field]
      })

      await createProduct(duplicated)
      toast.success('Producto duplicado exitosamente')
      fetchProducts()
    } catch (error: any) {
      console.error('Error duplicating product:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al duplicar producto'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id)
    const productName = product?.nombre || 'este producto'
    
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      await deleteProduct(id)
      toast.success(`Producto "${productName}" eliminado exitosamente`)
      fetchProducts()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al eliminar producto'
      toast.error(errorMessage)
    }
  }

  const handleStockUpdate = async (productId: string, talle: string, cantidad: number) => {
    if (cantidad < 0) {
      toast.error('El stock no puede ser negativo')
      return
    }

    if (!Number.isInteger(cantidad)) {
      toast.error('La cantidad debe ser un número entero')
      return
    }

    try {
      await updateStock(productId, talle, cantidad)
      toast.success(`Stock de talle ${talle} actualizado a ${cantidad}`)
      fetchProducts()
    } catch (error: any) {
      console.error('Error updating stock:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al actualizar stock'
      toast.error(errorMessage)
    }
  }

  const handleToggleActive = async (product: any) => {
    const newStatus = !product.activo
    const action = newStatus ? 'activar' : 'desactivar'
    
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} "${product.nombre}"?`)) {
      return
    }

    try {
      await updateProduct(product.id, { activo: newStatus })
      toast.success(`Producto "${product.nombre}" ${newStatus ? 'activado' : 'desactivado'} exitosamente`)
      fetchProducts()
    } catch (error: any) {
      console.error('Error toggling product active status:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al actualizar producto'
      toast.error(errorMessage)
    }
  }

  // Bulk Actions
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return

    const count = selectedProducts.size
    if (
      !confirm(
        `¿Estás seguro de eliminar ${count} producto${count > 1 ? 's' : ''}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return
    }

    try {
      const deletePromises = Array.from(selectedProducts).map((id) =>
        deleteProduct(id).catch((error) => {
          console.error(`Error deleting product ${id}:`, error)
          return { error: true, id }
        })
      )

      const results = await Promise.all(deletePromises)
      const errors = results.filter((r) => r?.error)

      if (errors.length > 0) {
        toast.error(`Error al eliminar ${errors.length} producto(s)`)
      } else {
        toast.success(`${count} producto(s) eliminado(s) exitosamente`)
      }

      setSelectedProducts(new Set())
      fetchProducts()
    } catch (error: any) {
      console.error('Error in bulk delete:', error)
      toast.error('Error al eliminar productos')
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedProducts.size === 0) return

    const count = selectedProducts.size
    if (!confirm(`¿Duplicar ${count} producto${count > 1 ? 's' : ''}?`)) {
      return
    }

    try {
      const productsToDuplicate = products.filter((p) =>
        selectedProducts.has(p.id)
      )

      const duplicatePromises = productsToDuplicate.map(async (product) => {
        const duplicated: any = {
          nombre: `${product.nombre} (Copia)`,
          descripcion: product.descripcion || '',
          precio: product.precio || 0,
          descuento: product.descuento || null,
          categoria: product.categoria || '',
          color: product.color || '',
          talles: product.talles ? [...product.talles] : [],
          stock: product.stock ? { ...product.stock } : {},
          imagenPrincipal: product.imagenPrincipal || product.imagen_principal || '',
          imagenesSec: product.imagenesSec || product.imagenes || [],
          idMercadoPago: product.idMercadoPago || '',
          tags: product.tags ? [...product.tags] : [],
          destacado: product.destacado || false,
          activo: product.activo !== false,
        }

        return createProduct(duplicated).catch((error) => {
          console.error(`Error duplicating product ${product.id}:`, error)
          return { error: true, id: product.id }
        })
      })

      const results = await Promise.all(duplicatePromises)
      const errors = results.filter((r) => r?.error)

      if (errors.length > 0) {
        toast.error(`Error al duplicar ${errors.length} producto(s)`)
      } else {
        toast.success(`${count} producto(s) duplicado(s) exitosamente`)
      }

      setSelectedProducts(new Set())
      fetchProducts()
    } catch (error: any) {
      console.error('Error in bulk duplicate:', error)
      toast.error('Error al duplicar productos')
    }
  }

  const handleBulkToggleActive = async (activate: boolean) => {
    if (selectedProducts.size === 0) return

    const count = selectedProducts.size
    const action = activate ? 'activar' : 'desactivar'
    if (
      !confirm(
        `¿${action.charAt(0).toUpperCase() + action.slice(1)} ${count} producto${count > 1 ? 's' : ''}?`
      )
    ) {
      return
    }

    try {
      const updatePromises = Array.from(selectedProducts).map((id) =>
        updateProduct(id, { activo: activate }).catch((error) => {
          console.error(`Error updating product ${id}:`, error)
          return { error: true, id }
        })
      )

      const results = await Promise.all(updatePromises)
      const errors = results.filter((r) => r?.error)

      if (errors.length > 0) {
        toast.error(`Error al ${action} ${errors.length} producto(s)`)
      } else {
        toast.success(`${count} producto(s) ${action}do(s) exitosamente`)
      }

      setSelectedProducts(new Set())
      fetchProducts()
    } catch (error: any) {
      console.error('Error in bulk toggle active:', error)
      toast.error(`Error al ${action} productos`)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterActivo('todos')
    setFilterCategoria('')
    setFilterPrecioMin('')
    setFilterPrecioMax('')
    setCurrentPage(1)
  }

  // Búsqueda y filtros avanzados
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Búsqueda por texto (nombre, categoría, descripción)
      const matchesSearch =
        !searchTerm ||
        product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )

      // Filtro por estado activo/inactivo
      const matchesActivo =
        filterActivo === 'todos' ||
        (filterActivo === 'activos' && product.activo !== false) ||
        (filterActivo === 'inactivos' && product.activo === false)

      // Filtro por categoría
      const matchesCategoria =
        !filterCategoria || product.categoria === filterCategoria

      // Filtro por precio
      const precio = product.precio || 0
      const precioMin = filterPrecioMin ? parseFloat(filterPrecioMin) : 0
      const precioMax = filterPrecioMax ? parseFloat(filterPrecioMax) : Infinity
      const matchesPrecio = precio >= precioMin && precio <= precioMax

      return (
        matchesSearch && matchesActivo && matchesCategoria && matchesPrecio
      )
    })
  }, [
    products,
    searchTerm,
    filterActivo,
    filterCategoria,
    filterPrecioMin,
    filterPrecioMax,
  ])

  // Obtener categorías únicas para el filtro
  const categorias = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoria).filter(Boolean))
    return Array.from(cats).sort()
  }, [products])

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Gestión de Productos</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Búsqueda y Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría, descripción o tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              Filtros
            </button>
            {(searchTerm ||
              filterActivo !== 'todos' ||
              filterCategoria ||
              filterPrecioMin ||
              filterPrecioMax) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
                Limpiar
              </button>
            )}
          </div>

          {/* Panel de Filtros Avanzados */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filterActivo}
                  onChange={(e) => {
                    setFilterActivo(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={filterCategoria}
                  onChange={(e) => {
                    setFilterCategoria(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Mín.
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filterPrecioMin}
                  onChange={(e) => {
                    setFilterPrecioMin(e.target.value)
                    setCurrentPage(1)
                  }}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Máx.
                </label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filterPrecioMax}
                  onChange={(e) => {
                    setFilterPrecioMax(e.target.value)
                    setCurrentPage(1)
                  }}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.size} producto(s) seleccionado(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Activar
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Desactivar
                </button>
                <button
                  onClick={handleBulkDuplicate}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Duplicar
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedProducts(new Set())}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <>
            <AdminProductTable
              products={paginatedProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onStockUpdate={handleStockUpdate}
              onToggleActive={handleToggleActive}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <AdminProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}

