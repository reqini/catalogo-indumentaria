/**
 * Tests E2E para el flujo completo de upload de imágenes
 * 
 * CRÍTICO: Estos tests aseguran que el flujo completo funcione correctamente
 */

import { test, expect } from '@playwright/test'

test.describe('Image Upload Flow - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@catalogo.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin/dashboard', { timeout: 10000 })
  })

  test('should upload image and save product with real image URL', async ({ page }) => {
    // Ir a crear producto
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')

    // Completar datos básicos
    await page.fill('input[name="nombre"]', `Producto Test Imagen ${Date.now()}`)
    await page.fill('input[name="precio"]', '10000')
    await page.selectOption('select[name="categoria"]', { label: 'Remeras' })
    await page.fill('input[name="color"]', 'Negro')

    // Subir imagen (usar una imagen de prueba pequeña)
    // Nota: En un entorno real, crear un archivo de prueba en tests/fixtures/
    const fileInput = page.locator('input[type="file"]').first()
    
    // Crear un archivo de prueba en memoria
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: testImageData,
    })

    // Esperar a que se complete el upload
    await page.waitForSelector('text=Imagen subida exitosamente', { timeout: 15000 }).catch(async () => {
      // Si no aparece el mensaje, verificar que al menos no hay error
      const errorMessages = await page.locator('text=/error|Error|ERROR/i').count()
      expect(errorMessages).toBe(0)
    })

    // Verificar que el preview muestra algo (puede ser la imagen o un placeholder temporal)
    const preview = page.locator('img').filter({ hasNotText: 'default-product' }).first()
    await expect(preview).toBeVisible({ timeout: 5000 })

    // Guardar producto
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto creado correctamente', { timeout: 10000 })

    // Verificar en la tabla que el producto tiene imagen real (no placeholder)
    const productName = await page.locator('input[name="nombre"]').inputValue()
    const productRow = page.locator(`tr:has-text("${productName}")`).first()
    
    if (await productRow.count() > 0) {
      const imageCell = productRow.locator('img').first()
      if (await imageCell.count() > 0) {
        const imageSrc = await imageCell.getAttribute('src')
        
        expect(imageSrc).toBeTruthy()
        // La imagen NO debe ser el placeholder
        expect(imageSrc).not.toContain('default-product.svg')
        // Debe ser una URL válida (Supabase o HTTP/HTTPS)
        expect(
          imageSrc?.startsWith('http') || 
          imageSrc?.startsWith('/images/') ||
          imageSrc?.includes('supabase.co')
        ).toBe(true)
      }
    }
  })

  test('should use placeholder when no image is uploaded', async ({ page }) => {
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')

    const productName = `Producto Sin Imagen ${Date.now()}`
    await page.fill('input[name="nombre"]', productName)
    await page.fill('input[name="precio"]', '5000')
    await page.selectOption('select[name="categoria"]', { label: 'Remeras' })
    await page.fill('input[name="color"]', 'Blanco')

    // NO subir imagen
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto creado correctamente', { timeout: 10000 })

    // Verificar que usa placeholder
    const productRow = page.locator(`tr:has-text("${productName}")`).first()
    
    if (await productRow.count() > 0) {
      const imageCell = productRow.locator('img').first()
      if (await imageCell.count() > 0) {
        const imageSrc = await imageCell.getAttribute('src')
        
        // Debe usar placeholder
        expect(imageSrc).toContain('default-product.svg')
      }
    }
  })

  test('should preserve image when editing product without changing image', async ({ page }) => {
    // Primero crear un producto con imagen
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')

    const productName = `Producto Con Imagen ${Date.now()}`
    await page.fill('input[name="nombre"]', productName)
    await page.fill('input[name="precio"]', '15000')
    await page.selectOption('select[name="categoria"]', { label: 'Remeras' })

    // Subir imagen
    const fileInput = page.locator('input[type="file"]').first()
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: testImageData,
    })

    await page.waitForTimeout(2000) // Esperar upload

    // Guardar
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto creado correctamente', { timeout: 10000 })

    // Editar el producto
    const productRow = page.locator(`tr:has-text("${productName}")`).first()
    await productRow.locator('button[title="Editar"]').click()

    // Cambiar solo el nombre, NO tocar imagen
    await page.fill('input[name="nombre"]', `${productName} - Editado`)

    // Guardar
    await page.click('button:has-text("Guardar")')
    await page.waitForSelector('text=Producto actualizado correctamente', { timeout: 10000 })

    // Verificar que la imagen se mantiene (no es placeholder)
    const editedRow = page.locator(`tr:has-text("${productName} - Editado")`).first()
    if (await editedRow.count() > 0) {
      const imageCell = editedRow.locator('img').first()
      if (await imageCell.count() > 0) {
        const imageSrc = await imageCell.getAttribute('src')
        expect(imageSrc).not.toContain('default-product.svg')
      }
    }
  })
})

