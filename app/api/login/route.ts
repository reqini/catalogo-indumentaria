import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/utils/validations'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Buscar tenant (usuario)
    const tenant = await Tenant.findOne({ email: email.toLowerCase() })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (!tenant.activo) {
      return NextResponse.json(
        { error: 'Cuenta inactiva' },
        { status: 403 }
      )
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, tenant.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar JWT con tenantId
    const token = jwt.sign(
      {
        id: tenant._id.toString(),
        tenantId: tenant.tenantId,
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
        tenantId: tenant.tenantId,
        nombreNegocio: tenant.nombreNegocio,
        email: tenant.email,
        plan: tenant.plan,
        branding: tenant.branding,
        rol: tenant.rol,
      },
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
