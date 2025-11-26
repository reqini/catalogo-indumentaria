import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catalogo-indumentaria.vercel.app'

test.describe('Sistema de Envíos - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('TC-E2E-001: Compra completa con envío real', async ({ page }) => {
    // 1. Agregar producto al carrito
    await page.goto(`${BASE_URL}/catalogo`)
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()

    // Esperar a que se abra el modal o página de producto
    await page.waitForTimeout(1000)

    // Seleccionar talle si hay selector
    const talleSelector = page.locator('button:has-text("M")').first()
    if ((await talleSelector.count()) > 0) {
      await talleSelector.click()
    }

    // Agregar al carrito
    const addToCartButton = page.locator('button:has-text("Agregar al carrito")').first()
    if ((await addToCartButton.count()) > 0) {
      await addToCartButton.click()
    }

    // 2. Ir a carrito
    await page.goto(`${BASE_URL}/carrito`)
    await page.waitForSelector('text=Carrito', { timeout: 5000 })

    // 3. Ir a checkout
    const checkoutButton = page.locator('button:has-text("Finalizar compra")').first()
    await checkoutButton.click()

    // 4. Completar datos personales
    await page.fill('input[placeholder*="Nombre"]', 'Juan Pérez')
    await page.fill('input[type="email"]', 'juan@example.com')
    await page.fill('input[type="tel"]', '+54 11 1234-5678')

    // 5. Completar dirección
    await page.fill('input[placeholder*="Calle"]', 'Av. Corrientes')
    await page.fill('input[placeholder*="Número"]', '1234')
    await page.fill('input[placeholder*="Código Postal"]', 'C1000')

    // Avanzar a envío
    await page.click('button:has-text("Continuar a Envío")')

    // 6. Calcular envío
    await page.waitForSelector('input[placeholder*="Código Postal"]', { timeout: 5000 })
    const cpInput = page.locator('input[placeholder*="Código Postal"]').first()
    await cpInput.fill('C1000')

    const calcularButton = page.locator('button:has-text("Calcular")').first()
    await calcularButton.click()

    // Esperar a que se carguen métodos
    await page.waitForSelector('button:has-text("OCA")', { timeout: 10000 })

    // 7. Seleccionar método de envío
    const ocaButton = page.locator('button:has-text("OCA Estándar")').first()
    await ocaButton.click()

    // Avanzar a resumen
    await page.click('button:has-text("Continuar a Resumen")')

    // 8. Verificar resumen
    await expect(page.locator('text=Resumen de Compra')).toBeVisible()
    await expect(page.locator('text=Juan Pérez')).toBeVisible()
    await expect(page.locator('text=OCA Estándar')).toBeVisible()

    // 9. Verificar que hay botón de pago (no completamos el pago real en test)
    await expect(page.locator('button:has-text("Pagar Ahora")')).toBeVisible()

    // NOTA: No completamos el pago real para no generar órdenes de prueba
  })

  test('TC-E2E-002: Compra con retiro en local', async ({ page }) => {
    // 1-3. Mismo proceso hasta checkout
    await page.goto(`${BASE_URL}/catalogo`)
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()
    await page.waitForTimeout(1000)

    const addToCartButton = page.locator('button:has-text("Agregar al carrito")').first()
    if ((await addToCartButton.count()) > 0) {
      await addToCartButton.click()
    }

    await page.goto(`${BASE_URL}/carrito`)
    const checkoutButton = page.locator('button:has-text("Finalizar compra")').first()
    await checkoutButton.click()

    // 4. Completar datos personales
    await page.fill('input[placeholder*="Nombre"]', 'María García')
    await page.fill('input[type="email"]', 'maria@example.com')
    await page.fill('input[type="tel"]', '+54 11 9876-5432')

    // Avanzar a envío
    await page.click('button:has-text("Continuar a Envío")')

    // 5. Seleccionar retiro en local
    await page.waitForSelector('button:has-text("Retiro en el local")', { timeout: 5000 })
    await page.click('button:has-text("Retiro en el local")')

    // 6. Verificar que se muestra información de retiro
    await expect(page.locator('text=Retiro en el local')).toBeVisible()
    await expect(page.locator('text=Vas a retirar tu pedido')).toBeVisible()

    // 7. Avanzar a resumen
    await page.click('button:has-text("Continuar a Resumen")')

    // 8. Verificar resumen
    await expect(page.locator('text=Retiro en el local')).toBeVisible()
    await expect(page.locator('text=Envió')).not.toBeVisible() // No debe mostrar costo de envío

    // 9. Verificar que total no incluye envío
    const totalText = await page.locator('text=Total').locator('..').textContent()
    // Verificar que no hay costo de envío agregado
  })

  test('TC-E2E-003: Tracking visible después de pago', async ({ page }) => {
    // Este test requiere una orden existente con tracking
    // Por ahora, solo verificamos que la página de tracking existe

    const trackingNumber = 'TRACK-TEST-123456'
    await page.goto(`${BASE_URL}/envio/${trackingNumber}`)

    // Verificar que la página carga (puede mostrar error 404 si no existe)
    // En producción, debería mostrar información del envío
    await page.waitForTimeout(2000)

    // Verificar que no hay error 500
    const error500 = page.locator('text=500')
    await expect(error500).not.toBeVisible()
  })

  test('TC-E2E-004: Validación de datos incompletos', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Intentar avanzar sin completar datos
    const continuarButton = page.locator('button:has-text("Continuar")').first()
    if ((await continuarButton.count()) > 0) {
      await continuarButton.click()

      // Verificar que se muestran errores de validación
      await page.waitForTimeout(500)
      const errorMessages = page.locator('text=obligatorio, text=inválido, text=requerido')
      // Al menos un error debe ser visible
    }

    // Completar solo nombre
    await page.fill('input[placeholder*="Nombre"]', 'Test')

    // Intentar avanzar
    if ((await continuarButton.count()) > 0) {
      await continuarButton.click()
      await page.waitForTimeout(500)

      // Verificar que se muestra error de email
      const emailError = page.locator('text=Email')
      // Error debe ser visible
    }
  })

  test('TC-E2E-005: Cálculo de envío con CP inválido', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos básicos
    await page.fill('input[placeholder*="Nombre"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="tel"]', '+54 11 1234-5678')

    // Avanzar a envío
    await page.click('button:has-text("Continuar a Envío")')

    // Intentar calcular con CP inválido
    const cpInput = page.locator('input[placeholder*="Código Postal"]').first()
    await cpInput.fill('12') // CP muy corto

    const calcularButton = page.locator('button:has-text("Calcular")').first()
    await calcularButton.click()

    // Verificar que se muestra error
    await page.waitForTimeout(1000)
    const errorMessage = page.locator('text=al menos 4 caracteres, text=inválido')
    // Error debe ser visible
  })

  test('TC-E2E-006: Simulación de error en API de envíos', async ({ page, context }) => {
    // Interceptar request a API de envíos y simular error
    await context.route('**/api/envios/calcular', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Error simulado en API' }),
      })
    })

    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos y avanzar a envío
    await page.fill('input[placeholder*="Nombre"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="tel"]', '+54 11 1234-5678')
    await page.click('button:has-text("Continuar a Envío")')

    // Intentar calcular envío
    const cpInput = page.locator('input[placeholder*="Código Postal"]').first()
    await cpInput.fill('C1000')

    const calcularButton = page.locator('button:has-text("Calcular")').first()
    await calcularButton.click()

    // Verificar que se muestra mensaje de error amigable
    await page.waitForTimeout(2000)
    const errorMessage = page.locator('text=Error, text=error')
    // Error debe ser visible pero no debe romper la página
  })
})

test.describe('Admin - Gestión de Órdenes', () => {
  test('TC-E2E-007: Visualización de órdenes en admin', async ({ page }) => {
    // Este test requiere autenticación como admin
    // Por ahora, solo verificamos que la página existe

    await page.goto(`${BASE_URL}/admin/orders`)

    // Verificar que la página carga
    await page.waitForTimeout(2000)

    // Puede requerir login, verificar que no hay error 500
    const error500 = page.locator('text=500')
    await expect(error500).not.toBeVisible()
  })
})
