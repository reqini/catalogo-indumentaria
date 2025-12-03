/**
 * Sistema de Documentación Interna Automática
 * Genera documentación de componentes, funciones y flujos
 */

import * as fs from 'fs'
import * as path from 'path'

export interface ComponentDoc {
  name: string
  file: string
  type: 'component' | 'hook' | 'utility' | 'api'
  description?: string
  props?: Array<{ name: string; type: string; required: boolean; description?: string }>
  dependencies?: string[]
}

export interface FlowDoc {
  name: string
  description: string
  steps: Array<{ name: string; description: string; file?: string }>
}

class AutoDocs {
  private docsDir = path.join(process.cwd(), 'docs', 'auto-generated')

  constructor() {
    // Crear directorio de docs si no existe (solo en servidor)
    if (typeof window === 'undefined' && !fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true })
    }
  }

  /**
   * Genera documentación de un componente
   */
  async documentComponent(filePath: string): Promise<ComponentDoc | null> {
    try {
      if (typeof window !== 'undefined' || !fs.existsSync(filePath)) {
        return null
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const fileName = path.basename(filePath, path.extname(filePath))

      // Detectar tipo
      let type: 'component' | 'hook' | 'utility' | 'api' = 'component'
      if (filePath.includes('/hooks/')) type = 'hook'
      else if (filePath.includes('/utils/') || filePath.includes('/lib/')) type = 'utility'
      else if (filePath.includes('/api/')) type = 'api'

      // Extraer descripción de comentarios
      const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/)
      const description = descriptionMatch ? descriptionMatch[1] : undefined

      // Extraer props/interfaces básicas
      const props: ComponentDoc['props'] = []
      const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g
      let match
      while ((match = interfaceRegex.exec(content)) !== null) {
        const interfaceContent = match[2]
        const propRegex = /(\w+)(\?)?:\s*([^;]+);/g
        let propMatch
        while ((propMatch = propRegex.exec(interfaceContent)) !== null) {
          props.push({
            name: propMatch[1],
            type: propMatch[3].trim(),
            required: !propMatch[2],
          })
        }
      }

      // Extraer dependencias (imports)
      const dependencies: string[] = []
      const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g
      let importMatch
      while ((importMatch = importRegex.exec(content)) !== null) {
        dependencies.push(importMatch[1])
      }

      return {
        name: fileName,
        file: filePath,
        type,
        description,
        props: props.length > 0 ? props : undefined,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Genera documentación de un flujo
   */
  documentFlow(name: string, description: string, steps: FlowDoc['steps']): FlowDoc {
    return {
      name,
      description,
      steps,
    }
  }

  /**
   * Genera documentación completa del proyecto
   */
  async generateProjectDocs(): Promise<string> {
    try {
      if (typeof window !== 'undefined') {
        return ''
      }

      let docs = `# Documentación Automática del Proyecto\n\n`
      docs += `**Generado:** ${new Date().toLocaleString('es-AR')}\n\n`

      // Componentes
      docs += `## Componentes\n\n`
      const componentsDir = path.join(process.cwd(), 'components')
      if (fs.existsSync(componentsDir)) {
        const files = this.getTypeScriptFiles(componentsDir)
        for (const file of files.slice(0, 10)) {
          // Limitar a 10 para no sobrecargar
          const doc = await this.documentComponent(file)
          if (doc) {
            docs += `### ${doc.name}\n\n`
            if (doc.description) docs += `${doc.description}\n\n`
            docs += `**Archivo:** \`${doc.file}\`\n`
            docs += `**Tipo:** ${doc.type}\n\n`
            if (doc.props && doc.props.length > 0) {
              docs += `**Props:**\n`
              doc.props.forEach((prop) => {
                docs += `- \`${prop.name}\`: ${prop.type} ${prop.required ? '(requerido)' : '(opcional)'}\n`
              })
              docs += '\n'
            }
          }
        }
      }

      // Hooks
      docs += `## Hooks\n\n`
      const hooksDir = path.join(process.cwd(), 'hooks')
      if (fs.existsSync(hooksDir)) {
        const files = this.getTypeScriptFiles(hooksDir)
        for (const file of files) {
          const doc = await this.documentComponent(file)
          if (doc) {
            docs += `### ${doc.name}\n\n`
            if (doc.description) docs += `${doc.description}\n\n`
            docs += `**Archivo:** \`${doc.file}\`\n\n`
          }
        }
      }

      // Guardar documentación
      const docsPath = path.join(this.docsDir, 'project-docs.md')
      fs.writeFileSync(docsPath, docs)

      return docs
    } catch (error: any) {
      console.error('[AutoDocs] Error generando documentación:', error)
      return ''
    }
  }

  /**
   * Obtiene archivos TypeScript de un directorio
   */
  private getTypeScriptFiles(dir: string): string[] {
    try {
      const files: string[] = []
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...this.getTypeScriptFiles(fullPath))
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(fullPath)
        }
      }

      return files
    } catch {
      return []
    }
  }
}

// Singleton
let docsInstance: AutoDocs | null = null

export function getAutoDocs(): AutoDocs {
  if (!docsInstance) {
    docsInstance = new AutoDocs()
  }
  return docsInstance
}

export default AutoDocs
