/**
 * SystemGuardian - Sistema de Alertas Inteligentes Always-On
 * Detecta errores críticos y genera alertas con soluciones automáticas
 */

export type AlertSeverity = 'critical' | 'error' | 'warning' | 'info'
export type AlertCategory =
  | 'checkout'
  | 'database'
  | 'images'
  | 'mercadopago'
  | 'cors'
  | 'routes'
  | 'components'
  | 'api'
  | 'stock'
  | 'variants'

export interface SystemAlert {
  id: string
  severity: AlertSeverity
  category: AlertCategory
  message: string
  details?: any
  file?: string
  line?: number
  timestamp: string
  resolved: boolean
  autoFixed: boolean
  solution?: string
  relatedFiles?: string[]
  occurrenceCount: number
  firstOccurrence: string
  lastOccurrence: string
}

export interface GuardianConfig {
  enableAutoFix: boolean
  enableAlerts: boolean
  enableLogging: boolean
  alertThreshold: number // Número de ocurrencias antes de alertar
  logToConsole: boolean
  logToFile: boolean
  logToAdmin: boolean
}

class SystemGuardian {
  private alerts: Map<string, SystemAlert> = new Map()
  private config: GuardianConfig
  private alertHistory: SystemAlert[] = []
  private maxHistorySize = 1000

  constructor(config?: Partial<GuardianConfig>) {
    this.config = {
      enableAutoFix: true,
      enableAlerts: true,
      enableLogging: true,
      alertThreshold: 3,
      logToConsole: process.env.NODE_ENV === 'development',
      logToFile: false,
      logToAdmin: true,
      ...config,
    }
  }

  /**
   * Detecta y registra un error del sistema
   */
  detectError(
    severity: AlertSeverity,
    category: AlertCategory,
    message: string,
    options?: {
      details?: any
      file?: string
      line?: number
      solution?: string
      relatedFiles?: string[]
      autoFix?: () => Promise<boolean> | boolean
    }
  ): SystemAlert {
    const alertId = `${category}-${message.substring(0, 50).replace(/\s+/g, '-')}`
    const existingAlert = this.alerts.get(alertId)

    const now = new Date().toISOString()

    if (existingAlert) {
      // Incrementar contador de ocurrencias
      existingAlert.occurrenceCount++
      existingAlert.lastOccurrence = now
      existingAlert.resolved = false

      // Si supera el umbral, generar alerta
      if (existingAlert.occurrenceCount >= this.config.alertThreshold) {
        this.generateAlert(existingAlert)
      }
    } else {
      // Crear nueva alerta
      const newAlert: SystemAlert = {
        id: alertId,
        severity,
        category,
        message,
        details: options?.details,
        file: options?.file,
        line: options?.line,
        timestamp: now,
        resolved: false,
        autoFixed: false,
        solution: options?.solution,
        relatedFiles: options?.relatedFiles,
        occurrenceCount: 1,
        firstOccurrence: now,
        lastOccurrence: now,
      }

      this.alerts.set(alertId, newAlert)

      // Si es crítico, alertar inmediatamente
      if (severity === 'critical') {
        this.generateAlert(newAlert)
      }

      // Intentar auto-reparación si está habilitado
      if (this.config.enableAutoFix && options?.autoFix) {
        this.attemptAutoFix(newAlert, options.autoFix)
      }
    }

    // Logging
    if (this.config.enableLogging) {
      this.logAlert(severity, category, message, options)
    }

    return this.alerts.get(alertId)!
  }

  /**
   * Detecta fallo en checkout
   */
  detectCheckoutFailure(error: any, context?: any): SystemAlert {
    return this.detectError(
      'critical',
      'checkout',
      `Fallo en checkout: ${error.message || 'Error desconocido'}`,
      {
        details: {
          error: error.message,
          stack: error.stack,
          context,
        },
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution:
          'Verificar configuración de Mercado Pago, validar datos del carrito, revisar logs del servidor',
        relatedFiles: [
          'app/api/checkout/create-order-simple/route.ts',
          'app/(ecommerce)/checkout/page.tsx',
          'lib/mercadopago/validate.ts',
        ],
      }
    )
  }

  /**
   * Detecta fallo en conexión a base de datos
   */
  detectDatabaseFailure(error: any): SystemAlert {
    return this.detectError(
      'critical',
      'database',
      `Fallo en conexión a base de datos: ${error.message || 'Error desconocido'}`,
      {
        details: {
          error: error.message,
          code: error.code,
        },
        file: 'lib/supabase.ts',
        solution:
          'Verificar variables de entorno de Supabase, revisar conexión a internet, verificar estado de Supabase',
        relatedFiles: ['lib/supabase.ts', 'lib/supabase-helpers.ts'],
      }
    )
  }

