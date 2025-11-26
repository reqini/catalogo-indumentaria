import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio debe ser positivo'),
  descuento: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  categoria: z.string().min(1, 'La categoría es requerida'),
  talles: z.array(z.string()).min(1, 'Debe tener al menos un talle'),
  stock: z.record(z.string(), z.number().min(0)),
  imagenes: z.array(z.string()).optional(),
  imagen_principal: z.string().optional(),
  imagenPrincipal: z.string().optional(),
  imagenesSec: z.array(z.string()).optional(),
  id_mercado_pago: z.string().optional(),
  idMercadoPago: z.string().optional(),
  tags: z.array(z.string()).optional(),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
})

export const bannerSchema = z.object({
  titulo: z.string().optional(),
  subtitulo: z.string().optional(),
  imagen: z.string().optional(), // Para compatibilidad con frontend
  imagenUrl: z.string().min(1, 'La URL de imagen es requerida'), // Campo del modelo
  link: z.string().optional(),
  activo: z.boolean().default(true),
  orden: z.number().default(0),
})

export const promocionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.enum(['producto', 'categoria', 'fecha', 'cantidad']),
  valor: z.number().min(0, 'El valor debe ser positivo'),
  producto_id: z.string().optional(),
  categoria: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  cantidad_minima: z.number().optional(),
  activa: z.boolean().default(true),
  mostrar_en_home: z.boolean().default(false),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const pagoSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
      id: z.string().optional(), // ID del producto para webhook
      talle: z.string().optional(), // Talle para webhook
    })
  ),
  back_urls: z.object({
    success: z.string().url(),
    failure: z.string().url(),
    pending: z.string().url(),
  }),
  payer: z
    .object({
      name: z.string(),
      email: z.string().email(),
      phone: z
        .object({
          area_code: z.string(),
          number: z.string(),
        })
        .optional(),
      address: z
        .object({
          street_name: z.string(),
          street_number: z.number(),
          zip_code: z.string(),
        })
        .optional(),
    })
    .optional(),
  external_reference: z.string().optional(),
})
