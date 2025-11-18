import { NextResponse } from 'next/server'
import { productoSchema } from '@/utils/validations'
import { getTenantFromToken } from '@/lib/supabase-helpers'
import { getProductoById, updateProducto, deleteProducto } from '@/lib/supabase-helpers'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const producto = await getProductoById(params.id)

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Formatear producto para el frontend
    const productoFormateado = {
      ...producto,
      id: producto.id,
      imagenPrincipal: producto.imagen_principal || '/images/default-product.svg',
      imagenes: producto.imagenes_sec || [],
      tags: producto.tags || [],
      stock: producto.stock || {},
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    console.error('Error fetching producto:', error)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Obtener tenant del token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const tenant = await getTenantFromToken(token)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
    }

    // Verificar que el producto pertenece al tenant
    const productoExistente = await getProductoById(params.id)
    if (!productoExistente) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (productoExistente.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productoSchema.parse(body)

    // Preparar datos para actualizar
    const updateData: any = {
      nombre: validatedData.nombre,
      descripcion: validatedData.descripcion,
      precio: validatedData.precio,
      descuento: validatedData.descuento,
      categoria: validatedData.categoria,
      color: validatedData.color,
      talles: validatedData.talles,
      stock: validatedData.stock,
      tags: validatedData.tags || [],
      destacado: validatedData.destacado || false,
      activo: validatedData.activo !== false,
    }

    // Normalizar campos de imagen
    if (validatedData.imagenPrincipal || validatedData.imagen_principal) {
      updateData.imagen_principal = validatedData.imagenPrincipal || validatedData.imagen_principal
    }
    if (validatedData.imagenesSec || validatedData.imagenes) {
      updateData.imagenes_sec = validatedData.imagenesSec || validatedData.imagenes
    }
    if (validatedData.idMercadoPago || validatedData.id_mercado_pago) {
      updateData.id_mercado_pago = validatedData.idMercadoPago || validatedData.id_mercado_pago
    }

    const producto = await updateProducto(params.id, updateData)

    // Formatear respuesta
    const productoFormateado = {
      ...producto,
      id: producto.id,
      imagenPrincipal: producto.imagen_principal,
      imagenes: producto.imagenes_sec || [],
      stock: producto.stock || {},
    }

    return NextResponse.json(productoFormateado)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Error updating producto:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Obtener tenant del token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const tenant = await getTenantFromToken(token)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 401 })
    }

    // Verificar que el producto pertenece al tenant
    const producto = await getProductoById(params.id)
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (producto.tenant_id !== tenant.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await deleteProducto(params.id)

    return NextResponse.json({ message: 'Producto eliminado' })
  } catch (error: any) {
    console.error('Error deleting producto:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
