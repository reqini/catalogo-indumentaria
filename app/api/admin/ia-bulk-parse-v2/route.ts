import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import parseBulkProductsV2 from '@/lib/bulk-import/v2-parser'
import { getBulkImportErrorHandler } from '@/lib/bulk-import/error-handler'

/**
 * Endpoint V2 mejorado usando el nuevo parser
 * Versión 2.0 - Reconstrucción completa
 */
export async function POST(request: Request) {
  const errorHandler = getBulkImportErrorHandler()
  errorHandler.clearErrors()

  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      text,
      source = 'text',
      enhance = true,
      detectTalles = true,
      detectColores = true,
      autoFix = true,
    } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      errorHandler.logError('error', 'NOMBRE_VACIO', 'El texto es requerido')
      return NextResponse.json(
        {
          error: 'El texto es requerido',
          errors: errorHandler.getErrors(),
        },
        { status: 400 }
      )
    }

    // Validar tamaño del texto
    const textSizeMB = new Blob([text]).size / (1024 * 1024)
    if (textSizeMB > 10) {
      errorHandler.logError(
        'error',
        'ARCHIVO_DEMASIADO_GRANDE',
        `Texto demasiado grande: ${textSizeMB.toFixed(2)}MB`
      )
      return NextResponse.json(
        {
          error: 'El texto es demasiado grande (máximo 10MB)',
          errors: errorHandler.getErrors(),
        },
        { status: 400 }
      )
    }

    console.log('[IA-BULK-PARSE-V2] Procesando:', {
      source,
      enhance,
      detectTalles,
      detectColores,
      autoFix,
      textLength: text.length,
    })

    // Usar nuevo parser V2
    const parseResult = parseBulkProductsV2(text, source as any, {
      enhance,
      detectTalles,
      detectColores,
      autoFix,
    })

    // Registrar errores del parser
    parseResult.errors.forEach((err) => {
      errorHandler.logError('error', 'ERROR_PARSE', err.mensaje, {
        fila: err.fila,
        solucion: 'Revisá el formato de la línea',
      })
    })

    parseResult.warnings.forEach((warn) => {
      errorHandler.logError('warning', 'WARNING_PARSE', warn.mensaje, {
        fila: warn.fila,
      })
    })

    console.log('[IA-BULK-PARSE-V2] Resultado:', {
      productos: parseResult.products.length,
      errores: parseResult.errors.length,
      advertencias: parseResult.warnings.length,
      tiempo: parseResult.metadata.tiempoProcesamiento,
    })

    if (parseResult.products.length === 0) {
      return NextResponse.json(
        {
          error: 'No se pudieron detectar productos en el texto.',
          products: [],
          errors: errorHandler.getErrors(),
          warnings: parseResult.warnings,
          metadata: parseResult.metadata,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      products: parseResult.products,
      count: parseResult.products.length,
      metadata: parseResult.metadata,
      errors: errorHandler.getErrors(),
      warnings: parseResult.warnings,
    })
  } catch (error: any) {
    console.error('[IA-BULK-PARSE-V2] Error:', error)

    errorHandler.logError(
      'critical',
      'ERROR_PARSE',
      error.message || 'Error al procesar el texto',
      {
        solucion: 'Verificá el formato del texto e intentá nuevamente',
      }
    )

    return NextResponse.json(
      {
        error: error.message || 'Error al procesar el texto',
        errors: errorHandler.getErrors(),
      },
      { status: 500 }
    )
  }
}
