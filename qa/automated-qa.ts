/**
 * Sistema de QA Automatizado Completo
 * Incluye tests de rendimiento, carga, filtros, búsqueda, variantes, rutas, etc.
 */

export interface QATestResult {
  testName: string
  category: 'performance' | 'functionality' | 'stress' | 'integration'
  success: boolean
  duration: number
  metrics?: Record<string, number>
  errors: string[]
  warnings: string[]
  details?: any
  timestamp: string
}

export interface QAReport {
  timestamp: string
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
  results: QATestResult[]
  summary: {
    performance: { passed: number; failed: number }
    functionality: { passed: number; failed: number }
    stress: { passed: number; failed: number }
    integration: { passed: number; failed: number }
  }
  recommendations: string[]
}

export class AutomatedQA {
  private baseUrl: string
  private results: QATestResult[] = []

  constructor(
    baseUrl: string = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
  ) {
    this.baseUrl = baseUrl
  }

  /**
   * Test de rendimiento básico
   */
  async testPerformance(): Promise<QATestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const metrics: Record<string, number> = {}

    try {
      // Test 1: Tiempo de carga de home
      const homeStart = Date.now()
      const homeResponse = await fetch(`${this.baseUrl}/`)
      metrics.homeLoadTime = Date.now() - homeStart
      if (metrics.homeLoadTime > 3000) {
        warnings.push(`Home carga lento: ${metrics.homeLoadTime}ms`)
      }

      // Test 2: Tiempo de carga de productos
      const productsStart = Date.now()
      const productsResponse = await fetch(`${this.baseUrl}/api/productos`)
      metrics.productsLoadTime = Date.now() - productsStart
      if (metrics.productsLoadTime > 2000) {
        warnings.push(`API de productos lenta: ${metrics.productsLoadTime}ms`)
      }

      // Test 3: Tamaño de respuesta
      const productsData = await productsResponse.json()
      const responseSize = JSON.stringify(productsData).length
      metrics.responseSize = responseSize
      if (responseSize > 1000000) {
        warnings.push(`Respuesta muy grande: ${responseSize} bytes`)
      }

      return {
        testName: 'Test de Rendimiento',
        category: 'performance',
        success: errors.length === 0,
        duration: Date.now() - startTime,
        metrics,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      errors.push(error.message || 'Error en test de rendimiento')
      return {
        testName: 'Test de Rendimiento',
        category: 'performance',
        success: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Test de funcionalidad: filtros y búsqueda
   */
  async testFiltersAndSearch(): Promise<QATestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test 1: Filtro por categoría
      const categoriaResponse = await fetch(`${this.baseUrl}/api/productos?categoria=remeras`)
      if (!categoriaResponse.ok) {
        errors.push(`Filtro por categoría falló: ${categoriaResponse.status}`)
      }

      // Test 2: Filtro por destacado
      const destacadoResponse = await fetch(`${this.baseUrl}/api/productos?destacado=true`)
      if (!destacadoResponse.ok) {
        errors.push(`Filtro por destacado falló: ${destacadoResponse.status}`)
      }

      // Test 3: Múltiples filtros
      const multipleFiltersResponse = await fetch(
        `${this.baseUrl}/api/productos?categoria=remeras&destacado=true&activo=true`
      )
      if (!multipleFiltersResponse.ok) {
        errors.push(`Múltiples filtros fallaron: ${multipleFiltersResponse.status}`)
      }

      return {
        testName: 'Test de Filtros y Búsqueda',
        category: 'functionality',
        success: errors.length === 0,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      errors.push(error.message || 'Error en test de filtros')
      return {
        testName: 'Test de Filtros y Búsqueda',
        category: 'functionality',
        success: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Test de stress: carga masiva de imágenes
   */
  async testImageLoadStress(): Promise<QATestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const metrics: Record<string, number> = {}

    try {
      // Obtener productos con imágenes
      const productsResponse = await fetch(`${this.baseUrl}/api/productos`)
      const products = await productsResponse.json()

      if (products.length === 0) {
        warnings.push('No hay productos para testear carga de imágenes')
        return {
          testName: 'Test de Stress - Carga de Imágenes',
          category: 'stress',
          success: true,
          duration: Date.now() - startTime,
          errors,
          warnings,
          timestamp: new Date().toISOString(),
        }
      }

      // Testear carga de primeras 10 imágenes
      const imageUrls: string[] = []
      products.slice(0, 10).forEach((product: any) => {
        if (product.imagenPrincipal || product.imagen_principal) {
          imageUrls.push(product.imagenPrincipal || product.imagen_principal)
        }
        if (product.imagenes && Array.isArray(product.imagenes)) {
          imageUrls.push(...product.imagenes.slice(0, 2))
        }
      })

      metrics.totalImages = imageUrls.length
      const loadTimes: number[] = []

      for (const imageUrl of imageUrls.slice(0, 5)) {
        // Solo testear primeras 5 para no sobrecargar
        try {
          const imageStart = Date.now()
          const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
          const loadTime = Date.now() - imageStart
          loadTimes.push(loadTime)

          if (!imageResponse.ok) {
            warnings.push(`Imagen no accesible: ${imageUrl}`)
          }
        } catch (error) {
          warnings.push(`Error cargando imagen: ${imageUrl}`)
        }
      }

      if (loadTimes.length > 0) {
        metrics.avgImageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
        metrics.maxImageLoadTime = Math.max(...loadTimes)
        metrics.minImageLoadTime = Math.min(...loadTimes)
      }

      return {
        testName: 'Test de Stress - Carga de Imágenes',
        category: 'stress',
        success: errors.length === 0,
        duration: Date.now() - startTime,
        metrics,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      errors.push(error.message || 'Error en test de stress de imágenes')
      return {
        testName: 'Test de Stress - Carga de Imágenes',
        category: 'stress',
        success: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Test de integración: variantes (talle + color)
   */
  async testVariants(): Promise<QATestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const productsResponse = await fetch(`${this.baseUrl}/api/productos`)
      const products = await productsResponse.json()

      if (products.length === 0) {
        warnings.push('No hay productos para testear variantes')
        return {
          testName: 'Test de Variantes (Talle + Color)',
          category: 'integration',
          success: true,
          duration: Date.now() - startTime,
          errors,
          warnings,
          timestamp: new Date().toISOString(),
        }
      }

      // Verificar que los productos tengan estructura correcta
      let productsWithTalles = 0
      let productsWithStock = 0

      products.forEach((product: any) => {
        if (product.talles && Array.isArray(product.talles) && product.talles.length > 0) {
          productsWithTalles++
        }
        if (product.stock && typeof product.stock === 'object') {
          productsWithStock++
        }
      })

      if (productsWithTalles === 0) {
        warnings.push('Ningún producto tiene talles configurados')
      }

      if (productsWithStock === 0) {
        warnings.push('Ningún producto tiene stock configurado')
      }

      return {
        testName: 'Test de Variantes (Talle + Color)',
        category: 'integration',
        success: errors.length === 0,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {
          totalProducts: products.length,
          productsWithTalles,
          productsWithStock,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      errors.push(error.message || 'Error en test de variantes')
      return {
        testName: 'Test de Variantes (Talle + Color)',
        category: 'integration',
        success: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Test de rutas y enlaces
   */
  async testRoutes(): Promise<QATestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const routes = [
        '/',
        '/catalogo',
        '/carrito',
        '/admin/login',
        '/api/productos',
        '/api/categorias',
        '/api/diagnostico-supabase',
        '/api/diagnostico-mercadopago',
      ]

      const routeResults: Record<string, number> = {}

      for (const route of routes) {
        try {
          const routeStart = Date.now()
          const response = await fetch(`${this.baseUrl}${route}`)
          const loadTime = Date.now() - routeStart
          routeResults[route] = loadTime

          if (!response.ok && response.status !== 401 && response.status !== 403) {
            // 401/403 son esperados para rutas protegidas
            errors.push(`Ruta ${route} falló: ${response.status}`)
          }
        } catch (error: any) {
          errors.push(`Error accediendo a ${route}: ${error.message}`)
        }
      }

      return {
        testName: 'Test de Rutas y Enlaces',
        category: 'functionality',
        success: errors.length === 0,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: routeResults,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      errors.push(error.message || 'Error en test de rutas')
      return {
        testName: 'Test de Rutas y Enlaces',
        category: 'functionality',
        success: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests(): Promise<QAReport> {
    const startTime = Date.now()

    // Ejecutar todos los tests en paralelo donde sea posible
    const [performanceResult, filtersResult, stressResult, variantsResult, routesResult] =
      await Promise.all([
        this.testPerformance(),
        this.testFiltersAndSearch(),
        this.testImageLoadStress(),
        this.testVariants(),
        this.testRoutes(),
      ])

    this.results = [performanceResult, filtersResult, stressResult, variantsResult, routesResult]

    const totalDuration = Date.now() - startTime
    const passedTests = this.results.filter((r) => r.success).length
    const failedTests = this.results.filter((r) => !r.success).length

    // Generar recomendaciones
    const recommendations: string[] = []
    if (failedTests > 0) {
      recommendations.push(`Revisar ${failedTests} test(s) fallido(s)`)
    }
    if (performanceResult.metrics?.homeLoadTime && performanceResult.metrics.homeLoadTime > 3000) {
      recommendations.push('Optimizar tiempo de carga de la home')
    }
    if (stressResult.warnings.length > 0) {
      recommendations.push('Revisar carga de imágenes - algunas pueden estar rotas')
    }

    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passedTests,
      failedTests,
      totalDuration,
      results: this.results,
      summary: {
        performance: {
          passed: this.results.filter((r) => r.category === 'performance' && r.success).length,
          failed: this.results.filter((r) => r.category === 'performance' && !r.success).length,
        },
        functionality: {
          passed: this.results.filter((r) => r.category === 'functionality' && r.success).length,
          failed: this.results.filter((r) => r.category === 'functionality' && !r.success).length,
        },
        stress: {
          passed: this.results.filter((r) => r.category === 'stress' && r.success).length,
          failed: this.results.filter((r) => r.category === 'stress' && !r.success).length,
        },
        integration: {
          passed: this.results.filter((r) => r.category === 'integration' && r.success).length,
          failed: this.results.filter((r) => r.category === 'integration' && !r.success).length,
        },
      },
      recommendations,
    }
  }

  /**
   * Genera reporte en formato texto
   */
  generateReport(): string {
    const report =
      this.results.length > 0
        ? this.generateReportFromResults(this.results)
        : 'No hay resultados disponibles'
    return report
  }

  private generateReportFromResults(results: QATestResult[]): string {
    let report = '# 📊 Reporte de QA Automatizado\n\n'
    report += `**Fecha:** ${new Date().toLocaleString('es-AR')}\n\n`

    const totalTests = results.length
    const passedTests = results.filter((r) => r.success).length
    const failedTests = results.filter((r) => !r.success).length

    report += `## Resumen\n\n`
    report += `- **Total de tests:** ${totalTests}\n`
    report += `- **Exitosos:** ${passedTests} ✅\n`
    report += `- **Fallidos:** ${failedTests} ${failedTests > 0 ? '❌' : ''}\n`
    report += `- **Tasa de éxito:** ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`

    report += `## Tests por Categoría\n\n`
    const categories = ['performance', 'functionality', 'stress', 'integration']
    categories.forEach((category) => {
      const categoryTests = results.filter((r) => r.category === category)
      const categoryPassed = categoryTests.filter((r) => r.success).length
      report += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`
      report += `- Tests: ${categoryTests.length}\n`
      report += `- Exitosos: ${categoryPassed}\n`
      report += `- Fallidos: ${categoryTests.length - categoryPassed}\n\n`
    })

    report += `## Detalles de Tests\n\n`
    results.forEach((result, index) => {
      report += `### ${index + 1}. ${result.testName}\n\n`
      report += `- **Estado:** ${result.success ? '✅ ÉXITO' : '❌ FALLÓ'}\n`
      report += `- **Categoría:** ${result.category}\n`
      report += `- **Duración:** ${result.duration}ms\n`

      if (result.metrics) {
        report += `- **Métricas:**\n`
        Object.entries(result.metrics).forEach(([key, value]) => {
          report += `  - ${key}: ${value}\n`
        })
      }

      if (result.errors.length > 0) {
        report += `- **Errores:**\n`
        result.errors.forEach((error) => {
          report += `  - ❌ ${error}\n`
        })
      }

      if (result.warnings.length > 0) {
        report += `- **Advertencias:**\n`
        result.warnings.forEach((warning) => {
          report += `  - ⚠️ ${warning}\n`
        })
      }

      report += '\n'
    })

    return report
  }
}
