import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET_NAME = 'productos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    console.log('[UPLOAD-IMAGE] Iniciando upload de imagen')
    const tenant = await getTenantFromRequest(request)
    
    if (!tenant) {
      console.error('[UPLOAD-IMAGE] ❌ No se encontró tenant - Token inválido o no proporcionado')
      // Log adicional para debugging
      const authHeader = request.headers.get('authorization')
      const cookieHeader = request.headers.get('cookie')
      console.error('[UPLOAD-IMAGE] Debug:', {
        hasAuthHeader: !!authHeader,
        hasCookie: !!cookieHeader,
        authHeaderPrefix: authHeader?.substring(0, 20),
      })
      
      return NextResponse.json(
        { 
          error: 'No autorizado. Debes iniciar sesión para subir imágenes.',
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
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false, // No sobrescribir archivos existentes
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      
      // Mensajes de error más descriptivos
      let errorMessage = 'Error al subir la imagen'
      if (uploadError.message?.includes('Bucket not found')) {
        errorMessage = `Bucket "${BUCKET_NAME}" no existe. Debe crearse en Supabase Dashboard.`
      } else if (uploadError.message?.includes('new row violates row-level security')) {
        errorMessage = 'Error de permisos. Verifica las políticas RLS del bucket en Supabase.'
      } else if (uploadError.message?.includes('File size exceeds')) {
        errorMessage = `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
      } else if (uploadError.message?.includes('Invalid MIME type')) {
        errorMessage = 'Formato no válido. Solo se permiten JPG, PNG y WebP'
      } else {
        errorMessage = uploadError.message || 'Error al subir la imagen'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // 9. Obtener URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath)

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

