/**
 * Bulk Import Error Handler - Manejo inteligente de errores
 * Versión 2.0
 */

export interface ImportError {
  tipo: 'critical' | 'error' | 'warning' | 'info'
  codigo: string
  mensaje: string
  mensajeAmigable: string
  fila?: number
  campo?: string
  valor?: any
  solucion?: string
  autoFixable?: boolean
  timestamp: string
}

export interface ErrorLog {
  id: string
  fecha: string
  errores: ImportError[]
  contexto: {
    archivo?: string
    formato?: string
    totalProductos?: number
    productosExitosos?: number
  }
}

class BulkImportErrorHandler {
  private errors: ImportError[] = []
  private maxRetries = 3
  private retryDelay = 1000 // ms

  /**
   * Registra un error
   */
  logError(
    tipo: ImportError['tipo'],
    codigo: string,
    mensaje: string,
    options: {
      fila?: number
      campo?: string
      valor?: any
      solucion?: string
      autoFixable?: boolean
    } = {}
  ): ImportError {
    const error: ImportError = {
      tipo,
      codigo,
      mensaje,
      mensajeAmigable: this.generateFriendlyMessage(codigo, mensaje, options),
      fila: options.fila,
      campo: options.campo,
      valor: options.valor,
      solucion: options.solucion,
      autoFixable: options.autoFixable ?? false,
      timestamp: new Date().toISOString(),
    }

    this.errors.push(error)

    // Log en consola solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error(`[BulkImportError] ${tipo.toUpperCase()}:`, error)
    }

