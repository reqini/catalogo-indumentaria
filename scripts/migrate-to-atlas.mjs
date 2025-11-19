#!/usr/bin/env node

/**
 * Script para migrar datos de MongoDB local a MongoDB Atlas
 * 
 * Uso:
 *   pnpm migrate-to-atlas
 * 
 * Requiere:
 *   - MONGODB_URI_LOCAL en .env.local (opcional, usa localhost por defecto)
 *   - MONGODB_URI_ATLAS en .env.local (tu cadena de conexión de Atlas)
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/catalogo_indumentaria'
const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS

if (!MONGODB_URI_ATLAS) {
  console.error('❌ Error: MONGODB_URI_ATLAS no está configurado en .env.local')
  console.log('\n📝 Agrega esto a tu .env.local:')
  console.log('MONGODB_URI_ATLAS=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/catalogo_indumentaria?retryWrites=true&w=majority')
  process.exit(1)
}

async function migrateCollection(connSource, connTarget, collectionName) {
  try {
    const sourceDB = connSource.connection.db
    const targetDB = connTarget.connection.db

    const sourceCollection = sourceDB.collection(collectionName)
    const targetCollection = targetDB.collection(collectionName)

    const count = await sourceCollection.countDocuments()
    
    if (count === 0) {
      console.log(`   ⏭️  ${collectionName}: Sin datos para migrar`)
      return
    }

    console.log(`   📦 ${collectionName}: ${count} documentos encontrados`)

    const documents = await sourceCollection.find({}).toArray()
    
    if (documents.length > 0) {
      // Limpiar colección destino (opcional - comentar si quieres mantener datos existentes)
      await targetCollection.deleteMany({})
      
      // Insertar documentos
      await targetCollection.insertMany(documents)
      console.log(`   ✅ ${collectionName}: ${documents.length} documentos migrados`)
    }
  } catch (error) {
    console.error(`   ❌ Error migrando ${collectionName}:`, error.message)
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración de MongoDB local a Atlas...\n')

  let connLocal = null
  let connAtlas = null

  try {
    // Conectar a MongoDB local
    console.log('📡 Conectando a MongoDB local...')
    connLocal = await mongoose.createConnection(MONGODB_URI_LOCAL).asPromise()
    console.log('✅ Conectado a MongoDB local\n')

    // Conectar a MongoDB Atlas
    console.log('📡 Conectando a MongoDB Atlas...')
    connAtlas = await mongoose.createConnection(MONGODB_URI_ATLAS).asPromise()
    console.log('✅ Conectado a MongoDB Atlas\n')

    // Obtener lista de colecciones
    const localDB = connLocal.connection.db
    const collections = await localDB.listCollections().toArray()
    
    console.log(`📋 Encontradas ${collections.length} colecciones para migrar\n`)

    // Migrar cada colección
    for (const collection of collections) {
      const collectionName = collection.name
      console.log(`🔄 Migrando: ${collectionName}`)
      await migrateCollection(connLocal, connAtlas, collectionName)
    }

    console.log('\n✅ Migración completada exitosamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Verifica los datos en MongoDB Atlas')
    console.log('   2. Configura MONGODB_URI en Vercel con tu cadena de Atlas')
    console.log('   3. Redesplega tu aplicación en Vercel')

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message)
    if (error.message.includes('authentication')) {
      console.log('\n💡 Verifica que tu usuario y contraseña de Atlas sean correctos')
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 Verifica que tu IP esté en la whitelist de MongoDB Atlas')
      console.log('   Ve a MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0')
    }
    process.exit(1)
  } finally {
    // Cerrar conexiones
    if (connLocal) await connLocal.close()
    if (connAtlas) await connAtlas.close()
    process.exit(0)
  }
}

migrate()

