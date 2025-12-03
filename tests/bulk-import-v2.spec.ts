import { describe, it, expect, beforeEach } from 'vitest'
import parseBulkProductsV2, { validateProductV2 } from '@/lib/bulk-import/v2-parser'
import { getBulkImportErrorHandler } from '@/lib/bulk-import/error-handler'
import { getFileValidator } from '@/lib/bulk-import/file-validator'

describe('Bulk Import V2 - Parser', () => {
  describe('parseBulkProductsV2', () => {
    it('debe parsear formato pipe correctamente', () => {
      const text = `Remera negra | categoría: Remeras | precio: 25000 | stock: 10 | talle: S/M/L
Jean azul | categoría: Pantalones | precio: 35000 | stock: 5 | color: Azul`

      const result = parseBulkProductsV2(text, 'text', {
        enhance: false,
        detectTalles: true,
        detectColores: true,
      })

      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products[0].nombre).toBe('Remera negra')
      expect(result.products[0].talles).toBeDefined()
    })

    it('debe detectar talles automáticamente', () => {
      const text = `Remera talle S/M/L | categoría: Remeras | precio: 25000 | stock: 15`

      const result = parseBulkProductsV2(text, 'text', {
        detectTalles: true,
      })

      expect(result.products[0].talles).toBeDefined()
      expect(result.products[0].talles?.length).toBeGreaterThan(0)
      expect(result.products[0].stockPorTalle).toBeDefined()
    })

    it('debe detectar colores automáticamente', () => {
      const text = `Remera negra premium | categoría: Remeras | precio: 25000 | stock: 10`

      const result = parseBulkProductsV2(text, 'text', {
        detectColores: true,
      })

      expect(result.products[0].colores).toBeDefined()
      expect(result.products[0].colores?.length).toBeGreaterThan(0)
    })

    it('debe parsear precios mal formateados con auto-fix', () => {
      const text = `Remera | categoría: Remeras | precio: $12.000 | stock: 10`

      const result = parseBulkProductsV2(text, 'text', {
        autoFix: true,
      })

      expect(result.products[0].precio).toBe(12000)
    })

    it('debe parsear formato JSON', () => {
      const json = JSON.stringify([
        {
          nombre: 'Remera Test',
          categoria: 'Remeras',
          precio: 25000,
          stock: 10,
          talles: ['S', 'M', 'L'],
        },
      ])

      const result = parseBulkProductsV2(json, 'json', {
        enhance: false,
      })

      expect(result.products.length).toBe(1)
      expect(result.products[0].nombre).toBe('Remera Test')
      expect(result.products[0].talles).toEqual(['S', 'M', 'L'])
    })

    it('debe manejar múltiples productos', () => {
      const text = `Producto 1 | categoría: Remeras | precio: 10000 | stock: 5
Producto 2 | categoría: Pantalones | precio: 20000 | stock: 3
Producto 3 | categoría: Buzos | precio: 30000 | stock: 8`

      const result = parseBulkProductsV2(text, 'text', {
        enhance: false,
      })

      expect(result.products.length).toBe(3)
      expect(result.metadata.productosDetectados).toBe(3)
    })

    it('debe registrar errores en líneas inválidas', () => {
      const text = `Producto válido | categoría: Remeras | precio: 10000 | stock: 5
Línea sin precio | categoría: Remeras | stock: 5
Producto válido 2 | categoría: Pantalones | precio: 20000 | stock: 3`

      const result = parseBulkProductsV2(text, 'text', {
        enhance: false,
      })

      expect(result.products.length).toBe(2)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('debe distribuir stock entre talles', () => {
      const text = `Remera | categoría: Remeras | precio: 10000 | stock: 15 | talle: S/M/L`

      const result = parseBulkProductsV2(text, 'text', {
        detectTalles: true,
      })

      const producto = result.products[0]
      expect(producto.talles?.length).toBe(3)
      expect(producto.stockPorTalle).toBeDefined()

      if (producto.stockPorTalle) {
        const stockTotal = Object.values(producto.stockPorTalle).reduce((a, b) => a + b, 0)
        expect(stockTotal).toBe(15)
      }
    })
  })

  describe('validateProductV2', () => {
    it('debe validar producto completo', () => {
      const producto = {
        nombre: 'Remera Test',
        categoria: 'Remeras',
        precio: 25000,
        stock: 10,
        descripcion: 'Descripción completa del producto',
        imagenPrincipal: 'https://example.com/image.jpg',
      }

      const validacion = validateProductV2(producto as any)

      expect(validacion.esValido).toBe(true)
      expect(validacion.errores.length).toBe(0)
    })

    it('debe detectar nombre inválido', () => {
      const producto = {
        nombre: 'Ab',
        categoria: 'Remeras',
        precio: 25000,
        stock: 10,
      }

      const validacion = validateProductV2(producto as any)

      expect(validacion.esValido).toBe(false)
      expect(validacion.errores.some((e) => e.includes('nombre'))).toBe(true)
    })

    it('debe detectar precio inválido', () => {
      const producto = {
        nombre: 'Remera Test',
        categoria: 'Remeras',
        precio: 0,
        stock: 10,
      }

      const validacion = validateProductV2(producto as any)

      expect(validacion.esValido).toBe(false)
      expect(validacion.errores.some((e) => e.includes('Precio'))).toBe(true)
    })

    it('debe detectar stock negativo', () => {
      const producto = {
        nombre: 'Remera Test',
        categoria: 'Remeras',
        precio: 25000,
        stock: -5,
      }

      const validacion = validateProductV2(producto as any)

      expect(validacion.esValido).toBe(false)
      expect(validacion.errores.some((e) => e.includes('Stock'))).toBe(true)
    })

    it('debe generar advertencias para campos faltantes', () => {
      const producto = {
        nombre: 'Remera Test',
        categoria: 'Remeras',
        precio: 25000,
        stock: 10,
        // Sin descripción, imagen, SKU
      }

      const validacion = validateProductV2(producto as any)

      expect(validacion.advertencias.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handler', () => {
    it('debe registrar errores correctamente', () => {
      const handler = getBulkImportErrorHandler()
      handler.clearErrors()

      handler.logError('error', 'PRECIO_INVALIDO', 'Precio inválido', {
        fila: 5,
        valor: '$12.000',
        solucion: 'Convertir a 12000',
        autoFixable: true,
      })

      const errores = handler.getErrors()
      expect(errores.length).toBe(1)
      expect(errores[0].codigo).toBe('PRECIO_INVALIDO')
      expect(errores[0].fila).toBe(5)
      expect(errores[0].autoFixable).toBe(true)
    })

    it('debe generar mensajes amigables', () => {
      const handler = getBulkImportErrorHandler()
      handler.clearErrors()

      const error = handler.logError('error', 'PRECIO_INVALIDO', 'Precio inválido', {
        fila: 10,
        campo: 'precio',
        valor: '$12.000',
        solucion: 'Convertir a 12000',
      })

      expect(error.mensajeAmigable).toContain('fila 10')
      expect(error.mensajeAmigable).toContain('precio')
      expect(error.mensajeAmigable).toContain('Solución')
    })
  })

  describe('File Validator', () => {
    it('debe validar archivo CSV válido', async () => {
      const validator = getFileValidator()
      const csvContent = 'nombre,categoria,precio,stock\nRemera,Remeras,25000,10'
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'test.csv', { type: 'text/csv' })

      const result = await validator.validateFile(file)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('debe rechazar archivo demasiado grande', async () => {
      const validator = getFileValidator()
      const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
      const blob = new Blob([largeContent], { type: 'text/csv' })
      const file = new File([blob], 'large.csv', { type: 'text/csv' })

      const result = await validator.validateFile(file, { maxSizeMB: 10 })

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('grande'))).toBe(true)
    })

    it('debe rechazar formato no soportado', async () => {
      const validator = getFileValidator()
      const blob = new Blob(['test'], { type: 'application/pdf' })
      const file = new File([blob], 'test.pdf', { type: 'application/pdf' })

      const result = await validator.validateFile(file)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('soportado'))).toBe(true)
    })
  })

  describe('Performance', () => {
    it('debe procesar 100 productos rápidamente', () => {
      const productos: string[] = []
      for (let i = 1; i <= 100; i++) {
        productos.push(
          `Producto ${i} | categoría: Categoria${i % 5} | precio: ${10000 + i * 100} | stock: ${i}`
        )
      }
      const text = productos.join('\n')

      const startTime = Date.now()
      const result = parseBulkProductsV2(text, 'text', { enhance: false })
      const duration = Date.now() - startTime

      expect(result.products.length).toBe(100)
      expect(duration).toBeLessThan(2000) // Debe ser rápido (< 2 segundos)
    })
  })
})
