/**
 * AutoFixEngine: Motor principal de detección y corrección automática de errores
 */

import { fixRegistry, FixResult } from './FixRegistry'
import { logger } from './Logger'

export interface ErrorContext {
  filePath?: string
  componentStack?: string
  errorInfo?: any
  args?: any[]
  timestamp?: string
  isWarning?: boolean
  [key: string]: any
}

export class AutoFixEngineClass {
  private enabled: boolean = false
  private fixesApplied: Map<string, FixResult> = new Map()

  init(): void {
    // Solo activar en desarrollo y si no está deshabilitado explícitamente
    if (process.env.AUTO_FIX === 'false') {
      logger.info('AutoFix deshabilitado por AUTO_FIX=false')
      return
    }

    if (process.env.NODE_ENV !== 'development') {
      logger.info('AutoFix solo está disponible en modo desarrollo')
      return
    }

    this.enabled = true
    logger.info('AutoFixEngine inicializado', {
      timestamp: new Date().toISOString(),
    })

    // Interceptar errores no capturados (solo en cliente)
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Error handler global
    window.addEventListener('error', (event) => {
      if (this.enabled) {
        this.handleClientError(
          new Error(event.message),
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
          }
        )
      }
    })

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      if (this.enabled) {
        const error =
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason))
        this.handleClientError(error, {
          type: 'unhandledRejection',
        })
      }
    })
  }

  async handleClientError(
    error: Error,
    context?: ErrorContext
  ): Promise<FixResult | null> {
    if (!this.enabled) {
      return null
    }

    logger.error('Error detectado en cliente:', {
      message: error.message,
      stack: error.stack,
      context,
    })

    // Intentar encontrar y aplicar fix
    const fixResult = await fixRegistry.findAndApplyFix(error, context)

    if (fixResult) {
      const fixKey = `${error.message}-${Date.now()}`
      this.fixesApplied.set(fixKey, fixResult)

      // Mostrar notificación visual si está disponible
      if (typeof window !== 'undefined' && fixResult.success) {
        this.showNotification(fixResult)
      }

      return fixResult
    }

    return null
  }

  async handleConsoleError(
    message: string,
    error?: Error,
    context?: ErrorContext
  ): Promise<FixResult | null> {
    if (!this.enabled) {
      return null
    }

    // Crear Error object si no existe
    const errorObj = error || new Error(message)

    logger.warn('Error detectado en consola:', {
      message,
      error: errorObj.message,
      context,
    })

    // Intentar encontrar y aplicar fix
    const fixResult = await fixRegistry.findAndApplyFix(errorObj, context)

    if (fixResult && fixResult.success) {
      const fixKey = `console-${message}-${Date.now()}`
      this.fixesApplied.set(fixKey, fixResult)

      this.showNotification(fixResult)
    }

    return fixResult
  }

  async handleServerError(
    error: Error,
    context?: ErrorContext
  ): Promise<FixResult | null> {
    if (!this.enabled) {
      return null
    }

    logger.error('Error detectado en servidor:', {
      message: error.message,
      stack: error.stack,
      context,
    })

    // En servidor, solo loguear (no podemos aplicar fixes en runtime)
    const fixResult = await fixRegistry.findAndApplyFix(error, context)

    if (fixResult) {
      logger.fix(
        fixResult.action,
        context?.filePath,
        fixResult.action,
        fixResult.success ? 'success' : 'failed',
        fixResult.message,
        fixResult.data
      )
    }

    return fixResult
  }

  private showNotification(fixResult: FixResult): void {
    if (typeof window === 'undefined') return

    // Crear notificación visual simple
    const notification = document.createElement('div')
    notification.className =
      'fixed top-4 right-4 bg-black text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md'
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="font-semibold">AutoFix aplicado</p>
          <p class="text-sm text-gray-300 mt-1">${fixResult.message}</p>
          ${fixResult.requiresRestart ? '<p class="text-xs text-yellow-300 mt-2">⚠️ Recarga requerida</p>' : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  getFixesApplied(): FixResult[] {
    return Array.from(this.fixesApplied.values())
  }

  clearFixes(): void {
    this.fixesApplied.clear()
  }

  isEnabled(): boolean {
    return this.enabled
  }

  disable(): void {
    this.enabled = false
    logger.info('AutoFixEngine deshabilitado')
  }

  enable(): void {
    if (process.env.NODE_ENV === 'development' && process.env.AUTO_FIX !== 'false') {
      this.enabled = true
      logger.info('AutoFixEngine habilitado')
    }
  }
}

export const AutoFixEngine = new AutoFixEngineClass()

