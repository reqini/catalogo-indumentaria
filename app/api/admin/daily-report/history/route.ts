import { NextResponse } from 'next/server'
import { getDailyReportScheduler } from '@/lib/daily-report-scheduler'

/**
 * Endpoint para obtener historial de reportes
 * Requiere token secreto
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // Verificar token
    const secretToken = process.env.DAILY_REPORT_SECRET_TOKEN || 'default-secret-token-change-me'
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const scheduler = getDailyReportScheduler()
    const history = await scheduler.getReportHistory()

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo historial',
      },
      { status: 500 }
    )
  }
}
