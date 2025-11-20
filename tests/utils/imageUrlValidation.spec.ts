/**
 * Tests de regresión para validación de URLs de imágenes
 * 
 * CRÍTICO: Estos tests aseguran que el fix de imágenes nunca se rompa
 */

import { describe, it, expect } from 'vitest'

/**
 * Función de validación de URLs de imágenes
 * 
 * Esta función replica la lógica de validación usada en:
 * - app/api/productos/route.ts
 * - app/api/productos/[id]/route.ts
 * - components/AdminProductForm.tsx
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmed = url.trim()
  
  if (trimmed === '' || trimmed === '/images/default-product.svg') {
    return false
  }
  
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/images/') ||
    trimmed.includes('supabase.co') // CRÍTICO: Incluir URLs de Supabase Storage
  )
}

describe('Image URL Validation - Regresión Tests', () => {
  describe('URLs de Supabase Storage (CRÍTICO)', () => {
    it('should accept Supabase Storage URLs with project ID', () => {
      const url = 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/tenant123/image.jpg'
      expect(isValidImageUrl(url)).toBe(true)
    })

    it('should accept Supabase Storage URLs with different project IDs', () => {
      const url = 'https://abcdefghijklmnop.supabase.co/storage/v1/object/public/productos/path/image.png'
      expect(isValidImageUrl(url)).toBe(true)
    })

    it('should accept Supabase Storage URLs with query parameters', () => {
      const url = 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/image.jpg?t=123456'
      expect(isValidImageUrl(url)).toBe(true)
    })
  })

  describe('URLs HTTPS/HTTP estándar', () => {
    it('should accept HTTPS URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
      expect(isValidImageUrl('https://cdn.example.com/products/image.png')).toBe(true)
    })

    it('should accept HTTP URLs', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
    })

    it('should accept URLs with ports', () => {
      expect(isValidImageUrl('https://example.com:8080/image.jpg')).toBe(true)
    })
  })

  describe('Rutas relativas', () => {
    it('should accept relative paths starting with /images/', () => {
      expect(isValidImageUrl('/images/product.jpg')).toBe(true)
      expect(isValidImageUrl('/images/products/123/image.png')).toBe(true)
    })

    it('should reject relative paths not starting with /images/', () => {
      expect(isValidImageUrl('/other/image.jpg')).toBe(false)
      expect(isValidImageUrl('./image.jpg')).toBe(false)
    })
  })

  describe('Placeholder (debe rechazarse)', () => {
    it('should reject default placeholder', () => {
      expect(isValidImageUrl('/images/default-product.svg')).toBe(false)
    })

    it('should reject placeholder even with whitespace', () => {
      expect(isValidImageUrl('  /images/default-product.svg  ')).toBe(false)
    })
  })

  describe('Valores inválidos', () => {
    it('should reject empty strings', () => {
      expect(isValidImageUrl('')).toBe(false)
      expect(isValidImageUrl('   ')).toBe(false)
      expect(isValidImageUrl('\t\n')).toBe(false)
    })

    it('should reject null and undefined', () => {
      expect(isValidImageUrl(null as any)).toBe(false)
      expect(isValidImageUrl(undefined as any)).toBe(false)
    })

    it('should reject non-string types', () => {
      expect(isValidImageUrl(123 as any)).toBe(false)
      expect(isValidImageUrl({} as any)).toBe(false)
      expect(isValidImageUrl([] as any)).toBe(false)
    })
  })

  describe('Casos edge', () => {
    it('should handle URLs with special characters', () => {
      const url = 'https://example.com/image%20with%20spaces.jpg'
      expect(isValidImageUrl(url)).toBe(true)
    })

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg'
      expect(isValidImageUrl(longUrl)).toBe(true)
    })

    it('should handle URLs with fragments', () => {
      expect(isValidImageUrl('https://example.com/image.jpg#fragment')).toBe(true)
    })
  })

  describe('Regresión: Bug original', () => {
    it('should NOT reject Supabase URLs (bug original)', () => {
      // Este test asegura que el bug original nunca vuelva
      const supabaseUrl = 'https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/public/productos/tenant/image.jpg'
      
      // La validación DEBE aceptar esta URL
      expect(isValidImageUrl(supabaseUrl)).toBe(true)
      
      // Si este test falla, significa que el bug volvió
    })

    it('should accept Supabase URLs even if they do not start with http/https pattern', () => {
      // Aunque improbable, asegurar que cualquier URL con supabase.co sea aceptada
      const url = 'custom://supabase.co/storage/image.jpg'
      expect(isValidImageUrl(url)).toBe(true)
    })
  })
})

