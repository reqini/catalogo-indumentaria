import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/utils/validations'
import { getTenantByEmail } from '@/lib/supabase-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { email, password } = loginSchema.parse(body)

    // Buscar tenant (usuario) en Supabase
    const tenant = await getTenantByEmail(email.toLowerCase())

    if (!tenant) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!tenant.activo) {
      return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 })
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, tenant.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Generar JWT con tenantId
    const token = jwt.sign(
      {
        id: tenant.id,
        tenantId: tenant.tenant_id,
        email: tenant.email,
        plan: tenant.plan,
        rol: tenant.rol,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token,
      tenant: {
        tenantId: tenant.tenant_id,
        nombreNegocio: tenant.nombre_negocio,
        email: tenant.email,
        plan: tenant.plan,
        branding: tenant.branding,
        rol: tenant.rol,
      },
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error in login:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
