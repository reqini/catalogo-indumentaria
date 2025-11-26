import { test, expect } from '@playwright/test'

/**
 * Tests E2E para sistema de envíos
 * Ejecutar: pnpm test:e2e shipping
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

test.describe('Sistema de Envíos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('TC-SHIPPING-001: Calcular envío con código postal válido', async ({ page }) => {
    // Agregar producto al carrito
    await page.goto(`${BASE_URL}/producto/test-product-id`)
    await page.click('button:has-text("Agregar al carrito")')

    // Ir a checkout
    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos personales
    await page.fill('input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[name="email"]', 'juan@example.com')
    await page.fill('input[name="telefono"]', '1234567890')
    await page.click('button:has-text("Continuar")')

    // Seleccionar envío a domicilio
    await page.click('button:has-text("Envío a domicilio")')

    // Ingresar código postal
    await page.fill('input[placeholder*="Código Postal"]', 'C1000')
    await page.click('button:has-text("Calcular")')

    // Esperar resultados
    await page.waitForSelector('text=Métodos disponibles:', { timeout: 10000 })

    // Verificar que hay métodos disponibles
    const metodos = await page.locator('button:has-text("OCA")').count()
    expect(metodos).toBeGreaterThan(0)

    // Seleccionar un método
    const ocaButton = page.locator('button:has-text("OCA Estándar")').first()
    await ocaButton.click()

    // Verificar que se seleccionó
    await expect(page.locator('text=Envió seleccionado')).toBeVisible()
  })

  test('TC-SHIPPING-002: Seleccionar retiro en local', async ({ page }) => {
    // Agregar producto al carrito
    await page.goto(`${BASE_URL}/producto/test-product-id`)
    await page.click('button:has-text("Agregar al carrito")')

    // Ir a checkout
    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos personales
    await page.fill('input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[name="email"]', 'juan@example.com')
    await page.fill('input[name="telefono"]', '1234567890')
    await page.click('button:has-text("Continuar")')

    // Seleccionar retiro en local
    await page.click('button:has-text("Retiro en local")')

    // Verificar mensaje
    await expect(page.locator('text=Retiro en el local')).toBeVisible()
    await expect(page.locator('text=Vas a retirar tu pedido')).toBeVisible()

    // Verificar que no requiere código postal
    const cpInput = page.locator('input[placeholder*="Código Postal"]')
    await expect(cpInput).not.toBeVisible()
  })

  test('TC-SHIPPING-003: Crear orden con envío y verificar tracking', async ({ page }) => {
    // Este test requiere una orden real creada
    // Se puede ejecutar manualmente después de una compra real
    test.skip(true, 'Requiere orden real creada')

    const orderId = 'test-order-id'
    const trackingNumber = 'TRACK-TEST-123'

    // Verificar página de éxito muestra tracking
    await page.goto(`${BASE_URL}/pago/success?orderId=${orderId}`)
    await expect(page.locator(`text=${trackingNumber}`)).toBeVisible()

    // Verificar link de tracking
    const trackingLink = page.locator(`a[href="/envio/${trackingNumber}"]`)
    await expect(trackingLink).toBeVisible()
  })

  test('TC-SHIPPING-004: Consultar tracking de envío', async ({ page }) => {
    // Este test requiere un tracking number real
    test.skip(true, 'Requiere tracking number real')

    const trackingNumber = 'TRACK-TEST-123'

    await page.goto(`${BASE_URL}/envio/${trackingNumber}`)

    // Verificar que muestra información
    await expect(page.locator('text=Seguimiento de Envío')).toBeVisible()
    await expect(page.locator(`text=${trackingNumber}`)).toBeVisible()
  })

  test('TC-SHIPPING-005: Validar código postal inválido', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos personales
    await page.fill('input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[name="email"]', 'juan@example.com')
    await page.fill('input[name="telefono"]', '1234567890')
    await page.click('button:has-text("Continuar")')

    // Seleccionar envío
    await page.click('button:has-text("Envío a domicilio")')

    // Ingresar código postal inválido
    await page.fill('input[placeholder*="Código Postal"]', '12')
    await page.click('button:has-text("Calcular")')

    // Verificar error
    await expect(
      page.locator('text=El código postal debe tener al menos 4 caracteres')
    ).toBeVisible()
  })

  test('TC-SHIPPING-006: Verificar que retiro en local no requiere dirección', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`)

    // Completar datos personales
    await page.fill('input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[name="email"]', 'juan@example.com')
    await page.fill('input[name="telefono"]', '1234567890')
    await page.click('button:has-text("Continuar")')

    // Seleccionar retiro en local
    await page.click('button:has-text("Retiro en local")')
    await page.click('button:has-text("Continuar a Resumen")')

    // Verificar que puede avanzar sin dirección
    await expect(page.locator('text=Resumen de Compra')).toBeVisible()
    await expect(page.locator('text=Retiro en el local')).toBeVisible()
  })
})
