import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import Venta from '@/models/Venta'
import Plan from '@/models/Plan'

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

export async function POST(request: Request) {
  await connectDB()

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const topic = url.searchParams.get('topic')

    if (!id || !topic) {
      return NextResponse.json({ message: 'Missing ID or topic' }, { status: 400 })
    }

    if (topic !== 'preapproval') {
      return NextResponse.json({ message: 'Ignored topic' }, { status: 200 })
    }

    if (!MP_ACCESS_TOKEN) {
      throw new Error('Mercado Pago access token not configured')
    }

    // Obtener datos de la suscripción desde MP
    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${id}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      }
    )

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error('Error fetching subscription from Mercado Pago:', errorData)
      throw new Error('Failed to fetch subscription details')
    }

    const subscription = await mpResponse.json()
    const tenantId = subscription.external_reference

    if (!tenantId) {
      return NextResponse.json({ message: 'Tenant ID not found' }, { status: 400 })
    }

    const tenant = await Tenant.findOne({ tenantId })
    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 })
    }

    // Determinar plan desde el monto
    const monto = subscription.auto_recurring?.transaction_amount || 0
    const plan = await Plan.findOne({ precio: Math.round(monto * 100), activo: true }).lean()

    if (plan) {
      // Actualizar plan del tenant
      const fechaInicio = new Date()
      const fechaFin = new Date()
      fechaFin.setMonth(fechaFin.getMonth() + 1)

      await Tenant.updateOne(
        { tenantId },
        {
          plan: plan.nombre,
          fechaRenovacion: fechaFin,
        }
      )

      // Registrar venta
      await Venta.create({
        tenantId,
        monto: Math.round(monto * 100),
        fecha: fechaInicio,
        estado: subscription.status === 'authorized' ? 'aprobado' : 'pendiente',
        preferenciaId: subscription.id,
        tipo: 'suscripcion',
        plan: plan.nombre,
        periodoInicio: fechaInicio,
        periodoFin: fechaFin,
      })
    }

    return NextResponse.json({ message: 'Subscription processed' }, { status: 200 })
  } catch (error: any) {
    console.error('Error processing subscription webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing webhook' },
      { status: 500 }
    )
  }
}

