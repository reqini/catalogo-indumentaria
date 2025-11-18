/**
 * Tests para FixRegistry
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { fixRegistry, FixRule } from '@/autofix/FixRegistry'

describe('FixRegistry', () => {
  beforeEach(() => {
    // El registry se reinicia en cada test
  })

  it('debe tener reglas por defecto registradas', () => {
    const rules = fixRegistry.getRules()
    expect(rules.length).toBeGreaterThan(0)
  })

  it('debe encontrar fix para error de hidratación', async () => {
    const error = new Error('Hydration failed: Text content does not match')
    const result = await fixRegistry.findAndApplyFix(error, {
      filePath: 'test.tsx',
    })

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('addUseClientDirective')
  })

  it('debe encontrar fix para módulo no encontrado', async () => {
    const error = new Error("Cannot find module '@/components/Test'")
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('suggestInstall')
  })

  it('debe encontrar fix para propiedad undefined', async () => {
    const error = new Error("Cannot read property 'value' of undefined")
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('addNullCheck')
  })

  it('debe encontrar fix para ReferenceError', async () => {
    const error = new ReferenceError('myVariable is not defined')
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('declareVariable')
  })

  it('debe encontrar fix para React Hooks', async () => {
    const error = new Error('React Hook "useState" is called conditionally')
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('fixReactHooks')
  })

  it('debe encontrar fix para Next.js hooks', async () => {
    const error = new Error('useSearchParams must be used within a Next.js component')
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('fixNextjsHook')
  })

  it('debe aplicar reglas en orden de prioridad', async () => {
    // Crear regla de alta prioridad
    const highPriorityRule: FixRule = {
      pattern: /test error/i,
      type: 'test',
      description: 'Test rule',
      priority: 100,
      fix: async () => ({
        success: true,
        action: 'testFix',
        message: 'Test fix applied',
      }),
    }

    fixRegistry.registerRule(highPriorityRule)

    const error = new Error('test error message')
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    expect(result?.action).toBe('testFix')
  })

  it('debe manejar errores genéricos con fallback', async () => {
    const error = new Error('Some unknown error message')
    const result = await fixRegistry.findAndApplyFix(error)

    expect(result).not.toBeNull()
    // Debe usar la regla genérica de menor prioridad
    expect(result?.action).toBe('manualReview')
  })
})

