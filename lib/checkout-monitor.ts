/**
 * Monitor 24/7 del Checkout y Mercado Pago
 * Intercepta errores y genera reportes detallados
 */

import { getSystemGuardian } from './system-guardian'

export interface CheckoutMonitorResult {
  success: boolean
  timestamp: string
  duration: number
  errors: CheckoutError[]
  warnings: string[]
  mercadopagoStatus?: number
  orderCreated?: boolean
  preferenceCreated?: boolean
}

export interface CheckoutError {
  type: 'validation' | 'mercadopago' | 'database' | 'network' | 'unknown'
  message: string
  details?: any
  file?: string
  line?: number
  solution?: string
}

class CheckoutMonitor {
  private guardian = getSystemGuardian()

  /**
   * Monitorea una solicitud de checkout
   */
  async monitorCheckoutRequest(
    requestBody: any,
    handler: () => Promise<any>
  ): Promise<{ result: any; monitorResult: CheckoutMonitorResult }> {
    const startTime = Date.now()
    const errors: CheckoutError[] = []
    const warnings: string[] = []

    try {
      // Validar formato del body antes de procesar
      this.validateCheckoutBody(requestBody, errors, warnings)

      // Ejecutar handler con monitoreo
      const result = await handler()

      // Verificar resultado
      if (!result || !result.ok) {
        errors.push({
          type: 'unknown',
          message: 'Checkout devolvió resultado inválido',
          details: result,
        })
      }

      const duration = Date.now() - startTime

      const monitorResult: CheckoutMonitorResult = {
        success: errors.length === 0,
        timestamp: new Date().toISOString(),
        duration,
        errors,
        warnings,
        orderCreated: result?.orderId !== undefined,
        preferenceCreated: result?.preferenceId !== undefined,
      }

      // Si hay errores, registrar en guardian
      if (errors.length > 0) {
        errors.forEach((error) => {
          this.guardian.detectError('critical', 'checkout', `Error en checkout: ${error.message}`, {
            details: error.details,
            file: error.file,
            line: error.line,
            solution: error.solution,
          })
        })
      }

      return { result, monitorResult }
    } catch (error: any) {
      const duration = Date.now() - startTime

      // Analizar tipo de error
      const checkoutError = this.analyzeError(error)

      errors.push(checkoutError)

      // Registrar en guardian
      this.guardian.detectCheckoutFailure(error, {
        requestBody,
        duration,
      })

      const monitorResult: CheckoutMonitorResult = {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        errors,
        warnings,
      }

      throw error // Re-lanzar para que el endpoint maneje el error
    }
  }

  /**
   * Monitorea respuesta de Mercado Pago
   */
  monitorMercadoPagoResponse(status: number, response: any): void {
    if (status >= 400) {
      this.guardian.detectMercadoPagoFailure(status, {
        message: `Mercado Pago devolvió ${status}`,
        response,
      })
    }

    // Validar formato de preferencia
    if (status === 200 || status === 201) {
      this.validatePreferenceFormat(response, status)
    }
  }

  /**
   * Valida formato del body de checkout
   */
  private validateCheckoutBody(body: any, errors: CheckoutError[], warnings: string[]): void {
    // Validar productos
    if (!body.productos || !Array.isArray(body.productos) || body.productos.length === 0) {
      errors.push({
        type: 'validation',
        message: 'El carrito está vacío',
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar que el carrito tenga productos antes de checkout',
      })
    }

    // Validar comprador
    if (!body.comprador || !body.comprador.email || !body.comprador.nombre) {
      errors.push({
        type: 'validation',
        message: 'Datos del comprador incompletos',
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar que se envíen email y nombre del comprador',
      })
    }

    // Validar envío
    if (!body.envio || !body.envio.tipo) {
      errors.push({
        type: 'validation',
        message: 'Tipo de envío no especificado',
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar que se especifique tipo de envío',
      })
    }

    // Validar total
    if (!body.total || body.total <= 0) {
      errors.push({
        type: 'validation',
        message: 'Total inválido o cero',
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar cálculo del total',
      })
    }

    // Warnings
    if (body.productos && body.productos.length > 10) {
      warnings.push('Carrito con más de 10 productos - puede causar problemas de rendimiento')
    }
  }