    return error
  }

  /**
   * Genera mensaje amigable para el usuario
   */
  private generateFriendlyMessage(
    codigo: string,
    mensaje: string,
    options: { fila?: number; campo?: string; valor?: any; solucion?: string }
  ): string {
    const filaText = options.fila ? ` en la fila ${options.fila}` : ''
    const campoText = options.campo ? ` del campo "${options.campo}"` : ''
    const valorText = options.valor ? ` (valor: "${options.valor}")` : ''
    const solucionText = options.solucion ? `\n💡 Solución: ${options.solucion}` : ''

    const mensajesCodigo: Record<string, string> = {
      PRECIO_INVALIDO: `Precio inválido${filaText}${campoText}${valorText}.${solucionText}`,
      STOCK_INVALIDO: `Stock inválido${filaText}${campoText}${valorText}.${solucionText}`,
      NOMBRE_VACIO: `El nombre del producto es requerido${filaText}.${solucionText}`,
      CATEGORIA_VACIA: `La categoría es requerida${filaText}.${solucionText}`,
      IMAGEN_INVALIDA: `URL de imagen inválida${filaText}${campoText}${valorText}.${solucionText}`,
      ARCHIVO_DEMASIADO_GRANDE: `El archivo es demasiado grande. Tamaño máximo: 10MB.${solucionText}`,
      FORMATO_NO_SOPORTADO: `Formato de archivo no soportado${valorText}. Formatos válidos: CSV, XLSX, JSON, TXT.${solucionText}`,
      ERROR_PARSE: `Error al procesar el archivo${filaText}.${solucionText}`,
      ERROR_NETWORK: `Error de conexión. Verificá tu internet e intentá nuevamente.${solucionText}`,
      ERROR_TIMEOUT: `La operación tardó demasiado. Intentá con menos productos o un archivo más pequeño.${solucionText}`,
      DUPLICADO: `Producto duplicado detectado${filaText}.${solucionText}`,
    }

    return mensajesCodigo[codigo] || mensaje
  }

  /**
   * Intenta auto-reparar un error
   */
  async tryAutoFix(error: ImportError): Promise<{ fixed: boolean; newValue?: any }> {
    if (!error.autoFixable) {
      return { fixed: false }
    }

    try {
      switch (error.codigo) {
        case 'PRECIO_INVALIDO':
          if (error.valor) {
            const fixed = this.fixPrice(error.valor)
            if (fixed > 0) {
              return { fixed: true, newValue: fixed }
            }
          }
          break

        case 'STOCK_INVALIDO':
          if (error.valor !== undefined) {
            const fixed = this.fixStock(error.valor)
            if (fixed >= 0) {
              return { fixed: true, newValue: fixed }
            }
          }
          break

        case 'NOMBRE_VACIO':
          // No se puede auto-reparar
          break

        case 'CATEGORIA_VACIA':
          // Intentar inferir desde nombre
          if (error.valor) {
            // Esto se haría con el parser
            return { fixed: false }
          }
          break
      }
    } catch (fixError) {
      console.error('[BulkImportError] Error en auto-fix:', fixError)
    }

    return { fixed: false }
  }

  /**
   * Repara precio mal formateado
   */
  private fixPrice(valor: any): number {
    if (typeof valor === 'number') return valor > 0 ? valor : 0

    const str = String(valor)
      .replace(/[^\d.,]/g, '')
      .replace(/\.(?=\d{3})/g, '')
      .replace(',', '.')

    const parsed = parseFloat(str)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * Repara stock inválido
   */
  private fixStock(valor: any): number {
    if (typeof valor === 'number') return Math.max(0, valor)

    const parsed = parseInt(String(valor))
    return isNaN(parsed) ? 0 : Math.max(0, parsed)
  }

  /**
   * Ejecuta función con retry automático
   */
  async executeWithRetry<T>(fn: () => Promise<T>, context: string = 'operación'): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error: any) {
        lastError = error

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt
          console.warn(
            `[BulkImportError] Reintento ${attempt}/${this.maxRetries} para ${context} en ${delay}ms`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    this.logError(
      'error',
      'ERROR_NETWORK',
      `Error después de ${this.maxRetries} intentos: ${lastError?.message}`,
      { solucion: 'Verificá tu conexión e intentá nuevamente' }
    )

    throw lastError || new Error('Error desconocido')
  }

  /**
   * Obtiene todos los errores
   */
  getErrors(): ImportError[] {
    return [...this.errors]
  }

  /**
   * Obtiene errores críticos
   */
  getCriticalErrors(): ImportError[] {
    return this.errors.filter((e) => e.tipo === 'critical')
  }

  /**
   * Obtiene errores auto-reparables
   */
  getAutoFixableErrors(): ImportError[] {
    return this.errors.filter((e) => e.autoFixable)
  }

  /**
   * Limpia errores
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Genera log estructurado
   */
  generateLog(contexto: ErrorLog['contexto']): ErrorLog {
    return {
      id: `log-${Date.now()}`,
      fecha: new Date().toISOString(),
      errores: [...this.errors],
      contexto,
    }
  }

  /**
   * Guarda log en almacenamiento
   */
  async saveLog(log: ErrorLog): Promise<void> {
    try {
      // Guardar en Supabase si está disponible
      try {
        const supabaseModule = await import('../supabase').catch(() => null)
        if (supabaseModule && supabaseModule.isSupabaseEnabled) {
          const { supabaseAdmin } = supabaseModule.requireSupabase()
          await supabaseAdmin.from('import_logs').insert({
            log_id: log.id,
            fecha: log.fecha,
            errores: log.errores,
            contexto: log.contexto,
            log_data: log,
          })
          return
        }
      } catch (supabaseError) {
        // Continuar con fallback
      }

      // Fallback: guardar en localStorage (cliente) o archivo (servidor)
      if (typeof window !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem('import_logs') || '[]')
        logs.push(log)
        // Mantener solo últimos 50 logs
        const logsLimitados = logs.slice(-50)
        localStorage.setItem('import_logs', JSON.stringify(logsLimitados))
      }
    } catch (error) {
      console.error('[BulkImportError] Error guardando log:', error)
    }
  }
}

// Singleton
let errorHandlerInstance: BulkImportErrorHandler | null = null

export function getBulkImportErrorHandler(): BulkImportErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new BulkImportErrorHandler()
  }
  return errorHandlerInstance
}

export default BulkImportErrorHandler
