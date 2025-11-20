#!/usr/bin/env node

/**
 * Script para crear íconos PWA correctos (192x192 y 512x512)
 * Reemplaza los placeholders 1x1px con íconos reales
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')

// Verificar si canvas está disponible
let canvas, createCanvas
try {
  const canvasModule = await import('canvas')
  canvas = canvasModule.default
  createCanvas = canvasModule.createCanvas
} catch (error) {
  console.warn('⚠️  Canvas no disponible. Usando método alternativo.')
}

/**
 * Crear ícono usando canvas (si está disponible)
 */
function createIconWithCanvas(size) {
  if (!createCanvas) {
    return null
  }

  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')

  // Fondo degradado violeta (#7452A8) a crema (#F7E8B5)
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#7452A8')
  gradient.addColorStop(1, '#F7E8B5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Texto "AS" en el centro
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${Math.floor(size * 0.4)}px system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AS', size / 2, size / 2)

  return c.toBuffer('image/png')
}

/**
 * Crear ícono usando método alternativo (SVG convertido)
 */
function createIconSVG(size) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7452A8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7E8B5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${Math.floor(size * 0.4)}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">AS</text>
</svg>
  `.trim()

  return Buffer.from(svg)
}

async function main() {
  console.log('🎨 Creando íconos PWA...\n')

  const sizes = [
    { size: 192, filename: 'icon-192x192.png' },
    { size: 512, filename: 'icon-512x512.png' },
  ]

  for (const { size, filename } of sizes) {
    const filePath = path.join(publicDir, filename)
    
    try {
      let buffer
      
      // Intentar usar canvas primero
      if (createCanvas) {
        console.log(`📦 Creando ${filename} con Canvas...`)
        buffer = createIconWithCanvas(size)
      }
      
      // Si canvas no está disponible, usar SVG
      if (!buffer) {
        console.log(`📦 Creando ${filename} con SVG (método alternativo)...`)
        console.warn('⚠️  Nota: Los íconos SVG pueden no funcionar en todos los navegadores.')
        console.warn('⚠️  Para íconos PNG reales, instala canvas: npm install canvas')
        
        // Para producción, mejor usar un método que genere PNG real
        // Por ahora, creamos un placeholder mejorado
        buffer = createIconSVG(size)
        
        // Cambiar extensión a .svg si usamos SVG
        if (!createCanvas) {
          const svgPath = filePath.replace('.png', '.svg')
          fs.writeFileSync(svgPath, buffer)
          console.log(`✅ Creado: ${path.basename(svgPath)}`)
          continue
        }
      }
      
      fs.writeFileSync(filePath, buffer)
      console.log(`✅ Creado: ${filename} (${size}x${size}px)`)
      
    } catch (error) {
      console.error(`❌ Error creando ${filename}:`, error.message)
      console.warn(`⚠️  Asegúrate de crear manualmente ${filename} con tamaño ${size}x${size}px`)
    }
  }

  console.log('\n✅ Proceso completado.')
  console.log('\n📝 Nota: Si los íconos no se generaron correctamente, puedes:')
  console.log('   1. Instalar canvas: npm install canvas')
  console.log('   2. O crear los íconos manualmente con un editor de imágenes')
  console.log('   3. Guardarlos en /public/icon-192x192.png y /public/icon-512x512.png')
}

main().catch(console.error)

