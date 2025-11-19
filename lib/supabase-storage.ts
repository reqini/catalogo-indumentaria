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

    // Verificar que el bucket existe (no intentar crearlo automáticamente en producción)
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
      
      if (listError) {
        console.error('Error listando buckets:', listError)
        // Continuar, puede ser un problema de permisos pero el bucket puede existir
      } else {
        const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)
        if (!bucketExists) {
          const errorMsg = `Bucket "${BUCKET_NAME}" no existe. Debe crearse manualmente en Supabase Dashboard. Ver: docs/setup-supabase-storage.md`
          console.error(errorMsg)
          return {
            url: '',
            path: '',
            error: errorMsg,
          }
        }
      }
    } catch (bucketError: any) {
      console.error('Error verificando bucket:', bucketError)
      // En producción, si no podemos verificar, asumimos que existe y continuamos
      // El error real se mostrará al intentar subir
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
      
      // Mensajes de error más descriptivos
      let errorMessage = 'Error al subir la imagen'
      if (error.message?.includes('Bucket not found')) {
        errorMessage = `Bucket "${BUCKET_NAME}" no existe. Debe crearse en Supabase Dashboard. Ver: docs/setup-supabase-storage.md`
      } else if (error.message?.includes('new row violates row-level security')) {
        errorMessage = 'Error de permisos. Verifica las políticas RLS del bucket en Supabase.'
      } else if (error.message?.includes('File size exceeds')) {
        errorMessage = `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
      } else if (error.message?.includes('Invalid MIME type')) {
        errorMessage = 'Formato no válido. Solo se permiten JPG, PNG y WebP'
      } else {
        errorMessage = error.message || 'Error al subir la imagen'
      }
      
      return {
        url: '',
        path: '',
        error: errorMessage,
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

