import { NextResponse } from 'next/server'
import { diagnoseMercadoPago, generateMercadoPagoReport } from '@/lib/mercadopago-diagnostic'

export async function GET() {
  try {
    const diagnostic = diagnoseMercadoPago()
    const report = generateMercadoPagoReport(diagnostic)

    return NextResponse.json(
      {
        ...diagnostic,
        report,
      },
      {
        status: diagnostic.status === 'error' ? 500 : diagnostic.status === 'warning' ? 200 : 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message || 'Error al generar diagnóstico',
        issues: [],
        recommendations: ['Revisa los logs del servidor para más detalles'],
      },
      { status: 500 }
    )
  }
}
