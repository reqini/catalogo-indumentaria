/**
 * Error Handler - Manejo robusto de errores con feedback claro
 */

export interface ErrorInfo {
  message: string
  code?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  retryable: boolean
  userMessage: string
}

class ErrorHandler {
  /**
   * Maneja errores de red
   */
  handleNetworkError(error: any): ErrorInfo {
    if (!navigator.onLine) {
      return {
        message: 'No hay conexión a internet',
        code: 'NO_CONNECTION',
        severity: 'error',
        retryable: true,
        userMessage: 'No hay conexión a internet. Verificá tu conexión e intentá nuevamente.',
      }
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Timeout en la solicitud',
        code: 'TIMEOUT',
        severity: 'error',
        retryable: true,
        userMessage: 'La solicitud tardó demasiado. Intentá nuevamente.',
      }
    }

    return {
      message: error.message || 'Error de red',
      code: 'NETWORK_ERROR',
      severity: 'error',
      retryable: true,
      userMessage: 'Error de conexión. Intentá nuevamente en unos momentos.',
    }
  }

  /**
   * Maneja errores de API
   */
  handleAPIError(error: any): ErrorInfo {
    const status = error.response?.status

    switch (status) {
      case 400:
        return {
          message: 'Datos inválidos',
          code: 'BAD_REQUEST',
          severity: 'warning',
          retryable: false,
          userMessage: 'Los datos enviados no son válidos. Verificá e intentá nuevamente.',
        }

      case 401:
        return {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          severity: 'error',
          retryable: false,
          userMessage: 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.',
        }

      case 403:
        return {
          message: 'Acceso denegado',
          code: 'FORBIDDEN',
          severity: 'error',
          retryable: false,
          userMessage: 'No tenés permisos para realizar esta acción.',
        }

      case 404:
        return {
          message: 'Recurso no encontrado',
          code: 'NOT_FOUND',
          severity: 'warning',
          retryable: false,
          userMessage: 'El recurso que buscás no existe.',
        }

      case 500:
      case 502:
      case 503:
        return {
          message: 'Error del servidor',
          code: 'SERVER_ERROR',
          severity: 'error',
          retryable: true,
          userMessage: 'Error del servidor. Intentá nuevamente en unos momentos.',
        }

      default:
        return {
          message: error.response?.data?.error || error.message || 'Error desconocido',
          code: 'UNKNOWN_ERROR',
          severity: 'error',
          retryable: true,
          userMessage: 'Ocurrió un error. Intentá nuevamente.',
        }
    }
  }

  /**
   * Maneja errores genéricos
   */
  handleError(error: any): ErrorInfo {
    // Error de red
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return this.handleNetworkError(error)
    }

    // Error de API
    if (error.response) {
      return this.handleAPIError(error)
    }

    // Error desconocido
    return {
      message: error.message || 'Error desconocido',
      code: 'UNKNOWN',
      severity: 'error',
      retryable: true,
      userMessage: 'Ocurrió un error inesperado. Intentá nuevamente.',
    }
  }

  /**
   * Muestra error al usuario de forma amigable
   */
  showErrorToUser(errorInfo: ErrorInfo, onRetry?: () => void): void {
    if (typeof window === 'undefined') return

    // En desarrollo, también loggear en consola
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', errorInfo)
    }

    // Aquí se podría integrar con un sistema de notificaciones
    // Por ahora, solo retornamos la información para que el componente la maneje
  }
}

// Singleton
let errorHandlerInstance: ErrorHandler | null = null

export function getErrorHandler(): ErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler()
  }
  return errorHandlerInstance
}

export default ErrorHandler
