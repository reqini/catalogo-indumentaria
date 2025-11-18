import mongoose from 'mongoose'

const StockLogSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    accion: {
      type: String,
      enum: ['alta', 'venta', 'reposicion', 'eliminacion'],
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    talle: String,
    usuario: String,
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.models.StockLog || mongoose.model('StockLog', StockLogSchema)

