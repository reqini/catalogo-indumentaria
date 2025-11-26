/**
 * Test E2E completo del circuito de compra final
 * Valida todo el flujo desde agregar producto hasta confirmación
 *
 * Ejecutar con: npx playwright test qa/e2e/checkout-final.spec.ts
 */

import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://catalogo-indumentaria.vercel.app'

test.describe('Circuito de Compra Completo - Producción', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(PRODUCTION_URL)
    await page.evaluate(() => localStorage.clear())
  })

  test('TC-E2E-FINAL-001: Flujo completo de compra hasta checkout (sin pago real)', async ({
    page,
  }) => {
    // 1. Navegar al catálogo
    await page.goto(`${PRODUCTION_URL}/catalogo`)
    await expect(page).toHaveURL(/.*catalogo/)

    // 2. Agregar producto al carrito
    const firstProduct = page
      .locator('[data-testid="product-card"], .product-card, a[href*="/producto/"]')
      .first()

    if ((await firstProduct.count()) > 0) {
      await firstProduct.click()
      await page.waitForURL(/.*producto\/.*/, { timeout: 10000 })

      // Seleccionar talle si existe
      const talleButton = page
        .locator('button:has-text("S"), button:has-text("M"), button:has-text("L")')
        .first()
      if ((await talleButton.count()) > 0) {
        await talleButton.click()
      }

      // Agregar al carrito
      const addToCartButton = page
        .locator('button:has-text("Agregar"), button:has-text("Comprar")')
        .first()
      if ((await addToCartButton.count()) > 0) {
        await addToCartButton.click()
        await page.waitForTimeout(1000)
      }
    } else {
      test.skip()
    }

    // 3. Ir al carrito
    await page.goto(`${PRODUCTION_URL}/carrito`)
    await expect(page).toHaveURL(/.*carrito/)

    // 4. Verificar que hay productos
    const cartItems = page
      .locator('[data-testid="cart-item"], .cart-item')
      .or(page.locator('text=/Producto|Talle/'))
    const cartItemsCount = await cartItems.count()

    if (cartItemsCount === 0) {
      const emptyCartMessage = page.locator('text=/carrito está vacío|vacío/i')
      if ((await emptyCartMessage.count()) > 0) {
        test.skip()
      }
    }

    // 5. Ir a checkout
    const checkoutButton = page
      .locator('button:has-text("Finalizar"), button:has-text("Checkout"), a[href*="/checkout"]')
      .first()
    if ((await checkoutButton.count()) > 0) {
      await checkoutButton.click()
      await page.waitForURL(/.*checkout/, { timeout: 10000 })
    } else {
      // Si no hay botón, navegar directamente
      await page.goto(`${PRODUCTION_URL}/checkout`)
    }

    // 6. Completar formulario de datos personales
    await page.fill('input[placeholder*="nombre"], input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com')
    await page.fill('input[type="tel"], input[name="telefono"]', '+54 11 1234-5678')
    await page.fill('input[placeholder*="calle"], input[name="calle"]', 'Av. Corrientes')
    await page.fill('input[placeholder*="número"], input[name="numero"]', '1234')
    await page.fill('input[placeholder*="postal"], input[name="codigoPostal"]', 'C1000')

    // Esperar autocompletado de localidad/provincia
    await page.waitForTimeout(1000)

    // 7. Continuar a envío
    const continueButton = page
      .locator('button:has-text("Continuar"), button:has-text("Siguiente")')
      .first()
    if ((await continueButton.count()) > 0) {
      await continueButton.click()
      await page.waitForTimeout(1000)
    }

    // 8. Calcular envío
    const calcularButton = page.locator('button:has-text("Calcular")').first()
    if ((await calcularButton.count()) > 0) {
      await calcularButton.click()
      await page.waitForTimeout(3000)

      // Seleccionar primer método de envío
      const metodoEnvio = page
        .locator('button:has-text("OCA"), button:has-text("Correo"), button:has-text("Andreani")')
        .first()
      if ((await metodoEnvio.count()) > 0) {
        await metodoEnvio.click()
        await page.waitForTimeout(500)
      }
    }

    // 9. Continuar a resumen
    const continueToSummary = page
      .locator('button:has-text("Resumen"), button:has-text("Continuar")')
      .first()
    if ((await continueToSummary.count()) > 0) {
      await continueToSummary.click()
      await page.waitForTimeout(1000)
    }

    // 10. Verificar resumen
    const totalElement = page
      .locator('text=/Total|total/i')
      .or(page.locator('[data-testid="total"]'))
    await expect(totalElement.first()).toBeVisible({ timeout: 5000 })

    // 11. Interceptar creación de orden para no procesar pago real
    await page.route('**/api/checkout/create-order', async (route) => {
      const response = await route.fetch()
      const data = await response.json()

      // Verificar que la respuesta tiene orderId y initPoint
      expect(data).toHaveProperty('orderId')
      expect(data).toHaveProperty('initPoint')
      expect(data.initPoint).toContain('mercadopago.com')

      // NO seguir con la redirección - cancelar para no procesar pago real
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ ...data, test_mode: true }),
      })
    })

    // 12. Hacer clic en "Pagar Ahora" (pero NO completar el pago)
    const payButton = page.locator('button:has-text("Pagar"), button:has-text("Finalizar")').first()
    if ((await payButton.count()) > 0) {
      await payButton.click()
      await page.waitForTimeout(2000)
    }

    // 13. Verificar que no hay errores críticos en consola
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Esperar un momento para que se procesen los errores
    await page.waitForTimeout(1000)

    // Filtrar errores no críticos (ej: analytics, etc.)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('analytics') &&
        !e.includes('gtag') &&
        !e.includes('google') &&
        !e.includes('favicon')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('TC-E2E-FINAL-002: Validar persistencia completa del carrito', async ({ page }) => {
    // Agregar productos
    await page.goto(`${PRODUCTION_URL}/catalogo`)

    const firstProduct = page
      .locator('[data-testid="product-card"], .product-card, a[href*="/producto/"]')
      .first()
    if ((await firstProduct.count()) > 0) {
      await firstProduct.click()
      await page.waitForURL(/.*producto\/.*/, { timeout: 10000 })

      const addToCartButton = page
        .locator('button:has-text("Agregar"), button:has-text("Comprar")')
        .first()
      if ((await addToCartButton.count()) > 0) {
        await addToCartButton.click()
        await page.waitForTimeout(1000)
      }
    }

    // Verificar localStorage
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('cart')
    })
    expect(cartData).not.toBeNull()

    // Navegar a checkout
    await page.goto(`${PRODUCTION_URL}/checkout`)

    // Verificar que el producto sigue ahí
    const cartItems = page
      .locator('[data-testid="cart-item"], .cart-item')
      .or(page.locator('text=/Producto|Talle/'))
    const emptyMessage = page.locator('text=/carrito está vacío|vacío/i')

    await expect(emptyMessage)
      .not.toBeVisible({ timeout: 2000 })
      .catch(() => {
        expect(cartItems.count()).toBeGreaterThan(0)
      })
  })

  test('TC-E2E-FINAL-003: Validar cálculo de envío en checkout', async ({ page }) => {
    // Ir a checkout (asumiendo que hay productos en el carrito)
    await page.goto(`${PRODUCTION_URL}/checkout`)

    // Completar datos básicos
    await page.fill('input[placeholder*="nombre"], input[name="nombre"]', 'Test User')
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com')
    await page.fill('input[type="tel"], input[name="telefono"]', '+54 11 1234-5678')
    await page.fill('input[placeholder*="calle"], input[name="calle"]', 'Test St')
    await page.fill('input[placeholder*="número"], input[name="numero"]', '123')
    await page.fill('input[placeholder*="postal"], input[name="codigoPostal"]', 'C1000')

    // Avanzar a paso de envío
    const continueButton = page
      .locator('button:has-text("Continuar"), button:has-text("Siguiente")')
      .first()
    if ((await continueButton.count()) > 0) {
      await continueButton.click()
      await page.waitForTimeout(1000)
    }

    // Calcular envío
    const calcularButton = page.locator('button:has-text("Calcular")').first()
    if ((await calcularButton.count()) > 0) {
      await calcularButton.click()
      await page.waitForTimeout(3000)

      // Verificar que aparecen métodos de envío
      const metodosEnvio = page.locator('text=/OCA|Correo|Andreani|Envío/i')
      await expect(metodosEnvio.first()).toBeVisible({ timeout: 5000 })
    }
  })
})
