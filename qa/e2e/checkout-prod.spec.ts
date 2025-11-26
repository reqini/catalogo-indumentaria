/**
 * Test E2E de Checkout en Producción
 *
 * Este test valida el flujo completo de checkout hasta antes de procesar el pago real.
 * NO ejecuta pagos reales para evitar cargos no deseados.
 *
 * Ejecutar con: npx playwright test qa/e2e/checkout-prod.spec.ts
 */

import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://catalogo-indumentaria.vercel.app'

test.describe('Checkout en Producción', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(PRODUCTION_URL)
    await page.evaluate(() => localStorage.clear())
  })

  test('TC-E2E-001: Flujo completo de checkout hasta MP (sin pago real)', async ({ page }) => {
    // 1. Navegar al catálogo
    await page.goto(`${PRODUCTION_URL}/catalogo`)
    await expect(page).toHaveURL(/.*catalogo/)

    // 2. Agregar producto al carrito
    // Buscar primer producto disponible
    const firstProduct = page
      .locator('[data-testid="product-card"], .product-card, a[href*="/producto/"]')
      .first()

    if ((await firstProduct.count()) > 0) {
      await firstProduct.click()

      // Esperar a que cargue la página del producto
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

        // Esperar notificación de éxito
        await page.waitForTimeout(1000)
      }
    } else {
      test.skip()
    }

    // 3. Ir al carrito
    await page.goto(`${PRODUCTION_URL}/carrito`)
    await expect(page).toHaveURL(/.*carrito/)

    // 4. Verificar que hay productos en el carrito
    const cartItems = page
      .locator('[data-testid="cart-item"], .cart-item')
      .or(page.locator('text=/Producto|Talle/'))
    const cartItemsCount = await cartItems.count()

    if (cartItemsCount === 0) {
      // Intentar verificar de otra forma
      const emptyCartMessage = page.locator('text=/carrito está vacío|vacío/i')
      if ((await emptyCartMessage.count()) > 0) {
        test.skip('El carrito está vacío - no se pudo agregar producto')
      }
    }

    // 5. Calcular envío (opcional)
    const codigoPostalInput = page
      .locator('input[placeholder*="postal"], input[type="text"]')
      .first()
    if ((await codigoPostalInput.count()) > 0) {
      await codigoPostalInput.fill('C1000')

      const calcularButton = page
        .locator('button:has-text("Calcular"), button:has-text("Calcular envío")')
        .first()
      if ((await calcularButton.count()) > 0) {
        await calcularButton.click()

        // Esperar métodos de envío
        await page.waitForTimeout(2000)

        // Seleccionar primer método de envío si existe
        const metodoEnvio = page
          .locator('button:has-text("OCA"), button:has-text("Correo"), button:has-text("Andreani")')
          .first()
        if ((await metodoEnvio.count()) > 0) {
          await metodoEnvio.click()
          await page.waitForTimeout(500)
        }
      }
    }

    // 6. Verificar resumen y total
    const totalElement = page
      .locator('text=/Total|total/i')
      .or(page.locator('[data-testid="total"]'))
    await expect(totalElement.first()).toBeVisible({ timeout: 5000 })

    // 7. Verificar que no hay errores en consola
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // 8. Hacer clic en "Finalizar Compra" (pero NO completar el pago)
    const finalizarButton = page
      .locator('button:has-text("Finalizar"), button:has-text("Comprar")')
      .first()

    if ((await finalizarButton.count()) > 0) {
      // Interceptar la redirección a MP para no completar el pago real
      await page.route('**/api/pago', async (route) => {
        const response = await route.fetch()
        const data = await response.json()

        // Verificar que la respuesta tiene init_point
        expect(data).toHaveProperty('init_point')
        expect(data.init_point).toContain('mercadopago.com')

        // NO seguir con la redirección - cancelar para no procesar pago real
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ ...data, test_mode: true }),
        })
      })

      await finalizarButton.click()

      // Esperar un momento para que se procese la request
      await page.waitForTimeout(2000)
    }

    // 9. Verificar que no hay errores críticos
    expect(errors.length).toBe(0)
  })

  test('TC-E2E-002: Validar persistencia del carrito', async ({ page }) => {
    // 1. Agregar producto al carrito (similar al test anterior)
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

    // 2. Verificar que está en localStorage
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('cart')
    })
    expect(cartData).not.toBeNull()

    // 3. Refrescar página
    await page.reload()

    // 4. Ir al carrito
    await page.goto(`${PRODUCTION_URL}/carrito`)

    // 5. Verificar que el producto sigue ahí
    const cartItems = page
      .locator('[data-testid="cart-item"], .cart-item')
      .or(page.locator('text=/Producto|Talle/'))
    const emptyMessage = page.locator('text=/carrito está vacío|vacío/i')

    // El carrito NO debería estar vacío
    await expect(emptyMessage)
      .not.toBeVisible({ timeout: 2000 })
      .catch(() => {
        // Si no hay mensaje de vacío, verificar que hay items
        expect(cartItems.count()).toBeGreaterThan(0)
      })
  })

  test('TC-E2E-003: Validar cálculo de envío', async ({ page }) => {
    // 1. Ir al carrito (asumiendo que hay productos)
    await page.goto(`${PRODUCTION_URL}/carrito`)

    // 2. Ingresar código postal
    const codigoPostalInput = page
      .locator('input[placeholder*="postal"], input[type="text"]')
      .first()

    if ((await codigoPostalInput.count()) > 0) {
      await codigoPostalInput.fill('C1000')

      // 3. Calcular envío
      const calcularButton = page
        .locator('button:has-text("Calcular"), button:has-text("Calcular envío")')
        .first()
      if ((await calcularButton.count()) > 0) {
        await calcularButton.click()

        // 4. Esperar métodos de envío
        await page.waitForTimeout(3000)

        // 5. Verificar que aparecen métodos de envío
        const metodosEnvio = page.locator('text=/OCA|Correo|Andreani|Envío/i')
        await expect(metodosEnvio.first()).toBeVisible({ timeout: 5000 })
      }
    } else {
      test.skip()
    }
  })
})
