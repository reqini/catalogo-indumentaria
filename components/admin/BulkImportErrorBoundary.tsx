'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary para la herramienta de carga masiva
 * Previene que errores rompan toda la UI
 */
export class BulkImportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[BulkImportErrorBoundary] Error capturado:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Log del error (en producción, enviar a servicio de logging)
    if (typeof window !== 'undefined') {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }

      // Guardar en localStorage como fallback
      try {
        const logs = JSON.parse(localStorage.getItem('bulk_import_errors') || '[]')
        logs.push(errorLog)
        // Mantener solo últimos 10 errores
        const logsLimitados = logs.slice(-10)
        localStorage.setItem('bulk_import_errors', JSON.stringify(logsLimitados))
      } catch (e) {
        // Ignorar errores de localStorage
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="text-red-500" size={48} />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-black">
                  Error en la herramienta de carga masiva
                </h2>
                <p className="mb-4 text-gray-600">
                  Ocurrió un error inesperado. No te preocupes, tus datos están seguros.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-red-800">Detalles técnicos:</p>
                    <p className="font-mono text-sm text-red-700">{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-600">
                          Ver stack trace
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-600">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    <RefreshCw size={20} />
                    Reintentar
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Recargar página
                  </button>
                </div>

                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Sugerencia:</strong> Si el problema persiste, intentá con menos
                    productos o verificá el formato de tus datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default BulkImportErrorBoundary
