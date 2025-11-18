/**
 * Logger para el sistema de AutoFix
 * Versión compatible con Next.js (solo consola en cliente)
 * En esta implementación evitamos usar 'fs' para no romper el bundle del cliente.
 */

export interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'fix'
  message: string
  data?: any
  stack?: string
}

export interface FixLogEntry extends LogEntry {
  type: string
  affectedFile?: string
  action: string
  result: 'success' | 'failed' | 'skipped'
}

class Logger {
  // En esta versión no necesitamos inicialización asíncrona
  async init(): Promise<void> {
    return
  }

  async log(entry: LogEntry): Promise<void> {
    const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`

    if (process.env.NODE_ENV === 'development') {
      // Mostramos detalles solo en desarrollo para no ensuciar producción
      console.log(
        '[AutoFix LOG]',
        logLine,
        entry.stack ? `\n${entry.stack}` : '',
        entry.data ? `\nData: ${JSON.stringify(entry.data, null, 2)}` : ''
      )
    }
  }

  async logFix(fixEntry: FixLogEntry): Promise<void> {
    // Reutilizamos el log normal para registrar el fix
    await this.log(fixEntry)
  }

  error(message: string, data?: any, stack?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      stack,
    }
    this.log(entry)
    console.error(`[AutoFix] ${message}`, data || '')
  }

  warn(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    }
    this.log(entry)
    console.warn(`[AutoFix] ${message}`, data || '')
  }

  info(message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    }
    this.log(entry)
    if (process.env.NODE_ENV === 'development') {
      console.info(`[AutoFix] ${message}`, data || '')
    }
  }

  fix(
    type: string,
    affectedFile: string | undefined,
    action: string,
    result: 'success' | 'failed' | 'skipped',
    message: string,
    data?: any
  ): void {
    const entry: FixLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'fix',
      type,
      affectedFile,
      action,
      result,
      message,
      data,
    }
    this.logFix(entry)

    const emoji = result === 'success' ? '✅' : result === 'failed' ? '❌' : '⏭️'
    console.log(
      `${emoji} [AutoFix] ${type} - ${action}${affectedFile ? ` (${affectedFile})` : ''}: ${message}`
    )
  }
}

export const logger = new Logger()

