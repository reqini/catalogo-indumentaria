import { NextResponse } from 'next/server'
import { getCategorias } from '@/lib/supabase-helpers'
import { getTenantFromToken } from '@/lib/supabase-helpers'
import { supabaseAdmin } from '@/lib/supabase'

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
    // Obtener tenant del token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const tenant = await getTenantFromToken(token)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
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
