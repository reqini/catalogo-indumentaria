import { NextResponse } from 'next/server'
import { getDailyReportScheduler } from '@/lib/daily-report-scheduler'

/**
 * Endpoint para ejecutar informe diario manualmente
 * Requiere token secreto
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    // Verificar token
    const secretToken = process.env.DAILY_REPORT_SECRET_TOKEN || 'default-secret-token-change-me'
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const scheduler = getDailyReportScheduler()
    const report = await scheduler.executeDailyReport()

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error ejecutando informe diario',
      },
      { status: 500 }
    )
  }
}
