'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Eye, EyeOff, GripVertical } from 'lucide-react'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/utils/api'
import AdminBannerForm from '@/components/AdminBannerForm'
import AdminBannerTable from '@/components/AdminBannerTable'
import toast from 'react-hot-toast'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const data = await getBanners()
      // Ordenar por orden
      const sorted = data.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
      setBanners(sorted)
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Error al cargar banners')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: any) => {
    setEditingBanner(banner)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) {
      return
    }

    try {
      await deleteBanner(id)
      toast.success('Banner eliminado')
      fetchBanners()
    } catch (error) {
      toast.error('Error al eliminar banner')
    }
  }

  const handleToggleActive = async (banner: any) => {
    try {
      await updateBanner(banner.id, { activo: !banner.activo })
      toast.success(`Banner ${!banner.activo ? 'activado' : 'desactivado'}`)
      fetchBanners()
    } catch (error) {
      toast.error('Error al actualizar banner')
    }
  }

  const handleOrderChange = async (bannerId: string, newOrder: number) => {
    try {
      await updateBanner(bannerId, { orden: newOrder })
      fetchBanners()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Gestión de Banners</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanners}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>
            <button
              onClick={() => {
                setEditingBanner(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              <Plus size={20} />
              Nuevo Banner
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Cargando banners...</p>
          </div>
        ) : (
          <AdminBannerTable
            banners={banners}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onOrderChange={handleOrderChange}
          />
        )}
      </div>

      {showForm && (
        <AdminBannerForm
          banner={editingBanner}
          onClose={() => {
            setShowForm(false)
            setEditingBanner(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingBanner(null)
            fetchBanners()
          }}
        />
      )}
    </div>
  )
}

