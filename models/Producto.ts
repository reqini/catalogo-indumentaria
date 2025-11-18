import mongoose, { Schema, Model } from 'mongoose'

export interface IProducto {
  tenantId: string // ID del tenant propietario
  nombre: string
  descripcion?: string
  precio: number
  descuento?: number
  color?: string
  categoria: string
  stock: { [key: string]: number }
  talles: string[]
  imagenPrincipal?: string
  imagenesSec?: string[]
  idMercadoPago?: string
  tags?: string[]
  destacado: boolean
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductoSchema = new Schema<IProducto>(
  {
    tenantId: {
      type: String,
      required: [true, 'El tenantId es requerido'],
      index: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [255, 'El nombre no puede exceder 255 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio debe ser positivo'],
    },
    descuento: {
      type: Number,
      min: [0, 'El descuento debe ser positivo'],
      max: [100, 'El descuento no puede exceder 100%'],
    },
    color: {
      type: String,
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es requerida'],
      enum: ['remeras', 'pantalones', 'buzos', 'accesorios'],
      index: true,
    },
    stock: {
      type: Map,
      of: Number,
      default: {},
    },
    talles: {
      type: [String],
      required: [true, 'Debe tener al menos un talle'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Debe tener al menos un talle',
      },
    },
    imagenPrincipal: {
      type: String,
    },
    imagenesSec: {
      type: [String],
      default: [],
    },
    idMercadoPago: {
      type: String,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    destacado: {
      type: Boolean,
      default: false,
      index: true,
    },
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
ProductoSchema.index({ tenantId: 1, activo: 1 })
ProductoSchema.index({ tenantId: 1, categoria: 1 })
ProductoSchema.index({ categoria: 1, destacado: 1 })
ProductoSchema.index({ nombre: 'text', descripcion: 'text' })

const Producto: Model<IProducto> =
  mongoose.models.Producto || mongoose.model<IProducto>('Producto', ProductoSchema)

export default Producto

