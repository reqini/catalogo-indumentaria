import mongoose, { Schema, Model } from 'mongoose'

export interface IUsuario {
  email: string
  passwordHash: string
  rol: 'admin' | 'editor' | 'viewer' | 'user'
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const UsuarioSchema = new Schema<IUsuario>(
  {
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
    rol: {
      type: String,
      enum: ['admin', 'editor', 'viewer', 'user'],
      default: 'user',
      index: true,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
)

const Usuario: Model<IUsuario> =
  mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema)

export default Usuario

