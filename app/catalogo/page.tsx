import { Metadata } from 'next'
import CatalogoClient from './CatalogoClient'

export const metadata: Metadata = {
  title: 'Catálogo - Premium Fashion',
  description: 'Explorá nuestra colección completa de indumentaria premium',
}

export const revalidate = 60 // ISR: revalidar cada 60 segundos

export default function CatalogoPage() {
  return <CatalogoClient />
}
