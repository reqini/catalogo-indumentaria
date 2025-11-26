import { describe, it, expect } from 'vitest'
import {
  exportToJSON,
  exportToCSSVariables,
  exportToTailwind,
  exportToJSS,
  exportToBootstrap,
} from '@/lib/theme-exporters'
import { defaultTheme } from '@/types/theme'

describe('Theme Exporters', () => {
  describe('exportToJSON', () => {
    it('should export theme as valid JSON', () => {
      const result = exportToJSON(defaultTheme)
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('should include all theme properties', () => {
      const result = exportToJSON(defaultTheme)
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('colors')
      expect(parsed).toHaveProperty('typography')
      expect(parsed).toHaveProperty('spacing')
      expect(parsed).toHaveProperty('radius')
      expect(parsed).toHaveProperty('shadows')
      expect(parsed).toHaveProperty('breakpoints')
    })

    it('should be properly formatted with indentation', () => {
      const result = exportToJSON(defaultTheme)
      expect(result.split('\n').length).toBeGreaterThan(10) // Should have multiple lines
    })
  })

  describe('exportToCSSVariables', () => {
    it('should generate valid CSS with :root selector', () => {
      const result = exportToCSSVariables(defaultTheme)
      expect(result).toContain(':root')
      expect(result).toContain('{')
      expect(result).toContain('}')
    })

    it('should include color variables', () => {
      const result = exportToCSSVariables(defaultTheme)
      expect(result).toContain('--color-primary')
      expect(result).toContain('--color-background')
    })

    it('should include typography variables', () => {
      const result = exportToCSSVariables(defaultTheme)
      expect(result).toContain('--font-base')
      expect(result).toContain('--font-size-base')
    })

    it('should include spacing variables', () => {
      const result = exportToCSSVariables(defaultTheme)
      expect(result).toContain('--spacing-md')
      expect(result).toContain('--spacing-lg')
    })
  })

  describe('exportToTailwind', () => {
    it('should generate valid JavaScript module', () => {
      const result = exportToTailwind(defaultTheme)
      expect(result).toContain('module.exports')
      expect(result).toContain('theme:')
      expect(result).toContain('extend:')
    })

    it('should include colors in extend.colors', () => {
      const result = exportToTailwind(defaultTheme)
      expect(result).toContain('colors:')
      expect(result).toContain("'primary':")
    })

    it('should include fontFamily configuration', () => {
      const result = exportToTailwind(defaultTheme)
      expect(result).toContain('fontFamily:')
      expect(result).toContain("'base':")
    })

    it('should include spacing configuration', () => {
      const result = exportToTailwind(defaultTheme)
      expect(result).toContain('spacing:')
    })
  })

  describe('exportToJSS', () => {
    it('should generate valid JavaScript object', () => {
      const result = exportToJSS(defaultTheme)
      expect(result).toContain('const theme')
      expect(result).toContain('export default theme')
    })

    it('should include palette object', () => {
      const result = exportToJSS(defaultTheme)
      expect(result).toContain('palette:')
    })

    it('should include typography object', () => {
      const result = exportToJSS(defaultTheme)
      expect(result).toContain('typography:')
    })

    it('should include spacing object', () => {
      const result = exportToJSS(defaultTheme)
      expect(result).toContain('spacing:')
    })
  })

  describe('exportToBootstrap', () => {
    it('should generate valid SCSS variables', () => {
      const result = exportToBootstrap(defaultTheme)
      expect(result).toContain('$primary')
      expect(result).toContain('//')
    })

    it('should include color variables', () => {
      const result = exportToBootstrap(defaultTheme)
      expect(result).toContain('$primary:')
      expect(result).toContain('$secondary:')
    })

    it('should include typography variables', () => {
      const result = exportToBootstrap(defaultTheme)
      expect(result).toContain('$font-family-base')
      expect(result).toContain('$font-size-base')
    })

    it('should include spacing variables', () => {
      const result = exportToBootstrap(defaultTheme)
      expect(result).toContain('$spacer-')
    })
  })
})
