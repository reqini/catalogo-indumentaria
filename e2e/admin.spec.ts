import { test, expect } from '@playwright/test'

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    // Login
    await page.fill('input[type="email"]', 'admin@demo.com')
    await page.fill('input[type="password"]', 'Admin123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*admin.*dashboard/)
  })

  test('debería mostrar el dashboard', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('debería navegar a productos', async ({ page }) => {
    await page.click('text=Productos')
    await expect(page).toHaveURL(/.*productos/)
    await expect(page.locator('text=Gestión de Productos')).toBeVisible()
  })

  test('debería crear un producto', async ({ page }) => {
    await page.goto('/admin/productos')
    await page.click('text=Nuevo Producto')
    await page.fill('input[name="nombre"]', 'Producto Test')
    await page.fill('input[name="precio"]', '10000')
    await page.selectOption('select[name="categoria"]', 'remeras')
    // Agregar talle
    await page.selectOption('select:has-text("Seleccionar talle")', 'S')
    await page.click('button:has-text("Agregar")')
    await page.fill('input[value="0"]', '10')
    // Guardar
    await page.click('button:has-text("Crear")')
    await expect(page.locator('text=Producto creado')).toBeVisible({ timeout: 10000 })
  })
})

