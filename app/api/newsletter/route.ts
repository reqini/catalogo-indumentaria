import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSupabase, isSupabaseEnabled } from '@/lib/supabase'

const newsletterSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: Request) {
  try {
    if (!isSupabaseEnabled) {
      return NextResponse.json(
        { error: 'Newsletter no disponible. Supabase no está configurado.' },
        { status: 503 }
      )
    }

    const { supabaseAdmin } = requireSupabase()
    const body = await request.json()
    const { email } = newsletterSchema.parse(body)

    // Verificar si el email ya está suscrito
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      // Si ya existe pero está inactivo, reactivarlo
      const { error: updateError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .update({ activo: true, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase())

      if (updateError) {
        throw updateError
      }

      return NextResponse.json(
        { message: 'Email ya estaba suscrito, reactivado exitosamente' },
        { status: 200 }
      )
    }

    // Crear nueva suscripción
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase(),
          activo: true,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Suscripción exitosa', data }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Email inválido', details: error.errors }, { status: 400 })
    }

    console.error('Error en newsletter:', error)
    return NextResponse.json({ error: error.message || 'Error al suscribirse' }, { status: 500 })
  }
}
