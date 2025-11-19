import { MetadataRoute } from 'next'
import { getProductos } from '@/lib/supabase-helpers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Agregar productos dinámicamente si Supabase está configurado
  try {
    const productos = await getProductos({ activo: true })
    const productPages: MetadataRoute.Sitemap = productos.map((producto) => ({
      url: `${baseUrl}/producto/${producto.id}`,
      lastModified: producto.updated_at ? new Date(producto.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...productPages]
  } catch (error) {
    // Si hay error (Supabase no configurado), retornar solo páginas estáticas
    console.warn('Error generando sitemap dinámico:', error)
    return staticPages
  }
}
