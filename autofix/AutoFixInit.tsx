/**
 * Componente cliente para inicializar AutoFix en desarrollo
 */

'use client'

import { useEffect } from 'react'
import { AutoFixEngine } from './AutoFixEngine'
import { interceptConsole } from './ConsoleInterceptor'

export function AutoFixInit(): null {
  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV === 'development' && process.env.AUTO_FIX !== 'false') {
      // Inicializar AutoFixEngine
      AutoFixEngine.init()

      // Interceptar console.error
      interceptConsole()

      console.log(
        '%c[AutoFix] Sistema activado',
        'color: #00ff00; font-weight: bold; font-size: 12px;'
      )
    }

    // Cleanup (opcional)
    return () => {
      // No necesitamos cleanup, pero podríamos restaurar console si fuera necesario
    }
  }, [])

  return null
}

