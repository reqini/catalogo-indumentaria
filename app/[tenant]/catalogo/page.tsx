'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getTenantFromPath } from '@/lib/tenant'
import ProductCard from '@/components/ProductCard'
import FilterBar, { Filters } from '@/components/FilterBar'
import Carousel from '@/components/Carousel'

export default function TenantCatalogoPage() {
  const params = useParams()
  const tenantSlug = params.tenant as string
  const [tenant, setTenant] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    categoria: '',
    color: '',
    nombre: '',
    precio: '',
  })

  useEffect(() => {
    if (!tenantSlug) return

    ;(async () => {
      try {
        // Obtener tenant desde el path
        const tenantData = await getTenantFromPath(tenantSlug)
        if (!tenantData) {
          console.error('Tenant no encontrado')
          setLoading(false)
          return
        }

        setTenant(tenantData)

        // Cargar productos del tenant
        const response = await fetch(`/api/productos?tenantId=${tenantData.tenantId}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading tenant data:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [tenantSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Catálogo no encontrado</h1>
          <p className="text-gray-600">El catálogo que buscás no existe o está inactivo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Aplicar branding dinámico */}
      <style jsx global>{`
        :root {
          --primary-color: ${tenant.branding?.primaryColor || '#000000'};
          --secondary-color: ${tenant.branding?.secondaryColor || '#ffffff'};
          --font-family: ${tenant.branding?.font || 'Inter'}, sans-serif;
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {tenant.branding?.logo && (
          <div className="mb-8 text-center">
            <div className="relative h-16 w-40 mx-auto">
              <Image
                src={tenant.branding.logo}
                alt={tenant.nombreNegocio}
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-center mb-8" style={{ color: 'var(--primary-color)' }}>
          {tenant.nombreNegocio}
        </h1>

        <Carousel />

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {(() => {
          // Aplicar filtros locales similares a CatalogoClient
          let filtered = products

          if (filters.nombre) {
            const nombreLower = filters.nombre.toLowerCase()
            filtered = filtered.filter(
              (p: any) =>
                p.nombre?.toLowerCase().includes(nombreLower) ||
                p.categoria?.toLowerCase().includes(nombreLower)
            )
          }

          if (filters.categoria) {
            filtered = filtered.filter(
              (p: any) => p.categoria?.toLowerCase() === filters.categoria.toLowerCase()
            )
          }

          if (filters.color) {
            filtered = filtered.filter(
              (p: any) => p.color?.toLowerCase() === filters.color.toLowerCase()
            )
          }

          if (filters.precio === 'asc') {
            filtered = [...filtered].sort((a: any, b: any) => a.precio - b.precio)
          } else if (filters.precio === 'desc') {
            filtered = [...filtered].sort((a: any, b: any) => b.precio - a.precio)
          }

          if (filtered.length === 0) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hay productos disponibles</p>
              </div>
            )
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {filtered.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        })()}

        {products.length === 0 && !filters.nombre && !filters.categoria && !filters.color && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay productos disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

