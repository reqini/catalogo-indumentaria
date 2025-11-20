import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET_NAME = 'productos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Genera un nombre único para el archivo
 * CRÍTICO: Normaliza el nombre para evitar doble extensión (.jpg.jpg)
 */
function generateFileName(tenantId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  
  // Extraer extensión correctamente (última parte después del último punto)
  const lastDotIndex = originalName.lastIndexOf('.')
  const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex + 1).toLowerCase() : 'jpg'
  
  // Obtener nombre sin extensión (todo antes del último punto)
  const nameWithoutExt = lastDotIndex > 0 
    ? originalName.substring(0, lastDotIndex)
    : originalName
  
  // Sanitizar nombre: remover espacios, acentos, caracteres especiales
  const sanitizedName = nameWithoutExt
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
    .replace(/[^a-zA-Z0-9]/g, '_') // Reemplazar caracteres especiales con guión bajo
    .replace(/_+/g, '_') // Reemplazar múltiples guiones bajos con uno solo
    .replace(/^_|_$/g, '') // Remover guiones bajos al inicio y final
    .substring(0, 50) // Limitar longitud
  
  // Construir nombre final: tenantId/timestamp-random-sanitizedName.extension
  const finalName = sanitizedName || 'image' // Fallback si el nombre queda vacío
  const fileName = `${tenantId}/${timestamp}-${random}-${finalName}.${extension}`
  
  console.log('[UPLOAD-IMAGE] 📝 Generando nombre de archivo:', {
    originalName,
    nameWithoutExt,
    sanitizedName,
    extension,
    fileName,
  })
  
  return fileName
}

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    console.log('[UPLOAD-IMAGE] Iniciando upload de imagen')
    
    // Intentar obtener tenant de múltiples formas
    let tenant = null
    try {
      tenant = await getTenantFromRequest(request)
    } catch (error) {
      console.error('[UPLOAD-IMAGE] Error obteniendo tenant:', error)
    }
    
    if (!tenant) {
      console.error('[UPLOAD-IMAGE] ❌ No se encontró tenant - Token inválido o no proporcionado')
      // Log adicional para debugging
      const authHeader = request.headers.get('authorization')
      const cookieHeader = request.headers.get('cookie')
      console.error('[UPLOAD-IMAGE] Debug:', {
        hasAuthHeader: !!authHeader,
        hasCookie: !!cookieHeader,
        authHeaderPrefix: authHeader?.substring(0, 30),
        cookiePrefix: cookieHeader?.substring(0, 50),
      })
      
      return NextResponse.json(
        { 
          error: 'No autorizado. Por favor, recarga la página e inicia sesión nuevamente.',
          details: 'Token no encontrado o inválido'
        },
        { status: 401 }
      )
    }
    
    console.log('[UPLOAD-IMAGE] ✅ Tenant autenticado:', tenant.tenantId)

    // 2. Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // 3. Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no válido. Solo se permiten JPG, PNG y WebP' },
        { status: 400 }
      )
    }

    // 4. Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 5. Generar nombre único para el archivo
    const fileName = generateFileName(tenant.tenantId, file.name)
    const filePath = fileName

    // 6. Verificar que el bucket existe
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
      
      if (listError) {
        console.error('Error listando buckets:', listError)
        // Continuar, puede ser un problema de permisos pero el bucket puede existir
      } else {
        const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)
        if (!bucketExists) {
          return NextResponse.json(
            {
              error: `Bucket "${BUCKET_NAME}" no existe. Debe crearse manualmente en Supabase Dashboard.`,
            },
            { status: 500 }
          )
        }
      }
    } catch (bucketError: any) {
      console.error('Error verificando bucket:', bucketError)
      // En producción, si no podemos verificar, asumimos que existe y continuamos
    }

    // 7. Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // 8. Subir archivo a Supabase Storage
    console.log('[UPLOAD-IMAGE] 📤 Iniciando upload a Supabase Storage:', {
      bucket: BUCKET_NAME,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
    })
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false, // No sobrescribir archivos existentes
      })

    if (uploadError) {
      console.error('[UPLOAD-IMAGE] ❌ Error uploading file:', {
        error: uploadError,
        message: uploadError.message,
        bucket: BUCKET_NAME,
        filePath,
      })
      
      // Mensajes de error más descriptivos y específicos
      let errorMessage = 'Error al subir la imagen'
      let statusCode = 500
      
      const errorMsg = uploadError.message || String(uploadError)
      
      if (errorMsg.includes('Bucket not found') || errorMsg.includes('404')) {
        errorMessage = `Bucket "${BUCKET_NAME}" no existe. Debe crearse manualmente en Supabase Dashboard. Ver: docs/SETUP_SUPABASE_STORAGE.md`
        statusCode = 500
      } else if (errorMsg.includes('new row violates row-level security') || errorMsg.includes('RLS')) {
        errorMessage = 'Error de permisos. Verifica las políticas RLS del bucket en Supabase. El bucket debe permitir INSERT para usuarios autenticados.'
        statusCode = 403
      } else if (errorMsg.includes('File size exceeds') || errorMsg.includes('too large')) {
        errorMessage = `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
        statusCode = 400
      } else if (errorMsg.includes('Invalid MIME type') || errorMsg.includes('content type')) {
        errorMessage = 'Formato no válido. Solo se permiten JPG, PNG y WebP'
        statusCode = 400
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        errorMessage = 'Error de conexión con Supabase Storage. Verifica tu conexión a internet y las políticas CSP.'
        statusCode = 503
      } else {
        errorMessage = errorMsg || 'Error al subir la imagen'
        statusCode = 500
      }
      
      console.error('[UPLOAD-IMAGE] ❌ Error detallado:', {
        errorMessage,
        statusCode,
        originalError: uploadError,
        errorString: String(uploadError),
      })
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorMsg,
        },
        { status: statusCode }
      )
    }
    
    console.log('[UPLOAD-IMAGE] ✅ Archivo subido exitosamente:', {
      path: uploadData?.path,
      id: uploadData?.id,
    })

    // 9. Obtener URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    if (!publicUrl) {
      console.error('[UPLOAD-IMAGE] ❌ No se pudo obtener URL pública')
      return NextResponse.json(
        { error: 'Error al obtener URL pública de la imagen' },
        { status: 500 }
      )
    }

    console.log('[UPLOAD-IMAGE] ✅ Imagen subida exitosamente:', {
      path: filePath,
      url: publicUrl.substring(0, 80) + '...',
    })

    // 10. Retornar URL pública
    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      success: true,
    })
  } catch (error: any) {
    console.error('Error in upload-image API:', error)
    return NextResponse.json(
      { error: error.message || 'Error inesperado al subir la imagen' },
      { status: 500 }
    )
  }
}

