'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

interface Categoria {
  id?: string
  nombre: string
  slug: string
  descripcion?: string
  activa: boolean
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
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    setLoading(true)
    try {
      // Por ahora usamos categorías hardcodeadas, pero se puede migrar a DB
      const defaultCategorias: Categoria[] = [
        { nombre: 'Running', slug: 'running', descripcion: 'Productos para running', activa: true },
        { nombre: 'Training', slug: 'training', descripcion: 'Productos para entrenamiento', activa: true },
        { nombre: 'Lifestyle', slug: 'lifestyle', descripcion: 'Productos lifestyle', activa: true },
        { nombre: 'Kids', slug: 'kids', descripcion: 'Productos para niños', activa: true },
        { nombre: 'Outdoor', slug: 'outdoor', descripcion: 'Productos outdoor', activa: true },
        { nombre: 'Remeras', slug: 'remeras', descripcion: 'Remeras', activa: true },
        { nombre: 'Pantalones', slug: 'pantalones', descripcion: 'Pantalones', activa: true },
        { nombre: 'Buzos', slug: 'buzos', descripcion: 'Buzos', activa: true },
        { nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Accesorios', activa: true },
      ]
      setCategorias(defaultCategorias)
    } catch (error) {
      console.error('Error fetching categorias:', error)
      toast.error('Error al cargar categorías')
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

    // Validar que no haya productos usando esta categoría antes de eliminar/desactivar
    if (editingCategoria && !formData.activa) {
      try {
        const token = localStorage.getItem('auth_token') || ''
        const products = await axios.get('/api/productos', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const productosConCategoria = products.data.filter(
          (p: any) => p.categoria === editingCategoria.slug
        )
        
        if (productosConCategoria.length > 0) {
          toast.error(
            `No se puede desactivar. Hay ${productosConCategoria.length} producto(s) usando esta categoría.`
          )
          return
        }
      } catch (error) {
        console.error('Error verificando productos:', error)
      }
    }

    // Por ahora solo mostramos mensaje (en el futuro se guardaría en DB)
    if (editingCategoria) {
      toast.success('Categoría actualizada (modo demo)')
    } else {
      toast.success('Categoría creada (modo demo)')
    }
    
    setShowForm(false)
    setEditingCategoria(null)
    setFormData({ nombre: '', slug: '', descripcion: '', activa: true })
    fetchCategorias()
  }

  const handleDelete = async (categoria: Categoria) => {
    try {
      const token = localStorage.getItem('auth_token') || ''
      const products = await axios.get('/api/productos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const productosConCategoria = products.data.filter(
        (p: any) => p.categoria === categoria.slug
      )
      
      if (productosConCategoria.length > 0) {
        toast.error(
          `No se puede eliminar. Hay ${productosConCategoria.length} producto(s) usando esta categoría. Re-asigná los productos primero.`
        )
        return
      }

      if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
        toast.success('Categoría eliminada (modo demo)')
        fetchCategorias()
      }
    } catch (error) {
      console.error('Error verificando productos:', error)
      toast.error('Error al verificar productos')
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
                setFormData({ nombre: '', slug: '', descripcion: '', activa: true })
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
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <tr key={categoria.slug} className="hover:bg-gray-50">
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
                            setFormData(categoria)
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
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
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
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
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
                    setFormData({ nombre: '', slug: '', descripcion: '', activa: true })
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

