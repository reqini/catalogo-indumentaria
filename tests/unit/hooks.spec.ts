import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Tests unitarios para hooks críticos
 * Previene re-renders peligrosos y bugs silenciosos
 */

describe('Hooks Críticos', () => {
  describe('useCallback con dependencias', () => {
    it('debe mantener referencia estable con dependencias correctas', () => {
      const { result, rerender } = renderHook(
        ({ deps }) => {
          const callback = useCallback(() => {
            return deps
          }, [deps])
          return callback
        },
        { initialProps: { deps: [1, 2, 3] } }
      )

      const firstCallback = result.current

      rerender({ deps: [1, 2, 3] })
      expect(result.current).toBe(firstCallback) // Misma referencia

      rerender({ deps: [1, 2, 4] })
      expect(result.current).not.toBe(firstCallback) // Nueva referencia
    })
  })

  describe('useMemo con dependencias', () => {
    it('debe recalcular solo cuando cambian dependencias', () => {
      const computeFn = vi.fn((value) => value * 2)

      const { result, rerender } = renderHook(
        ({ value }) => {
          return useMemo(() => computeFn(value), [value])
        },
        { initialProps: { value: 5 } }
      )

      expect(result.current).toBe(10)
      expect(computeFn).toHaveBeenCalledTimes(1)

      rerender({ value: 5 })
      expect(computeFn).toHaveBeenCalledTimes(1) // No recalcula

      rerender({ value: 10 })
      expect(computeFn).toHaveBeenCalledTimes(2) // Recalcula
      expect(result.current).toBe(20)
    })
  })

  describe('useEffect con dependencias', () => {
    it('debe ejecutarse cuando cambian dependencias', async () => {
      const effectFn = vi.fn()

      const { rerender } = renderHook(
        ({ value }) => {
          useEffect(() => {
            effectFn(value)
          }, [value])
        },
        { initialProps: { value: 1 } }
      )

      await waitFor(() => {
        expect(effectFn).toHaveBeenCalledWith(1)
      })

      rerender({ value: 1 })
      await waitFor(() => {
        expect(effectFn).toHaveBeenCalledTimes(1) // No se ejecuta de nuevo
      })

      rerender({ value: 2 })
      await waitFor(() => {
        expect(effectFn).toHaveBeenCalledWith(2)
        expect(effectFn).toHaveBeenCalledTimes(2) // Se ejecuta con nuevo valor
      })
    })
  })
})
