#!/usr/bin/env node

/**
 * Script para crear productos y banners reales en Supabase
 * 
 * Uso:
 *   pnpm crear-datos-reales
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readFileSync } from 'fs'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Leer .env.local manualmente
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) {
    return {}
  }
  
  const content = readFileSync(envPath, 'utf-8')
  const env = {}
  
  content.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  })
  
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function crearTenantDemo() {
  console.log('\n📋 Creando tenant demo...')
  
  const tenantId = uuidv4()
  const passwordHash = await bcrypt.hash('admin123', 10)
  
  const { data, error } = await supabase
    .from('tenants')
    .insert([
      {
        tenant_id: tenantId,
        nombre_negocio: 'Catálogo Indumentaria',
        email: 'admin@catalogo.com',
        password_hash: passwordHash,
        plan: 'premium',
        activo: true,
        rol: 'tenant',
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          font: 'Inter',
        },
      },
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Ya existe, buscar el existente
      const { data: existing } = await supabase
        .from('tenants')
        .select('tenant_id')
        .eq('email', 'admin@catalogo.com')
        .single()
      
      if (existing) {
        console.log('✅ Tenant demo ya existe')
        return existing.tenant_id
      }
    } else {
      console.error('❌ Error creando tenant:', error.message)
      throw error
    }
  }

  console.log('✅ Tenant demo creado')
  return data.tenant_id
}

async function crearProductos(tenantId) {
  console.log('\n📦 Creando productos reales...')

  const productos = [
    {
      tenant_id: tenantId,
      nombre: 'Remera Running Pro',
      descripcion: 'Remera técnica de alta performance para running. Material transpirable y de secado rápido. Ideal para entrenamientos intensos y carreras.',
      precio: 12990,
      descuento: 15,
      categoria: 'Running',
      color: 'Negro',
      talles: ['S', 'M', 'L', 'XL'],
      stock: { 'S': 10, 'M': 15, 'L': 12, 'XL': 8 },
      imagen_principal: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      imagenes_sec: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      tags: ['running', 'deporte', 'técnico'],
      destacado: true,
      activo: true,
    },
    {
      tenant_id: tenantId,
      nombre: 'Pantalón Training Elite',
      descripcion: 'Pantalón de entrenamiento con tecnología de compresión. Perfecto para gimnasio, crossfit y entrenamientos funcionales. Máxima movilidad y comodidad.',
      precio: 18990,
      descuento: 20,
      categoria: 'Training',
      color: 'Gris',
      talles: ['S', 'M', 'L', 'XL'],
      stock: { 'S': 8, 'M': 12, 'L': 10, 'XL': 6 },
      imagen_principal: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      imagenes_sec: [
        'https://images.unsplash.com/photo-1506629905607-cc0c5e0c0c0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      tags: ['training', 'gimnasio', 'compresión'],
      destacado: true,
      activo: true,
    },
    {
      tenant_id: tenantId,
      nombre: 'Buzo Lifestyle Premium',
      descripcion: 'Buzo cómodo y elegante para uso diario. Algodón premium, corte moderno. Perfecto para combinar con cualquier outfit casual.',
      precio: 24990,
      categoria: 'Lifestyle',
      color: 'Azul Marino',
      talles: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: { 'S': 5, 'M': 8, 'L': 10, 'XL': 7, 'XXL': 4 },
      imagen_principal: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      imagenes_sec: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      tags: ['lifestyle', 'casual', 'premium'],
      destacado: true,
      activo: true,
    },
    {
      tenant_id: tenantId,
      nombre: 'Remera Básica Algodón',
      descripcion: 'Remera básica de algodón 100%. Corte clásico, cómoda y versátil. Disponible en múltiples colores.',
      precio: 8990,
      descuento: 10,
      categoria: 'remeras',
      color: 'Blanco',
      talles: ['XS', 'S', 'M', 'L', 'XL'],
      stock: { 'XS': 15, 'S': 20, 'M': 25, 'L': 18, 'XL': 12 },
      imagen_principal: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      imagenes_sec: [],
      tags: ['básico', 'algodón', 'clásico'],
      destacado: false,
      activo: true,
    },
    {
      tenant_id: tenantId,
      nombre: 'Pantalón Cargo Urbano',
      descripcion: 'Pantalón cargo moderno con múltiples bolsillos. Estilo urbano y funcional. Perfecto para el día a día.',
      precio: 21990,
      categoria: 'pantalones',
      color: 'Beige',
      talles: ['28', '30', '32', '34', '36'],
      stock: { '28': 6, '30': 10, '32': 12, '34': 8, '36': 5 },
      imagen_principal: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      imagenes_sec: [],
      tags: ['urbano', 'cargo', 'funcional'],
      destacado: false,
      activo: true,
    },
  ]

  const productosCreados = []
  
  for (const producto of productos) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando producto "${producto.nombre}":`, error.message)
    } else {
      console.log(`✅ Producto creado: ${producto.nombre}`)
      productosCreados.push(data)
    }
  }

  return productosCreados
}

async function crearBanners(tenantId) {
  console.log('\n🖼️  Creando banners para la home...')

  const banners = [
    {
      tenant_id: tenantId,
      titulo: 'Nueva Colección Running',
      imagen_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      activo: true,
      orden: 1,
      link: '/catalogo?categoria=Running',
    },
    {
      tenant_id: tenantId,
      titulo: 'Ofertas Especiales',
      imagen_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      activo: true,
      orden: 2,
      link: '/catalogo?precio=asc',
    },
    {
      tenant_id: tenantId,
      titulo: 'Training Elite',
      imagen_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      activo: true,
      orden: 3,
      link: '/catalogo?categoria=Training',
    },
  ]

  const bannersCreados = []
  
  for (const banner of banners) {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando banner "${banner.titulo}":`, error.message)
    } else {
      console.log(`✅ Banner creado: ${banner.titulo}`)
      bannersCreados.push(data)
    }
  }

  return bannersCreados
}

async function crearPlanes() {
  console.log('\n💳 Creando planes...')

  const planes = [
    {
      nombre: 'free',
      precio: 0,
      limite_productos: 10,
      limite_banners: 3,
      beneficios: ['Hasta 10 productos', '3 banners', 'Soporte por email'],
      activo: true,
    },
    {
      nombre: 'pro',
      precio: 2990,
      limite_productos: 100,
      limite_banners: 10,
      beneficios: ['Hasta 100 productos', '10 banners', 'Soporte prioritario', 'Analytics avanzado'],
      activo: true,
    },
    {
      nombre: 'premium',
      precio: 8990,
      limite_productos: -1, // Ilimitado
      limite_banners: -1, // Ilimitado
      beneficios: ['Productos ilimitados', 'Banners ilimitados', 'Soporte 24/7', 'Analytics completo', 'Dominio personalizado'],
      activo: true,
    },
  ]

  for (const plan of planes) {
    const { error } = await supabase
      .from('planes')
      .upsert([plan], { onConflict: 'nombre' })

    if (error) {
      console.error(`❌ Error creando plan "${plan.nombre}":`, error.message)
    } else {
      console.log(`✅ Plan creado: ${plan.nombre}`)
    }
  }
}

async function main() {
  console.log('🚀 Creando datos reales en Supabase...\n')
  console.log('='.repeat(60))

  try {
    // Crear planes primero
    await crearPlanes()

    // Crear tenant demo
    const tenantId = await crearTenantDemo()

    // Crear productos
    const productos = await crearProductos(tenantId)

    // Crear banners
    const banners = await crearBanners(tenantId)

    console.log('\n' + '='.repeat(60))
    console.log('✅ DATOS CREADOS EXITOSAMENTE')
    console.log('='.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   ✅ Tenant: admin@catalogo.com`)
    console.log(`   ✅ Productos creados: ${productos.length}`)
    console.log(`   ✅ Banners creados: ${banners.length}`)
    console.log(`   ✅ Planes creados: 3`)
    console.log(`\n🔑 Credenciales:`)
    console.log(`   Email: admin@catalogo.com`)
    console.log(`   Password: admin123`)
    console.log(`\n🌐 Accede a:`)
    console.log(`   http://localhost:3001/admin/login`)
    console.log(`\n🎉 ¡Todo listo para usar!`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()