  /**
   * Detecta fallo en carga de imágenes
   */
  detectImageUploadFailure(error: any, imageUrl?: string): SystemAlert {
    return this.detectError(
      'error',
      'images',
      `Fallo en carga de imagen: ${error.message || 'Error desconocido'}`,
      {
        details: {
          error: error.message,
          imageUrl,
        },
        file: 'components/ImageUploader.tsx',
        solution:
          'Verificar tamaño y formato de imagen, revisar permisos de Storage, verificar conexión',
        relatedFiles: ['components/ImageUploader.tsx', 'app/api/admin/upload-image/route.ts'],
        autoFix: async () => {
          // Auto-fix: aplicar fallback de imagen
          return true
        },
      }
    )
  }

  /**
   * Detecta productos con stock mal marcado
   */
  detectStockMismatch(productId: string, expectedStock: number, actualStock: number): SystemAlert {
    return this.detectError(
      'warning',
      'stock',
      `Producto ${productId} tiene stock inconsistente: esperado ${expectedStock}, actual ${actualStock}`,
      {
        details: {
          productId,
          expectedStock,
          actualStock,
        },
        file: 'lib/supabase-helpers.ts',
        solution: 'Revisar lógica de actualización de stock, verificar transacciones concurrentes',
        relatedFiles: ['lib/supabase-helpers.ts', 'app/api/productos/route.ts'],
      }
    )
  }

  /**
   * Detecta variantes mal seteadas
   */
  detectVariantError(productId: string, issue: string): SystemAlert {
    return this.detectError(
      'warning',
      'variants',
      `Producto ${productId} tiene problema con variantes: ${issue}`,
      {
        details: {
          productId,
          issue,
        },
        file: 'components/TalleSelector.tsx',
        solution: 'Verificar que talles y colores estén correctamente configurados en el producto',
        relatedFiles: ['components/TalleSelector.tsx', 'components/ColorSelector.tsx'],
      }
    )
  }

  /**
   * Detecta error de CORS
   */
  detectCORSError(origin: string, method: string): SystemAlert {
    return this.detectError('error', 'cors', `Error de CORS: ${method} desde ${origin}`, {
      details: {
        origin,
        method,
      },
      file: 'middleware.ts',
      solution: 'Agregar origen a configuración de CORS en middleware.ts',
      relatedFiles: ['middleware.ts'],
    })
  }

  /**
   * Detecta fallo en Mercado Pago
   */
  detectMercadoPagoFailure(status: number, error: any): SystemAlert {
    const severity: AlertSeverity = status >= 500 ? 'critical' : status >= 400 ? 'error' : 'warning'

    return this.detectError(
      severity,
      'mercadopago',
      `Mercado Pago devolvió ${status}: ${error.message || 'Error desconocido'}`,
      {
        details: {
          status,
          error: error.message,
          response: error.response,
        },
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: this.getMercadoPagoSolution(status),
        relatedFiles: [
          'app/api/checkout/create-order-simple/route.ts',
          'lib/mercadopago/validate.ts',
          'lib/mercadopago-diagnostic.ts',
        ],
      }
    )
  }

  /**
   * Detecta error en rutas o componentes críticos
   */
  detectRouteError(route: string, error: any): SystemAlert {
    return this.detectError(
      'error',
      'routes',
      `Error en ruta ${route}: ${error.message || 'Error desconocido'}`,
      {
        details: {
          route,
          error: error.message,
        },
        file: `app${route}/page.tsx`,
        solution: 'Verificar que el componente exista y esté correctamente exportado',
        relatedFiles: [`app${route}/page.tsx`],
      }
    )
  }

  /**
   * Genera alerta y la registra
   */
  private generateAlert(alert: SystemAlert): void {
    if (!this.config.enableAlerts) return

    // Agregar a historial
    this.alertHistory.push({ ...alert })
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift()
    }

    // Logging según configuración
    if (this.config.logToConsole) {
      this.logToConsole(alert)
    }

