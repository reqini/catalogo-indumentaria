/**
 * Sistema de Alertas Severas - Modo Guardián Activo
 * Genera alertas automáticas cuando fallan funciones críticas
 */

import { getSystemGuardian } from './system-guardian'

export interface SevereAlert {
  id: string
  module: string
  error: string
  impact: 'low' | 'medium' | 'high' | 'lethal'
  actionExecuted: string
  status: 'pending' | 'resolved' | 'in_progress'
  timestamp: string
  resolvedAt?: string
  autoFixed: boolean
}

class SevereAlerts {
  private guardian = getSystemGuardian()
  private alerts: Map<string, SevereAlert> = new Map()

  /**
   * Genera alerta severa cuando falla una función crítica
   */
  generateSevereAlert(
    module: string,
    error: string,
    impact: 'low' | 'medium' | 'high' | 'lethal',
    actionExecuted: string = 'Ninguna',
    autoFixed: boolean = false
  ): SevereAlert {
    const alertId = `${module}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const alert: SevereAlert = {
      id: alertId,
      module,
      error,
      impact,
      actionExecuted,
      status: 'pending',
      timestamp: new Date().toISOString(),
      autoFixed,
    }

    this.alerts.set(alertId, alert)

    // Registrar en guardian también
    const severity = impact === 'lethal' ? 'critical' : impact === 'high' ? 'error' : 'warning'
    this.guardian.detectError(
      severity,
      'api',
      `⚠️ ALERTA SEVERA – FUNCIÓN CRÍTICA FALLÓ: ${module}`,
      {
        details: {
          error,
          impact,
          actionExecuted,
          autoFixed,
        },
        solution: this.getSolutionForModule(module),
      }
    )

    // Logging
    console.error('='.repeat(60))
    console.error('⚠️ ALERTA SEVERA – FUNCIÓN CRÍTICA FALLÓ')
    console.error('='.repeat(60))
    console.error(`Módulo: ${module}`)
    console.error(`Error: ${error}`)
    console.error(`Impacto: ${impact.toUpperCase()}`)
    console.error(`Acción ejecutada: ${actionExecuted}`)
    console.error(`Estado: ${alert.status.toUpperCase()}`)
    console.error(`Auto-fix: ${autoFixed ? 'Sí' : 'No'}`)
    console.error('='.repeat(60))

    return alert
  }

  /**
   * Alerta cuando falla envío
   */
  alertShippingFailure(error: any): SevereAlert {
    return this.generateSevereAlert(
      'ENVÍO',
      `Fallo en cálculo de envío: ${error.message || 'Error desconocido'}`,
      'high',
      'Se intentó calcular envío pero falló',
      false
    )
  }

  /**
   * Alerta cuando falla checkout
   */
  alertCheckoutFailure(error: any): SevereAlert {
    return this.generateSevereAlert(
      'CHECKOUT',
      `Fallo en checkout: ${error.message || 'Error desconocido'}`,
      'lethal',
      'Se intentó procesar checkout pero falló',
      false
    )
  }

  /**
   * Alerta cuando falla Mercado Pago
   */
  alertMercadoPagoFailure(status: number, error: any): SevereAlert {
    const impact: 'low' | 'medium' | 'high' | 'lethal' =
      status >= 500 ? 'lethal' : status >= 400 ? 'high' : 'medium'

    return this.generateSevereAlert(
      'MERCADO_PAGO',
      `Mercado Pago devolvió ${status}: ${error.message || 'Error desconocido'}`,
      impact,
      `Se intentó crear preferencia de pago pero MP devolvió ${status}`,
      false
    )
  }

  /**
   * Alerta cuando falla stock
   */
  alertStockFailure(productId: string, issue: string): SevereAlert {
    return this.generateSevereAlert(
      'STOCK',
      `Problema con stock del producto ${productId}: ${issue}`,
      'high',
      'Se detectó inconsistencia en stock',
      false
    )
  }

  /**
   * Alerta cuando fallan variantes
   */
  alertVariantFailure(productId: string, issue: string): SevereAlert {
    return this.generateSevereAlert(
      'VARIANTES',
      `Problema con variantes del producto ${productId}: ${issue}`,
      'medium',
      'Se detectó problema con talles/colores',
      false
    )
  }

  /**
   * Alerta cuando falla carga de imágenes
   */
  alertImageUploadFailure(error: any): SevereAlert {
    return this.generateSevereAlert(
      'IMÁGENES',
      `Fallo en carga de imagen: ${error.message || 'Error desconocido'}`,
      'medium',
      'Se intentó subir imagen pero falló',
      true // Puede auto-fixearse con fallback
    )
  }

  /**
   * Alerta cuando falla Google Sheets (si se usa)
   */
  alertGoogleSheetsFailure(error: any): SevereAlert {
    return this.generateSevereAlert(
      'GOOGLE_SHEETS',
      `Fallo en conexión a Google Sheets: ${error.message || 'Error desconocido'}`,
      'high',
      'Se intentó acceder a Google Sheets pero falló',
      false
    )
  }

  /**
   * Obtiene solución específica para cada módulo
   */
  private getSolutionForModule(module: string): string {
    const solutions: Record<string, string> = {
      ENVÍO: 'Verificar endpoint /api/envios/calcular, revisar configuración de transportistas',
      CHECKOUT:
        'Revisar endpoint /api/checkout/create-order-simple, verificar validaciones y stock',
      MERCADO_PAGO:
        'Verificar MP_ACCESS_TOKEN en variables de entorno, revisar configuración de Mercado Pago',
      STOCK: 'Revisar lógica de actualización de stock, verificar transacciones concurrentes',
      VARIANTES: 'Verificar que talles y colores estén correctamente configurados en productos',
      IMÁGENES: 'Verificar permisos de Storage, revisar tamaño y formato de imágenes',
      GOOGLE_SHEETS: 'Verificar credenciales de Google Sheets, revisar permisos y configuración',
    }

    return solutions[module] || 'Revisar logs del servidor para más detalles'
  }

  /**
   * Marca alerta como resuelta
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.resolvedAt = new Date().toISOString()
    }
  }

  /**
   * Obtiene alertas pendientes
   */
  getPendingAlerts(): SevereAlert[] {
    return Array.from(this.alerts.values()).filter((a) => a.status === 'pending')
  }

  /**
   * Obtiene todas las alertas
   */
  getAllAlerts(): SevereAlert[] {
    return Array.from(this.alerts.values())
  }

  /**
   * Obtiene estadísticas de alertas
   */
  getStats(): {
    total: number
    pending: number
    resolved: number
    byImpact: Record<string, number>
    byModule: Record<string, number>
  } {
    const alerts = Array.from(this.alerts.values())

    return {
      total: alerts.length,
      pending: alerts.filter((a) => a.status === 'pending').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      byImpact: alerts.reduce(
        (acc, a) => {
          acc[a.impact] = (acc[a.impact] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      byModule: alerts.reduce(
        (acc, a) => {
          acc[a.module] = (acc[a.module] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
    }
  }
}

// Singleton
let alertsInstance: SevereAlerts | null = null

export function getSevereAlerts(): SevereAlerts {
  if (!alertsInstance) {
    alertsInstance = new SevereAlerts()
  }
  return alertsInstance
}

export default SevereAlerts
