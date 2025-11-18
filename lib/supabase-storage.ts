/**
 * Utilidades para Supabase Storage
 * Manejo de upload y gestión de imágenes de productos
 */

import { supabaseAdmin, supabase } from './supabase'

const BUCKET_NAME = 'productos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Valida que el archivo sea una imagen válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
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
 * Genera un nombre único para el archivo
 */
function generateFileName(tenantId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const extension = originalName.split('.').pop()
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50)
  return `${tenantId}/${timestamp}-${random}-${sanitizedName}.${extension}`
}

/**
 * Sube una imagen a Supabase Storage
 */
export async function uploadImage(
  file: File,
  tenantId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // Validar archivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error }
    }

    // Generar nombre único
    const fileName = generateFileName(tenantId, file.name)
    const filePath = `${fileName}`

    // Crear bucket si no existe (solo en desarrollo, en producción debe crearse manualmente)
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)

      if (!bucketExists) {
        console.warn(
          `Bucket "${BUCKET_NAME}" no existe. Debe crearse manualmente en Supabase Dashboard.`
        )
        // Intentar crear bucket (requiere permisos de admin)
        await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_TYPES,
        })
      }
    } catch (bucketError) {
      console.warn('Error verificando/creando bucket:', bucketError)
      // Continuar aunque falle, el bucket puede existir
    }

    // Subir archivo
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // No sobrescribir archivos existentes
      })

    if (error) {
      console.error('Error uploading file:', error)
      return {
        url: '',
        path: '',
        error: error.message || 'Error al subir la imagen',
      }
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    if (onProgress) {
      onProgress(100)
    }

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error('Error in uploadImage:', error)
    return {
      url: '',
      path: '',
      error: error.message || 'Error inesperado al subir la imagen',
    }
  }
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteImage:', error)
    return { success: false, error: error.message || 'Error al eliminar la imagen' }
  }
}

/**
 * Obtiene la URL pública de una imagen
 */
export function getImageUrl(filePath: string): string {
  if (!filePath) return ''
  
  // Si ya es una URL completa, retornarla
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  // Si es una ruta relativa, construir URL de Supabase
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
  return data.publicUrl
}

