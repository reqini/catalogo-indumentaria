import { NextResponse } from 'next/server'
import { VirtualUser } from '@/qa/virtual-users'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const baseUrl = body.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const virtualUser = new VirtualUser(baseUrl)
    const results = await virtualUser.runAllTests()
    const report = virtualUser.generateReport()

    const allSuccess = results.every((r) => r.success)
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

    return NextResponse.json(
      {
        success: allSuccess,
        results,
        report,
        summary: {
          totalTests: results.length,
          passedTests: results.filter((r) => r.success).length,
          failedTests: results.filter((r) => !r.success).length,
          totalDuration,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: allSuccess ? 200 : 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error ejecutando tests de usuario virtual',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
