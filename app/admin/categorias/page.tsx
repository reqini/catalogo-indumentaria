'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/utils/api'

interface Categoria {
  id?: string
  nombre: string
  slug: string
  descripcion?: string
  activa: boolean
  orden?: number
}

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState<Categoria>({
    nombre: '',
    slug: '',
    descripcion: '',
    activa: true,
    orden: 0,
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    setLoading(true)
    try {
      const data = await getCategorias(false) // Obtener todas, activas e inactivas
      setCategorias(data)
    } catch (error: any) {
      console.error('Error fetching categorias:', error)
      toast.error(error.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.slug) {
      toast.error('Nombre y slug son requeridos')
      return
    }

    try {
      if (editingCategoria?.id) {
        // Actualizar categoría existente
        await updateCategoria(editingCategoria.id, formData)
        toast.success('Categoría actualizada correctamente')
      } else {
        // Crear nueva categoría
        await createCategoria(formData)
        toast.success('Categoría creada correctamente')
      }

      setShowForm(false)
      setEditingCategoria(null)
      setFormData({ nombre: '', slug: '', descripcion: '', activa: true, orden: 0 })
      fetchCategorias()
    } catch (error: any) {
      console.error('Error saving categoria:', error)
      toast.error(error.message || 'Error al guardar categoría')
    }
  }

  const handleDelete = async (categoria: Categoria) => {
    if (!categoria.id) {
      toast.error('ID de categoría no válido')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      return
    }

    try {
      await deleteCategoria(categoria.id)
      toast.success('Categoría eliminada correctamente')
      fetchCategorias()
    } catch (error: any) {
      console.error('Error deleting categoria:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar categoría'
      
      // Si hay productos asociados, mostrar mensaje específico
      if (error.response?.data?.productosAsociados) {
        toast.error(`No se puede eliminar. Hay ${error.response.data.productosAsociados} producto(s) usando esta categoría. Re-asigná los productos primero.`)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Gestión de Categorías</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategorias}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>
            <button
              onClick={() => {
                setEditingCategoria(null)
                setFormData({ nombre: '', slug: '', descripcion: '', activa: true, orden: 0 })
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              <Plus size={20} />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Cargando categorías...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No hay categorías. Creá una para comenzar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <tr key={categoria.id || categoria.slug} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{categoria.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{categoria.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{categoria.descripcion || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{categoria.orden || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {categoria.activa ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategoria(categoria)
                            setFormData({
                              nombre: categoria.nombre,
                              slug: categoria.slug,
                              descripcion: categoria.descripcion || '',
                              activa: categoria.activa,
                              orden: categoria.orden || 0,
                            })
                            setShowForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      nombre: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    })
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.orden || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label className="text-sm font-medium text-gray-700">Activa</label>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategoria(null)
                    setFormData({ nombre: '', slug: '', descripcion: '', activa: true, orden: 0 })
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
                >
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
