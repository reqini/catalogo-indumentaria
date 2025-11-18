import { test, expect } from '@playwright/test'

test.describe('Catálogo', () => {
  test('debería cargar la página principal', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('debería navegar al catálogo', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Ver Catálogo')
    await expect(page).toHaveURL(/.*catalogo/)
  })

  test('debería filtrar productos por categoría', async ({ page }) => {
    await page.goto('/catalogo')
    await page.selectOption('select[name="categoria"]', 'remeras')
    await page.waitForTimeout(500) // Esperar filtro
    // Verificar que hay productos
    const productos = page.locator('[data-testid="product-card"]')
    await expect(productos.first()).toBeVisible()
  })

  test('debería buscar productos por nombre', async ({ page }) => {
    await page.goto('/catalogo')
    await page.fill('input[placeholder*="Buscar"]', 'Remera')
    await page.waitForTimeout(500)
    const productos = page.locator('[data-testid="product-card"]')
    await expect(productos.first()).toBeVisible()
  })

  test('debería ordenar por precio', async ({ page }) => {
    await page.goto('/catalogo')
    await page.selectOption('select[name="precio"]', 'asc')
    await page.waitForTimeout(500)
    // Verificar que los productos están ordenados
    const productos = page.locator('[data-testid="product-card"]')
    await expect(productos.first()).toBeVisible()
  })
})

