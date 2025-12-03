import { NextResponse } from 'next/server'
import { AutomatedQA } from '@/qa/automated-qa'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const baseUrl = body.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const qa = new AutomatedQA(baseUrl)
    const report = await qa.runAllTests()
    const reportText = qa.generateReport()

    return NextResponse.json(
      {
        ...report,
        reportText,
      },
      {
        status: report.failedTests > 0 ? 500 : 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        error: error.message || 'Error ejecutando QA automatizado',
      },
      { status: 500 }
    )
  }
}
