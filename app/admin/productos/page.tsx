'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
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

  const filteredProducts = products.filter((product) =>
    product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
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

