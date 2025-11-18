/**
 * FixRegistry: Repositorio de reglas y soluciones automáticas
 * Contiene patrones de errores comunes y sus correcciones
 */

import { logger } from './Logger'

export interface FixRule {
  pattern: RegExp | string
  type: string
  description: string
  fix: (error: Error, context?: any) => Promise<FixResult>
  priority: number // Mayor prioridad = se aplica primero
}

export interface FixResult {
  success: boolean
  action: string
  message: string
  requiresRestart?: boolean
  patch?: string // Código patch sugerido
  data?: any
}

class FixRegistry {
  private rules: FixRule[] = []

  constructor() {
    this.registerDefaultRules()
  }

  private registerDefaultRules(): void {
    // 1. Hydration errors -> agregar 'use client'
    this.rules.push({
      pattern: /Hydration failed|Text content does not match|Hydration mismatch/i,
      type: 'hydration',
      description: 'Error de hidratación - requiere directiva use client',
      priority: 10,
      fix: async (error, context) => {
        const filePath = context?.filePath || 'unknown'
        return {
          success: true,
          action: 'addUseClientDirective',
          message: `Agregar 'use client' al inicio del archivo ${filePath}`,
          requiresRestart: true,
          patch: "'use client'\n",
          data: { filePath },
        }
      },
    })

    // 2. Module not found -> sugerir instalación
    this.rules.push({
      pattern: /Cannot find module|Module not found|Cannot resolve module/i,
      type: 'moduleNotFound',
      description: 'Módulo no encontrado - sugerir instalación',
      priority: 9,
      fix: async (error, context) => {
        const match = error.message.match(/['"]([^'"]+)['"]/)
        const moduleName = match ? match[1] : 'unknown'
        const isScoped = moduleName.startsWith('@/')
        const packageName = isScoped ? moduleName.split('/')[0] : moduleName.split('/')[0]

        return {
          success: true,
          action: 'suggestInstall',
          message: `Instalar módulo faltante: ${packageName}`,
          requiresRestart: true,
          patch: isScoped
            ? `// Verificar que el path alias '@/' esté configurado en tsconfig.json`
            : `// Ejecutar: pnpm add ${packageName}`,
          data: { moduleName, packageName, isScoped },
        }
      },
    })

    // 3. Cannot read properties of undefined/null
    this.rules.push({
      pattern: /Cannot read propert(y|ies) of (undefined|null)|Cannot read .* of undefined/i,
      type: 'nullCheck',
      description: 'Acceso a propiedad de undefined/null - agregar validación',
      priority: 8,
      fix: async (error, context) => {
        const match = error.message.match(/Cannot read propert(y|ies) '(\w+)' of (undefined|null)/i)
        const property = match ? match[2] : 'property'

        return {
          success: true,
          action: 'addNullCheck',
          message: `Agregar validación para ${property}`,
          requiresRestart: false,
          patch: `// Agregar: ${property} && ${property}.value`,
          data: { property },
        }
      },
    })

    // 4. ReferenceError -> variable no declarada
    this.rules.push({
      pattern: /ReferenceError|is not defined|Cannot access .* before initialization/i,
      type: 'referenceError',
      description: 'Variable no declarada o accedida antes de inicialización',
      priority: 7,
      fix: async (error, context) => {
        const match = error.message.match(/(\w+) is not defined|Cannot access (\w+) before initialization/i)
        const variable = match ? (match[1] || match[2]) : 'variable'

        return {
          success: true,
          action: 'declareVariable',
          message: `Declarar variable: ${variable}`,
          requiresRestart: false,
          patch: `// Declarar: const ${variable} = ...`,
          data: { variable },
        }
      },
    })

    // 5. React Hooks errors
    this.rules.push({
      pattern: /React Hook|Rules of Hooks|Hooks can only be called|Invalid hook call/i,
      type: 'reactHooks',
      description: 'Error en uso de React Hooks',
      priority: 9,
      fix: async (error, context) => {
        return {
          success: true,
          action: 'fixReactHooks',
          message: 'Verificar que los hooks se llamen en el nivel superior del componente',
          requiresRestart: true,
          patch: `// Asegurar que los hooks estén al inicio del componente, fuera de condicionales`,
          data: {},
        }
      },
    })

    // 6. Type errors -> tipos faltantes
    this.rules.push({
      pattern: /Type error|Type '.*' is not assignable|Property '.*' does not exist on type/i,
      type: 'typeError',
      description: 'Error de tipos TypeScript',
      priority: 6,
      fix: async (error, context) => {
        return {
          success: true,
          action: 'fixTypeError',
          message: 'Revisar tipos y agregar definiciones faltantes',
          requiresRestart: false,
          patch: `// Revisar tipos en el archivo o agregar: @ts-ignore si es necesario temporalmente`,
          data: {},
        }
      },
    })

    // 7. API route errors -> verificar método HTTP
    this.rules.push({
      pattern: /Method not allowed|405|Route handler|API Route/i,
      type: 'apiRoute',
      description: 'Error en ruta API - verificar método HTTP',
      priority: 7,
      fix: async (error, context) => {
        return {
          success: true,
          action: 'fixApiRoute',
          message: 'Verificar que el método HTTP (GET, POST, etc.) esté implementado en la ruta',
          requiresRestart: true,
          patch: `// Asegurar export async function GET/POST/PUT/DELETE`,
          data: {},
        }
      },
    })

    // 8. Import errors -> path incorrecto
    this.rules.push({
      pattern: /Failed to resolve import|Cannot resolve|Import .* cannot be resolved/i,
      type: 'importError',
      description: 'Error en import - path incorrecto',
      priority: 8,
      fix: async (error, context) => {
        const match = error.message.match(/['"]([^'"]+)['"]/)
        const importPath = match ? match[1] : 'unknown'

        return {
          success: true,
          action: 'fixImportPath',
          message: `Verificar path de import: ${importPath}`,
          requiresRestart: true,
          patch: `// Verificar que el path sea correcto o usar alias '@/'`,
          data: { importPath },
        }
      },
    })

    // 9. Next.js specific errors
    this.rules.push({
      pattern: /useSearchParams|useParams|useRouter|must be used within|Next.js/i,
      type: 'nextjsHook',
      description: 'Hook de Next.js usado fuera de contexto',
      priority: 8,
      fix: async (error, context) => {
        return {
          success: true,
          action: 'fixNextjsHook',
          message: 'Asegurar que el componente tenga "use client" y esté dentro del contexto correcto',
          requiresRestart: true,
          patch: `'use client'\n// Agregar al inicio del archivo`,
          data: {},
        }
      },
    })

    // 10. Generic fallback
    this.rules.push({
      pattern: /.*/,
      type: 'generic',
      description: 'Error genérico - análisis manual requerido',
      priority: 1,
      fix: async (error, context) => {
        return {
          success: false,
          action: 'manualReview',
          message: `Error no reconocido: ${error.message}`,
          requiresRestart: false,
          data: { error: error.message, stack: error.stack },
        }
      },
    })
  }

  async findAndApplyFix(error: Error, context?: any): Promise<FixResult | null> {
    // Ordenar reglas por prioridad (mayor primero)
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority)

    for (const rule of sortedRules) {
      const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern

      if (pattern.test(error.message) || (error.stack && pattern.test(error.stack))) {
        logger.info(`Regla encontrada: ${rule.type}`, { error: error.message })

        try {
          const result = await rule.fix(error, context)
          logger.fix(
            rule.type,
            context?.filePath,
            result.action,
            result.success ? 'success' : 'failed',
            result.message,
            result.data
          )

          return result
        } catch (fixError: any) {
          logger.error(`Error aplicando fix ${rule.type}:`, fixError)
          return {
            success: false,
            action: rule.type,
            message: `Error al aplicar fix: ${fixError.message}`,
          }
        }
      }
    }

    return null
  }

  registerRule(rule: FixRule): void {
    this.rules.push(rule)
    // Mantener ordenado por prioridad
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  getRules(): FixRule[] {
    return [...this.rules]
  }
}

export const fixRegistry = new FixRegistry()

