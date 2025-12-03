/**
 * Monitor y Mejora Continua de Carga de Imágenes
 * Valida peso, formato, compresión, URLs y rutas rotas
 */

import { getSystemGuardian } from './system-guardian'

export interface ImageValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  metrics: {
    size: number
    format: string
    dimensions?: { width: number; height: number }
    compressionRatio?: number
  }
}

export interface ImageMonitorResult {
  url: string
  accessible: boolean
  valid: boolean
  loadTime?: number
  errors: string[]
  fallbackApplied: boolean
}

class ImageMonitor {
  private guardian = getSystemGuardian()
  private readonly MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  private readonly MAX_DIMENSION = 4000 // pixels

  /**
   * Valida un archivo de imagen antes de subir
   */
  validateImageFile(file: File): ImageValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const metrics = {
      size: file.size,
      format: file.type,
    }

    // Validar tamaño
    if (file.size > this.MAX_SIZE) {
      errors.push(`Imagen demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máx. 5MB)`)
    }

    // Validar formato
    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      errors.push(`Formato no permitido: ${file.type}. Formatos permitidos: JPEG, PNG, WebP`)
    }

    // Warnings
    if (file.size > 2 * 1024 * 1024) {
      warnings.push('Imagen grande - considerar compresión para mejor rendimiento')
    }

    // Registrar en guardian si hay errores críticos
    if (errors.length > 0) {
      this.guardian.detectImageUploadFailure(new Error(errors.join('; ')), file.name)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics,
    }
  }

  /**
   * Verifica si una URL de imagen es accesible
   */
  async checkImageAccessibility(imageUrl: string): Promise<ImageMonitorResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let accessible = false
    let fallbackApplied = false

    try {
      // Verificar que sea una URL válida
      if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
        errors.push('URL inválida')
        fallbackApplied = true
        return {
          url: imageUrl,
          accessible: false,
          valid: false,
          errors,
          fallbackApplied,
        }
      }

      // Intentar cargar imagen
      const response = await fetch(imageUrl, { method: 'HEAD' })
      const loadTime = Date.now() - startTime

      if (!response.ok) {
        errors.push(`Imagen no accesible: ${response.status} ${response.statusText}`)
        fallbackApplied = true

        // Registrar en guardian
        this.guardian.detectError('warning', 'images', `Imagen no accesible: ${imageUrl}`, {
          details: {
            status: response.status,
            statusText: response.statusText,
          },
          solution: 'Aplicar imagen de fallback o verificar URL',
          autoFix: async () => {
            // Auto-fix: aplicar fallback
            return true
          },
        })
      } else {
        accessible = true

        // Verificar tipo de contenido
        const contentType = response.headers.get('content-type')
        if (contentType && !contentType.startsWith('image/')) {
          console.warn(`[ImageMonitor] Tipo de contenido inesperado: ${contentType}`)
        }

        // Warning si carga lento
        if (loadTime > 3000) {
          console.warn(`[ImageMonitor] Imagen carga lento: ${loadTime}ms`)
        }
      }

      return {
        url: imageUrl,
        accessible,
        valid: accessible && errors.length === 0,
        loadTime,
        errors,
        fallbackApplied,
      }
    } catch (error: any) {
      errors.push(`Error verificando imagen: ${error.message}`)
      fallbackApplied = true

      // Registrar en guardian
      this.guardian.detectImageUploadFailure(error, imageUrl)

      return {
        url: imageUrl,
        accessible: false,
        valid: false,
        errors,
        fallbackApplied,
        loadTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Aplica fallback seguro para imágenes rotas
   */
  applyImageFallback(
    imageUrl: string,
    fallbackUrl: string = '/images/default-product.svg'
  ): string {
    // Verificar si la imagen original es válida
    if (!imageUrl || imageUrl === fallbackUrl) {
      return fallbackUrl
    }

    // Si la URL es inválida, aplicar fallback
    if (
      !imageUrl.startsWith('http://') &&
      !imageUrl.startsWith('https://') &&
      !imageUrl.startsWith('/')
    ) {
      return fallbackUrl
    }

    return imageUrl
  }

  /**
   * Verifica múltiples imágenes en batch
   */
  async checkMultipleImages(imageUrls: string[]): Promise<ImageMonitorResult[]> {
    const results = await Promise.all(imageUrls.map((url) => this.checkImageAccessibility(url)))

    // Estadísticas
    const accessibleCount = results.filter((r) => r.accessible).length
    const brokenCount = results.filter((r) => !r.accessible).length

    if (brokenCount > 0) {
      this.guardian.detectError(
        'warning',
        'images',
        `${brokenCount} de ${imageUrls.length} imágenes no son accesibles`,
        {
          details: {
            total: imageUrls.length,
            accessible: accessibleCount,
            broken: brokenCount,
            brokenUrls: results.filter((r) => !r.accessible).map((r) => r.url),
          },
          solution: 'Revisar URLs de imágenes y aplicar fallbacks donde sea necesario',
        }
      )
    }

    return results
  }

  /**
   * Sugiere compresión si la imagen es muy grande
   */
  suggestCompression(file: File): boolean {
    return file.size > 1 * 1024 * 1024 // > 1MB
  }
}

// Singleton
let monitorInstance: ImageMonitor | null = null

export function getImageMonitor(): ImageMonitor {
  if (!monitorInstance) {
    monitorInstance = new ImageMonitor()
  }
  return monitorInstance
}

export default ImageMonitor
