/**
 * Función robusta y centralizada para subir imágenes de productos a Supabase Storage
 * 
 * CARACTERÍSTICAS:
 * - Normaliza nombres de archivo (evita doble extensión)
 * - Manejo de errores detallado
 * - Logging completo
 * - Retorna URL pública directamente
 */

import { supabaseAdmin } from './supabase'

const BUCKET_NAME = 'productos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface UploadImageResult {
  url: string
  path: string
  error?: string
}

/**
 * Normaliza el nombre de archivo para evitar doble extensión
 * Ejemplo: "imagen.jpg.png" → "imagen.png"
 */
function normalizeFileName(originalName: string): string {
  // Extraer extensión (última parte después del último punto)
  const lastDotIndex = originalName.lastIndexOf('.')
  let extension = 'jpg' // Default
  
  if (lastDotIndex > 0 && lastDotIndex < originalName.length - 1) {
    const extPart = originalName.substring(lastDotIndex + 1).toLowerCase().trim()
    // Validar extensión (solo letras/números, max 5 caracteres)
    if (/^[a-z0-9]{1,5}$/.test(extPart)) {
      extension = extPart
    }
  }
  
  // Obtener nombre sin extensión
  const nameWithoutExt = lastDotIndex > 0 
    ? originalName.substring(0, lastDotIndex)
    : originalName
  
  // Sanitizar nombre
  const sanitizedName = nameWithoutExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
  
  return sanitizedName || 'image'
}

/**
 * Genera un nombre único para el archivo
 * Formato: {tenantId}/{timestamp}-{random}-{sanitizedName}.{extension}
 */
function generateUniqueFileName(tenantId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const normalizedName = normalizeFileName(originalName)
  
  // Extraer extensión del nombre original
  const lastDotIndex = originalName.lastIndexOf('.')
  let extension = 'jpg'
  
  if (lastDotIndex > 0 && lastDotIndex < originalName.length - 1) {
    const extPart = originalName.substring(lastDotIndex + 1).toLowerCase().trim()
    if (/^[a-z0-9]{1,5}$/.test(extPart)) {
      extension = extPart
    }
  }
  
  const fileName = `${tenantId}/${timestamp}-${random}-${normalizedName}.${extension}`
  
  // VALIDACIÓN FINAL: Verificar que no haya doble extensión
  if (fileName.match(/\.(jpg|png|webp|jpeg)\.(jpg|png|webp|jpeg)$/i)) {
    console.error('❌ [upload-product-image] Doble extensión detectada, corrigiendo...')
    return fileName.replace(/\.(jpg|png|webp|jpeg)\.(jpg|png|webp|jpeg)$/i, `.${extension}`)
  }
  
  return fileName
}

/**
 * Valida que el archivo sea una imagen válida
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no válido. Solo se permiten JPG, PNG y WebP',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

/**
 * Sube una imagen de producto a Supabase Storage
 * 
 * @param file - Archivo de imagen a subir
 * @param tenantId - ID del tenant (obtenido del token)
 * @returns URL pública de la imagen subida o error
 */
export async function uploadProductImage(
  file: File,
  tenantId: string
): Promise<UploadImageResult> {
  console.log('📤 [upload-product-image] Iniciando upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    tenantId,
  })

  // 1. Validar archivo
  const validation = validateImageFile(file)
  if (!validation.valid) {
    console.error('❌ [upload-product-image] Validación falló:', validation.error)
    return {
      url: '',
      path: '',
      error: validation.error,
    }
  }

  // 2. Generar nombre único
  const fileName = generateUniqueFileName(tenantId, file.name)
  const filePath = fileName

  console.log('📝 [upload-product-image] Nombre generado:', {
    originalName: file.name,
    fileName,
    filePath,
  })

  // 3. Convertir File a ArrayBuffer para Supabase
  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch (error: any) {
    console.error('❌ [upload-product-image] Error convirtiendo archivo:', error)
    return {
      url: '',
      path: '',
      error: 'Error al procesar el archivo',
    }
  }

  const uint8Array = new Uint8Array(arrayBuffer)

  // 4. Subir a Supabase Storage
  // NO verificamos si el bucket existe - asumimos que está creado manualmente
  console.log('📤 [upload-product-image] Subiendo a Supabase Storage:', {
    bucket: BUCKET_NAME,
    filePath,
  })

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, uint8Array, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false, // No sobrescribir archivos existentes
    })

  if (uploadError) {
    console.error('❌ [upload-product-image] Error subiendo archivo:', {
      error: uploadError,
      message: uploadError.message,
      bucket: BUCKET_NAME,
      filePath,
    })

    // Mensajes de error específicos
    let errorMessage = 'Error al subir la imagen'
    const errorMsg = uploadError.message || String(uploadError)

    if (errorMsg.includes('Bucket not found') || errorMsg.includes('404')) {
      errorMessage = `Bucket "${BUCKET_NAME}" no existe. Debe crearse manualmente en Supabase Dashboard. Ver: docs/SETUP_SUPABASE_STORAGE_COMPLETE.md`
    } else if (errorMsg.includes('new row violates row-level security') || errorMsg.includes('RLS')) {
      errorMessage = 'Error de permisos. Verifica las políticas RLS del bucket en Supabase.'
    } else if (errorMsg.includes('File size exceeds')) {
      errorMessage = `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
    } else if (errorMsg.includes('Invalid MIME type')) {
      errorMessage = 'Formato no válido. Solo se permiten JPG, PNG y WebP'
    } else {
      errorMessage = errorMsg
    }

    return {
      url: '',
      path: '',
      error: errorMessage,
    }
  }

  console.log('✅ [upload-product-image] Archivo subido exitosamente:', {
    path: uploadData?.path,
    id: uploadData?.id,
  })

  // 5. Obtener URL pública
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  if (!publicUrl) {
    console.error('❌ [upload-product-image] No se pudo obtener URL pública')
    return {
      url: '',
      path: '',
      error: 'Error al obtener URL pública de la imagen',
    }
  }

  console.log('✅ [upload-product-image] Upload completado:', {
    path: filePath,
    url: publicUrl.substring(0, 80) + '...',
  })

  return {
    url: publicUrl,
    path: filePath,
  }
}

