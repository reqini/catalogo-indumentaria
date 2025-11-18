import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { createTenant, getTenantByEmail } from '@/lib/supabase-helpers'

const registerSchema = z.object({
  nombreNegocio: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  mpId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingTenant = await getTenantByEmail(validatedData.email)
    if (existingTenant) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Generar tenantId único
    const tenantId = uuidv4()

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Crear tenant en Supabase
    const tenantData = {
      tenant_id: tenantId,
      nombre_negocio: validatedData.nombreNegocio,
      email: validatedData.email.toLowerCase(),
      password_hash: passwordHash,
      plan: 'free',
      activo: true,
      rol: 'tenant',
      branding: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        font: 'Inter',
      },
    }

    const tenant = await createTenant(tenantData)

    return NextResponse.json(
      {
        message: 'Registro exitoso',
        tenant: {
          tenantId: tenant.tenant_id,
          nombreNegocio: tenant.nombre_negocio,
          email: tenant.email,
          plan: tenant.plan,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error in register:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
