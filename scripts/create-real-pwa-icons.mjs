#!/usr/bin/env node

/**
 * Script para crear íconos PWA REALES (192x192 y 512x512)
 * 
 * PROPÓSITO:
 *   Genera PNGs válidos usando sharp (más confiable que canvas)
 *   Crea iconos con el branding "AS" (Así Somos)
 * 
 * CUÁNDO EJECUTAR:
 *   - Manualmente cuando cambies el logo o necesites regenerar iconos
 *   - Localmente durante desarrollo/setup inicial
 *   - NO se ejecuta automáticamente en build de Vercel
 * 
 * USO:
 *   pnpm pwa:icons:real
 * 
 * REQUISITOS:
 *   - Dependencia opcional: sharp (preferido) o canvas (fallback)
 *   - Si ninguna está disponible, el script fallará con instrucciones alternativas
 * 
 * NOTA:
 *   Este script NO debe ejecutarse en el build de Vercel porque:
 *   1. Requiere dependencias opcionales (sharp/canvas) que pueden no estar disponibles
 *   2. Los iconos deben estar commitados en el repo, no generarse en cada build
 *   3. Es un paso manual que se hace cuando cambia el logo
 * 
 * RECOMENDACIÓN:
 *   Usa este script en lugar de create-pwa-icons.mjs porque es más robusto
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')

// Intentar usar sharp primero (más confiable)
let sharp
try {
  const sharpModule = await import('sharp')
  sharp = sharpModule.default
} catch (error) {
  console.warn('⚠️  Sharp no disponible. Usando método alternativo.')
}

/**
 * Crear ícono usando sharp (método preferido)
 */
async function createIconWithSharp(size) {
  if (!sharp) {
    return null
  }

  // Crear SVG primero
  const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7452A8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7E8B5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.floor(size * 0.35)}" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">AS</text>
</svg>
  `.trim())

  // Convertir SVG a PNG usando sharp
  const pngBuffer = await sharp(svg)
    .resize(size, size)
    .png()
    .toBuffer()

  return pngBuffer
}

/**
 * Crear ícono usando método alternativo (canvas)
 */
async function createIconWithCanvas(size) {
  try {
    const canvasModule = await import('canvas')
    const { createCanvas } = canvasModule

    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, '#7452A8')
    gradient.addColorStop(1, '#F7E8B5')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // Texto "AS"
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${Math.floor(size * 0.35)}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('AS', size / 2, size / 2)

    return canvas.toBuffer('image/png')
  } catch (error) {
    console.warn('⚠️  Canvas no disponible:', error.message)
    return null
  }
}

async function main() {
  console.log('🎨 Creando íconos PWA REALES...\n')

  const sizes = [
    { size: 192, filename: 'icon-192x192.png' },
    { size: 512, filename: 'icon-512x512.png' },
  ]

  for (const { size, filename } of sizes) {
    const filePath = path.join(publicDir, filename)
    
    try {
      let buffer = null
      
      // Intentar sharp primero (más confiable)
      if (sharp) {
        console.log(`📦 Creando ${filename} con Sharp...`)
        buffer = await createIconWithSharp(size)
      }
      
      // Si sharp no funciona, intentar canvas
      if (!buffer) {
        console.log(`📦 Creando ${filename} con Canvas...`)
        buffer = await createIconWithCanvas(size)
      }
      
      if (!buffer) {
        throw new Error('No se pudo crear el ícono. Instala sharp o canvas.')
      }
      
      fs.writeFileSync(filePath, buffer)
      
      // Verificar que el archivo se creó correctamente
      const stats = fs.statSync(filePath)
      console.log(`✅ Creado: ${filename} (${size}x${size}px, ${(stats.size / 1024).toFixed(2)}KB)`)
      
    } catch (error) {
      console.error(`❌ Error creando ${filename}:`, error.message)
      console.warn(`⚠️  Asegúrate de crear manualmente ${filename} con tamaño exacto ${size}x${size}px`)
      console.warn(`⚠️  Puedes usar: https://realfavicongenerator.net/ o cualquier editor de imágenes`)
    }
  }

  console.log('\n✅ Proceso completado.')
  console.log('\n📝 Verificación:')
  console.log('   - Los íconos deben tener exactamente 192x192 y 512x512 píxeles')
  console.log('   - Deben ser archivos PNG válidos')
  console.log('   - Deben estar en /public/icon-192x192.png y /public/icon-512x512.png')
}

main().catch(console.error)
