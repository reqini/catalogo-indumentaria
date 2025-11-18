'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Clock, User, FileEdit, Trash2, Eye, EyeOff, Package } from 'lucide-react'
import { format } from 'date-fns'

interface HistorialEntry {
  id: string
  accion: string
  usuario_id: string
  campo_modificado?: string
  valor_anterior?: string
  valor_nuevo?: string
  created_at: string
}

interface ProductHistorialModalProps {
  productId: string
  productName: string
  onClose: () => void
}

const accionIcons: Record<string, any> = {
  crear: Package,
  editar: FileEdit,
  eliminar: Trash2,
  activar: Eye,
  desactivar: EyeOff,
  stock: Package,
}

const accionLabels: Record<string, string> = {
  crear: 'Creado',
  editar: 'Editado',
  eliminar: 'Eliminado',
  activar: 'Activado',
  desactivar: 'Desactivado',
  stock: 'Stock actualizado',
}

export default function ProductHistorialModal({
  productId,
  productName,
  onClose,
}: ProductHistorialModalProps) {
  const [historial, setHistorial] = useState<HistorialEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistorial = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/productos/${productId}/historial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistorial(data)
      }
    } catch (error) {
      console.error('Error fetching historial:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-black">Historial de Cambios</h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Cargando historial...</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No hay historial disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((entry) => {
                const Icon = accionIcons[entry.accion] || FileEdit
                const label = accionLabels[entry.accion] || entry.accion

                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon size={20} className="text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-black">{label}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(entry.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm")}
                          </span>
                        </div>
                        {entry.campo_modificado && (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Campo:</span>{' '}
                              {entry.campo_modificado}
                            </p>
                            {entry.valor_anterior && (
                              <p>
                                <span className="font-medium">Antes:</span>{' '}
                                <span className="line-through text-red-600">
                                  {entry.valor_anterior}
                                </span>
                              </p>
                            )}
                            {entry.valor_nuevo && (
                              <p>
                                <span className="font-medium">Después:</span>{' '}
                                <span className="text-green-600">
                                  {entry.valor_nuevo}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                          <User size={14} />
                          <span>Usuario: {entry.usuario_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

