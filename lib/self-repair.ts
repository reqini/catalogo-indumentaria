/**
 * Módulo Self-Repair - Auto-Reparación Inteligente
 * Detecta y repara problemas comunes de manera segura
 */

import { getSystemGuardian } from './system-guardian'
import * as fs from 'fs'
import * as path from 'path'

export interface RepairResult {
  success: boolean
  repaired: boolean
  message: string
  changes: string[]
  backupCreated: boolean
  backupPath?: string
}

export interface RepairIssue {
  type: 'import' | 'function' | 'endpoint' | 'hook' | 'prop' | 'unknown'
  description: string
  file: string
  line?: number
  severity: 'critical' | 'error' | 'warning'
  canAutoFix: boolean
}

class SelfRepair {
  private guardian = getSystemGuardian()
  private backupsDir = path.join(process.cwd(), '.backups')
  private repairs: RepairResult[] = []

  constructor() {
    // Crear directorio de backups si no existe
    if (typeof window === 'undefined' && !fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true })
    }
  }

  /**
   * Detecta problemas comunes en el código
   */
  async detectIssues(filePath: string): Promise<RepairIssue[]> {
    const issues: RepairIssue[] = []

    try {
      // Solo funciona en servidor (Node.js)
      if (typeof window !== 'undefined') {
        return issues
      }

      if (!fs.existsSync(filePath)) {
        issues.push({
          type: 'unknown',
          description: `Archivo no existe: ${filePath}`,
          file: filePath,
          severity: 'error',
          canAutoFix: false,
        })
        return issues
      }

      const content = fs.readFileSync(filePath, 'utf-8')

      // Detectar imports rotos
      const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g
      let match
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]
        if (!this.checkImportExists(importPath, filePath)) {
          issues.push({
            type: 'import',
            description: `Import roto: ${importPath}`,
            file: filePath,
            severity: 'error',
            canAutoFix: true,
          })
        }
      }

      // Detectar funciones no definidas (básico)
      // Esto es más complejo y requeriría análisis AST completo
    } catch (error: any) {
      this.guardian.detectError(
        'warning',
        'components',
        `Error detectando problemas en ${filePath}: ${error.message}`,
        {
          file: filePath,
        }
      )
    }

    return issues
  }

  /**
   * Intenta reparar un problema
   */
  async attemptRepair(issue: RepairIssue): Promise<RepairResult> {
    if (!issue.canAutoFix) {
      return {
        success: false,
        repaired: false,
        message: 'No se puede auto-reparar este problema',
        changes: [],
        backupCreated: false,
      }
    }

    // Crear backup antes de reparar
    const backupPath = await this.createBackup(issue.file)

    try {
      let repaired = false
      const changes: string[] = []

      switch (issue.type) {
        case 'import':
          repaired = await this.repairImport(issue)
          if (repaired) {
            changes.push(`Reparado import en ${issue.file}`)
          }
          break

        default:
          // No se puede reparar automáticamente
          break
      }

      return {
        success: true,
        repaired,
        message: repaired ? 'Problema reparado exitosamente' : 'No se pudo reparar automáticamente',
        changes,
        backupCreated: !!backupPath,
        backupPath: backupPath || undefined,
      }
    } catch (error: any) {
      // Restaurar desde backup si falla
      if (backupPath) {
        await this.restoreFromBackup(issue.file, backupPath)
      }

      return {
        success: false,
        repaired: false,
        message: `Error en reparación: ${error.message}`,
        changes: [],
        backupCreated: !!backupPath,
        backupPath: backupPath || undefined,
      }
    }
  }

  /**
   * Crea backup de un archivo
   */
  private async createBackup(filePath: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' || !fs.existsSync(filePath)) {
        return null
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = path.basename(filePath)
      const backupFileName = `${fileName}.backup.${timestamp}`
      const backupPath = path.join(this.backupsDir, backupFileName)

      fs.copyFileSync(filePath, backupPath)

      return backupPath
    } catch (error) {
      console.warn('[SelfRepair] No se pudo crear backup:', error)
      return null
    }
  }

  /**
   * Restaura archivo desde backup
   */
  private async restoreFromBackup(filePath: string, backupPath: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' || !fs.existsSync(backupPath)) {
        return
      }

      fs.copyFileSync(backupPath, filePath)
    } catch (error) {
      console.error('[SelfRepair] Error restaurando desde backup:', error)
    }
  }

  /**
   * Verifica si un import existe
   */
  private checkImportExists(importPath: string, fromFile: string): boolean {
    try {
      if (typeof window !== 'undefined') {
        return true // En cliente, asumir que existe
      }

      // Resolver ruta relativa
      const fileDir = path.dirname(fromFile)
      const resolvedPath = path.resolve(fileDir, importPath)

      // Verificar si existe como archivo o directorio
      if (fs.existsSync(resolvedPath)) {
        return true
      }

      // Verificar extensiones comunes
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
      for (const ext of extensions) {
        if (fs.existsSync(resolvedPath + ext)) {
          return true
        }
      }

      // Verificar si es un módulo de node_modules
      if (importPath.startsWith('@/') || !importPath.startsWith('.')) {
        // Es un alias o módulo externo, asumir que existe
        return true
      }

      return false
    } catch {
      return false
    }
  }

  /**
   * Repara un import roto
   */
  private async repairImport(issue: RepairIssue): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' || !fs.existsSync(issue.file)) {
        return false
      }

      const content = fs.readFileSync(issue.file, 'utf-8')
      // En un sistema real, aquí se intentaría encontrar el archivo correcto
      // Por ahora, solo registramos que se detectó el problema

      // Registrar en guardian
      this.guardian.detectError(
        'error',
        'components',
        `Import roto detectado: ${issue.description}`,
        {
          file: issue.file,
          solution: 'Verificar que el archivo importado exista y la ruta sea correcta',
        }
      )

      return false // No auto-reparar imports por seguridad
    } catch {
      return false
    }
  }

  /**
   * Obtiene historial de reparaciones
   */
  getRepairHistory(): RepairResult[] {
    return this.repairs
  }
}

// Singleton
let repairInstance: SelfRepair | null = null

export function getSelfRepair(): SelfRepair {
  if (!repairInstance) {
    repairInstance = new SelfRepair()
  }
  return repairInstance
}

export default SelfRepair
