import { describe, it, expect } from 'vitest'
import { getStockStatus } from '@/utils/getStockStatus'

describe('getStockStatus', () => {
  it('debería retornar "disponible" si hay stock suficiente', () => {
    const producto = {
      stock: { S: 10, M: 5 },
      talles: ['S', 'M'],
    }

    expect(getStockStatus(producto, 'S')).toBe('disponible')
    expect(getStockStatus(producto, 'M')).toBe('disponible')
  })

  it('debería retornar "ultimas_unidades" si stock < 5', () => {
    const producto = {
      stock: { S: 4, M: 3 },
      talles: ['S', 'M'],
    }

    expect(getStockStatus(producto, 'S')).toBe('ultimas_unidades')
    expect(getStockStatus(producto, 'M')).toBe('ultimas_unidades')
  })

  it('debería retornar "agotado" si stock = 0', () => {
    const producto = {
      stock: { S: 0, M: 0 },
      talles: ['S', 'M'],
    }

    expect(getStockStatus(producto, 'S')).toBe('agotado')
    expect(getStockStatus(producto, 'M')).toBe('agotado')
  })

  it('debería retornar "agotado" si el talle no existe', () => {
    const producto = {
      stock: { S: 10 },
      talles: ['S'],
    }

    expect(getStockStatus(producto, 'XL')).toBe('agotado')
  })
})

