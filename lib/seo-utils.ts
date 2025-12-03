/**
 * SEO Utils - Utilidades para SEO y metadatos
 */

import { Metadata } from 'next'

export interface ProductSEOData {
  nombre: string
  descripcion?: string
  precio: number
  precioOriginal?: number
  imagenPrincipal: string
  categoria?: string
  marca?: string
  stock?: boolean
  rating?: number
  reviews?: number
}

/**
 * Genera metadatos SEO para una página de producto
 */
export function generateProductMetadata(
  product: ProductSEOData,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): Metadata {
  const title = `${product.nombre} - Premium Fashion`
  const description =
    product.descripcion ||
    `Comprá ${product.nombre}${product.categoria ? ` en ${product.categoria}` : ''} en Premium Fashion. ${product.precioOriginal ? `Antes $${product.precioOriginal}, ahora $${product.precio}` : `$${product.precio}`}`

  return {
    title,
    description,
    keywords: [product.nombre, product.categoria, 'indumentaria', 'ropa', 'moda', 'premium']
      .filter(Boolean)
      .join(', '),
    openGraph: {
      title,
      description,
      type: 'product',
      images: [
        {
          url: product.imagenPrincipal,
          width: 1200,
          height: 630,
          alt: product.nombre,
        },
      ],
      siteName: 'Premium Fashion',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imagenPrincipal],
    },
    alternates: {
      canonical: `${baseUrl}/producto/${product.nombre.toLowerCase().replace(/\s+/g, '-')}`,
    },
  }
}

/**
 * Genera schema.org JSON-LD para un producto
 */
export function generateProductSchema(product: ProductSEOData, baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion || product.nombre,
    image: product.imagenPrincipal,
    brand: {
      '@type': 'Brand',
      name: product.marca || 'Premium Fashion',
    },
    category: product.categoria,
    offers: {
      '@type': 'Offer',
      price: product.precio,
      priceCurrency: 'ARS',
      availability: product.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/producto/${product.nombre.toLowerCase().replace(/\s+/g, '-')}`,
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
      },
    }),
  }
}

/**
 * Genera schema.org JSON-LD para una tienda
 */
export function generateStoreSchema(baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Premium Fashion',
    description: 'Catálogo premium de indumentaria con las mejores prendas',
    url: baseUrl,
    image: `${baseUrl}/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
    },
  }
}

/**
 * Genera breadcrumbs schema
 */
export function generateBreadcrumbsSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Sanitiza texto para URLs SEO-friendly
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
}
