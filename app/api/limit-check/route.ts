import { NextResponse } from 'next/server'
import { getTenantFromToken } from '@/lib/tenant'
import { checkPlanLimits } from '@/lib/tenant'

export async function POST(request: Request) {
  try {
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

