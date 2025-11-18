/**
 * Tests para AutoFixEngine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AutoFixEngine } from '@/autofix/AutoFixEngine'
import { fixRegistry } from '@/autofix/FixRegistry'

describe('AutoFixEngine', () => {
  beforeEach(() => {
    // Reset engine state
    AutoFixEngine.clearFixes()
    AutoFixEngine.disable()
  })

  it('debe inicializarse correctamente en desarrollo', () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'development'
    ;(process.env as any).AUTO_FIX = undefined

    AutoFixEngine.init()

    expect(AutoFixEngine.isEnabled()).toBe(true)

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('no debe inicializarse en producción', () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'production'

    AutoFixEngine.init()

    expect(AutoFixEngine.isEnabled()).toBe(false)

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('no debe inicializarse si AUTO_FIX=false', () => {
    const originalEnv = process.env.NODE_ENV
    const originalAutoFix = process.env.AUTO_FIX
    ;(process.env as any).NODE_ENV = 'development'
    ;(process.env as any).AUTO_FIX = 'false'

    AutoFixEngine.init()

    expect(AutoFixEngine.isEnabled()).toBe(false)

    ;(process.env as any).NODE_ENV = originalEnv
    ;(process.env as any).AUTO_FIX = originalAutoFix
  })

  it('debe manejar errores de cliente y aplicar fixes', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'development'
    AutoFixEngine.init()

    const error = new Error('Hydration failed: Text content does not match')
    const result = await AutoFixEngine.handleClientError(error, {
      filePath: 'test.tsx',
    })

    expect(result).not.toBeNull()
    expect(result?.success).toBe(true)
    expect(result?.action).toBe('addUseClientDirective')

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('debe manejar errores de consola', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'development'
    AutoFixEngine.init()

    const result = await AutoFixEngine.handleConsoleError(
      'Cannot find module "@/components/Test"',
      undefined,
      {}
    )

    expect(result).not.toBeNull()

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('debe manejar errores de servidor', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'development'
    AutoFixEngine.init()

    const error = new Error('Module not found: Cannot resolve "@/utils/test"')
    const result = await AutoFixEngine.handleServerError(error, {
      filePath: 'api/test.ts',
    })

    expect(result).not.toBeNull()

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('debe registrar fixes aplicados', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as any).NODE_ENV = 'development'
    AutoFixEngine.init()

    const error = new Error('Hydration failed: Text content does not match')
    await AutoFixEngine.handleClientError(error, {
      filePath: 'test.tsx',
    })

    const fixes = AutoFixEngine.getFixesApplied()
    expect(fixes.length).toBeGreaterThan(0)

    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('debe limpiar fixes aplicados', () => {
    AutoFixEngine.enable()
    AutoFixEngine.clearFixes()

    const fixes = AutoFixEngine.getFixesApplied()
    expect(fixes.length).toBe(0)
  })
})

