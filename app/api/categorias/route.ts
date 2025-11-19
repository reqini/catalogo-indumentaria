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
    console.log('[API-CATEGORIAS] POST - Crear categoría')
    
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      console.error('[API-CATEGORIAS] ❌ Token no proporcionado')
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    console.log('[API-CATEGORIAS] ✅ Tenant autenticado:', tenant.tenantId)

    const body = await request.json()
    const { nombre, slug, descripcion, orden } = body

    console.log('[API-CATEGORIAS] Datos recibidos:', { nombre, slug, descripcion, orden })

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    // Verificar si ya existe una categoría con el mismo slug
    const { data: existing } = await supabaseAdmin
      .from('categorias')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.warn('[API-CATEGORIAS] ⚠️ Categoría con slug ya existe:', slug)
      return NextResponse.json(
        { error: `Ya existe una categoría con el slug "${slug}". Usa un slug diferente.` },
        { status: 400 }
      )
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
      console.error('[API-CATEGORIAS] ❌ Error insertando en Supabase:', error)
      throw error
    }

    console.log('[API-CATEGORIAS] ✅ Categoría creada exitosamente:', data.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('[API-CATEGORIAS] ❌ Error creating categoria:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Error al crear categoría',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
