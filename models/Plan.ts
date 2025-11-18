import mongoose, { Schema, Model } from 'mongoose'

export interface IPlan {
  nombre: 'free' | 'pro' | 'premium'
  precio: number // Precio mensual en centavos
  limiteProductos: number
  limiteBanners: number
  beneficios: string[]
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const PlanSchema = new Schema<IPlan>(
  {
    nombre: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      required: true,
      unique: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    limiteProductos: {
      type: Number,
      required: true,
      min: 0,
    },
    limiteBanners: {
      type: Number,
      required: true,
      min: 0,
    },
    beneficios: {
      type: [String],
      default: [],
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema)

export default Plan

