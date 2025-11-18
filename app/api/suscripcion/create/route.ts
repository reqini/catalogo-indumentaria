import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import Plan from '@/models/Plan'
import { getTenantFromToken } from '@/lib/tenant'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

export async function POST(request: Request) {
  try {
    await connectDB()

    // Obtener token del header
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
    const { planNombre } = body

    if (!['free', 'pro', 'premium'].includes(planNombre)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    // Obtener plan
    const plan = await Plan.findOne({ nombre: planNombre, activo: true }).lean()
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    if (planNombre === 'free') {
      // Plan gratis, actualizar directamente
      await Tenant.updateOne(
        { tenantId: tenant.tenantId },
        { plan: 'free', fechaRenovacion: null }
      )

      return NextResponse.json({
        success: true,
        message: 'Plan actualizado a Free',
      })
    }

    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago no configurado' },
        { status: 500 }
      )
    }

    // Crear suscripción en Mercado Pago
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        reason: `Suscripción ${planNombre.toUpperCase()} - Catálogo Simple`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.precio / 100, // Convertir centavos a pesos
          currency_id: 'ARS',
        },
        back_url: `${baseUrl}/planes?status=success`,
        notification_url: `${baseUrl}/api/mp/subscription`,
        external_reference: tenant.tenantId,
      }),
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.json()
      console.error('Mercado Pago error:', error)
      return NextResponse.json(
        { error: 'Error al crear suscripción' },
        { status: 500 }
      )
    }

    const mpData = await mpResponse.json()

    return NextResponse.json({
      init_point: mpData.init_point,
      subscription_id: mpData.id,
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear suscripción' },
      { status: 500 }
    )
  }
}

