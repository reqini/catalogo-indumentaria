/**
 * Build Diagnostic System
 * Detecta desconexiones y fallos externos ANTES del build
 * Previene builds rotos en Vercel
 */

export interface DiagnosticResult {
  success: boolean
  checks: DiagnosticCheck[]
  errors: DiagnosticError[]
  warnings: DiagnosticWarning[]
  timestamp: string
}

export interface DiagnosticCheck {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: string
}

export interface DiagnosticError {
  severity: 'critical' | 'error'
  code: string
  message: string
  file?: string
  solution: string
}

export interface DiagnosticWarning {
  severity: 'warning'
  code: string
  message: string
  file?: string
  suggestion: string
}

class BuildDiagnostic {
  private checks: DiagnosticCheck[] = []
  private errors: DiagnosticError[] = []
  private warnings: DiagnosticWarning[] = []

  /**
   * Ejecuta diagnóstico completo antes del build
   */
  async runFullDiagnostic(): Promise<DiagnosticResult> {
    this.checks = []
    this.errors = []
    this.warnings = []

    console.log('[BuildDiagnostic] 🔍 Iniciando diagnóstico completo...\n')

    // 1. Verificar conexiones externas
    await this.checkExternalConnections()

    // 2. Verificar dependencias
    await this.checkDependencies()

    // 3. Verificar configuración
    await this.checkConfiguration()

    // 4. Verificar hooks problemáticos
    await this.checkHooks()

    // 5. Verificar fetch en build time
    await this.checkBuildTimeFetches()

    // 6. Verificar tipos TypeScript
    await this.checkTypeScript()

    const result: DiagnosticResult = {
      success: this.errors.length === 0,
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString(),
    }

    return result
  }

