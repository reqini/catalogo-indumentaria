/**
 * Script simple para crear iconos PWA válidos usando sharp
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'

async function createIcon(size, filename) {
  // Crear imagen negra
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#000000"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 20}" fill="#FFFFFF"/>
      <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#000000" text-anchor="middle" dominant-baseline="central">CI</text>
    </svg>
  `

  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .resize(size, size)
    .toBuffer()

  writeFileSync(`public/${filename}`, pngBuffer)
  console.log(`✅ ${filename} creado (${size}x${size})`)
}

async function main() {
  try {
    await createIcon(192, 'icon-192x192.png')
    await createIcon(512, 'icon-512x512.png')
    console.log('\n✅ Iconos PWA creados exitosamente')
  } catch (error) {
    console.error('❌ Error creando iconos:', error.message)
    console.log('\n📝 Alternativa: Usa un servicio online como:')
    console.log('   - https://realfavicongenerator.net/')
    console.log('   - https://www.favicon-generator.org/')
    process.exit(1)
  }
}

main()

