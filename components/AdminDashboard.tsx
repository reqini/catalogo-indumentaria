'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Plus, Edit, Trash2, BarChart3, Package } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { useAdmin } from '@/hooks/useAdmin'
import AdminForm from './AdminForm'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { logout } = useAuthContext()
  const router = useRouter()
  const { products, loading, handleDeleteProduct } = useAdmin()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const stats = {
    total: products.length,
    conDescuento: products.filter((p) => p.descuento && p.descuento > 0).length,
    agotados: products.filter((p) => {
      if (!p.stock) return false
      const stock = p.stock as Record<string, number>
      const totalStock = Object.values(stock).reduce(
        (a: number, b: number) => a + b,
        0
      )
      return totalStock === 0
    }).length,
  }

  if (showForm) {
    return (
      <AdminForm
        product={editingProduct}
        onClose={handleCloseForm}
        onSuccess={handleCloseForm}
      />
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Panel de Administración</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Productos</p>
                <p className="text-3xl font-bold text-black">{stats.total}</p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Con Descuento</p>
                <p className="text-3xl font-bold text-black">{stats.conDescuento}</p>
              </div>
              <BarChart3 className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Agotados</p>
                <p className="text-3xl font-bold text-red-500">{stats.agotados}</p>
              </div>
              <Package className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Botón Agregar */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>

        {/* Lista de Productos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No hay productos registrados</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              Crear Primer Producto
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stock = (product.stock || {}) as Record<string, number>
                    const totalStock = Object.values(stock).reduce(
                      (a: number, b: number) => a + b,
                      0
                    )

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {product.imagenPrincipal ? (
                              <Image
                                src={product.imagenPrincipal}
                                alt={product.nombre}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-black">
                            {product.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categoria}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">
                            ${product.precio?.toLocaleString('es-AR')}
                          </div>
                          {product.descuento && (
                            <div className="text-sm text-red-500">
                              -{product.descuento}% OFF
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black">{totalStock} unidades</div>
                          {totalStock === 0 && (
                            <div className="text-xs text-red-500">Agotado</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
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
        )}
      </div>
    </main>
  )
}

