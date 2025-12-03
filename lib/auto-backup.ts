/**
 * Sistema de Backups Automáticos
 * Crea backups antes de modificar archivos críticos
 */

import * as fs from 'fs'
import * as path from 'path'

export interface BackupInfo {
  originalPath: string
  backupPath: string
  timestamp: string
  size: number
}

class AutoBackup {
  private backupsDir = path.join(process.cwd(), '.backups')
  private maxBackups = 10 // Mantener solo los últimos 10 backups por archivo

  constructor() {
    // Crear directorio de backups si no existe (solo en servidor)
    if (typeof window === 'undefined' && !fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true })
    }
  }

  /**
   * Crea backup de un archivo antes de modificarlo
   */
  async createBackup(filePath: string): Promise<BackupInfo | null> {
    try {
      // Solo funciona en servidor
      if (typeof window !== 'undefined') {
        return null
      }

      if (!fs.existsSync(filePath)) {
        console.warn(`[AutoBackup] Archivo no existe: ${filePath}`)
        return null
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = path.basename(filePath)
      const fileDir = path
        .dirname(filePath)
        .replace(process.cwd(), '')
        .replace(/^\//, '')
        .replace(/\//g, '_')
      const backupFileName = `${fileDir}_${fileName}.backup.${timestamp}`
      const backupPath = path.join(this.backupsDir, backupFileName)

      // Copiar archivo
      fs.copyFileSync(filePath, backupPath)

      const stats = fs.statSync(backupPath)

      // Limpiar backups antiguos
      this.cleanOldBackups(filePath)

      return {
        originalPath: filePath,
        backupPath,
        timestamp,
        size: stats.size,
      }
    } catch (error: any) {
      console.error(`[AutoBackup] Error creando backup de ${filePath}:`, error.message)
      return null
    }
  }

  /**
   * Restaura un archivo desde su backup más reciente
   */
  async restoreFromBackup(filePath: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const backups = this.getBackupsForFile(filePath)
      if (backups.length === 0) {
        console.warn(`[AutoBackup] No hay backups para ${filePath}`)
        return false
      }

      // Usar el backup más reciente
      const latestBackup = backups[backups.length - 1]

      if (!fs.existsSync(latestBackup.backupPath)) {
        console.warn(`[AutoBackup] Backup no existe: ${latestBackup.backupPath}`)
        return false
      }

      fs.copyFileSync(latestBackup.backupPath, filePath)
      return true
    } catch (error: any) {
      console.error(`[AutoBackup] Error restaurando ${filePath}:`, error.message)
      return false
    }
  }

  /**
   * Obtiene todos los backups de un archivo
   */
  getBackupsForFile(filePath: string): BackupInfo[] {
    try {
      if (typeof window === 'undefined' || !fs.existsSync(this.backupsDir)) {
        return []
      }

      const fileName = path.basename(filePath)
      const fileDir = path
        .dirname(filePath)
        .replace(process.cwd(), '')
        .replace(/^\//, '')
        .replace(/\//g, '_')
      const prefix = `${fileDir}_${fileName}.backup.`

      const files = fs.readdirSync(this.backupsDir)
      const backups: BackupInfo[] = []

      for (const file of files) {
        if (file.startsWith(prefix)) {
          const backupPath = path.join(this.backupsDir, file)
          const stats = fs.statSync(backupPath)
          backups.push({
            originalPath: filePath,
            backupPath,
            timestamp: file.replace(prefix, '').replace(/\.backup$/, ''),
            size: stats.size,
          })
        }
      }

      // Ordenar por timestamp
      backups.sort((a, b) => a.timestamp.localeCompare(b.timestamp))

      return backups
    } catch (error) {
      return []
    }
  }

  /**
   * Limpia backups antiguos manteniendo solo los últimos N
   */
  private cleanOldBackups(filePath: string): void {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const backups = this.getBackupsForFile(filePath)
      if (backups.length <= this.maxBackups) {
        return
      }

      // Eliminar backups más antiguos
      const toDelete = backups.slice(0, backups.length - this.maxBackups)
      for (const backup of toDelete) {
        if (fs.existsSync(backup.backupPath)) {
          fs.unlinkSync(backup.backupPath)
        }
      }
    } catch (error) {
      // Ignorar errores en limpieza
    }
  }

  /**
   * Lista todos los backups disponibles
   */
  listAllBackups(): BackupInfo[] {
    try {
      if (typeof window === 'undefined' || !fs.existsSync(this.backupsDir)) {
        return []
      }

      const files = fs.readdirSync(this.backupsDir)
      const backups: BackupInfo[] = []

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const backupPath = path.join(this.backupsDir, file)
          const stats = fs.statSync(backupPath)
          backups.push({
            originalPath: '', // No podemos determinar el original desde el nombre
            backupPath,
            timestamp: file.split('.').slice(-2, -1)[0] || '',
            size: stats.size,
          })
        }
      }

      return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    } catch (error) {
      return []
    }
  }
}

// Singleton
let backupInstance: AutoBackup | null = null

export function getAutoBackup(): AutoBackup {
  if (!backupInstance) {
    backupInstance = new AutoBackup()
  }
  return backupInstance
}

export default AutoBackup
