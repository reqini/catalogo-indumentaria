/**
 * AutoFix System - Exportaciones principales
 */

export { AutoFixEngine } from './AutoFixEngine'
export { AutoFixErrorBoundary } from './ErrorBoundary'
export { interceptConsole, restoreConsole } from './ConsoleInterceptor'
export { fixRegistry } from './FixRegistry'
export { logger } from './Logger'
export type { ErrorContext } from './AutoFixEngine'
export type { FixRule, FixResult } from './FixRegistry'

