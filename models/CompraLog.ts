import mongoose, { Schema, Model } from 'mongoose'

export interface ICompraLog {
  productoId?: mongoose.Types.ObjectId
  preferenciaId?: string
  mpPaymentId?: string
  estado: string
  fecha: Date
  metadata?: {
    talle?: string
    cantidad?: number
    [key: string]: any
  }
  createdAt: Date
}

const CompraLogSchema = new Schema<ICompraLog>(
  {
    productoId: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
    },
    preferenciaId: {
      type: String,
    },
    mpPaymentId: {
      type: String,
    },
    estado: {
      type: String,
      required: true,
      enum: ['pendiente', 'aprobado', 'rechazado', 'cancelado'],
      default: 'pendiente',
      index: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Índices
CompraLogSchema.index({ fecha: -1 })
CompraLogSchema.index({ estado: 1, fecha: -1 })

const CompraLog: Model<ICompraLog> =
  mongoose.models.CompraLog || mongoose.model<ICompraLog>('CompraLog', CompraLogSchema)

export default CompraLog



