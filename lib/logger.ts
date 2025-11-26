/**
 * Sistema de logs estructurado
 * Logs en consola + archivo (si está disponible)
 */

import { promises as fs } from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`)

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  module: string
  message: string
  data?: any
}

/**
 * Escribir log a archivo (no bloquea si falla)
 */
async function writeToFile(entry: LogEntry) {
  try {
    // Crear directorio si no existe
    await fs.mkdir(LOG_DIR, { recursive: true })

    // Formatear entrada
    const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}${
      entry.data ? ' ' + JSON.stringify(entry.data) : ''
    }\n`

    // Escribir al archivo (append)
    await fs.appendFile(LOG_FILE, logLine)
  } catch (error) {
    // No fallar si no se puede escribir al archivo
    console.warn('[LOGGER] No se pudo escribir al archivo de log:', error)
  }
}

/**
 * Logger principal
 */
export class Logger {
  constructor(private module: string) {}

  info(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      module: this.module,
      message,
      data,
    }

    console.log(`[${entry.module}] ${message}`, data || '')
    writeToFile(entry).catch(() => {}) // No bloquear
  }

  warn(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      module: this.module,
      message,
      data,
    }

    console.warn(`[${entry.module}] ⚠️ ${message}`, data || '')
    writeToFile(entry).catch(() => {})
  }

  error(message: string, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      module: this.module,
      message,
      data: error ? { message: error.message, stack: error.stack } : undefined,
    }

    console.error(`[${entry.module}] ❌ ${message}`, error || '')
    writeToFile(entry).catch(() => {})
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        module: this.module,
        message,
        data,
      }

      console.debug(`[${entry.module}] 🔍 ${message}`, data || '')
      writeToFile(entry).catch(() => {})
    }
  }
}

/**
 * Crear logger para un módulo específico
 */
export function createLogger(module: string): Logger {
  return new Logger(module)
}

/**
 * Logs específicos por módulo
 */
export const orderLogger = createLogger('ORDENES')
export const paymentLogger = createLogger('PAGO')
export const shippingLogger = createLogger('ENVIOS')
export const webhookLogger = createLogger('WEBHOOK')
