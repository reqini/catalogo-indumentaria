/**
 * Script de QA Completo para Productos, Categorías, Banners e Imágenes
 * Simula flujos completos de ABM y subida de imágenes
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    const envVars = {}

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        }
      }
    })

    return envVars
  } catch (error) {
    console.error('Error cargando .env.local:', error.message)
    return {}
  }
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const results = {
  productos: { passed: 0, failed: 0, errors: [] },
  categorias: { passed: 0, failed: 0, errors: [] },
  banners: { passed: 0, failed: 0, errors: [] },
  imagenes: { passed: 0, failed: 0, errors: [] },
}

async function testBucketExists() {
  console.log('\n🔍 Test 1: Verificar bucket "productos" existe...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const bucketExists = buckets?.some((b) => b.name === 'productos')
    if (bucketExists) {
      console.log('✅ Bucket "productos" existe')
      results.imagenes.passed++
      return true
    } else {
      console.error('❌ Bucket "productos" NO existe')
      results.imagenes.failed++
      results.imagenes.errors.push('Bucket "productos" no existe en Supabase Storage')
      return false
    }
  } catch (error) {
    console.error('❌ Error verificando bucket:', error.message)
    results.imagenes.failed++
    results.imagenes.errors.push(`Error verificando bucket: ${error.message}`)
    return false
  }
}

async function testImageUpload() {
  console.log('\n🔍 Test 2: Simular subida de imagen...')
  try {
    // Crear imagen de prueba pequeña (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const testFileName = `test/${Date.now()}-test.png`
    const { data, error } = await supabase.storage
      .from('productos')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })

    if (error) {
      throw error
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('productos').getPublicUrl(testFileName)

    if (publicUrl) {
      console.log('✅ Imagen subida exitosamente')
      console.log(`   URL: ${publicUrl}`)
      results.imagenes.passed++

      // Limpiar: eliminar imagen de prueba
      await supabase.storage.from('productos').remove([testFileName])
      return true
    } else {
      throw new Error('No se obtuvo URL pública')
    }
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.message)
    results.imagenes.failed++
    results.imagenes.errors.push(`Error subiendo imagen: ${error.message}`)
    return false
  }
}

async function testProductCRUD() {
  console.log('\n🔍 Test 3: CRUD de Productos...')

  // Obtener un tenant de prueba
  const { data: tenants } = await supabase.from('tenants').select('tenant_id').limit(1)
  if (!tenants || tenants.length === 0) {
    console.error('❌ No hay tenants disponibles para testing')
    results.productos.failed++
    results.productos.errors.push('No hay tenants disponibles')
    return
  }

  const tenantId = tenants[0].tenant_id
  let productId = null

  try {
    // CREATE
    console.log('   → Crear producto...')
    const { data: newProduct, error: createError } = await supabase
      .from('productos')
      .insert([
        {
          tenant_id: tenantId,
          nombre: 'Producto Test QA',
          descripcion: 'Producto de prueba para QA',
          precio: 1000,
          categoria: 'Test',
          talles: ['M'],
          stock: { M: 10 },
          imagen_principal: '/images/default-product.svg',
          activo: true,
        },
      ])
      .select()
      .single()

    if (createError) throw createError
    productId = newProduct.id
    console.log('   ✅ Producto creado:', productId)
    results.productos.passed++

    // READ
    console.log('   → Leer producto...')
    const { data: readProduct, error: readError } = await supabase
      .from('productos')
      .eq('id', productId)
      .single()

    if (readError) throw readError
    console.log('   ✅ Producto leído correctamente')
    results.productos.passed++

    // UPDATE
    console.log('   → Actualizar producto...')
    const { error: updateError } = await supabase
      .from('productos')
      .update({ nombre: 'Producto Test QA Actualizado' })
      .eq('id', productId)

    if (updateError) throw updateError
    console.log('   ✅ Producto actualizado correctamente')
    results.productos.passed++

    // DELETE
    console.log('   → Eliminar producto...')
    const { error: deleteError } = await supabase.from('productos').delete().eq('id', productId)

    if (deleteError) throw deleteError
    console.log('   ✅ Producto eliminado correctamente')
    results.productos.passed++
  } catch (error) {
    console.error('   ❌ Error en CRUD de productos:', error.message)
    results.productos.failed++
    results.productos.errors.push(`Error CRUD: ${error.message}`)

    // Limpiar si quedó producto creado
    if (productId) {
      await supabase.from('productos').delete().eq('id', productId)
    }
  }
}

async function testCategoriaCRUD() {
  console.log('\n🔍 Test 4: CRUD de Categorías...')
  let categoriaId = null

  try {
    // CREATE
    console.log('   → Crear categoría...')
    const { data: newCategoria, error: createError } = await supabase
      .from('categorias')
      .insert([
        {
          nombre: 'Categoría Test QA',
          slug: 'categoria-test-qa',
          descripcion: 'Categoría de prueba',
          activa: true,
        },
      ])
      .select()
      .single()

    if (createError) throw createError
    categoriaId = newCategoria.id
    console.log('   ✅ Categoría creada:', categoriaId)
    results.categorias.passed++

    // UPDATE
    console.log('   → Actualizar categoría...')
    const { error: updateError } = await supabase
      .from('categorias')
      .update({ nombre: 'Categoría Test QA Actualizada' })
      .eq('id', categoriaId)

    if (updateError) throw updateError
    console.log('   ✅ Categoría actualizada correctamente')
    results.categorias.passed++

    // DELETE
    console.log('   → Eliminar categoría...')
    const { error: deleteError } = await supabase.from('categorias').delete().eq('id', categoriaId)

    if (deleteError) throw deleteError
    console.log('   ✅ Categoría eliminada correctamente')
    results.categorias.passed++
  } catch (error) {
    console.error('   ❌ Error en CRUD de categorías:', error.message)
    results.categorias.failed++
    results.categorias.errors.push(`Error CRUD: ${error.message}`)

    // Limpiar si quedó categoría creada
    if (categoriaId) {
      await supabase.from('categorias').delete().eq('id', categoriaId)
    }
  }
}

async function testBannerCRUD() {
  console.log('\n🔍 Test 5: CRUD de Banners...')

  // Obtener un tenant de prueba
  const { data: tenants } = await supabase.from('tenants').select('tenant_id').limit(1)
  if (!tenants || tenants.length === 0) {
    console.error('❌ No hay tenants disponibles para testing')
    results.banners.failed++
    results.banners.errors.push('No hay tenants disponibles')
    return
  }

  const tenantId = tenants[0].tenant_id
  let bannerId = null

  try {
    // CREATE
    console.log('   → Crear banner...')
    const { data: newBanner, error: createError } = await supabase
      .from('banners')
      .insert([
        {
          tenant_id: tenantId,
          titulo: 'Banner Test QA',
          imagen_url: '/images/default-product.svg',
          activo: true,
          orden: 0,
        },
      ])
      .select()
      .single()

    if (createError) throw createError
    bannerId = newBanner.id
    console.log('   ✅ Banner creado:', bannerId)
    results.banners.passed++

    // UPDATE
    console.log('   → Actualizar banner...')
    const { error: updateError } = await supabase
      .from('banners')
      .update({ titulo: 'Banner Test QA Actualizado' })
      .eq('id', bannerId)

    if (updateError) throw updateError
    console.log('   ✅ Banner actualizado correctamente')
    results.banners.passed++

    // DELETE
    console.log('   → Eliminar banner...')
    const { error: deleteError } = await supabase.from('banners').delete().eq('id', bannerId)

    if (deleteError) throw deleteError
    console.log('   ✅ Banner eliminado correctamente')
    results.banners.passed++
  } catch (error) {
    console.error('   ❌ Error en CRUD de banners:', error.message)
    results.banners.failed++
    results.banners.errors.push(`Error CRUD: ${error.message}`)

    // Limpiar si quedó banner creado
    if (bannerId) {
      await supabase.from('banners').delete().eq('id', bannerId)
    }
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO QA COMPLETO')
  console.log('═══════════════════════════════════════════════════════════\n')

  await testBucketExists()
  await testImageUpload()
  await testProductCRUD()
  await testCategoriaCRUD()
  await testBannerCRUD()

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 RESUMEN DE TESTS')
  console.log('═══════════════════════════════════════════════════════════\n')

  const totalPassed =
    results.productos.passed +
    results.categorias.passed +
    results.banners.passed +
    results.imagenes.passed
  const totalFailed =
    results.productos.failed +
    results.categorias.failed +
    results.banners.failed +
    results.imagenes.failed

  console.log(`✅ Tests pasados: ${totalPassed}`)
  console.log(`❌ Tests fallidos: ${totalFailed}\n`)

  if (totalFailed > 0) {
    console.log('📋 ERRORES DETECTADOS:\n')
    Object.entries(results).forEach(([module, result]) => {
      if (result.errors.length > 0) {
        console.log(`${module.toUpperCase()}:`)
        result.errors.forEach((error) => console.log(`  - ${error}`))
        console.log('')
      }
    })
  }

  process.exit(totalFailed > 0 ? 1 : 0)
}

runAllTests()

