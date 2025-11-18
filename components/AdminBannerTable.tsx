'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

interface AdminBannerTableProps {
  banners: any[]
  onEdit: (banner: any) => void
  onDelete: (id: string) => void
  onToggleActive: (banner: any) => void
  onOrderChange: (bannerId: string, newOrder: number) => void
}

export default function AdminBannerTable({
  banners,
  onEdit,
  onDelete,
  onToggleActive,
  onOrderChange,
}: AdminBannerTableProps) {
  if (banners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600">No hay banners. Creá uno para comenzar.</p>
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
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
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
            {banners.map((banner, index) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOrderChange(banner.id, banner.orden - 1)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Subir"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {banner.orden || 0}
                    </span>
                    <button
                      onClick={() => onOrderChange(banner.id, banner.orden + 1)}
                      disabled={index === banners.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Bajar"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {banner.imagenUrl ? (
                      <Image
                        src={banner.imagenUrl}
                        alt={banner.titulo || 'Banner'}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-black">
                    {banner.titulo || 'Sin título'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {banner.link ? (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {banner.link}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Sin link</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {banner.activo ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleActive(banner)}
                      className={`${
                        banner.activo
                          ? 'text-gray-600 hover:text-gray-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={banner.activo ? 'Desactivar' : 'Activar'}
                    >
                      {banner.activo ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => onEdit(banner)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(banner.id)}
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
    </div>
  )
}

