/**
 * Script para crear iconos PWA válidos
 * Genera iconos de 192x192 y 512x512 píxeles
 */

import fs from 'fs'
import { createCanvas } from 'canvas'

try {
  // Crear icono 192x192
  const canvas192 = createCanvas(192, 192)
  const ctx192 = canvas192.getContext('2d')

  // Fondo negro
  ctx192.fillStyle = '#000000'
  ctx192.fillRect(0, 0, 192, 192)

  // Círculo blanco en el centro
  ctx192.fillStyle = '#FFFFFF'
  ctx192.beginPath()
  ctx192.arc(96, 96, 70, 0, Math.PI * 2)
  ctx192.fill()

  // Texto "CI" en negro dentro del círculo
  ctx192.fillStyle = '#000000'
  ctx192.font = 'bold 60px Arial'
  ctx192.textAlign = 'center'
  ctx192.textBaseline = 'middle'
  ctx192.fillText('CI', 96, 96)

  const buffer192 = canvas192.toBuffer('image/png')
  fs.writeFileSync('public/icon-192x192.png', buffer192)
  console.log('✅ Icono 192x192 creado correctamente')

  // Crear icono 512x512
  const canvas512 = createCanvas(512, 512)
  const ctx512 = canvas512.getContext('2d')

  // Fondo negro
  ctx512.fillStyle = '#000000'
  ctx512.fillRect(0, 0, 512, 512)

  // Círculo blanco en el centro
  ctx512.fillStyle = '#FFFFFF'
  ctx512.beginPath()
  ctx512.arc(256, 256, 180, 0, Math.PI * 2)
  ctx512.fill()

  // Texto "CI" en negro dentro del círculo
  ctx512.fillStyle = '#000000'
  ctx512.font = 'bold 160px Arial'
  ctx512.textAlign = 'center'
  ctx512.textBaseline = 'middle'
  ctx512.fillText('CI', 256, 256)

  const buffer512 = canvas512.toBuffer('image/png')
  fs.writeFileSync('public/icon-512x512.png', buffer512)
  console.log('✅ Icono 512x512 creado correctamente')
  console.log('✅ Iconos PWA generados exitosamente')
} catch (error) {
  console.error('❌ Error creando iconos:', error.message)
  console.log('\n📝 Alternativa: Usa un servicio online como:')
  console.log('   - https://realfavicongenerator.net/')
  console.log('   - https://www.favicon-generator.org/')
  console.log('   O instala canvas: pnpm add canvas')
  process.exit(1)
}

