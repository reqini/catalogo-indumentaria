import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'
import { getAuthToken } from '@/lib/auth-helpers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * API Route para generar chat/conversaciones
 *
 * SEGURIDAD: Validación estricta de autorización
 * - El userId siempre se obtiene del token JWT autenticado
 * - Nunca se confía en userId proporcionado por el cliente
 * - Validación de autenticación antes de procesar cualquier request
 *
 * CORRECCIÓN DE VULNERABILIDAD:
 * - Antes: Comparaba userId del body con req.user.id (vulnerable a user impersonation)
 * - Ahora: Obtiene userId SIEMPRE del token autenticado, nunca del body
 */

export async function POST(request: NextRequest) {
  try {
    // 1. VALIDACIÓN CRÍTICA: Obtener token y validar autenticación
    // Esto previene suplantación de usuario (user impersonation)
    const tokenResult = await getAuthToken(request)

    if (!tokenResult) {
      return NextResponse.json({ error: 'No autenticado. Token requerido.' }, { status: 401 })
    }

    // 2. Decodificar token para obtener userId directamente
    // El token contiene: { id, tenantId, email, plan, rol }
    let decoded: any
    try {
      decoded = jwt.verify(tokenResult.token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    // 3. Validar que el token tenga userId
    if (!decoded.id) {
      return NextResponse.json({ error: 'Token inválido: falta userId' }, { status: 401 })
    }

    // 4. Validar tenant para asegurar que está activo
    const tenant = await getTenantFromRequest(request)
    if (!tenant || !tenant.activo) {
      return NextResponse.json({ error: 'Cuenta inactiva o no encontrada' }, { status: 403 })
    }

    // 5. Obtener datos del request body
    const body = await request.json()
    const { message, conversationId } = body

    // Validar datos requeridos
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    // 6. CRÍTICO: Usar SIEMPRE el userId del token autenticado
    // NUNCA usar userId del body o query params (previene user impersonation)
    // El userId viene del token JWT verificado, no del cliente
    const userId = decoded.id

    // 5. Si se proporciona conversationId, validar que pertenece al usuario autenticado
    if (conversationId) {
      // Aquí deberías validar que la conversación pertenece al userId autenticado
      // Ejemplo: const conversation = await getConversationById(conversationId)
      // if (conversation.userId !== userId) {
      //   return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      // }
    }

    // 6. Procesar la generación de chat usando el userId autenticado
    // TODO: Implementar lógica de generación de chat
    const response = {
      message: 'Chat generado exitosamente',
      userId, // Usar siempre el userId del token autenticado
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('Error en /api/chat:', error)

    // No exponer detalles internos del error
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}

/**
 * GET handler para obtener conversaciones del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // 1. VALIDACIÓN CRÍTICA: Obtener token y validar autenticación
    const tokenResult = await getAuthToken(request)

    if (!tokenResult) {
      return NextResponse.json({ error: 'No autenticado. Token requerido.' }, { status: 401 })
    }

    // 2. Decodificar token para obtener userId directamente
    let decoded: any
    try {
      decoded = jwt.verify(tokenResult.token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    // 3. Validar que el token tenga userId
    if (!decoded.id) {
      return NextResponse.json({ error: 'Token inválido: falta userId' }, { status: 401 })
    }

    // 4. Validar tenant para asegurar que está activo
    const tenant = await getTenantFromRequest(request)
    if (!tenant || !tenant.activo) {
      return NextResponse.json({ error: 'Cuenta inactiva o no encontrada' }, { status: 403 })
    }

    // 5. CRÍTICO: Usar SIEMPRE el userId del token autenticado
    // NUNCA usar userId de query params (previene user impersonation)
    const userId = decoded.id

    // 4. Obtener parámetros de query (opcional)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 5. Obtener conversaciones del usuario autenticado
    // TODO: Implementar lógica para obtener conversaciones
    // const conversations = await getConversationsByUserId(userId, { limit, offset })

    const response = {
      conversations: [], // Placeholder
      userId, // Usar siempre el userId del token autenticado
      limit,
      offset,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('Error en GET /api/chat:', error)

    return NextResponse.json({ error: 'Error al obtener conversaciones' }, { status: 500 })
  }
}
