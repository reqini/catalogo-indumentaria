/**
 * Script para crear planes por defecto
 */

import mongoose from 'mongoose'

const PlanSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  limiteProductos: Number,
  limiteBanners: Number,
  beneficios: [String],
  activo: Boolean,
}, { timestamps: true })

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo_indumentaria'

async function seedPlans() {
  try {
    console.log('🌱 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Limpiar planes existentes
    console.log('🧹 Limpiando planes...')
    await Plan.deleteMany({})
    console.log('✅ Planes limpiados')

    // Crear planes
    console.log('📦 Creando planes...')
    const planes = [
      {
        nombre: 'free',
        precio: 0, // Gratis
        limiteProductos: 10,
        limiteBanners: 0,
        beneficios: [
          'Hasta 10 productos',
          'Sin banners',
          'Soporte por email',
        ],
        activo: true,
      },
      {
        nombre: 'pro',
        precio: 99900, // $999 ARS en centavos
        limiteProductos: 200,
        limiteBanners: 5,
        beneficios: [
          'Hasta 200 productos',
          '5 banners personalizados',
          'Dominio personalizado',
          'Soporte prioritario',
        ],
        activo: true,
      },
      {
        nombre: 'premium',
        precio: 199900, // $1999 ARS en centavos
        limiteProductos: -1, // Sin límite
        limiteBanners: -1, // Sin límite
        beneficios: [
          'Productos ilimitados',
          'Banners ilimitados',
          'Dominio personalizado',
          'Analytics avanzado',
          'Soporte 24/7',
        ],
        activo: true,
      },
    ]

    const planesCreados = await Plan.insertMany(planes)
    console.log(`✅ ${planesCreados.length} planes creados`)

    console.log('\n✅ Seed de planes completado!')
    console.log('\n📋 Planes creados:')
    planesCreados.forEach((plan) => {
      console.log(`   - ${plan.nombre}: $${plan.precio / 100} ARS/mes`)
    })

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed de planes:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedPlans()

