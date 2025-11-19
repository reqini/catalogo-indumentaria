import { NextResponse } from 'next/server'
import { getHistorialProducto } from '@/lib/historial-helpers'
import { getProductoById } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    // Verificar que el producto pertenece al tenant
    const producto = await getProductoById(params.id)
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (producto.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener historial
    const historial = await getHistorialProducto(params.id, tenant.tenantId)

    return NextResponse.json(historial)
  } catch (error: any) {
    console.error('Error obteniendo historial:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    )
  }
}

