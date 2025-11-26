import { Metadata } from 'next'
import { getProductById } from '@/utils/api'
import ProductoClient from './ProductoClient'

export const revalidate = 60 // ISR: revalidar cada 60 segundos

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await getProductById(params.id)
    return {
      title: `${product.nombre} - Premium Fashion`,
      description: product.descripcion || `Comprá ${product.nombre} en Premium Fashion`,
      openGraph: {
        title: product.nombre,
        description: product.descripcion || '',
        images: [product.imagenPrincipal || '/images/urban-runner-1.jpg'],
      },
    }
  } catch {
    return {
      title: 'Producto - Premium Fashion',
    }
  }
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  return <ProductoClient />
}
