/**
 * Sistema de diagnóstico automático para Mercado Pago
 * Detecta problemas comunes y genera reportes detallados
 */

import { validateMercadoPagoConfig } from './mercadopago/validate'

export interface MercadoPagoDiagnostic {
  timestamp: string
  status: 'ok' | 'error' | 'warning'
  issues: DiagnosticIssue[]
  recommendations: string[]
  environment: {
    nodeEnv: string
    vercel: boolean
  }
}

export interface DiagnosticIssue {
  severity: 'critical' | 'error' | 'warning' | 'info'
  code: string
  message: string
  file?: string
  line?: number
  solution: string
  relatedFiles?: string[]
}

export function diagnoseMercadoPago(): MercadoPagoDiagnostic {
  const timestamp = new Date().toISOString()
  const issues: DiagnosticIssue[] = []
  const recommendations: string[] = []

  // Validar configuración básica
  const mpConfig = validateMercadoPagoConfig()

  if (!mpConfig.isValid) {
    issues.push({
      severity: 'critical',
      code: 'MP_CONFIG_MISSING',
      message: 'MP_ACCESS_TOKEN no está configurado',
      file: 'app/api/checkout/create-order-simple/route.ts',
      line: 55,
      solution: 'Configura MP_ACCESS_TOKEN en las variables de entorno de Vercel',
      relatedFiles: [
        'app/api/checkout/create-order-simple/route.ts',
        'lib/mercadopago/validate.ts',
      ],
    })
  }

  // Verificar variables de entorno
  const mpAccessToken =
    process.env.MP_ACCESS_TOKEN ||
    process.env['MP_ACCESS_TOKEN'] ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env['MERCADOPAGO_ACCESS_TOKEN']

  if (!mpAccessToken) {
    issues.push({
      severity: 'critical',
      code: 'MP_TOKEN_NOT_FOUND',
      message: 'No se encontró MP_ACCESS_TOKEN en ninguna variable de entorno',
      file: 'app/api/checkout/create-order-simple/route.ts',
      line: 56,
      solution: 'Agrega MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables',
      relatedFiles: ['app/api/checkout/create-order-simple/route.ts'],
    })
  } else {
    // Validar formato del token (debe empezar con TEST- o APP_USR-)
    if (!mpAccessToken.startsWith('TEST-') && !mpAccessToken.startsWith('APP_USR-')) {
      issues.push({
        severity: 'warning',
        code: 'MP_TOKEN_INVALID_FORMAT',
        message: 'El formato del token parece inválido',
        file: 'app/api/checkout/create-order-simple/route.ts',
        solution:
          'Verifica que el token sea correcto. Debe empezar con TEST- (sandbox) o APP_USR- (producción)',
      })
    }
  }

  // Verificar que el endpoint esté correctamente configurado
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'

  if (baseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    issues.push({
      severity: 'warning',
      code: 'BASE_URL_LOCALHOST',
      message: 'BASE_URL está configurado como localhost en producción',
      solution: 'Configura NEXT_PUBLIC_BASE_URL con la URL real de producción',
    })
  }

  // Generar recomendaciones
  if (issues.length === 0) {
    recommendations.push('✅ Configuración de Mercado Pago correcta')
  } else {
    recommendations.push(
      '1. Verifica que MP_ACCESS_TOKEN esté configurado en las variables de entorno'
    )
    recommendations.push('2. Asegúrate de hacer REDEPLOY después de agregar variables')
    recommendations.push(
      '3. Verifica que el token sea válido en https://www.mercadopago.com.ar/developers/panel'
    )
  }

  return {
    timestamp,
    status: issues.some((i) => i.severity === 'critical' || i.severity === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : 'ok',
    issues,
    recommendations,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      vercel: !!process.env.VERCEL,
    },
  }
}

export function generateMercadoPagoReport(diagnostic: MercadoPagoDiagnostic): string {
  let report = '# 🔍 Reporte de Diagnóstico - Mercado Pago\n\n'
  report += `**Fecha:** ${new Date(diagnostic.timestamp).toLocaleString('es-AR')}\n\n`
  report += `**Estado:** ${diagnostic.status === 'ok' ? '✅ OK' : diagnostic.status === 'error' ? '❌ ERROR' : '⚠️ ADVERTENCIA'}\n\n`

  if (diagnostic.issues.length === 0) {
    report += '✅ No se encontraron problemas.\n\n'
  } else {
    report += `## Problemas Encontrados (${diagnostic.issues.length})\n\n`

    diagnostic.issues.forEach((issue, index) => {
      report += `### ${index + 1}. ${issue.message}\n\n`
      report += `- **Severidad:** ${issue.severity}\n`
      report += `- **Código:** ${issue.code}\n`
      if (issue.file) {
        report += `- **Archivo:** ${issue.file}`
        if (issue.line) {
          report += ` (línea ${issue.line})`
        }
        report += '\n'
      }
      report += `- **Solución:** ${issue.solution}\n`
      if (issue.relatedFiles && issue.relatedFiles.length > 0) {
        report += `- **Archivos relacionados:** ${issue.relatedFiles.join(', ')}\n`
      }
      report += '\n'
    })
  }

  report += '## Recomendaciones\n\n'
  diagnostic.recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`
  })

  report += '\n## Información del Entorno\n\n'
  report += `- **Node Env:** ${diagnostic.environment.nodeEnv}\n`
  report += `- **Vercel:** ${diagnostic.environment.vercel ? 'Sí' : 'No'}\n`

  return report
}
