import { describe, it, expect } from 'vitest'
import { applyDiscount } from '@/utils/applyDiscount'
import { getStockStatus } from '@/utils/getStockStatus'

/**
 * Tests unitarios para funciones utilitarias críticas
 */

describe('Utilidades Críticas', () => {
  describe('applyDiscount', () => {
    it('debe calcular descuento correctamente', () => {
      expect(applyDiscount(1000, 10)).toBe(900)
      expect(applyDiscount(1000, 0)).toBe(1000)
      expect(applyDiscount(1000, 100)).toBe(0)
    })

    it('debe manejar valores negativos', () => {
      expect(applyDiscount(1000, -10)).toBe(1000) // No aplica descuento negativo
    })

    it('debe manejar descuentos mayores a 100%', () => {
      expect(applyDiscount(1000, 150)).toBe(0) // Máximo 100%
    })
  })

  describe('getStockStatus', () => {
    it('debe detectar stock disponible', () => {
      const stock = { S: { negro: 5 }, M: { negro: 10 } }
      expect(getStockStatus(stock, 'S', 'negro')).toBe('available')
      expect(getStockStatus(stock, 'M', 'negro')).toBe('available')
    })

    it('debe detectar sin stock', () => {
      const stock = { S: { negro: 0 }, M: { negro: 0 } }
      expect(getStockStatus(stock, 'S', 'negro')).toBe('out_of_stock')
    })

    it('debe detectar stock bajo', () => {
      const stock = { S: { negro: 2 }, M: { negro: 1 } }
      expect(getStockStatus(stock, 'S', 'negro')).toBe('low_stock')
    })

    it('debe manejar variantes no existentes', () => {
      const stock = { S: { negro: 5 } }
      expect(getStockStatus(stock, 'XL', 'negro')).toBe('out_of_stock')
      expect(getStockStatus(stock, 'S', 'blanco')).toBe('out_of_stock')
    })
  })
})
