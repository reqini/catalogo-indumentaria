import mongoose, { Schema, Model } from 'mongoose'

export interface IBranding {
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  font?: string
  coverImage?: string
}

export interface ITenant {
  tenantId: string // UUID único
  nombreNegocio: string
  email: string
  passwordHash: string
  plan: 'free' | 'pro' | 'premium'
  mpId?: string // ID de Mercado Pago
  branding: IBranding
  subdomain?: string // Para subdominios personalizados
  dominio?: string // Dominio propio
  activo: boolean
  fechaAlta: Date
  fechaRenovacion?: Date
  rol: 'tenant' | 'superadmin'
  createdAt: Date
  updatedAt: Date
}

const BrandingSchema = new Schema<IBranding>(
  {
    logo: String,
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#ffffff' },
    font: { type: String, default: 'Inter', enum: ['Inter', 'Montserrat', 'Roboto'] },
    coverImage: String,
  },
  { _id: false }
)

const TenantSchema = new Schema<ITenant>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    nombreNegocio: {
      type: String,
      required: [true, 'El nombre del negocio es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'El hash de contraseña es requerido'],
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
      index: true,
    },
    mpId: {
      type: String,
      trim: true,
    },
    branding: {
      type: BrandingSchema,
      default: () => ({
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        font: 'Inter',
      }),
    },
    subdomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Subdominio inválido'],
    },
    dominio: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
    fechaAlta: {
      type: Date,
      default: Date.now,
    },
    fechaRenovacion: {
      type: Date,
    },
    rol: {
      type: String,
      enum: ['tenant', 'superadmin'],
      default: 'tenant',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
TenantSchema.index({ tenantId: 1 })
TenantSchema.index({ email: 1 })
TenantSchema.index({ plan: 1, activo: 1 })
TenantSchema.index({ subdomain: 1 })

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema)

export default Tenant

