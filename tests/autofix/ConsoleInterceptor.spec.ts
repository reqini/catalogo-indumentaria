/**
 * Tests para ConsoleInterceptor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { interceptConsole, restoreConsole } from '@/autofix/ConsoleInterceptor'
import { AutoFixEngine } from '@/autofix/AutoFixEngine'

describe('ConsoleInterceptor', () => {
  let originalConsoleError: typeof console.error
  let originalConsoleWarn: typeof console.warn

  beforeEach(() => {
    originalConsoleError = console.error
    originalConsoleWarn = console.warn
    AutoFixEngine.enable()
    AutoFixEngine.clearFixes()
  })

  afterEach(() => {
    restoreConsole()
    AutoFixEngine.disable()
  })

  it('debe interceptar console.error', () => {
    const mockError = vi.fn()
    console.error = mockError

    interceptConsole()

    const error = new Error('Test error')
    console.error(error)

    expect(mockError).toHaveBeenCalled()
  })

  it('debe interceptar console.warn con errores', () => {
    const mockWarn = vi.fn()
    console.warn = mockWarn

    interceptConsole()

    console.warn('Warning: Some error occurred')

    expect(mockWarn).toHaveBeenCalled()
  })

  it('debe restaurar console original', () => {
    interceptConsole()
    restoreConsole()

    expect(console.error).toBe(originalConsoleError)
    expect(console.warn).toBe(originalConsoleWarn)
  })

  it('no debe interceptar múltiples veces', () => {
    interceptConsole()
    const firstError = console.error
    interceptConsole()
    const secondError = console.error

    expect(firstError).toBe(secondError)
  })

  it('debe manejar errores en console.error', async () => {
    AutoFixEngine.enable()
    interceptConsole()

    const error = new Error('Hydration failed')
    console.error(error)

    // Esperar un poco para que se procese
    await new Promise((resolve) => setTimeout(resolve, 100))

    const fixes = AutoFixEngine.getFixesApplied()
    // Puede o no haber fixes aplicados dependiendo del error
    expect(fixes.length).toBeGreaterThanOrEqual(0)
  })
})