  /**
   * Valida formato de preferencia de Mercado Pago
   */
  private validatePreferenceFormat(preference: any, status: number): void {
    const errors: CheckoutError[] = []

    if (!preference.init_point && !preference.sandbox_init_point) {
      errors.push({
        type: 'mercadopago',
        message: 'Preferencia de Mercado Pago sin init_point',
        details: preference,
        solution: 'Verificar que Mercado Pago devuelva init_point o sandbox_init_point',
      })
    }

    if (!preference.id) {
      errors.push({
        type: 'mercadopago',
        message: 'Preferencia de Mercado Pago sin ID',
        details: preference,
        solution: 'Verificar respuesta de Mercado Pago',
      })
    }

    if (errors.length > 0) {
      errors.forEach((error) => {
        this.guardian.detectError('error', 'mercadopago', error.message, {
          details: error.details,
          solution: error.solution,
        })
      })
    }
  }

  /**
   * Analiza un error y determina su tipo
   */
  private analyzeError(error: any): CheckoutError {
    const message = error.message || 'Error desconocido'

    // Error de validación
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      error.name === 'ZodError'
    ) {
      return {
        type: 'validation',
        message,
        details: error.errors || error,
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar formato de datos enviados',
      }
    }

    // Error de Mercado Pago
    if (message.includes('Mercado Pago') || message.includes('MP_') || error.response?.status) {
      return {
        type: 'mercadopago',
        message,
        details: error.response || error,
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution: 'Verificar configuración de Mercado Pago',
      }
    }

    // Error de base de datos
    if (message.includes('PGRST') || message.includes('Supabase') || message.includes('database')) {
      return {
        type: 'database',
        message,
        details: error,
        file: 'lib/supabase-helpers.ts',
        solution: 'Verificar conexión a Supabase',
      }
    }

    // Error de red
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return {
        type: 'network',
        message,
        details: error,
        solution: 'Verificar conexión a internet',
      }
    }

    // Error desconocido
    return {
      type: 'unknown',
      message,
      details: error,
      solution: 'Revisar logs del servidor para más detalles',
    }
  }

  /**
   * Genera reporte de checkout
   */
  generateReport(result: CheckoutMonitorResult): string {
    let report = `# 📊 Reporte de Checkout\n\n`
    report += `**Fecha:** ${new Date(result.timestamp).toLocaleString('es-AR')}\n\n`
    report += `**Estado:** ${result.success ? '✅ ÉXITO' : '❌ FALLÓ'}\n`
    report += `**Duración:** ${result.duration}ms\n\n`

    if (result.errors.length > 0) {
      report += `## Errores (${result.errors.length})\n\n`
      result.errors.forEach((error, index) => {
        report += `### ${index + 1}. ${error.message}\n`
        report += `- **Tipo:** ${error.type}\n`
        if (error.file) report += `- **Archivo:** ${error.file}\n`
        if (error.solution) report += `- **Solución:** ${error.solution}\n`
        report += '\n'
      })
    }

    if (result.warnings.length > 0) {
      report += `## Advertencias (${result.warnings.length})\n\n`
      result.warnings.forEach((warning) => {
        report += `- ⚠️ ${warning}\n`
      })
      report += '\n'
    }

    return report
  }
}

// Singleton
let monitorInstance: CheckoutMonitor | null = null

export function getCheckoutMonitor(): CheckoutMonitor {
  if (!monitorInstance) {
    monitorInstance = new CheckoutMonitor()
  }
  return monitorInstance
}

export default CheckoutMonitor
