import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defaultTheme } from '@/types/theme'
import type { ThemePreset } from '@/types/theme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Theme Presets localStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should save preset to localStorage', () => {
    const preset: ThemePreset = {
      id: 'test-1',
      name: 'Test Theme',
      theme: defaultTheme,
      createdAt: new Date().toISOString(),
    }

    const presets = [preset]
    localStorageMock.setItem('theme-builder-presets', JSON.stringify(presets))

    const saved = localStorageMock.getItem('theme-builder-presets')
    expect(saved).not.toBeNull()
    const parsed = JSON.parse(saved!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Test Theme')
  })

  it('should load presets from localStorage', () => {
    const preset: ThemePreset = {
      id: 'test-2',
      name: 'Loaded Theme',
      theme: defaultTheme,
      createdAt: new Date().toISOString(),
    }

    localStorageMock.setItem('theme-builder-presets', JSON.stringify([preset]))

    const loaded = localStorageMock.getItem('theme-builder-presets')
    const parsed = JSON.parse(loaded!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Loaded Theme')
  })

  it('should handle empty localStorage gracefully', () => {
    const loaded = localStorageMock.getItem('theme-builder-presets')
    expect(loaded).toBeNull()
  })

  it('should delete preset from localStorage', () => {
    const preset1: ThemePreset = {
      id: 'test-3',
      name: 'Theme 1',
      theme: defaultTheme,
      createdAt: new Date().toISOString(),
    }

    const preset2: ThemePreset = {
      id: 'test-4',
      name: 'Theme 2',
      theme: defaultTheme,
      createdAt: new Date().toISOString(),
    }

    localStorageMock.setItem('theme-builder-presets', JSON.stringify([preset1, preset2]))

    const loaded = JSON.parse(localStorageMock.getItem('theme-builder-presets')!)
    const filtered = loaded.filter((p: ThemePreset) => p.id !== 'test-3')
    localStorageMock.setItem('theme-builder-presets', JSON.stringify(filtered))

    const afterDelete = JSON.parse(localStorageMock.getItem('theme-builder-presets')!)
    expect(afterDelete).toHaveLength(1)
    expect(afterDelete[0].id).toBe('test-4')
  })

  it('should update preset name in localStorage', () => {
    const preset: ThemePreset = {
      id: 'test-5',
      name: 'Old Name',
      theme: defaultTheme,
      createdAt: new Date().toISOString(),
    }

    localStorageMock.setItem('theme-builder-presets', JSON.stringify([preset]))

    const loaded = JSON.parse(localStorageMock.getItem('theme-builder-presets')!)
    const updated = loaded.map((p: ThemePreset) =>
      p.id === 'test-5' ? { ...p, name: 'New Name' } : p
    )
    localStorageMock.setItem('theme-builder-presets', JSON.stringify(updated))

    const afterUpdate = JSON.parse(localStorageMock.getItem('theme-builder-presets')!)
    expect(afterUpdate[0].name).toBe('New Name')
  })
})
