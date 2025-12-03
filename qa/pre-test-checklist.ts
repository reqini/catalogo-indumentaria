/**
 * Pre-Test Checklist - Verificación automática antes de pruebas masivas
 */

export interface ChecklistResult {
  test: string
  status: 'ok' | 'fail'
  message: string
  duration: number
  details?: any
}

export interface PreTestChecklistReport {
  timestamp: string
  overallStatus: 'ready' | 'not_ready'
  results: ChecklistResult[]
  summary: {
    passed: number
    failed: number
    total: number
  }
  recommendations: string[]
}

class PreTestChecklist {
  private baseUrl: string

  constructor(
    baseUrl: string = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
  ) {
    this.baseUrl = baseUrl
  }

  /**
   * Ejecuta checklist completo
   */
  async runChecklist(): Promise<PreTestChecklistReport> {
    const results: ChecklistResult[] = []

    // Test 1: Home
    results.push(await this.testHome())

    // Test 2: Búsqueda
    results.push(await this.testSearch())

    // Test 3: Producto individual
    results.push(await this.testProduct())

    // Test 4: Carrito
    results.push(await this.testCart())

    // Test 5: Envíos
    results.push(await this.testShipping())

    // Test 6: Checkout
    results.push(await this.testCheckout())

    // Test 7: Mercado Pago
    results.push(await this.testMercadoPago())

    // Test 8: Admin
    results.push(await this.testAdmin())

    // Test 9: Performance
    results.push(await this.testPerformance())

    // Calcular resumen
    const passed = results.filter((r) => r.status === 'ok').length
    const failed = results.filter((r) => r.status === 'fail').length
    const overallStatus: 'ready' | 'not_ready' = failed === 0 ? 'ready' : 'not_ready'

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(results)

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      results,
      summary: {
        passed,
        failed,
        total: results.length,
      },
      recommendations,
    }
  }

  /**
   * Test Home
   */
  private async testHome(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/`)
      const duration = Date.now() - startTime

      if (!response.ok) {
        return {
          test: 'Home',
          status: 'fail',
          message: `Home devuelve ${response.status}`,
          duration,
        }
      }

      if (duration > 3000) {
        return {
          test: 'Home',
          status: 'ok',
          message: `Home carga en ${duration}ms (lento pero funcional)`,
          duration,
        }
      }

      return {
        test: 'Home',
        status: 'ok',
        message: `Home carga correctamente en ${duration}ms`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Home',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Búsqueda
   */
  private async testSearch(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/api/productos?nombre=test`)
      const duration = Date.now() - startTime

      if (!response.ok) {
        return {
          test: 'Búsqueda',
          status: 'fail',
          message: `Búsqueda devuelve ${response.status}`,
          duration,
        }
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        return {
          test: 'Búsqueda',
          status: 'fail',
          message: 'Búsqueda no devuelve un array',
          duration,
        }
      }

      return {
        test: 'Búsqueda',
        status: 'ok',
        message: `Búsqueda funciona correctamente`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Búsqueda',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Producto Individual
   */
  private async testProduct(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      // Obtener un producto primero
      const productsResponse = await fetch(`${this.baseUrl}/api/productos`)
      const products = await productsResponse.json()

      if (!Array.isArray(products) || products.length === 0) {
        return {
          test: 'Producto individual',
          status: 'fail',
          message: 'No hay productos para testear',
          duration: Date.now() - startTime,
        }
      }

      const productId = products[0].id
      const response = await fetch(`${this.baseUrl}/api/productos/${productId}`)
      const duration = Date.now() - startTime

      if (!response.ok) {
        return {
          test: 'Producto individual',
          status: 'fail',
          message: `Producto devuelve ${response.status}`,
          duration,
        }
      }

      return {
        test: 'Producto individual',
        status: 'ok',
        message: `Producto carga correctamente`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Producto individual',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Carrito
   */
  private async testCart(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      // Verificar que la página de carrito existe
      const response = await fetch(`${this.baseUrl}/carrito`)
      const duration = Date.now() - startTime

      // Puede devolver 401/403 si requiere auth, eso está bien
      if (response.status >= 500) {
        return {
          test: 'Carrito',
          status: 'fail',
          message: `Carrito devuelve ${response.status}`,
          duration,
        }
      }

      return {
        test: 'Carrito',
        status: 'ok',
        message: `Carrito accesible`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Carrito',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Envíos
   */
  private async testShipping(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/api/envios/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoPostal: 'B8000',
          peso: 1,
          precio: 10000,
        }),
      })
      const duration = Date.now() - startTime

      if (!response.ok && response.status !== 400) {
        return {
          test: 'Envíos',
          status: 'fail',
          message: `Envíos devuelve ${response.status}`,
          duration,
        }
      }

      const data = await response.json()
      if (response.ok && (!data.metodos || !Array.isArray(data.metodos))) {
        return {
          test: 'Envíos',
          status: 'fail',
          message: 'Envíos no devuelve métodos válidos',
          duration,
        }
      }

      return {
        test: 'Envíos',
        status: 'ok',
        message: `Envíos funciona correctamente`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Envíos',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Checkout
   */
  private async testCheckout(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/api/checkout/create-order-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: [] }),
      })
      const duration = Date.now() - startTime

      // Esperamos error de validación (400), no 500
      if (response.status === 500) {
        return {
          test: 'Checkout',
          status: 'fail',
          message: `Checkout devuelve 500 (error del servidor)`,
          duration,
        }
      }

      return {
        test: 'Checkout',
        status: 'ok',
        message: `Checkout responde correctamente`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Checkout',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Mercado Pago
   */
  private async testMercadoPago(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/api/diagnostico-mercadopago`)
      const duration = Date.now() - startTime

      if (!response.ok) {
        return {
          test: 'Mercado Pago',
          status: 'fail',
          message: `Diagnóstico MP devuelve ${response.status}`,
          duration,
        }
      }

      const diagnostic = await response.json()
      if (diagnostic.status === 'error' || !diagnostic.isValid) {
        return {
          test: 'Mercado Pago',
          status: 'fail',
          message: `Mercado Pago no configurado: ${diagnostic.errors?.join(', ') || 'Error desconocido'}`,
          duration,
        }
      }

      return {
        test: 'Mercado Pago',
        status: 'ok',
        message: `Mercado Pago configurado correctamente`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Mercado Pago',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Admin
   */
  private async testAdmin(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/admin/productos`)
      const duration = Date.now() - startTime

      // Puede devolver 401/403 si requiere auth, eso está bien
      if (response.status >= 500) {
        return {
          test: 'Admin',
          status: 'fail',
          message: `Admin devuelve ${response.status}`,
          duration,
        }
      }

      return {
        test: 'Admin',
        status: 'ok',
        message: `Admin accesible`,
        duration,
      }
    } catch (error: any) {
      return {
        test: 'Admin',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Test Performance
   */
  private async testPerformance(): Promise<ChecklistResult> {
    const startTime = Date.now()
    try {
      // Test de carga de home
      const homeStart = performance.now()
      await fetch(`${this.baseUrl}/`)
      const homeDuration = performance.now() - homeStart

      // Test de carga de API
      const apiStart = performance.now()
      await fetch(`${this.baseUrl}/api/productos`)
      const apiDuration = performance.now() - apiStart

      const duration = Date.now() - startTime

      const issues: string[] = []
      if (homeDuration > 2000) {
        issues.push(`Home carga lento (${homeDuration.toFixed(0)}ms)`)
      }
      if (apiDuration > 1000) {
        issues.push(`API responde lento (${apiDuration.toFixed(0)}ms)`)
      }

      if (issues.length > 0) {
        return {
          test: 'Performance',
          status: 'ok',
          message: `Performance: ${issues.join(', ')}`,
          duration,
          details: {
            homeDuration,
            apiDuration,
          },
        }
      }

      return {
        test: 'Performance',
        status: 'ok',
        message: `Performance dentro de parámetros aceptables`,
        duration,
        details: {
          homeDuration,
          apiDuration,
        },
      }
    } catch (error: any) {
      return {
        test: 'Performance',
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Genera recomendaciones basadas en resultados
   */
  private generateRecommendations(results: ChecklistResult[]): string[] {
    const recommendations: string[] = []

    const failedTests = results.filter((r) => r.status === 'fail')
    if (failedTests.length > 0) {
      recommendations.push(
        `Resolver ${failedTests.length} test(s) fallido(s) antes de pruebas masivas`
      )
    }

    const performanceTest = results.find((r) => r.test === 'Performance')
    if (performanceTest && performanceTest.details) {
      const { homeDuration, apiDuration } = performanceTest.details as any
      if (homeDuration > 2000) {
        recommendations.push('Optimizar carga inicial de home (LCP)')
      }
      if (apiDuration > 1000) {
        recommendations.push('Optimizar respuesta de API de productos')
      }
    }

    const mpTest = results.find((r) => r.test === 'Mercado Pago')
    if (mpTest && mpTest.status === 'fail') {
      recommendations.push('Configurar MP_ACCESS_TOKEN antes de pruebas de pago')
    }

    return recommendations
  }

  /**
   * Genera reporte en formato texto
   */
  generateReport(report: PreTestChecklistReport): string {
    let doc = `# PRE-TEST CHECKLIST – RESULTADO\n\n`
    doc += `**Fecha:** ${new Date(report.timestamp).toLocaleString('es-AR')}\n\n`

    doc += `## Estado General\n\n`
    doc += `**Estado:** ${report.overallStatus === 'ready' ? '✅ LISTO PARA PRUEBAS' : '❌ NO LISTO'}\n\n`

    doc += `### Resumen\n\n`
    doc += `- **Total:** ${report.summary.total}\n`
    doc += `- **Exitosos:** ${report.summary.passed} ✅\n`
    doc += `- **Fallidos:** ${report.summary.failed} ❌\n\n`

    doc += `## Resultados Detallados\n\n`
    report.results.forEach((result) => {
      const emoji = result.status === 'ok' ? '✅' : '❌'
      doc += `### ${emoji} ${result.test}\n\n`
      doc += `- **Estado:** ${result.status.toUpperCase()}\n`
      doc += `- **Mensaje:** ${result.message}\n`
      doc += `- **Duración:** ${result.duration}ms\n\n`
    })

    if (report.recommendations.length > 0) {
      doc += `## Recomendaciones\n\n`
      report.recommendations.forEach((rec, index) => {
        doc += `${index + 1}. ${rec}\n`
      })
      doc += '\n'
    }

    doc += `## Conclusión\n\n`
    doc += `**Estado:** ${report.overallStatus === 'ready' ? '✅ LISTO PARA PRUEBAS' : '❌ NO LISTO'}\n\n`
    if (report.overallStatus === 'not_ready') {
      doc += `⚠️ Resolver los problemas detectados antes de iniciar pruebas masivas.\n\n`
    }

    return doc
  }
}

export default PreTestChecklist
