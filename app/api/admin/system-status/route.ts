import { NextResponse } from 'next/server'
import { getSystemGuardian } from '@/lib/system-guardian'

export async function GET() {
  try {
    const guardian = getSystemGuardian()
    const stats = guardian.getStats()
    const activeAlerts = guardian.getActiveAlerts()
    const recentAlerts = guardian.getAlertHistory(10)

    // Simular KPIs (en producción vendrían de métricas reales)
    const status = {
      overall:
        stats.criticalAlerts > 0 ? 'critical' : stats.activeAlerts > 5 ? 'warning' : 'stable',
      kpis: {
        avgApiLatency: 150, // ms - en producción vendría de métricas reales
        checkoutFailures: stats.byCategory.checkout || 0,
        imageUploadFailures: stats.byCategory.images || 0,
        mercadoPagoFailures: stats.byCategory.mercadopago || 0,
        productsWithErrors: 0, // En producción vendría de base de datos
      },
      virtualUsers: {
        active: true,
        lastRun: new Date().toISOString(),
        lastResult: 'passed' as const,
      },
      lastQA: {
        timestamp: new Date().toISOString(),
        status:
          stats.criticalAlerts > 0 ? 'failed' : stats.activeAlerts > 5 ? 'unstable' : 'stable',
        totalTests: 10,
        passedTests: 10 - stats.activeAlerts,
        failedTests: stats.activeAlerts,
      },
      lastAutoRepair: {
        timestamp: new Date().toISOString(),
        repaired: stats.autoFixedAlerts > 0,
        message:
          stats.autoFixedAlerts > 0
            ? `${stats.autoFixedAlerts} problema(s) auto-reparado(s)`
            : 'No se requirió reparación',
      },
      recentAlerts: recentAlerts.map((alert) => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
      })),
    }

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        overall: 'critical',
        error: error.message || 'Error obteniendo estado del sistema',
      },
      { status: 500 }
    )
  }
}
