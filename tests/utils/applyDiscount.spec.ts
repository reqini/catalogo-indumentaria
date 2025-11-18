import { describe, it, expect } from 'vitest'
import { applyDiscount } from '@/utils/applyDiscount'
import type { Promocion } from '@/lib/db'

describe('applyDiscount', () => {
  it('debería retornar precio original si no hay descuento', () => {
    const producto = { precio: 10000 }
    const resultado = applyDiscount(producto, [])

    expect(resultado.precioOriginal).toBe(10000)
    expect(resultado.descuento).toBe(0)
    expect(resultado.precioFinal).toBe(10000)
    expect(resultado.tieneDescuento).toBe(false)
  })

  it('debería aplicar descuento del producto', () => {
    const producto = { precio: 10000, descuento: 20 }
    const resultado = applyDiscount(producto, [])

    expect(resultado.precioOriginal).toBe(10000)
    expect(resultado.descuento).toBe(20)
    expect(resultado.precioFinal).toBe(8000)
    expect(resultado.tieneDescuento).toBe(true)
  })

  it('debería aplicar promoción si no hay descuento del producto', () => {
    const producto = { precio: 10000, categoria: 'remeras' }
    const promociones: Promocion[] = [
      {
        id: '1',
        nombre: 'Promo Remeras',
        tipo: 'categoria',
        valor: 15,
        categoria: 'remeras',
        activa: true,
        mostrar_en_home: false,
      },
    ]

    const resultado = applyDiscount(producto as any, promociones)

    expect(resultado.precioOriginal).toBe(10000)
    expect(resultado.descuento).toBe(15)
    expect(resultado.precioFinal).toBe(8500)
    expect(resultado.tieneDescuento).toBe(true)
  })

  it('debería priorizar descuento del producto sobre promoción', () => {
    const producto = { precio: 10000, descuento: 20, categoria: 'remeras' }
    const promociones: Promocion[] = [
      {
        id: '1',
        nombre: 'Promo Remeras',
        tipo: 'categoria',
        valor: 15,
        categoria: 'remeras',
        activa: true,
        mostrar_en_home: false,
      },
    ]

    const resultado = applyDiscount(producto as any, promociones)

    expect(resultado.descuento).toBe(20) // Prioriza descuento del producto
    expect(resultado.precioFinal).toBe(8000)
  })
})

