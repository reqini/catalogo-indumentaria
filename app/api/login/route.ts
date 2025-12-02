import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/utils/validations'
import { getTenantByEmail } from '@/lib/supabase-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    console.log('[API-LOGIN] 📥 POST request recibido')

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('[API-LOGIN] ❌ Error parseando body:', e)
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
    }

    const { email, password } = loginSchema.parse(body)
    console.log('[API-LOGIN] 🔍 Intentando login para:', email.toLowerCase())

    // Buscar tenant (usuario) en Supabase
    let tenant
    try {
      tenant = await getTenantByEmail(email.toLowerCase())
    } catch (error: any) {
      console.error('[API-LOGIN] ❌ Error obteniendo tenant:', error)
      // Si es error de Supabase no configurado, retornar error claro
      if (error.message?.includes('no está configurado')) {
        return NextResponse.json(
          {
            error: 'Sistema no configurado. Por favor, contacta al administrador.',
            details: 'Supabase no está configurado',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
    }

    if (!tenant) {
      console.warn('[API-LOGIN] ⚠️ Tenant no encontrado para:', email.toLowerCase())
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!tenant.activo) {
      console.warn('[API-LOGIN] ⚠️ Cuenta inactiva para:', email.toLowerCase())
      return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 })
    }

    console.log('[API-LOGIN] ✅ Tenant encontrado:', tenant.tenant_id)

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, tenant.password_hash)

    if (!isValid) {
      console.warn('[API-LOGIN] ⚠️ Contraseña inválida para:', email.toLowerCase())
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

    console.log('[API-LOGIN] ✅ Login exitoso para:', tenant.tenant_id)

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
      console.error('[API-LOGIN] ❌ Error de validación:', error.errors)
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('[API-LOGIN] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