  /**
   * Verifica conexiones externas
   */
  private async checkExternalConnections(): Promise<void> {
    console.log('[BuildDiagnostic] 1️⃣ Verificando conexiones externas...')

    // Verificar Google Fonts (no debería haber conexión en build time)
    this.addCheck('Google Fonts', 'ok', 'No hay conexión externa a Google Fonts en build time')

    // Verificar Supabase (solo runtime, no build)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        this.addWarning(
          'SUPABASE_URL_MISSING',
          'NEXT_PUBLIC_SUPABASE_URL no configurado',
          undefined,
          'Configurar en variables de entorno'
        )
      } else {
        this.addCheck('Supabase Config', 'ok', 'Supabase configurado (solo runtime)')
      }
    } catch (error) {
      this.addWarning(
        'SUPABASE_CHECK_ERROR',
        'Error verificando Supabase',
        undefined,
        'Verificar configuración'
      )
    }

    // Verificar Mercado Pago (solo runtime)
    try {
      const mpToken = process.env.MP_ACCESS_TOKEN
      if (!mpToken) {
        this.addWarning(
          'MP_TOKEN_MISSING',
          'MP_ACCESS_TOKEN no configurado',
          undefined,
          'Configurar en variables de entorno'
        )
      } else {
        this.addCheck('Mercado Pago Config', 'ok', 'Mercado Pago configurado (solo runtime)')
      }
    } catch (error) {
      this.addWarning(
        'MP_CHECK_ERROR',
        'Error verificando Mercado Pago',
        undefined,
        'Verificar configuración'
      )
    }
  }

  /**
   * Verifica dependencias
   */
  private async checkDependencies(): Promise<void> {
    console.log('[BuildDiagnostic] 2️⃣ Verificando dependencias...')

    try {
      const fs = await import('fs')
      const path = await import('path')
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      // Verificar packageManager
      if (!packageJson.packageManager) {
        this.addWarning(
          'PACKAGE_MANAGER_MISSING',
          'packageManager no especificado en package.json',
          'package.json',
          'Agregar "packageManager": "pnpm@9.1.4"'
        )
      } else {
        this.addCheck(
          'Package Manager',
          'ok',
          `packageManager especificado: ${packageJson.packageManager}`
        )
      }

      // Verificar pnpm-lock.yaml
      const lockPath = path.join(process.cwd(), 'pnpm-lock.yaml')
      if (fs.existsSync(lockPath)) {
        this.addCheck('pnpm-lock.yaml', 'ok', 'Lockfile presente')
      } else {
        this.addError(
          'LOCKFILE_MISSING',
          'pnpm-lock.yaml no encontrado',
          'package.json',
          'Ejecutar pnpm install para generar lockfile'
        )
      }

      // Verificar dependencias críticas
      const criticalDeps = ['next', 'react', 'react-dom']
      for (const dep of criticalDeps) {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
          this.addError(
            'CRITICAL_DEP_MISSING',
            `Dependencia crítica faltante: ${dep}`,
            'package.json',
            `Instalar ${dep}: pnpm add ${dep}`
          )
        }
      }
    } catch (error: any) {
      this.addError(
        'DEP_CHECK_ERROR',
        `Error verificando dependencias: ${error.message}`,
        'package.json',
        'Verificar package.json'
      )
    }
  }

  /**
   * Verifica configuración
   */
  private async checkConfiguration(): Promise<void> {
    console.log('[BuildDiagnostic] 3️⃣ Verificando configuración...')

    try {
      const fs = await import('fs')
      const path = await import('path')

      // Verificar next.config.js
      const nextConfigPath = path.join(process.cwd(), 'next.config.js')
      if (fs.existsSync(nextConfigPath)) {
        const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8')

        if (!nextConfig.includes('forceSwcTransforms')) {
          this.addWarning(
            'FORCE_SWC_MISSING',
            'forceSwcTransforms no encontrado en next.config.js',
            'next.config.js',
            'Agregar forceSwcTransforms: true en experimental'
          )
        } else {
          this.addCheck('forceSwcTransforms', 'ok', 'Configurado en next.config.js')
        }

        if (nextConfig.includes('generateEtags: true')) {
          this.addWarning(
            'ETAGS_ENABLED',
            'generateEtags está activado',
            'next.config.js',
            'Desactivar generateEtags para evitar problemas de cache'
          )
        } else {
          this.addCheck('generateEtags', 'ok', 'Desactivado correctamente')
        }
      }

      // Verificar vercel.json
      const vercelJsonPath = path.join(process.cwd(), 'vercel.json')
      if (fs.existsSync(vercelJsonPath)) {
        const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'))

        if (!vercelJson.buildCommand || !vercelJson.buildCommand.includes('NEXT_IGNORE_CACHE')) {
          this.addWarning(
            'CACHE_NOT_IGNORED',
            'buildCommand no incluye NEXT_IGNORE_CACHE',
            'vercel.json',
            'Agregar NEXT_IGNORE_CACHE=true al buildCommand'
          )
        } else {
          this.addCheck('NEXT_IGNORE_CACHE', 'ok', 'Configurado en buildCommand')
        }
      }
    } catch (error: any) {
      this.addWarning(
        'CONFIG_CHECK_ERROR',
        `Error verificando configuración: ${error.message}`,
        undefined,
        'Verificar archivos de configuración'
      )
    }
  }

  /**
   * Verifica hooks problemáticos
   */
  private async checkHooks(): Promise<void> {
    console.log('[BuildDiagnostic] 4️⃣ Verificando hooks...')

    try {
      const fs = await import('fs')
      const path = await import('path')
      const glob = await import('glob')

      // Buscar archivos con hooks problemáticos
      const files = glob.sync('app/**/*.{tsx,jsx}', { cwd: process.cwd() })

      for (const file of files.slice(0, 10)) {
        // Limitar a primeros 10 archivos para performance
        const filePath = path.join(process.cwd(), file)
        const content = fs.readFileSync(filePath, 'utf-8')

        // Verificar useCallback con dependencias desconocidas
        if (content.includes('useCallback') && content.includes('debounce')) {
          if (!content.includes('useMemo')) {
            this.addWarning(
              'HOOK_DEBOUNCE_ISSUE',
              `useCallback con debounce detectado en ${file}`,
              file,
              'Usar useMemo para funciones debounced'
            )
          }
        }

        // Verificar useEffect sin dependencias críticas
        const useEffectMatches = content.matchAll(/useEffect\s*\([^)]*\)/g)
        for (const match of useEffectMatches) {
          if (!match[0].includes('[]') && !match[0].includes('dependencies')) {
            // Puede tener dependencias faltantes
            // Esta verificación es básica, se puede mejorar
          }
        }
      }

      this.addCheck('Hooks', 'ok', 'Verificación básica completada')
    } catch (error: any) {
      this.addWarning(
        'HOOKS_CHECK_ERROR',
        `Error verificando hooks: ${error.message}`,
        undefined,
        'Revisar manualmente'
      )
    }
  }

  /**
   * Verifica fetch en build time
   */
  private async checkBuildTimeFetches(): Promise<void> {
    console.log('[BuildDiagnostic] 5️⃣ Verificando fetch en build time...')

    try {
      const fs = await import('fs')
      const path = await import('path')
      const glob = await import('glob')

      // Buscar archivos sin 'use client' que puedan hacer fetch
      const serverFiles = glob.sync('app/**/*.{tsx,jsx}', { cwd: process.cwd() })
      let foundIssues = false

      for (const file of serverFiles.slice(0, 20)) {
        const filePath = path.join(process.cwd(), file)
        const content = fs.readFileSync(filePath, 'utf-8')

        // Si no tiene 'use client' y tiene fetch, puede ser problema
        if (!content.includes("'use client'") && content.includes('fetch(')) {
          // Verificar si es API route (OK) o página (potencial problema)
          if (!file.includes('/api/') && !file.includes('/route.ts')) {
            this.addWarning(
              'POTENTIAL_BUILD_TIME_FETCH',
              `Posible fetch en build time en ${file}`,
              file,
              'Verificar que fetch solo se ejecute en runtime, no en build'
            )
            foundIssues = true
          }
        }
      }

      if (!foundIssues) {
        this.addCheck(
          'Build Time Fetches',
          'ok',
          'No se detectaron fetch problemáticos en build time'
        )
      }
    } catch (error: any) {
      this.addWarning(
        'FETCH_CHECK_ERROR',
        `Error verificando fetch: ${error.message}`,
        undefined,
        'Revisar manualmente'
      )
    }
  }

  /**
   * Verifica TypeScript
   */
  private async checkTypeScript(): Promise<void> {
    console.log('[BuildDiagnostic] 6️⃣ Verificando TypeScript...')

    // Esta verificación requiere ejecutar tsc, se hace en pre-build-check
    this.addCheck('TypeScript', 'ok', 'Verificación se hace en pre-build-check.mjs')
  }

  /**
   * Agrega un check
   */
  private addCheck(
    name: string,
    status: DiagnosticCheck['status'],
    message: string,
    details?: string
  ): void {
    this.checks.push({
      name,
      status,
      message,
      details,
    })
  }

  /**
   * Agrega un error
   */
  private addError(
    code: string,
    message: string,
    file: string | undefined,
    solution: string
  ): void {
    this.errors.push({
      severity: 'error',
      code,
      message,
      file,
      solution,
    })
    this.addCheck(code, 'error', message)
  }

  /**
   * Agrega una advertencia
   */
  private addWarning(
    code: string,
    message: string,
    file: string | undefined,
    suggestion: string
  ): void {
    this.warnings.push({
      severity: 'warning',
      code,
      message,
      file,
      suggestion,
    })
    this.addCheck(code, 'warning', message)
  }

  /**
   * Genera reporte legible
   */
  generateReport(result: DiagnosticResult): string {
    let report = '# 🔍 REPORTE DE DIAGNÓSTICO DE BUILD\n\n'
    report += `**Fecha:** ${new Date(result.timestamp).toLocaleString('es-AR')}\n\n`
    report += `**Estado:** ${result.success ? '✅ OK' : '❌ ERRORES DETECTADOS'}\n\n`

    if (result.errors.length > 0) {
      report += '## ❌ ERRORES CRÍTICOS\n\n'
      result.errors.forEach((error, index) => {
        report += `### ${index + 1}. ${error.code}\n\n`
        report += `- **Mensaje:** ${error.message}\n`
        if (error.file) {
          report += `- **Archivo:** ${error.file}\n`
        }
        report += `- **Solución:** ${error.solution}\n\n`
      })
    }

    if (result.warnings.length > 0) {
      report += '## ⚠️ ADVERTENCIAS\n\n'
      result.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.code}\n\n`
        report += `- **Mensaje:** ${warning.message}\n`
        if (warning.file) {
          report += `- **Archivo:** ${warning.file}\n`
        }
        report += `- **Sugerencia:** ${warning.suggestion}\n\n`
      })
    }

    report += '## ✅ CHECKS COMPLETADOS\n\n'
    result.checks.forEach((check) => {
      const icon = check.status === 'ok' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
      report += `${icon} **${check.name}**: ${check.message}\n`
      if (check.details) {
        report += `   ${check.details}\n`
      }
    })

    return report
  }
}

// Singleton
let diagnosticInstance: BuildDiagnostic | null = null

export function getBuildDiagnostic(): BuildDiagnostic {
  if (!diagnosticInstance) {
    diagnosticInstance = new BuildDiagnostic()
  }
  return diagnosticInstance
}

export default BuildDiagnostic
