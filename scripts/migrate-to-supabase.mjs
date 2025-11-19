#!/usr/bin/env node

/**
 * Script para migrar datos de MongoDB a Supabase
 * 
 * Uso:
 *   pnpm migrate-to-supabase
 * 
 * Requiere:
 *   - MONGODB_URI en .env.local (origen)
 *   - NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local (destino)
 */

import mongoose from 'mongoose'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está configurado')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de Supabase no configuradas')
  console.log('   Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrateCollection(collectionName, transformFn) {
  try {
    console.log(`\n🔄 Migrando: ${collectionName}`)
    
    const db = mongoose.connection.db
    const sourceCollection = db.collection(collectionName)
    const count = await sourceCollection.countDocuments()
    
    if (count === 0) {
      console.log(`   ⏭️  Sin datos para migrar`)
      return
    }

    console.log(`   📦 ${count} documentos encontrados`)

    const documents = await sourceCollection.find({}).toArray()
    const transformed = documents.map(transformFn).filter(Boolean)
    
    if (transformed.length > 0) {
      // Insertar en lotes de 100
      const batchSize = 100
      for (let i = 0; i < transformed.length; i += batchSize) {
        const batch = transformed.slice(i, i + batchSize)
        const { error } = await supabase
          .from(collectionName)
          .insert(batch)
        
        if (error) {
          console.error(`   ❌ Error insertando lote ${i / batchSize + 1}:`, error.message)
        } else {
          console.log(`   ✅ Lote ${i / batchSize + 1}/${Math.ceil(transformed.length / batchSize)} insertado`)
        }
      }
      console.log(`   ✅ ${transformed.length} documentos migrados`)
    }
  } catch (error) {
    console.error(`   ❌ Error migrando ${collectionName}:`, error.message)
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración de MongoDB a Supabase...\n')

  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB\n')

    // Transformadores para cada colección
    const transformers = {
      tenants: (doc) => ({
        tenant_id: doc.tenantId,
        nombre_negocio: doc.nombreNegocio,
        email: doc.email,
        password_hash: doc.passwordHash,
        plan: doc.plan,
        mp_id: doc.mpId,
        branding: doc.branding || {},
        subdomain: doc.subdomain,
        dominio: doc.dominio,
        activo: doc.activo !== false,
        fecha_alta: doc.fechaAlta ? new Date(doc.fechaAlta).toISOString() : new Date().toISOString(),
        fecha_renovacion: doc.fechaRenovacion ? new Date(doc.fechaRenovacion).toISOString() : null,
        rol: doc.rol || 'tenant',
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }),
      productos: (doc) => {
        // Convertir stock Map a objeto
        let stockObj = {}
        if (doc.stock) {
          if (doc.stock instanceof Map) {
            stockObj = Object.fromEntries(doc.stock.entries())
          } else if (typeof doc.stock === 'object') {
            stockObj = doc.stock
          }
        }
        
        return {
          tenant_id: doc.tenantId,
          nombre: doc.nombre,
          descripcion: doc.descripcion,
          precio: doc.precio,
          descuento: doc.descuento,
          color: doc.color,
          categoria: doc.categoria,
          stock: stockObj,
          talles: doc.talles || [],
          imagen_principal: doc.imagenPrincipal,
          imagenes_sec: doc.imagenesSec || [],
          id_mercado_pago: doc.idMercadoPago,
          tags: doc.tags || [],
          destacado: doc.destacado || false,
          activo: doc.activo !== false,
          created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        }
      },
      banners: (doc) => ({
        tenant_id: doc.tenantId,
        titulo: doc.titulo,
        imagen_url: doc.imagenUrl || doc.imagen,
        activo: doc.activo !== false,
        orden: doc.orden || 0,
        link: doc.link,
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }),
      planes: (doc) => ({
        nombre: doc.nombre,
        precio: doc.precio,
        limite_productos: doc.limiteProductos,
        limite_banners: doc.limiteBanners,
        beneficios: doc.beneficios || [],
        activo: doc.activo !== false,
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }),
      compralogs: (doc) => ({
        producto_id: doc.productoId ? doc.productoId.toString() : null,
        preferencia_id: doc.preferenciaId,
        mp_payment_id: doc.mpPaymentId,
        estado: doc.estado || 'pendiente',
        fecha: doc.fecha ? new Date(doc.fecha).toISOString() : new Date().toISOString(),
        metadata: doc.metadata || {},
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }),
      categorias: (doc) => ({
        nombre: doc.nombre,
        slug: doc.slug,
        descripcion: doc.descripcion,
        orden: doc.orden || 0,
        activa: doc.activa !== false,
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }),
    }

    // Migrar cada colección
    for (const [collectionName, transformFn] of Object.entries(transformers)) {
      await migrateCollection(collectionName, transformFn)
    }

    console.log('\n✅ Migración completada!')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Verifica los datos en Supabase Dashboard')
    console.log('   2. Actualiza las rutas API para usar Supabase')
    console.log('   3. Prueba todas las funcionalidades')

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

migrate()

