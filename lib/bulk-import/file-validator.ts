/**
 * File Validator - Validaciones de archivos para carga masiva
 * Versión 2.0
 */

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    nombre: string
    tamaño: number
    tipo: string
    extension: string
  }
}

export interface FileValidationOptions {
  maxSizeMB?: number
  allowedFormats?: string[]
  requiredColumns?: string[]
}

class FileValidator {
  private defaultMaxSizeMB = 10
  private defaultAllowedFormats = ['csv', 'xlsx', 'xls', 'json', 'txt']
  private defaultRequiredColumns = ['nombre', 'precio']

  /**
   * Valida un archivo
   */
  async validateFile(
    file: File,
    options: FileValidationOptions = {}
  ): Promise<FileValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    const maxSizeMB = options.maxSizeMB || this.defaultMaxSizeMB
    const allowedFormats = options.allowedFormats || this.defaultAllowedFormats
    const requiredColumns = options.requiredColumns || this.defaultRequiredColumns

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      errors.push(
        `El archivo es demasiado grande (${sizeMB.toFixed(2)}MB). Tamaño máximo: ${maxSizeMB}MB`
      )
    }

    // Validar formato
    const extension = this.getFileExtension(file.name)
    if (!allowedFormats.includes(extension.toLowerCase())) {
      errors.push(
        `Formato no soportado: ${extension}. Formatos permitidos: ${allowedFormats.join(', ')}`
      )
    }

    // Validar tipo MIME
    if (file.type && !this.isValidMimeType(file.type, extension)) {
      warnings.push(`El tipo MIME (${file.type}) no coincide con la extensión (.${extension})`)
    }

    // Validar contenido básico (solo para archivos pequeños)
    if (file.size < 1024 * 1024) {
      // Archivo menor a 1MB, validar contenido
      try {
        const content = await file.text()
        if (content.trim().length === 0) {
          errors.push('El archivo está vacío')
        } else {
          // Validar formato según extensión
          const contentValidation = this.validateFileContent(content, extension, requiredColumns)
          errors.push(...contentValidation.errors)
          warnings.push(...contentValidation.warnings)
        }
      } catch (error: any) {
        warnings.push(`No se pudo validar el contenido del archivo: ${error.message}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        nombre: file.name,
        tamaño: file.size,
        tipo: file.type || 'unknown',
        extension,
      },
    }
  }

  /**
   * Valida contenido del archivo
   */
  private validateFileContent(
    content: string,
    extension: string,
    requiredColumns: string[]
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    switch (extension.toLowerCase()) {
      case 'csv':
        const csvValidation = this.validateCSV(content, requiredColumns)
        errors.push(...csvValidation.errors)
        warnings.push(...csvValidation.warnings)
        break

      case 'json':
        const jsonValidation = this.validateJSON(content)
        errors.push(...jsonValidation.errors)
        warnings.push(...jsonValidation.warnings)
        break

      case 'txt':
        // TXT es flexible, solo validar que tenga contenido
        if (content.trim().length < 10) {
          warnings.push('El archivo de texto parece muy corto')
        }
        break

      case 'xlsx':
      case 'xls':
        // Validación básica - en producción usar librería XLSX
        warnings.push('Validación completa de Excel requiere procesamiento del archivo')
        break
    }

    return { errors, warnings }
  }

  /**
   * Valida CSV
   */
  private validateCSV(
    content: string,
    requiredColumns: string[]
  ): {
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    const lines = content.split('\n').filter((line) => line.trim().length > 0)

    if (lines.length === 0) {
      errors.push('El archivo CSV está vacío')
      return { errors, warnings }
    }

    // Validar header
    const header = lines[0].split(',').map((col) => col.trim().toLowerCase())
    const missingColumns = requiredColumns.filter(
      (col) => !header.some((h) => h.includes(col.toLowerCase()))
    )

    if (missingColumns.length > 0) {
      errors.push(`Columnas requeridas faltantes: ${missingColumns.join(', ')}`)
    }

    // Validar que haya datos (más de header)
    if (lines.length === 1) {
      warnings.push('El CSV solo tiene header, no hay datos')
    }

    // Validar formato básico
    const columnCount = header.length
    for (let i = 1; i < Math.min(lines.length, 10); i++) {
      // Validar primeras 10 filas
      const row = lines[i].split(',')
      if (row.length !== columnCount) {
        warnings.push(`Fila ${i + 1} tiene ${row.length} columnas, se esperaban ${columnCount}`)
      }
    }

    return { errors, warnings }
  }

  /**
   * Valida JSON
   */
  private validateJSON(content: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const parsed = JSON.parse(content)

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          warnings.push('El array JSON está vacío')
        } else {
          // Validar estructura del primer elemento
          const first = parsed[0]
          if (typeof first !== 'object' || first === null) {
            errors.push('Los elementos del array deben ser objetos')
          } else {
            if (!first.nombre && !first.name) {
              warnings.push('Los objetos deberían tener un campo "nombre" o "name"')
            }
          }
        }
      } else if (typeof parsed === 'object') {
        // Objeto único
        if (!parsed.nombre && !parsed.name) {
          warnings.push('El objeto debería tener un campo "nombre" o "name"')
        }
      } else {
        errors.push('El JSON debe ser un objeto o un array de objetos')
      }
    } catch (error: any) {
      errors.push(`JSON inválido: ${error.message}`)
    }

    return { errors, warnings }
  }

  /**
   * Obtiene extensión del archivo
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  }

  /**
   * Valida tipo MIME
   */
  private isValidMimeType(mimeType: string, extension: string): boolean {
    const mimeMap: Record<string, string[]> = {
      csv: ['text/csv', 'application/csv', 'text/plain'],
      xlsx: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      xls: ['application/vnd.ms-excel'],
      json: ['application/json', 'text/json'],
      txt: ['text/plain'],
    }

    const validMimes = mimeMap[extension.toLowerCase()] || []
    return validMimes.length === 0 || validMimes.includes(mimeType)
  }
}

// Singleton
let validatorInstance: FileValidator | null = null

export function getFileValidator(): FileValidator {
  if (!validatorInstance) {
    validatorInstance = new FileValidator()
  }
  return validatorInstance
}

export default FileValidator
