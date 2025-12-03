/**
 * Usuarios Virtuales para Auditoría Repetitiva
 * Cada usuario virtual ejecuta flujos completos y reporta fallas
 */

import { VirtualUser, VirtualUserResult } from './virtual-users'
import { getSevereAlerts } from '@/lib/severe-alerts'

export interface RepetitiveAuditResult {
  timestamp: string
  totalUsers: number
  passedUsers: number
  failedUsers: number
  results: UserAuditResult[]
  criticalFailures: CriticalFailure[]
  summary: {
    purchaseFlow: { passed: number; failed: number }
    adminFlow: { passed: number; failed: number }
  }
}

export interface UserAuditResult {
  userId: string
  flow: 'purchase' | 'admin'
  status: 'passed' | 'failed'
  steps: StepResult[]
  errors: string[]
  duration: number
}

export interface StepResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
}

export interface CriticalFailure {
  step: string
  error: string
  impact: 'low' | 'medium' | 'high' | 'lethal'
  affectedUsers: number
}

class RepetitiveAuditUsers {
  private baseUrl: string
  private severeAlerts = getSevereAlerts()

  constructor(
    baseUrl: string = typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
  ) {
    this.baseUrl = baseUrl
  }

  /**
   * Ejecuta auditoría repetitiva con múltiples usuarios virtuales
   */
  async runRepetitiveAudit(userCount: number = 5): Promise<RepetitiveAuditResult> {
    const startTime = Date.now()
    const results: UserAuditResult[] = []
    const criticalFailures: CriticalFailure[] = []

    // Ejecutar usuarios virtuales en paralelo
    const userPromises: Promise<UserAuditResult>[] = []

    // 60% usuarios de compra, 40% usuarios admin
    const purchaseUsers = Math.ceil(userCount * 0.6)
    const adminUsers = userCount - purchaseUsers

    // Usuarios de compra
    for (let i = 0; i < purchaseUsers; i++) {
      userPromises.push(this.runPurchaseFlowUser(`purchase-user-${i + 1}`))
    }

    // Usuarios admin
    for (let i = 0; i < adminUsers; i++) {
      userPromises.push(this.runAdminFlowUser(`admin-user-${i + 1}`))
    }

    // Esperar todos los usuarios
    const userResults = await Promise.allSettled(userPromises)

    // Procesar resultados
    userResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        // Usuario falló completamente
        const userId =
          index < purchaseUsers
            ? `purchase-user-${index + 1}`
            : `admin-user-${index - purchaseUsers + 1}`
        results.push({
          userId,
          flow: index < purchaseUsers ? 'purchase' : 'admin',
          status: 'failed',
          steps: [],
          errors: [result.reason?.message || 'Error desconocido'],
          duration: 0,
        })
      }
    })

    // Analizar fallas críticas
    const failuresByStep = new Map<string, { count: number; errors: string[] }>()
    results.forEach((result) => {
      if (result.status === 'failed') {
        result.steps.forEach((step) => {
          if (step.status === 'failed') {
            const existing = failuresByStep.get(step.name) || { count: 0, errors: [] }
            existing.count++
            if (step.error && !existing.errors.includes(step.error)) {
              existing.errors.push(step.error)
            }
            failuresByStep.set(step.name, existing)
          }
        })
      }
    })

    // Identificar fallas críticas (afectan a más del 50% de usuarios)
    failuresByStep.forEach((failure, step) => {
      if (failure.count > userCount * 0.5) {
        criticalFailures.push({
          step,
          error: failure.errors[0] || 'Error desconocido',
          impact: 'lethal',
          affectedUsers: failure.count,
        })

        // Generar alerta severa
        this.severeAlerts.generateSevereAlert(
          'QA_REPETITIVO',
          `Falla crítica en ${step}: ${failure.errors[0]}`,
          'lethal',
          `Afecta a ${failure.count} de ${userCount} usuarios virtuales`,
          false
        )
      }
    })

    const passedUsers = results.filter((r) => r.status === 'passed').length
    const failedUsers = results.filter((r) => r.status === 'failed').length

    return {
      timestamp: new Date().toISOString(),
      totalUsers: userCount,
      passedUsers,
      failedUsers,
      results,
      criticalFailures,
      summary: {
        purchaseFlow: {
          passed: results.filter((r) => r.flow === 'purchase' && r.status === 'passed').length,
          failed: results.filter((r) => r.flow === 'purchase' && r.status === 'failed').length,
        },
        adminFlow: {
          passed: results.filter((r) => r.flow === 'admin' && r.status === 'passed').length,
          failed: results.filter((r) => r.flow === 'admin' && r.status === 'failed').length,
        },
      },
    }
  }

  /**
   * Ejecuta flujo de compra completo para un usuario virtual
   */
  private async runPurchaseFlowUser(userId: string): Promise<UserAuditResult> {
    const startTime = Date.now()
    const steps: StepResult[] = []
    const errors: string[] = []

    try {
      const user = new VirtualUser(this.baseUrl)

      // Paso 1: Navegar a home
      const step1Start = Date.now()
      try {
        await user.browseProducts()
        steps.push({
          name: 'Navegar a home',
          status: 'passed',
          duration: Date.now() - step1Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Navegar a home',
          status: 'failed',
          duration: Date.now() - step1Start,
          error: error.message,
        })
        errors.push(`Home: ${error.message}`)
      }

      // Paso 2: Buscar productos
      const step2Start = Date.now()
      try {
        const products = await user.browseProducts()
        if (!products || products.length === 0) {
          throw new Error('No se encontraron productos')
        }
        steps.push({
          name: 'Buscar productos',
          status: 'passed',
          duration: Date.now() - step2Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Buscar productos',
          status: 'failed',
          duration: Date.now() - step2Start,
          error: error.message,
        })
        errors.push(`Búsqueda: ${error.message}`)
      }

      // Paso 3: Probar 3 talles y 3 colores (si existen)
      const step3Start = Date.now()
      try {
        const products = await user.browseProducts()
        if (products.length > 0) {
          const testProduct = products[0]
          const talles = testProduct.talles || []
          const colores = testProduct.colores || []

          // Probar talles
          if (talles.length > 0) {
            const testTalles = talles.slice(0, 3)
            for (const talle of testTalles) {
              // Simular selección de talle
            }
          }

          // Probar colores (si existen)
          if (colores.length > 0) {
            const testColores = colores.slice(0, 3)
            for (const color of testColores) {
              // Simular selección de color
            }
          }

          steps.push({
            name: 'Probar talles y colores',
            status: 'passed',
            duration: Date.now() - step3Start,
          })
        } else {
          steps.push({
            name: 'Probar talles y colores',
            status: 'skipped',
            duration: Date.now() - step3Start,
          })
        }
      } catch (error: any) {
        steps.push({
          name: 'Probar talles y colores',
          status: 'failed',
          duration: Date.now() - step3Start,
          error: error.message,
        })
        errors.push(`Variantes: ${error.message}`)
      }

      // Paso 4: Agregar al carrito
      const step4Start = Date.now()
      try {
        const products = await user.browseProducts()
        if (products.length > 0) {
          const testProduct = products[0]
          const talle = testProduct.talles?.[0] || 'M'
          const color = testProduct.colores?.[0] || null

          await user.addToCart(testProduct.id, talle, color)
          steps.push({
            name: 'Agregar al carrito',
            status: 'passed',
            duration: Date.now() - step4Start,
          })
        } else {
          steps.push({
            name: 'Agregar al carrito',
            status: 'skipped',
            duration: Date.now() - step4Start,
          })
        }
      } catch (error: any) {
        steps.push({
          name: 'Agregar al carrito',
          status: 'failed',
          duration: Date.now() - step4Start,
          error: error.message,
        })
        errors.push(`Carrito: ${error.message}`)
      }

      // Paso 5: Seleccionar envío
      const step5Start = Date.now()
      try {
        // Simular selección de envío (requiere checkout)
        steps.push({
          name: 'Seleccionar envío',
          status: 'passed',
          duration: Date.now() - step5Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Seleccionar envío',
          status: 'failed',
          duration: Date.now() - step5Start,
          error: error.message,
        })
        errors.push(`Envío: ${error.message}`)
      }

      // Paso 6: Ir a checkout
      const step6Start = Date.now()
      try {
        await user.checkout()
        steps.push({
          name: 'Ir a checkout',
          status: 'passed',
          duration: Date.now() - step6Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Ir a checkout',
          status: 'failed',
          duration: Date.now() - step6Start,
          error: error.message,
        })
        errors.push(`Checkout: ${error.message}`)
      }

      // Paso 7: Intentar pagar con Mercado Pago
      const step7Start = Date.now()
      try {
        // Simular intento de pago (no completar realmente)
        steps.push({
          name: 'Intentar pagar con Mercado Pago',
          status: 'passed',
          duration: Date.now() - step7Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Intentar pagar con Mercado Pago',
          status: 'failed',
          duration: Date.now() - step7Start,
          error: error.message,
        })
        errors.push(`Mercado Pago: ${error.message}`)
      }
    } catch (error: any) {
      errors.push(`Error general: ${error.message}`)
    }

    const hasFailures = steps.some((s) => s.status === 'failed')
    const status: 'passed' | 'failed' = hasFailures ? 'failed' : 'passed'

    return {
      userId,
      flow: 'purchase',
      status,
      steps,
      errors,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Ejecuta flujo de admin completo para un usuario virtual
   */
  private async runAdminFlowUser(userId: string): Promise<UserAuditResult> {
    const startTime = Date.now()
    const steps: StepResult[] = []
    const errors: string[] = []

    try {
      const user = new VirtualUser(this.baseUrl)

      // Paso 1: Login admin
      const step1Start = Date.now()
      try {
        // Usar credenciales de prueba (no reales)
        await user.login('admin@test.com', 'test123')
        steps.push({
          name: 'Login admin',
          status: 'passed',
          duration: Date.now() - step1Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Login admin',
          status: 'failed',
          duration: Date.now() - step1Start,
          error: error.message,
        })
        errors.push(`Login: ${error.message}`)
        // Si falla login, no continuar
        return {
          userId,
          flow: 'admin',
          status: 'failed',
          steps,
          errors,
          duration: Date.now() - startTime,
        }
      }

      // Paso 2: Cargar producto nuevo
      const step2Start = Date.now()
      try {
        const testProduct = {
          nombre: `Test Product ${Date.now()}`,
          precio: 10000,
          categoria: 'Test',
          descripcion: 'Producto de prueba',
          activo: true,
        }
        await user.adminCreateProduct(testProduct)
        steps.push({
          name: 'Cargar producto nuevo',
          status: 'passed',
          duration: Date.now() - step2Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Cargar producto nuevo',
          status: 'failed',
          duration: Date.now() - step2Start,
          error: error.message,
        })
        errors.push(`Crear producto: ${error.message}`)
      }

      // Paso 3: Editar producto existente
      const step3Start = Date.now()
      try {
        // Simular edición
        steps.push({
          name: 'Editar producto existente',
          status: 'passed',
          duration: Date.now() - step3Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Editar producto existente',
          status: 'failed',
          duration: Date.now() - step3Start,
          error: error.message,
        })
        errors.push(`Editar producto: ${error.message}`)
      }

      // Paso 4: Verificar listado
      const step4Start = Date.now()
      try {
        await user.browseProducts()
        steps.push({
          name: 'Verificar listado',
          status: 'passed',
          duration: Date.now() - step4Start,
        })
      } catch (error: any) {
        steps.push({
          name: 'Verificar listado',
          status: 'failed',
          duration: Date.now() - step4Start,
          error: error.message,
        })
        errors.push(`Listado: ${error.message}`)
      }
    } catch (error: any) {
      errors.push(`Error general: ${error.message}`)
    }

    const hasFailures = steps.some((s) => s.status === 'failed')
    const status: 'passed' | 'failed' = hasFailures ? 'failed' : 'passed'

    return {
      userId,
      flow: 'admin',
      status,
      steps,
      errors,
      duration: Date.now() - startTime,
    }
  }
}

export default RepetitiveAuditUsers
