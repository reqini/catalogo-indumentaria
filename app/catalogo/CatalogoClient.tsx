'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Obtener productos con filtros de API
        const data = await getProducts({
          categoria: filters.categoria || undefined,
          color: filters.color || undefined,
        })
        
        // Filtrar solo productos activos
        let filtered = data.filter((p: any) => p.activo !== false)
        
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
        
        setProducts(filtered || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([]) // Asegurar que siempre sea un array
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [filters])

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-black mb-8"
        >
          Catálogo
        </motion.h1>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {loading ? (
          <p className="text-gray-600">Cargando catálogo...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
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

