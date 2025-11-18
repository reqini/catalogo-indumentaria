import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const registerSchema = z.object({
  nombreNegocio: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  mpId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingTenant = await Tenant.findOne({ email: validatedData.email })
    if (existingTenant) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Generar tenantId único
    const tenantId = uuidv4()

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Crear tenant
    const tenant = await Tenant.create({
      tenantId,
      nombreNegocio: validatedData.nombreNegocio,
      email: validatedData.email,
      passwordHash,
      plan: 'free',
      mpId: validatedData.mpId,
      branding: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        font: 'Inter',
      },
      activo: true,
      fechaAlta: new Date(),
      rol: 'tenant',
    })

    // Generar JWT
    const jwt = await import('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

    const token = jwt.sign(
      {
        id: tenant._id.toString(),
        tenantId: tenant.tenantId,
        email: tenant.email,
        plan: tenant.plan,
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
      },
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar' },
      { status: 500 }
    )
  }
}

