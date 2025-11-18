import mongoose from 'mongoose'

const CategoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Categoria || mongoose.model('Categoria', CategoriaSchema)

