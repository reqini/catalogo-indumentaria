import { test, expect } from '@playwright/test'

test.describe('Theme Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder')
    // Wait for hydration
    await page.waitForTimeout(1000)
  })

  test('should open builder page and show controls', async ({ page }) => {
    await expect(page.locator('text=Theme Controls')).toBeVisible()
    await expect(page.locator('text=Vista Previa')).toBeVisible()
  })

  test('should update preview when changing colors', async ({ page }) => {
    // Find color input for primary
    const primaryColorInput = page.locator('input[type="color"]').first()
    const originalValue = await primaryColorInput.inputValue()

    // Change color
    await primaryColorInput.fill('#ff0000')

    // Wait for update
    await page.waitForTimeout(500)

    // Check that preview updated (look for elements with the new color)
    const preview = page.locator('[style*="--color-primary"]').first()
    await expect(preview).toBeVisible()
  })

  test('should save and load preset', async ({ page }) => {
    // Enter preset name
    const presetInput = page.locator('input[placeholder*="Nombre del preset"]')
    await presetInput.fill('Test Preset')

    // Click save button
    const saveButton = page.locator('button:has-text("Guardar")')
    await saveButton.click()

    // Wait for save
    await page.waitForTimeout(500)

    // Check that preset appears in list
    await expect(page.locator('text=Test Preset')).toBeVisible()

    // Refresh page
    await page.reload()
    await page.waitForTimeout(1000)

    // Check that preset is still there
    await expect(page.locator('text=Test Preset')).toBeVisible()
  })

  test('should export JSON format', async ({ page }) => {
    // Click on JSON tab (should be default)
    const jsonTab = page.locator('button:has-text("JSON")')
    await jsonTab.click()

    // Wait for content
    await page.waitForTimeout(300)

    // Check that JSON content is visible
    const codeBlock = page.locator('pre code')
    const content = await codeBlock.textContent()
    expect(content).toContain('"colors"')
    expect(content).toContain('"typography"')
  })

  test('should export CSS Variables format', async ({ page }) => {
    // Click on CSS tab
    const cssTab = page.locator('button:has-text("CSS Variables")')
    await cssTab.click()

    await page.waitForTimeout(300)

    // Check that CSS content is visible
    const codeBlock = page.locator('pre code')
    const content = await codeBlock.textContent()
    expect(content).toContain(':root')
    expect(content).toContain('--color-primary')
  })

  test('should copy to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Click copy button
    const copyButton = page.locator('button[title="Copiar al portapapeles"]')
    await copyButton.click()

    await page.waitForTimeout(500)

    // Check for success message
    await expect(page.locator('text=Copiado al portapapeles')).toBeVisible({ timeout: 2000 })
  })

  test('should navigate from landing to builder', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Click builder link
    const builderLink = page.locator('a:has-text("Abrir Generador de Temas")')
    await builderLink.click()

    // Should navigate to builder
    await expect(page).toHaveURL(/\/builder/)
    await expect(page.locator('text=Theme Controls')).toBeVisible()
  })

  test('should apply theme changes in real-time preview', async ({ page }) => {
    // Change font size
    const fontSizeInput = page
      .locator('input[type="number"]')
      .filter({ hasText: /Tamaño Base/ })
      .first()
    await fontSizeInput.fill('20')

    await page.waitForTimeout(500)

    // Check that preview updated
    const preview = page.locator('[style*="font-size"]').first()
    await expect(preview).toBeVisible()
  })
})
