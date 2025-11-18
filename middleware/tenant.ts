/**
 * Middleware para validar tenant en API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/tenant'

export async function tenantMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const tenant = await getTenantFromRequest(request)

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant no encontrado o inactivo' }, { status: 401 })
  }

  if (!tenant.activo) {
    return NextResponse.json({ error: 'Tenant inactivo' }, { status: 403 })
  }

  // Agregar tenant al request headers para uso en route handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenant.tenantId)
  requestHeaders.set('x-tenant-plan', tenant.plan)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

