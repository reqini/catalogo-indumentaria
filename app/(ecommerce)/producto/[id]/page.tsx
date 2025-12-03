import { Metadata } from 'next'
import Script from 'next/script'
import { getProductById } from '@/utils/api'
import { generateProductMetadata, generateProductSchema } from '@/lib/seo-utils'
import ProductoClient from './ProductoClient'

export const revalidate = 60 // ISR: revalidar cada 60 segundos

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await getProductById(params.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return generateProductMetadata(
      {
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        precioOriginal: product.descuento ? product.precio : undefined,
        imagenPrincipal:
          product.imagenPrincipal || product.imagen_principal || '/images/default-product.svg',
        categoria: product.categoria,
        stock: (product.stock && Object.values(product.stock).some((s: any) => s > 0)) || false,
      },
      baseUrl
    )
  } catch {
    return {
      title: 'Producto - Premium Fashion',
      description: 'Producto no encontrado',
    }
  }
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  let productSchema = null

  try {
    const product = await getProductById(params.id)
    productSchema = generateProductSchema(
      {
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        precioOriginal: product.descuento ? product.precio : undefined,
        imagenPrincipal:
          product.imagenPrincipal || product.imagen_principal || '/images/default-product.svg',
        categoria: product.categoria,
        stock: (product.stock && Object.values(product.stock).some((s: any) => s > 0)) || false,
      },
      baseUrl
    )
  } catch {
    // Si falla, no agregar schema
  }

  return (
    <>
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      <ProductoClient />
    </>
  )
}
