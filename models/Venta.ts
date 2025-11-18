import mongoose, { Schema, Model } from 'mongoose'

export interface IVenta {
  tenantId: string
  productoId?: mongoose.Types.ObjectId
  comprador?: string
  monto: number
  fecha: Date
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
  preferenciaId?: string
  mpPaymentId?: string
  tipo: 'producto' | 'suscripcion'
  plan?: 'free' | 'pro' | 'premium'
  periodoInicio?: Date
  periodoFin?: Date
  createdAt: Date
  updatedAt: Date
}

const VentaSchema = new Schema<IVenta>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    productoId: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
      index: true,
    },
    comprador: {
      type: String,
      trim: true,
    },
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'aprobado', 'rechazado', 'cancelado'],
      default: 'pendiente',
      index: true,
    },
    preferenciaId: {
      type: String,
      index: true,
    },
    mpPaymentId: {
      type: String,
      index: true,
    },
    tipo: {
      type: String,
      enum: ['producto', 'suscripcion'],
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
    },
    periodoInicio: {
      type: Date,
    },
    periodoFin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Índices compuestos
VentaSchema.index({ tenantId: 1, fecha: -1 })
VentaSchema.index({ tenantId: 1, estado: 1 })
VentaSchema.index({ tipo: 1, estado: 1 })

const Venta: Model<IVenta> = mongoose.models.Venta || mongoose.model<IVenta>('Venta', VentaSchema)

export default Venta

