/**
 * ConsoleInterceptor: Intercepta console.error y console.warn
 * para enviarlos al AutoFixEngine
 */

import { AutoFixEngine } from './AutoFixEngine'

let originalConsoleError: typeof console.error
let originalConsoleWarn: typeof console.warn
let isIntercepted = false

export function interceptConsole(): void {
  if (isIntercepted) return
  if (typeof window === 'undefined') return // Solo en cliente

  originalConsoleError = console.error
  originalConsoleWarn = console.warn

  console.error = (...args: any[]) => {
    originalConsoleError.apply(console, args)

    // Intentar extraer Error object
    const error = args.find((arg) => arg instanceof Error) || args[0]
    const message = error instanceof Error ? error.message : String(error)

    if (message && typeof message === 'string') {
      AutoFixEngine.handleConsoleError(message, error instanceof Error ? error : undefined, {
        args,
        timestamp: new Date().toISOString(),
      })
    }
  }

  console.warn = (...args: any[]) => {
    originalConsoleWarn.apply(console, args)

    // Algunos warnings también pueden ser errores
    const message = String(args[0])
    if (message.includes('Warning:') || message.includes('Error:')) {
      AutoFixEngine.handleConsoleError(message, undefined, {
        args,
        timestamp: new Date().toISOString(),
        isWarning: true,
      })
    }
  }

  isIntercepted = true
}

export function restoreConsole(): void {
  if (!isIntercepted) return

  if (originalConsoleError) {
    console.error = originalConsoleError
  }
  if (originalConsoleWarn) {
    console.warn = originalConsoleWarn
  }

  isIntercepted = false
}

