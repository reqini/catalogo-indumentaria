'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { debounce } from '@/lib/performance-optimizer'
import ProductCard from '@/components/ProductCard'
import FilterBar, { Filters } from '@/components/FilterBar'
import { getProducts } from '@/utils/api'

export default function CatalogoClient() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    categoria: searchParams.get('categoria') || '',
    color: searchParams.get('color') || '',
    nombre: searchParams.get('nombre') || '',
    precio: (searchParams.get('precio') as 'asc' | 'desc' | '') || '',
  })

  // Memoizar productos filtrados para evitar recálculos innecesarios
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p: any) => p.activo !== false)

    // Aplicar filtros locales adicionales
    if (filters.nombre) {
      filtered = filtered.filter((p: any) =>
        p.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      )
    }

    // Ordenamiento por precio
    if (filters.precio === 'asc') {
      filtered.sort((a: any, b: any) => {
        const priceA = a.descuento ? a.precio * (1 - a.descuento / 100) : a.precio
        const priceB = b.descuento ? b.precio * (1 - b.descuento / 100) : b.precio
        return priceA - priceB
      })
    } else if (filters.precio === 'desc') {
      filtered.sort((a: any, b: any) => {
        const priceA = a.descuento ? a.precio * (1 - a.descuento / 100) : a.precio
        const priceB = b.descuento ? b.precio * (1 - b.descuento / 100) : b.precio
        return priceB - priceA
      })
    } else {
      // Por defecto, ordenar por más recientes
      filtered.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    }

    return filtered
  }, [products, filters.nombre, filters.precio])

  // Debounce para búsqueda por nombre (evitar llamadas excesivas)
  const debouncedFetch = useCallback(
    debounce(async (filtersToUse: Filters) => {
      setLoading(true)
      try {
        const data = await getProducts({
          categoria: filtersToUse.categoria || undefined,
          color: filtersToUse.color || undefined,
        })
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    // Solo hacer fetch cuando cambian filtros de API (categoría, color)
    // La búsqueda por nombre se hace localmente
    if (filters.categoria || filters.color) {
      debouncedFetch(filters)
    } else {
      // Cargar todos los productos solo una vez
      const fetchProducts = async () => {
        setLoading(true)
        try {
          const data = await getProducts()
          setProducts(data || [])
        } catch (error) {
          console.error('Error fetching products:', error)
          setProducts([])
        } finally {
          setLoading(false)
        }
      }
      fetchProducts()
    }
  }, [filters.categoria, filters.color, debouncedFetch])

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-bold text-black"
        >
          Catálogo
        </motion.h1>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
