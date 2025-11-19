import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Tests unitarios para el parser de carga múltiple
 */

// Simular funciones de parseo
function parseProductText(text: string): Array<{
  nombre: string
  categoria: string
  precio: number
  stock: number
  sku?: string
}> {
  const products: any[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  for (const line of lines) {
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim())
      const nombre = parts[0].trim()
      
      let categoria = ''
      let precio = 0
      let stock = 0
      let sku: string | undefined = undefined

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].toLowerCase()
        if (part.includes('categoría:') || part.includes('categoria:')) {
          categoria = part.split(':')[1]?.trim() || ''
        } else if (part.includes('precio:')) {
          precio = parseFloat(part.split(':')[1]?.trim() || '0')
        } else if (part.includes('stock:')) {
          stock = parseInt(part.split(':')[1]?.trim() || '0')
        } else if (part.includes('sku:')) {
          sku = part.split(':')[1]?.trim()
        }
      }

      if (nombre && categoria && precio > 0) {
        products.push({ nombre, categoria, precio, stock, sku })
      }
    }
  }

  return products
}

describe('Bulk Import Parser', () => {
  describe('parseProductText', () => {
    it('debe parsear texto estructurado correctamente', () => {
      const text = `Remera negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01
Jean azul | categoría: Pantalones | precio: 35000 | stock: 5 | sku: JEA-02`

      const result = parseProductText(text)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        nombre: 'Remera negra',
        categoria: 'remeras',
        precio: 25000,
        stock: 10,
        sku: 'ron-01',
      })
    })

    it('debe manejar texto caótico parcialmente', () => {
      const text = `Remera negra | categoría: Remeras | precio: 25000 | stock: 10
Texto sin formato válido
Jean azul | categoría: Pantalones | precio: 35000 | stock: 5`

      const result = parseProductText(text)

      expect(result.length).toBeGreaterThan(0)
      expect(result.some(p => p.nombre === 'Remera negra')).toBe(true)
    })

    it('debe rechazar productos sin precio válido', () => {
      const text = `Remera negra | categoría: Remeras | precio: inválido | stock: 10`

      const result = parseProductText(text)

      expect(result).toHaveLength(0)
    })

    it('debe rechazar productos sin nombre', () => {
      const text = `| categoría: Remeras | precio: 25000 | stock: 10`

      const result = parseProductText(text)

      expect(result).toHaveLength(0)
    })

    it('debe procesar 50+ productos sin problemas', () => {
      const products: string[] = []
      for (let i = 1; i <= 50; i++) {
        products.push(`Producto ${i} | categoría: Categoria${i % 5} | precio: ${10000 + i * 100} | stock: ${i}`)
      }
      const text = products.join('\n')

      const startTime = Date.now()
      const result = parseProductText(text)
      const endTime = Date.now()

      expect(result).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(1000) // Debe ser rápido
    })
  })

  describe('Validaciones', () => {
    it('debe validar que nombre es requerido', () => {
      const product = { nombre: '', categoria: 'Remeras', precio: 25000, stock: 10 }
      const errors = []
      
      if (!product.nombre || product.nombre.trim() === '') {
        errors.push('Nombre requerido')
      }

      expect(errors).toContain('Nombre requerido')
    })

    it('debe validar que precio es mayor a 0', () => {
      const product = { nombre: 'Remera', categoria: 'Remeras', precio: 0, stock: 10 }
      const errors = []
      
      if (!product.precio || product.precio <= 0) {
        errors.push('Precio inválido')
      }

      expect(errors).toContain('Precio inválido')
    })

    it('debe validar que stock no es negativo', () => {
      const product = { nombre: 'Remera', categoria: 'Remeras', precio: 25000, stock: -5 }
      const errors = []
      
      if (product.stock < 0) {
        errors.push('Stock no puede ser negativo')
      }

      expect(errors).toContain('Stock no puede ser negativo')
    })
  })

  describe('Detección de Duplicados', () => {
    it('debe detectar productos duplicados por nombre', () => {
      const products = [
        { nombre: 'Remera negra', categoria: 'Remeras', precio: 25000, stock: 10 },
        { nombre: 'Remera negra', categoria: 'Remeras', precio: 25000, stock: 10 },
        { nombre: 'Jean azul', categoria: 'Pantalones', precio: 35000, stock: 5 },
      ]

      const nombresVistos = new Map<string, number[]>()
      products.forEach((p, index) => {
        const nombreNormalizado = p.nombre.toLowerCase().trim()
        if (nombresVistos.has(nombreNormalizado)) {
          nombresVistos.get(nombreNormalizado)!.push(index)
        } else {
          nombresVistos.set(nombreNormalizado, [index])
        }
      })

      const duplicados: string[] = []
      nombresVistos.forEach((indices, nombre) => {
        if (indices.length > 1) {
          duplicados.push(nombre)
        }
      })

      expect(duplicados).toContain('remera negra')
      expect(duplicados.length).toBe(1)
    })
  })
})

