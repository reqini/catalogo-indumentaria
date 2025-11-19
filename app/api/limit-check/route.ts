import { NextResponse } from 'next/server'
import { checkPlanLimits } from '@/lib/tenant'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (!['productos', 'banners'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const limits = await checkPlanLimits(tenant.tenantId, type)

    return NextResponse.json(limits)
  } catch (error: any) {
    console.error('Error checking limits:', error)
    return NextResponse.json(
      { error: error.message || 'Error al verificar límites' },
      { status: 500 }
    )
  }
}

