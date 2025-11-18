/**
 * ErrorBoundary mejorado para AutoFix
 * Captura errores de render y los envía al AutoFixEngine
 */

'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { AutoFixEngine } from './AutoFixEngine'
import { logger } from './Logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  fixAttempted: boolean
  fixResult?: {
    success: boolean
    message: string
    requiresRestart?: boolean
  }
}

export class AutoFixErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      fixAttempted: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo): Promise<void> {
    this.setState({ errorInfo })

    // Intentar auto-fix
    if (!this.state.fixAttempted && process.env.NODE_ENV === 'development') {
      this.setState({ fixAttempted: true })

      try {
        const fixResult = await AutoFixEngine.handleClientError(error, {
          componentStack: errorInfo?.componentStack || undefined,
          errorInfo,
        })

        if (fixResult) {
          this.setState({ fixResult })

          if (fixResult.success && fixResult.requiresRestart) {
            logger.info('Fix aplicado, se requiere recarga de página')
            // No recargar automáticamente, dejar que el usuario lo haga
          }
        }
      } catch (fixError) {
        logger.error('Error en AutoFix durante componentDidCatch:', fixError)
      }
    }

    // Log del error
    logger.error('ErrorBoundary capturó un error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      fixAttempted: false,
      fixResult: undefined,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, fixResult } = this.state

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <AlertCircle className="text-red-500" size={48} />
              <div>
                <h2 className="text-2xl font-bold text-black">Error detectado</h2>
                {fixResult && (
                  <p
                    className={`text-sm mt-1 ${
                      fixResult.success ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {fixResult.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold mb-2">Error:</p>
              <p className="text-red-700 text-sm">{error?.message || 'Error desconocido'}</p>
            </div>

            {fixResult?.success && fixResult.requiresRestart && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Se aplicó una corrección automática. Por favor, recargá la página para
                  aplicar los cambios.
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                  Detalles técnicos (solo desarrollo)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReload}
                className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Recargar Página
              </button>
              {!fixResult?.requiresRestart && (
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Intentar de Nuevo
                </button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                El sistema de AutoFix está activo. Revisá la consola para más detalles.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

