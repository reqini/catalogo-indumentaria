import { NextResponse } from 'next/server'
import PreTestChecklist from '@/qa/pre-test-checklist'

export async function POST(request: Request) {
  try {
    const { baseUrl } = await request.json()

    const checklist = new PreTestChecklist(
      baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    )
    const report = await checklist.runChecklist()

    // Generar reporte en texto
    const reportText = checklist.generateReport(report)

    return NextResponse.json({
      success: true,
      report,
      reportText,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error ejecutando checklist',
      },
      { status: 500 }
    )
  }
}
