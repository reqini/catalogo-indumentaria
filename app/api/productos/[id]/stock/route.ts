import { NextResponse } from 'next/server'
import { getProductoById, updateProducto } from '@/lib/supabase-helpers'
import { createStockLog } from '@/lib/supabase-helpers'
import { getTenantFromRequest } from '@/lib/auth-helpers'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener tenant del token (desde header o cookie)
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { talle, cantidad, accion } = body

    // Validaciones
    if (!talle || cantidad === undefined) {
      return NextResponse.json(
        { error: 'Talle y cantidad son requeridos' },
        { status: 400 }
      )
    }

    if (cantidad < 0) {
      return NextResponse.json(
        { error: 'El stock no puede ser negativo' },
        { status: 400 }
      )
    }

    if (!Number.isInteger(cantidad)) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número entero' },
        { status: 400 }
      )
    }

    // Obtener producto
    const producto = await getProductoById(params.id)

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar que el producto pertenece al tenant
    if (producto.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Verificar que el talle existe en el producto
    if (!producto.talles || !producto.talles.includes(talle)) {
      return NextResponse.json(
        { error: `El talle "${talle}" no existe en este producto` },
        { status: 400 }
      )
    }

    // Obtener stock anterior
    const stockAnterior = (producto.stock as Record<string, number>)?.[talle] || 0

    // Actualizar stock
    const stockActualizado = {
      ...(producto.stock as Record<string, number> || {}),
      [talle]: cantidad,
    }

    // Actualizar producto en Supabase
    const productoActualizado = await updateProducto(params.id, {
      stock: stockActualizado,
    })

    // Registrar en historial de stock
    try {
      await createStockLog({
        producto_id: producto.id,
        accion: accion || 'reposicion',
        cantidad: cantidad - stockAnterior,
        talle,
        usuario: tenant.tenantId,
      })
    } catch (logError) {
      // No fallar si el log falla, solo registrar
      console.error('Error creating stock log:', logError)
    }

    // Formatear respuesta
    const productoFormateado = {
      ...productoActualizado,
      id: productoActualizado.id,
      stock: productoActualizado.stock || {},
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar stock' },
      { status: 500 }
    )
  }
}
