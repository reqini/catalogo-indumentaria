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
    try {
      const duplicated = {
        ...product,
        nombre: `${product.nombre} (Copia)`,
      }
      // Remover campos que no deben duplicarse
      delete duplicated.id
      delete duplicated._id
      delete duplicated.createdAt
      delete duplicated.updatedAt
      
      await createProduct(duplicated)
      toast.success('Producto duplicado exitosamente')
      fetchProducts()
    } catch (error) {
      console.error('Error duplicating product:', error)
      toast.error('Error al duplicar producto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return
    }

    try {
      await deleteProduct(id)
      toast.success('Producto eliminado')
      fetchProducts()
    } catch (error) {
      toast.error('Error al eliminar producto')
    }
  }

  const handleStockUpdate = async (productId: string, talle: string, cantidad: number) => {
    try {
      await updateStock(productId, talle, cantidad)
      toast.success('Stock actualizado')
      fetchProducts()
    } catch (error) {
      toast.error('Error al actualizar stock')
    }
  }

  const handleToggleActive = async (product: any) => {
    try {
      await updateProduct(product.id, { activo: !product.activo })
      toast.success(`Producto ${!product.activo ? 'activado' : 'desactivado'}`)
      fetchProducts()
    } catch (error) {
      toast.error('Error al actualizar producto')
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

