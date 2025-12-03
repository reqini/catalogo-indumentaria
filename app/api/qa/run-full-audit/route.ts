import { NextResponse } from 'next/server'
import FullAudit from '@/qa/full-audit'

export async function POST(request: Request) {
  try {
    const { baseUrl } = await request.json()

    const audit = new FullAudit(
      baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    )
    const report = await audit.runFullAudit()

    // Generar reporte en texto
    const reportText = audit.generateReport(report)

    return NextResponse.json({
      success: true,
      report,
      reportText,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error ejecutando auditoría',
      },
      { status: 500 }
    )
  }
}
