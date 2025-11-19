/**
 * Script de inicialización para SaaS
 * Crea planes y tenant superadmin
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const PlanSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  limiteProductos: Number,
  limiteBanners: Number,
  beneficios: [String],
  activo: Boolean,
}, { timestamps: true })

const TenantSchema = new mongoose.Schema({
  tenantId: String,
  nombreNegocio: String,
  email: String,
  passwordHash: String,
  plan: String,
  mpId: String,
  branding: Object,
  subdomain: String,
  dominio: String,
  activo: Boolean,
  fechaAlta: Date,
  fechaRenovacion: Date,
  rol: String,
}, { timestamps: true })

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema)
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo_indumentaria'

async function initSaaS() {
  try {
    console.log('🌱 Inicializando SaaS...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Crear planes
    console.log('📦 Creando planes...')
    await Plan.deleteMany({})
    const planes = [
      {
        nombre: 'free',
        precio: 0,
        limiteProductos: 10,
        limiteBanners: 0,
        beneficios: ['Hasta 10 productos', 'Sin banners', 'Soporte por email'],
        activo: true,
      },
      {
        nombre: 'pro',
        precio: 99900,
        limiteProductos: 200,
        limiteBanners: 5,
        beneficios: ['Hasta 200 productos', '5 banners', 'Dominio personalizado', 'Soporte prioritario'],
        activo: true,
      },
      {
        nombre: 'premium',
        precio: 199900,
        limiteProductos: -1,
        limiteBanners: -1,
        beneficios: ['Productos ilimitados', 'Banners ilimitados', 'Dominio personalizado', 'Analytics avanzado', 'Soporte 24/7'],
        activo: true,
      },
    ]
    await Plan.insertMany(planes)
    console.log('✅ Planes creados')

    // Crear superadmin si no existe
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@catalogo.com'
    const superAdminPass = process.env.SUPER_ADMIN_PASS || 'admin123'

    const existingSuperAdmin = await Tenant.findOne({ email: superAdminEmail })
    if (!existingSuperAdmin) {
      console.log('👤 Creando superadmin...')
      const passwordHash = await bcrypt.hash(superAdminPass, 10)
      await Tenant.create({
        tenantId: uuidv4(),
        nombreNegocio: 'Super Admin',
        email: superAdminEmail,
        passwordHash,
        plan: 'premium',
        activo: true,
        rol: 'superadmin',
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          font: 'Inter',
        },
      })
      console.log(`✅ Superadmin creado: ${superAdminEmail}`)
    } else {
      console.log('✅ Superadmin ya existe')
    }

    console.log('\n✅ Inicialización SaaS completada!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en inicialización:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

initSaaS()

