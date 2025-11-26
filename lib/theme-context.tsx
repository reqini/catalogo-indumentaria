'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ThemeTokens, ThemePreset, defaultTheme } from '@/types/theme'

interface ThemeContextType {
  theme: ThemeTokens
  activePresetId: string | null
  presets: ThemePreset[]
  updateTheme: (updates: {
    colors?: Partial<ThemeTokens['colors']>
    typography?: Partial<ThemeTokens['typography']>
    spacing?: Partial<ThemeTokens['spacing']>
    radius?: Partial<ThemeTokens['radius']>
    shadows?: Partial<ThemeTokens['shadows']>
    breakpoints?: Partial<ThemeTokens['breakpoints']>
  }) => void
  setTheme: (theme: ThemeTokens) => void
  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
  renamePreset: (id: string, newName: string) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY_THEME = 'theme-builder-active-theme'
const STORAGE_KEY_PRESETS = 'theme-builder-presets'
const STORAGE_KEY_ACTIVE_PRESET = 'theme-builder-active-preset-id'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeTokens>(defaultTheme)
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Load active theme
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME)
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme)
        setThemeState(parsed)
      }

      // Load presets
      const savedPresets = localStorage.getItem(STORAGE_KEY_PRESETS)
      if (savedPresets) {
        const parsed = JSON.parse(savedPresets)
        setPresets(parsed)
      }

      // Load active preset ID
      const savedActivePresetId = localStorage.getItem(STORAGE_KEY_ACTIVE_PRESET)
      if (savedActivePresetId) {
        setActivePresetId(savedActivePresetId)
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(theme))
    } catch (error) {
      console.error('Error saving theme to localStorage:', error)
    }
  }, [theme, isHydrated])

  const updateTheme = useCallback(
    (updates: {
      colors?: Partial<ThemeTokens['colors']>
      typography?: Partial<ThemeTokens['typography']>
      spacing?: Partial<ThemeTokens['spacing']>
      radius?: Partial<ThemeTokens['radius']>
      shadows?: Partial<ThemeTokens['shadows']>
      breakpoints?: Partial<ThemeTokens['breakpoints']>
    }) => {
      setThemeState((current) => {
        const updated: ThemeTokens = { ...current }

        // Handle nested objects
        if (updates.colors) {
          updated.colors = { ...current.colors, ...updates.colors }
        }
        if (updates.typography) {
          updated.typography = { ...current.typography, ...updates.typography }
        }
        if (updates.spacing) {
          updated.spacing = { ...current.spacing, ...updates.spacing }
        }
        if (updates.radius) {
          updated.radius = { ...current.radius, ...updates.radius }
        }
        if (updates.shadows) {
          updated.shadows = { ...current.shadows, ...updates.shadows }
        }
        if (updates.breakpoints) {
          updated.breakpoints = { ...current.breakpoints, ...updates.breakpoints }
        }

        return updated
      })
      setActivePresetId(null) // Clear active preset when manually editing
    },
    []
  )

  const setTheme = useCallback((newTheme: ThemeTokens) => {
    setThemeState(newTheme)
    setActivePresetId(null)
  }, [])

  const savePreset = useCallback(
    (name: string) => {
      const newPreset: ThemePreset = {
        id: `preset-${Date.now()}`,
        name,
        theme: { ...theme },
        createdAt: new Date().toISOString(),
      }

      const updatedPresets = [...presets, newPreset]
      setPresets(updatedPresets)

      try {
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updatedPresets))
        setActivePresetId(newPreset.id)
        localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, newPreset.id)
      } catch (error) {
        console.error('Error saving preset to localStorage:', error)
      }
    },
    [theme, presets]
  )

  const loadPreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id)
      if (preset) {
        setThemeState(preset.theme)
        setActivePresetId(id)
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, id)
        } catch (error) {
          console.error('Error saving active preset ID:', error)
        }
      }
    },
    [presets]
  )

  const deletePreset = useCallback(
    (id: string) => {
      const updatedPresets = presets.filter((p) => p.id !== id)
      setPresets(updatedPresets)

      if (activePresetId === id) {
        setActivePresetId(null)
        try {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_PRESET)
        } catch (error) {
          console.error('Error removing active preset ID:', error)
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updatedPresets))
      } catch (error) {
        console.error('Error deleting preset from localStorage:', error)
      }
    },
    [presets, activePresetId]
  )

  const renamePreset = useCallback(
    (id: string, newName: string) => {
      const updatedPresets = presets.map((p) => (p.id === id ? { ...p, name: newName } : p))
      setPresets(updatedPresets)

      try {
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updatedPresets))
      } catch (error) {
        console.error('Error renaming preset:', error)
      }
    },
    [presets]
  )

  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme)
    setActivePresetId(null)
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_PRESET)
    } catch (error) {
      console.error('Error resetting theme:', error)
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activePresetId,
        presets,
        updateTheme,
        setTheme,
        savePreset,
        loadPreset,
        deletePreset,
        renamePreset,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