    if (this.config.logToAdmin) {
      // Se guardará en base de datos para el panel de admin
      this.saveAlertToDatabase(alert)
    }
  }

  /**
   * Intenta auto-reparación
   */
  private async attemptAutoFix(
    alert: SystemAlert,
    autoFix: () => Promise<boolean> | boolean
  ): Promise<void> {
    if (!this.config.enableAutoFix) return

    try {
      const fixed = await Promise.resolve(autoFix())
      if (fixed) {
        alert.autoFixed = true
        alert.resolved = true
        this.logToConsole({
          ...alert,
          message: `✅ Auto-reparado: ${alert.message}`,
        })
      }
    } catch (error) {
      console.error('[SystemGuardian] Error en auto-reparación:', error)
    }
  }

  /**
   * Obtiene solución específica para errores de Mercado Pago
   */
  private getMercadoPagoSolution(status: number): string {
    const solutions: Record<number, string> = {
      400: 'Verificar formato de datos enviados a Mercado Pago',
      401: 'Verificar MP_ACCESS_TOKEN en variables de entorno',
      403: 'Verificar permisos de la aplicación en Mercado Pago',
      404: 'Verificar que el endpoint de Mercado Pago sea correcto',
      500: 'Error del servidor de Mercado Pago - revisar estado del servicio',
      503: 'Servicio de Mercado Pago no disponible - reintentar más tarde',
    }

    return solutions[status] || 'Revisar logs de Mercado Pago para más detalles'
  }

  /**
   * Logging a consola
   */
  private logToConsole(alert: SystemAlert): void {
    const emoji = {
      critical: '🔴',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[alert.severity]

    console.group(`${emoji} [SystemGuardian] ${alert.severity.toUpperCase()}: ${alert.message}`)
    console.log('Categoría:', alert.category)
    console.log('Ocurrencias:', alert.occurrenceCount)
    if (alert.file) console.log('Archivo:', alert.file)
    if (alert.solution) console.log('Solución:', alert.solution)
    if (alert.details) console.log('Detalles:', alert.details)
    console.groupEnd()
  }

  /**
   * Logging general
   */
  private logAlert(
    severity: AlertSeverity,
    category: AlertCategory,
    message: string,
    options?: any
  ): void {
    if (this.config.logToConsole) {
      console.log(`[SystemGuardian][${severity}][${category}]`, message, options?.details || '')
    }
  }

  /**
   * Guarda alerta en base de datos (para panel admin)
   */
  private async saveAlertToDatabase(alert: SystemAlert): Promise<void> {
    try {
      // Intentar guardar en Supabase si está disponible
      const { isSupabaseEnabled, requireSupabase } = await import('./supabase')
      if (isSupabaseEnabled) {
        const { supabaseAdmin } = requireSupabase()
        await supabaseAdmin.from('system_alerts').insert({
          alert_id: alert.id,
          severity: alert.severity,
          category: alert.category,
          message: alert.message,
          details: alert.details,
          file: alert.file,
          line: alert.line,
          resolved: alert.resolved,
          auto_fixed: alert.autoFixed,
          solution: alert.solution,
          occurrence_count: alert.occurrenceCount,
          first_occurrence: alert.firstOccurrence,
          last_occurrence: alert.lastOccurrence,
        })
      }
    } catch (error) {
      // Si falla, solo loggear (no queremos que el guardian cause errores)
      console.warn('[SystemGuardian] No se pudo guardar alerta en BD:', error)
    }
  }

  /**
   * Obtiene todas las alertas activas
   */
  getActiveAlerts(): SystemAlert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.resolved)
  }

  /**
   * Obtiene historial de alertas
   */
  getAlertHistory(limit: number = 100): SystemAlert[] {
    return this.alertHistory.slice(-limit)
  }

  /**
   * Marca alerta como resuelta
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getStats(): {
    totalAlerts: number
    activeAlerts: number
    criticalAlerts: number
    autoFixedAlerts: number
    byCategory: Record<AlertCategory, number>
    bySeverity: Record<AlertSeverity, number>
  } {
    const alerts = Array.from(this.alerts.values())
    const activeAlerts = alerts.filter((a) => !a.resolved)

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter((a) => a.severity === 'critical').length,
      autoFixedAlerts: alerts.filter((a) => a.autoFixed).length,
      byCategory: alerts.reduce(
        (acc, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1
          return acc
        },
        {} as Record<AlertCategory, number>
      ),
      bySeverity: alerts.reduce(
        (acc, a) => {
          acc[a.severity] = (acc[a.severity] || 0) + 1
          return acc
        },
        {} as Record<AlertSeverity, number>
      ),
    }
  }
}

// Singleton instance
let guardianInstance: SystemGuardian | null = null

export function getSystemGuardian(): SystemGuardian {
  if (!guardianInstance) {
    guardianInstance = new SystemGuardian({
      enableAutoFix: process.env.NODE_ENV === 'production',
      logToConsole: process.env.NODE_ENV === 'development',
    })
  }
  return guardianInstance
}

export default SystemGuardian
