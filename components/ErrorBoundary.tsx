'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { getSystemGuardian } from '@/lib/system-guardian'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary mejorado con integración de SystemGuardian
 * Previene que un componente crashee toda la aplicación
 */
export class ErrorBoundary extends Component<Props, State> {
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
    // Registrar error en SystemGuardian
    const guardian = getSystemGuardian()
    guardian.detectError('error', 'components', `Error en componente: ${error.message}`, {
      details: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
      solution: 'Revisar el componente que causó el error, verificar props y estado',
      autoFix: async () => {
        // Auto-fix: resetear estado del error boundary después de un tiempo
        setTimeout(() => {
          this.setState({ hasError: false, error: null, errorInfo: null })
        }, 5000)
        return true
      },
    })

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback UI por defecto
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-6">
              <AlertTriangle className="mx-auto text-red-500" size={64} />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Algo salió mal</h1>
            <p className="mb-6 text-gray-600">
              Ocurrió un error inesperado. El sistema ha registrado el problema y lo revisaremos
              pronto.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-left">
                <p className="break-all font-mono text-sm text-red-800">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-600">
                      Ver detalles técnicos
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-700">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
              >
                <RefreshCw size={18} />
                Reintentar
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Home size={18} />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
