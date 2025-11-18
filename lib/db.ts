import { supabase, isSupabaseConfigured } from './supabase'

// Tipos
export interface Producto {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  descuento?: number
  color?: string
  categoria: string
  talles: string[]
  stock: { [key: string]: number }
  imagenes: string[]
  imagen_principal?: string
  id_mercado_pago?: string
  destacado: boolean
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export interface Banner {
  id: string
  titulo?: string
  subtitulo?: string
  imagen: string
  link?: string
  activo: boolean
  orden: number
  fecha_creacion?: string
}

export interface Promocion {
  id: string
  nombre: string
  tipo: 'producto' | 'categoria' | 'fecha' | 'cantidad'
  valor: number
  producto_id?: string
  categoria?: string
  fecha_inicio?: string
  fecha_fin?: string
  cantidad_minima?: number
  activa: boolean
  mostrar_en_home: boolean
  fecha_creacion?: string
}

export interface Usuario {
  id: string
  email: string
  password_hash: string
  rol: 'admin' | 'user'
  fecha_creacion?: string
}

export interface Compra {
  id: string
  producto_id?: string
  nombre_producto: string
  talle?: string
  cantidad: number
  precio_unitario: number
  precio_total: number
  id_pago_mercado_pago?: string
  estado: string
  fecha_creacion?: string
}

// Funciones de base de datos
export const db = {
  // Productos
  async getProductos(filters?: {
    categoria?: string
    color?: string
    destacado?: boolean
    activo?: boolean
  }): Promise<Producto[]> {
    if (!isSupabaseConfigured()) {
      return getMockProductos()
    }

    let query = supabase!.from('productos').select('*')

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria)
    }
    if (filters?.color) {
      query = query.eq('color', filters.color)
    }
    if (filters?.destacado !== undefined) {
      query = query.eq('destacado', filters.destacado)
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo)
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error fetching productos:', error)
      return getMockProductos()
    }

    return data || []
  },

  async getProductoById(id: string): Promise<Producto | null> {
    if (!isSupabaseConfigured()) {
      const productos = getMockProductos()
      return productos.find((p) => p.id === id) || null
    }

    const { data, error } = await supabase!
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching producto:', error)
      return null
    }

    return data
  },

  async createProducto(producto: Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Producto> {
    if (!isSupabaseConfigured()) {
      const newProducto: Producto = {
        ...producto,
        id: Date.now().toString(),
        fecha_creacion: new Date().toISOString(),
      }
      return newProducto
    }

    const { data, error } = await supabase!
      .from('productos')
      .insert([producto])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating producto: ${error.message}`)
    }

    return data
  },

  async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    if (!isSupabaseConfigured()) {
      return { ...updates, id } as Producto
    }

    const { data, error } = await supabase!
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating producto: ${error.message}`)
    }

    return data
  },

  async deleteProducto(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    const { error } = await supabase!
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting producto: ${error.message}`)
    }
  },

  async updateStock(productoId: string, talle: string, cantidad: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    const producto = await this.getProductoById(productoId)
    if (!producto) {
      throw new Error('Producto no encontrado')
    }

    const nuevoStock = {
      ...producto.stock,
      [talle]: Math.max(0, cantidad),
    }

    await this.updateProducto(productoId, { stock: nuevoStock })
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    if (!isSupabaseConfigured()) {
      return getMockBanners()
    }

    const { data, error } = await supabase!
      .from('banners')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error fetching banners:', error)
      return getMockBanners()
    }

    return data || []
  },

  async createBanner(banner: Omit<Banner, 'id' | 'fecha_creacion'>): Promise<Banner> {
    if (!isSupabaseConfigured()) {
      return { ...banner, id: Date.now().toString() }
    }

    const { data, error } = await supabase!
      .from('banners')
      .insert([banner])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating banner: ${error.message}`)
    }

    return data
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    if (!isSupabaseConfigured()) {
      return { ...updates, id } as Banner
    }

    const { data, error } = await supabase!
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating banner: ${error.message}`)
    }

    return data
  },

  async deleteBanner(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    const { error } = await supabase!
      .from('banners')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting banner: ${error.message}`)
    }
  },

  async updateBannerOrder(banners: { id: string; orden: number }[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    for (const banner of banners) {
      await this.updateBanner(banner.id, { orden: banner.orden })
    }
  },

  // Promociones
  async getPromociones(activas?: boolean): Promise<Promocion[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    let query = supabase!.from('promociones').select('*')

    if (activas !== undefined) {
      query = query.eq('activa', activas)
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error fetching promociones:', error)
      return []
    }

    return data || []
  },

  async createPromocion(promocion: Omit<Promocion, 'id' | 'fecha_creacion'>): Promise<Promocion> {
    if (!isSupabaseConfigured()) {
      return { ...promocion, id: Date.now().toString() }
    }

    const { data, error } = await supabase!
      .from('promociones')
      .insert([promocion])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating promocion: ${error.message}`)
    }

    return data
  },

  async updatePromocion(id: string, updates: Partial<Promocion>): Promise<Promocion> {
    if (!isSupabaseConfigured()) {
      return { ...updates, id } as Promocion
    }

    const { data, error } = await supabase!
      .from('promociones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating promocion: ${error.message}`)
    }

    return data
  },

  async deletePromocion(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    const { error } = await supabase!
      .from('promociones')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting promocion: ${error.message}`)
    }
  },

  // Compras
  async createCompra(compra: Omit<Compra, 'id' | 'fecha_creacion'>): Promise<Compra> {
    if (!isSupabaseConfigured()) {
      return { ...compra, id: Date.now().toString() }
    }

    const { data, error } = await supabase!
      .from('compras')
      .insert([compra])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating compra: ${error.message}`)
    }

    return data
  },

  async getCompras(): Promise<Compra[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    const { data, error } = await supabase!
      .from('compras')
      .select('*')
      .order('fecha_creacion', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching compras:', error)
      return []
    }

    return data || []
  },
}

// Datos mock para desarrollo sin Supabase
function getMockProductos(): Producto[] {
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
      imagenes: ['/products/remera-1.jpg'],
      imagen_principal: '/products/remera-1.jpg',
      id_mercado_pago: 'MP_TEST_123',
      destacado: true,
      activo: true,
    },
  ]
}

function getMockBanners(): Banner[] {
  return [
    {
      id: '1',
      titulo: 'Nueva Colección',
      subtitulo: 'Descubrí las últimas tendencias',
      imagen: '/banner-1.jpg',
      link: '/catalogo',
      activo: true,
      orden: 1,
    },
  ]
}



