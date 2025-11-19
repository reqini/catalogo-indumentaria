import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 })
    }

    // TODO: Implementar OCR real con Tesseract.js en el servidor
    // Por ahora, retornar texto de ejemplo o usar API externa
    
    // Opción 1: Usar API externa de OCR (ej: Google Cloud Vision, AWS Textract)
    // Opción 2: Procesar con Tesseract.js en servidor
    
    // Por ahora, retornar mensaje indicando que OCR está en desarrollo
    return NextResponse.json({
      text: `[OCR en desarrollo] Por favor, usa la opción de texto o CSV/Excel por ahora.\n\nPara habilitar OCR completo, instala tesseract.js y configura el procesamiento en servidor.`,
      note: 'OCR completo requiere configuración adicional',
    })
  } catch (error: any) {
    console.error('[OCR-PROCESS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar imagen' },
      { status: 500 }
    )
  }
}

