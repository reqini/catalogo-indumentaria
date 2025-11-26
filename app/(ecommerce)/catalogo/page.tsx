import { Metadata } from 'next'
import { Suspense } from 'react'
import CatalogoClient from './CatalogoClient'

export const metadata: Metadata = {
  title: 'Catálogo - Premium Fashion',
  description: 'Explorá nuestra colección completa de indumentaria premium',
}

export const revalidate = 60 // ISR: revalidar cada 60 segundos

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      }
    >
      <CatalogoClient />
    </Suspense>
  )
}
