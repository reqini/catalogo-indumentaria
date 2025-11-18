import mongoose, { Schema, Model } from 'mongoose'

export interface IBanner {
  tenantId: string // ID del tenant propietario
  titulo?: string
  imagenUrl: string
  activo: boolean
  orden: number
  link?: string
  createdAt: Date
  updatedAt: Date
}

const BannerSchema = new Schema<IBanner>(
  {
    tenantId: {
      type: String,
      required: [true, 'El tenantId es requerido'],
      index: true,
    },
    titulo: {
      type: String,
      trim: true,
    },
    imagenUrl: {
      type: String,
      required: [true, 'La URL de imagen es requerida'],
    },
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
    orden: {
      type: Number,
      default: 0,
      index: true,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
BannerSchema.index({ tenantId: 1, activo: 1 })
BannerSchema.index({ tenantId: 1, orden: 1 })
BannerSchema.index({ activo: 1, orden: 1 })

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema)

export default Banner

