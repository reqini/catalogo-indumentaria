/**
 * Hook personalizado para persistir estado en sessionStorage
 * 
 * Usa sessionStorage en lugar de localStorage para:
 * - Limpiarse al cerrar la pestaña (más seguro)
 * - Persistir durante la sesión (incluye refresh)
 * - No interferir con otras pestañas
 */

import { useState, useEffect } from 'react'

/**
 * Hook que persiste el estado en sessionStorage
 * 
 * @param key - Clave única para el sessionStorage
 * @param initialValue - Valor inicial si no hay nada guardado
 * @returns [state, setState] - Similar a useState
 * 
 * @example
 * const [inputText, setInputText] = usePersistedState('bulk-import-input', '')
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Leer del sessionStorage al montar
  const [state, setState] = useState<T>(() => {
    // SSR: retornar valor inicial si estamos en servidor
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`[usePersistedState] Error reading ${key} from sessionStorage:`, error)
      return initialValue
    }
  })

  // Guardar en sessionStorage cuando cambia el estado
  useEffect(() => {
    // SSR: no hacer nada si estamos en servidor
    if (typeof window === 'undefined') {
      return
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`[usePersistedState] Error saving ${key} to sessionStorage:`, error)
    }
  }, [key, state])

  return [state, setState]
}

