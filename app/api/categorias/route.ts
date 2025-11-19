import { NextResponse } from 'next/server'
import { getCategorias } from '@/lib/supabase-helpers'
import { supabaseAdmin } from '@/lib/supabase'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const categorias = await getCategorias(true)
    return NextResponse.json(categorias)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener categorías' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, slug, descripcion, orden } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('categorias')
      .insert([
        {
          nombre,
          slug,
          descripcion,
          orden: orden || 0,
          activa: true,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating categoria:', error)
    return NextResponse.json({ error: error.message || 'Error al crear categoría' }, { status: 500 })
  }
}
