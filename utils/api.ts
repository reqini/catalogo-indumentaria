import axios from 'axios'

// Base URL para la API. Por defecto usamos la raíz de Next,
// y todas las llamadas incluyen el prefijo `/api/...`.
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  // Buscar token en localStorage (clave 'token')
  let token = localStorage.getItem('token')
  
  // Si no está en localStorage, intentar obtener de cookies (solo en cliente)
  if (!token && typeof window !== 'undefined') {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
    if (authCookie) {
      token = authCookie.split('=')[1]
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Categorías
export async function getCategorias(filters?: { activa?: boolean }): Promise<any[]> {
  try {
    const response = await api.get('/api/categorias')
    const categorias = response.data || []
    // Filtrar por activa si se requiere
    if (filters?.activa !== false) {
      return categorias.filter((c: any) => c.activa !== false)
    }
    return categorias
  } catch (error) {
    console.error('Error fetching categorias:', error)
    return []
  }
}

// Bulk Import APIs
export async function parseBulkProducts(text: string, source: 'text' | 'csv' | 'ocr' | 'voice' = 'text'): Promise<any> {
  const response = await api.post('/api/admin/ia-bulk-parse-v2', {
    text,
    source,
    enhance: true,
  })
  return response.data
}

export async function createBulkProducts(products: any[]): Promise<any> {
  const response = await api.post('/api/admin/bulk-products-create-v2', {
    products,
  })
  return response.data
}

export async function createCategoria(categoriaData: any): Promise<any> {
  const response = await api.post('/api/categorias', categoriaData)
  return response.data
}

export async function updateCategoria(id: string, categoriaData: any): Promise<any> {
  const response = await api.put(`/api/categorias/${id}`, categoriaData)
  return response.data
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/api/categorias/${id}`)
}

// Productos
export async function getProducts(filters?: {
  categoria?: string
  color?: string
  destacado?: boolean
}): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.categoria) params.append('categoria', filters.categoria)
    if (filters?.color) params.append('color', filters.color)
    if (filters?.destacado !== undefined) params.append('destacado', String(filters.destacado))
    
    const response = await api.get(`/api/productos?${params.toString()}`)
    
    // Asegurar que siempre devolvamos un array
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // Si la respuesta no es un array, intentar extraer datos
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    console.warn('API devolvió formato inesperado:', response.data)
    return []
  } catch (error: any) {
    console.error('Error fetching products:', error)
    // En caso de error, devolver array vacío para no romper el render
    return []
  }
}

export async function getProductById(id: string): Promise<any> {
  try {
    const response = await api.get(`/api/productos/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function createProduct(productData: any): Promise<any> {
  const response = await api.post('/api/productos', productData)
  return response.data
}

export async function updateProduct(id: string, productData: any): Promise<any> {
  const response = await api.put(`/api/productos/${id}`, productData)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/productos/${id}`)
}

export async function updateStock(productId: string, talle: string, cantidad: number): Promise<any> {
  const response = await api.put(`/api/productos/${productId}/stock`, { talle, cantidad })
  return response.data
}

// Banners
export async function getBanners(): Promise<any[]> {
  try {
    const response = await api.get('/api/banners')
    return response.data
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}

export async function createBanner(bannerData: any): Promise<any> {
  const response = await api.post('/api/banners', bannerData)
  return response.data
}

export async function updateBanner(id: string, bannerData: any): Promise<any> {
  const response = await api.put(`/api/banners/${id}`, bannerData)
  return response.data
}

export async function deleteBanner(id: string): Promise<void> {
  await api.delete(`/api/banners/${id}`)
}

// Promociones
export async function getPromociones(activas?: boolean): Promise<any[]> {
  try {
    const params = activas !== undefined ? `?activas=${activas}` : ''
    const response = await api.get(`/api/promociones${params}`)
    return response.data
  } catch (error) {
    console.error('Error fetching promociones:', error)
    return []
  }
}

export async function createPromocion(promocionData: any): Promise<any> {
  const response = await api.post('/api/promociones', promocionData)
  return response.data
}

export async function updatePromocion(id: string, promocionData: any): Promise<any> {
  const response = await api.put(`/api/promociones/${id}`, promocionData)
  return response.data
}

export async function deletePromocion(id: string): Promise<void> {
  await api.delete(`/api/promociones/${id}`)
}

// Login
export async function login(email: string, password: string): Promise<any> {
  const response = await api.post('/api/login', { email, password })
  return response.data
}

// Logout
export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

// Mercado Pago
export async function createPayment(preferenceData: any): Promise<any> {
  try {
    console.log('[MP-PAYMENT] Creando preferencia con datos:', {
      items: preferenceData.items?.length || 0,
      back_urls: preferenceData.back_urls,
    })
    const response = await api.post('/api/pago', preferenceData)
    console.log('[MP-PAYMENT] Preferencia creada exitosamente:', response.data.preference_id)
    return response.data
  } catch (error: any) {
    console.error('[MP-PAYMENT] ❌ Error en createPayment:')
    console.error('[MP-PAYMENT] Status:', error?.response?.status)
    console.error('[MP-PAYMENT] Data:', error?.response?.data)
    console.error('[MP-PAYMENT] Error completo:', error)
    // Re-lanzar el error para que el componente pueda manejarlo
    throw error
  }
}

// Datos mock para desarrollo
function getMockProducts(): any[] {
  return [
    {
      id: '1',
      nombre: 'Remera Premium Negra',
      descripcion: 'Remera de algodón premium con diseño minimalista',
      precio: 15000,
      descuento: 20,
      categoria: 'remeras',
      color: 'negro',
      talles: ['S', 'M', 'L', 'XL'],
      stock: { S: 10, M: 5, L: 8, XL: 3 },
      imagenPrincipal: '/products/remera-1.jpg',
      imagenes: ['/products/remera-1.jpg', '/products/remera-1-2.jpg'],
      featured: true,
      mercadoPagoId: 'MP_TEST_123',
    },
    {
      id: '2',
      nombre: 'Pantalón Cargo Gris',
      descripcion: 'Pantalón cargo con múltiples bolsillos',
      precio: 25000,
      categoria: 'pantalones',
      color: 'gris',
      talles: ['M', 'L', 'XL'],
      stock: { M: 2, L: 1, XL: 0 },
      imagenPrincipal: '/products/pantalon-1.jpg',
      imagenes: ['/products/pantalon-1.jpg'],
      featured: true,
      mercadoPagoId: 'MP_TEST_456',
    },
    {
      id: '3',
      nombre: 'Buzo con Capucha Azul',
      descripcion: 'Buzo cómodo y abrigado para todas las estaciones',
      precio: 30000,
      descuento: 15,
      categoria: 'buzos',
      color: 'azul',
      talles: ['S', 'M', 'L'],
      stock: { S: 7, M: 4, L: 6 },
      imagenPrincipal: '/products/buzo-1.jpg',
      imagenes: ['/products/buzo-1.jpg'],
      featured: true,
      mercadoPagoId: 'MP_TEST_789',
    },
  ]
}

