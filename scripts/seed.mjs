import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Definir esquemas directamente en el seed
const ProductoSchema = new mongoose.Schema({
  tenantId: String,
  nombre: String,
  descripcion: String,
  precio: Number,
  descuento: Number,
  color: String,
  categoria: String,
  stock: Map,
  talles: [String],
  imagenPrincipal: String,
  imagenesSec: [String],
  idMercadoPago: String,
  destacado: Boolean,
  activo: { type: Boolean, default: true },
}, { timestamps: true })

const BannerSchema = new mongoose.Schema({
  tenantId: String,
  titulo: String,
  imagenUrl: String,
  activo: Boolean,
  orden: Number,
  link: String,
}, { timestamps: true })

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  rol: String,
}, { timestamps: true })

// Tenant para el login SaaS (mismo email/clave que el admin legacy)
const TenantSchema = new mongoose.Schema({
  tenantId: String,
  nombreNegocio: String,
  email: { type: String, unique: true },
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

const Producto = mongoose.models.Producto || mongoose.model('Producto', ProductoSchema)
const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema)
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema)
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo_indumentaria'

async function seed() {
  try {
    console.log('🌱 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    // Limpiar colecciones
    console.log('🧹 Limpiando colecciones...')
    await Producto.deleteMany({})
    await Banner.deleteMany({})
    await Usuario.deleteMany({})
    // No borramos Tenant para no romper otros tenants; solo nos aseguramos
    // de que exista el admin de demo.
    console.log('✅ Colecciones limpiadas')

    // Crear usuario admin
    console.log('👤 Creando usuario admin...')
    const passwordHash = await bcrypt.hash('Admin123!', 10)
    const admin = await Usuario.create({
      email: 'admin@demo.com',
      passwordHash,
      rol: 'admin',
    })
    console.log(`✅ Usuario admin creado: ${admin.email}`)

    // Crear/actualizar Tenant admin para el login SaaS
    console.log('🏢 Sincronizando Tenant admin para login SaaS...')
    let demoTenant = await Tenant.findOne({ email: 'admin@demo.com' })
    if (!demoTenant) {
      demoTenant = await Tenant.create({
        tenantId: uuidv4(),
        nombreNegocio: 'Demo Store',
        email: 'admin@demo.com',
        passwordHash,
        plan: 'pro',
        activo: true,
        rol: 'tenant',
        fechaAlta: new Date(),
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          font: 'Inter',
        },
      })
      console.log('✅ Tenant admin@demo.com creado para login SaaS')
    } else {
      demoTenant.passwordHash = passwordHash
      demoTenant.activo = true
      await demoTenant.save()
      console.log('✅ Tenant admin@demo.com actualizado (password/estado)')
    }

    // Crear productos (10 productos del dataset real de ETAPA 8)
    console.log('📦 Creando productos (dataset ETAPA 8)...')

    const dataset = [
      {
        nombre: 'Zapatilla Urban Runner',
        descripcion: 'Diseño urbano con suela antideslizante y tejido respirable. Ideal para el día a día.',
        precio: 134999,
        descuento: 10,
        color: 'Negro',
        categoria: 'Running',
        stockTotal: 25,
        talles: ['38', '39', '40', '41', '42', '43'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-URBANRUN',
        destacado: true,
      },
      {
        nombre: 'Buzo Classic Fit',
        descripcion: 'Algodón premium, corte clásico, interior afelpado para máxima comodidad.',
        precio: 89999,
        descuento: 0,
        color: 'Gris',
        categoria: 'Lifestyle',
        stockTotal: 30,
        talles: ['S', 'M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-BUZOCLASS',
        destacado: true,
      },
      {
        nombre: 'Remera Dry Motion',
        descripcion:
          'Tecnología Dry Motion: absorbe humedad y mantiene frescura durante el entrenamiento.',
        precio: 49999,
        descuento: 5,
        color: 'Azul Marino',
        categoria: 'Training',
        stockTotal: 40,
        talles: ['S', 'M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-DRYMOT',
        destacado: false,
      },
      {
        nombre: 'Campera WindTech',
        descripcion: 'Rompeviento resistente al agua con cierre completo y capucha desmontable.',
        precio: 159999,
        descuento: 20,
        color: 'Verde Militar',
        categoria: 'Outdoor',
        stockTotal: 10,
        talles: ['S', 'M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-WINDTECH',
        destacado: true,
      },
      {
        nombre: 'Jogging Street',
        descripcion: 'Pantalón jogging con bolsillo lateral y cintura elástica. Ideal para uso urbano.',
        precio: 74999,
        descuento: 0,
        color: 'Negro',
        categoria: 'Lifestyle',
        stockTotal: 15,
        talles: ['S', 'M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-JOGSTR',
        destacado: false,
      },
      {
        nombre: 'Top Fit Energy',
        descripcion: 'Top deportivo de alto rendimiento con soporte firme y costuras planas.',
        precio: 38999,
        descuento: 0,
        color: 'Rosa',
        categoria: 'Training',
        stockTotal: 20,
        talles: ['S', 'M', 'L'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-TOPFIT',
        destacado: false,
      },
      {
        nombre: 'Short Breeze Flow',
        descripcion: 'Short liviano con tela técnica de secado rápido y malla interior.',
        precio: 34999,
        descuento: 10,
        color: 'Celeste',
        categoria: 'Running',
        stockTotal: 35,
        talles: ['S', 'M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-BREEZE',
        destacado: false,
      },
      {
        nombre: 'Campera Puffer Core',
        descripcion: 'Campera inflable térmica con interior polar, liviana y resistente.',
        precio: 219999,
        descuento: 25,
        color: 'Negro',
        categoria: 'Outdoor',
        stockTotal: 5,
        talles: ['M', 'L', 'XL'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-PUFFCORE',
        destacado: true,
      },
      {
        nombre: 'Remera Kids Adventure',
        descripcion: 'Remera para niños con estampado ecológico y algodón orgánico.',
        precio: 29999,
        descuento: 0,
        color: 'Amarillo',
        categoria: 'Kids',
        stockTotal: 22,
        talles: ['4', '6', '8', '10'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-KIDSADV',
        destacado: false,
      },
      {
        nombre: 'Zapatilla Training MaxGrip',
        descripcion:
          'Suela antideslizante, gran amortiguación y soporte lateral para entrenamientos intensos.',
        precio: 119999,
        descuento: 15,
        color: 'Blanco',
        categoria: 'Training',
        stockTotal: 18,
        talles: ['39', '40', '41', '42', '43'],
        imagenPrincipal: '/images/default-product.svg',
        imagenesSec: ['/images/default-product.svg'],
        idMercadoPago: 'MP-MAXGRIP',
        destacado: true,
      },
    ]

    // Distribuir el stock total entre los talles de forma equitativa
    const productos = dataset.map((item) => {
      const base = Math.floor(item.stockTotal / item.talles.length)
      let resto = item.stockTotal % item.talles.length

      const stockEntries = item.talles.map((talle) => {
        const extra = resto > 0 ? 1 : 0
        if (resto > 0) resto -= 1
        return [talle, base + extra]
      })

      return {
        tenantId: demoTenant.tenantId,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        descuento: item.descuento,
        color: item.color,
        categoria: item.categoria,
        talles: item.talles,
        stock: new Map(stockEntries),
        imagenPrincipal: item.imagenPrincipal,
        imagenesSec: item.imagenesSec,
        idMercadoPago: item.idMercadoPago,
        destacado: item.destacado,
        activo: true,
      }
    })

    const productosCreados = await Producto.insertMany(productos)
    console.log(`✅ ${productosCreados.length} productos creados`)

    // Crear banners
    console.log('🖼️  Creando banners...')
    const banners = [
      {
        titulo: 'Nueva Colección Running',
        imagenUrl: '/images/banner-1.jpg',
        activo: true,
        orden: 1,
        link: '/catalogo?categoria=Running',
      },
      {
        titulo: 'Essentials Lifestyle',
        imagenUrl: '/images/banner-2.jpg',
        activo: true,
        orden: 2,
        link: '/catalogo?categoria=Lifestyle',
      },
      {
        titulo: 'Training Pro',
        imagenUrl: '/images/banner-3.jpg',
        activo: true,
        orden: 3,
        link: '/catalogo?categoria=Training',
      },
    ]

    const bannersCreados = await Banner.insertMany(banners)
    console.log(`✅ ${bannersCreados.length} banners creados`)

    console.log('\n✅ CatalogoIndumentaria — ETAPA 8: CARGA DE PRODUCTOS REAL COMPLETA')
    console.log('\n📋 Resumen:')
    console.log(`   - Usuario admin (legacy): admin@demo.com`)
    console.log(`   - Productos cargados: ${productosCreados.length}`)
    console.log(`   - Banners: ${bannersCreados.length}`)
    console.log('\nVerificación rápida:')
    console.log('  Home:       http://localhost:3001/')
    console.log('  Catálogo:   http://localhost:3001/catalogo')
    console.log('  Admin:      http://localhost:3001/admin')
    console.log('  API:        http://localhost:3001/api/productos')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
