import { NextResponse } from 'next/server'
import { getPlanes } from '@/lib/supabase-helpers'

export async function GET() {
  try {
    const planes = await getPlanes(true)

    // Formatear planes para el frontend
    const planesFormateados = planes.map((p: any) => ({
      _id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      limiteProductos: p.limite_productos,
      limiteBanners: p.limite_banners,
      beneficios: p.beneficios || [],
      activo: p.activo,
    }))

    return NextResponse.json(planesFormateados)
  } catch (error: any) {
    console.error('Error fetching planes:', error)
    return NextResponse.json({ error: 'Error al obtener planes' }, { status: 500 })
  }
}
