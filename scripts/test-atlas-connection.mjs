#!/usr/bin/env node

/**
 * Script para probar la conexión a MongoDB Atlas
 * 
 * Uso:
 *   pnpm test-atlas
 * 
 * Requiere:
 *   - MONGODB_URI_ATLAS en .env.local
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI

if (!MONGODB_URI_ATLAS) {
  console.error('❌ Error: MONGODB_URI_ATLAS o MONGODB_URI no está configurado')
  console.log('\n📝 Configura MONGODB_URI_ATLAS en tu .env.local')
  process.exit(1)
}

async function testConnection() {
  console.log('🧪 Probando conexión a MongoDB Atlas...\n')
  console.log(`📡 URI: ${MONGODB_URI_ATLAS.replace(/:[^:@]+@/, ':****@')}\n`)

  try {
    const startTime = Date.now()
    const conn = await mongoose.connect(MONGODB_URI_ATLAS, {
      serverSelectionTimeoutMS: 5000,
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('✅ Conexión exitosa!')
    console.log(`⏱️  Tiempo de conexión: ${duration}ms`)
    console.log(`📊 Base de datos: ${conn.connection.name}`)
    console.log(`🌐 Host: ${conn.connection.host}`)

    // Listar colecciones
    const db = conn.connection.db
    const collections = await db.listCollections().toArray()
    
    console.log(`\n📋 Colecciones encontradas: ${collections.length}`)
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`)
      })
    } else {
      console.log('   (No hay colecciones aún)')
    }

    await mongoose.disconnect()
    console.log('\n✅ Prueba completada exitosamente!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Verifica que tu usuario y contraseña sean correctos')
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 Verifica que:')
      console.log('   1. Tu IP esté en la whitelist de MongoDB Atlas')
      console.log('   2. La cadena de conexión sea correcta')
      console.log('   3. El cluster esté activo en MongoDB Atlas')
    } else if (error.message.includes('bad auth')) {
      console.log('\n💡 Verifica que el usuario tenga permisos en la base de datos')
    }
    
    process.exit(1)
  }
}

testConnection()

