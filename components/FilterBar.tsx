'use client'

import { X } from 'lucide-react'

export interface Filters {
  categoria: string
  color: string
  nombre: string
  precio: 'asc' | 'desc' | ''
}

interface FilterBarProps {
  filters: Filters
  onFilterChange?: (key: keyof Filters, value: string) => void
  onFiltersChange?: (filters: Filters) => void
}

// Categorías dinámicas (se pueden obtener de la DB en el futuro)
const categorias = [
  { name: 'Running', slug: 'running' },
  { name: 'Training', slug: 'training' },
  { name: 'Lifestyle', slug: 'lifestyle' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Outdoor', slug: 'outdoor' },
  { name: 'Remeras', slug: 'remeras' },
  { name: 'Pantalones', slug: 'pantalones' },
  { name: 'Buzos', slug: 'buzos' },
  { name: 'Accesorios', slug: 'accesorios' },
]
const colores = ['Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde']

export default function FilterBar({
  filters,
  onFilterChange,
  onFiltersChange,
}: FilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    if (onFilterChange) {
      onFilterChange(key, value)
    }
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [key]: value,
      })
    }
  }

  const hasActiveFilters =
    filters.categoria || filters.color || filters.nombre || filters.precio

  const clearFilters = () => {
    handleChange('categoria', '')
    handleChange('color', '')
    handleChange('nombre', '')
    handleChange('precio', '')
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda por nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={filters.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Nombre del producto..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Filtro por categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filters.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <select
            value={filters.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todos</option>
            {colores.map((color) => (
              <option key={color} value={color.toLowerCase()}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenamiento por precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por precio
          </label>
          <select
            value={filters.precio}
            onChange={(e) => handleChange('precio', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Sin ordenar</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
        </div>
      </div>
    </div>
  )
}

