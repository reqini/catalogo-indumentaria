import { NextResponse } from 'next/server'
import { getDailyReportScheduler } from '@/lib/daily-report-scheduler'

/**
 * Endpoint para obtener último reporte
 * Requiere autenticación
 */
export async function GET(request: Request) {
  try {
    // Verificar token desde header
    const authHeader = request.headers.get('authorization')
    const token =
      authHeader?.replace('Bearer ', '') || new URL(request.url).searchParams.get('token')

    // Verificar token
    const secretToken = process.env.DAILY_REPORT_SECRET_TOKEN || 'default-secret-token-change-me'
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const scheduler = getDailyReportScheduler()
    const report = await scheduler.getLastReport()

    if (!report) {
      return NextResponse.json({ error: 'No hay reportes disponibles' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo reporte',
      },
      { status: 500 }
    )
  }
}
