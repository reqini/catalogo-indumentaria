import { NextResponse } from 'next/server'

export async function GET() {
  const endpoints = {
    productos: {
      'GET /api/productos': 'Listar productos (query: categoria, color, destacado)',
      'GET /api/productos/:id': 'Obtener producto por ID',
      'POST /api/productos': 'Crear producto',
      'PUT /api/productos/:id': 'Actualizar producto',
      'DELETE /api/productos/:id': 'Eliminar producto',
      'PUT /api/productos/:id/stock': 'Actualizar stock de un talle',
    },
    banners: {
      'GET /api/banners': 'Listar banners activos',
      'POST /api/banners': 'Crear banner',
      'PUT /api/banners/:id': 'Actualizar banner',
      'DELETE /api/banners/:id': 'Eliminar banner',
      'PUT /api/banners/orden': 'Actualizar orden de banners',
    },
    promociones: {
      'GET /api/promociones': 'Listar promociones (query: activas)',
      'POST /api/promociones': 'Crear promoción',
      'PUT /api/promociones/:id': 'Actualizar promoción',
      'DELETE /api/promociones/:id': 'Eliminar promoción',
    },
    auth: {
      'POST /api/login': 'Login (email, password)',
    },
    pago: {
      'POST /api/pago': 'Crear preferencia de Mercado Pago',
    },
  }

  return NextResponse.json({
    message: 'API del Catálogo de Indumentaria',
    version: '2.0',
    endpoints,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  })
}


