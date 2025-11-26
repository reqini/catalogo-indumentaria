#!/usr/bin/env node

/**
 * Script para generar iconos PWA desde el logo horizontal SVG
 * Requiere: sharp (npm install sharp)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function generatePWAIcons() {
  try {
    // Intentar usar sharp si está disponible
    let sharp
    try {
      sharp = (await import('sharp')).default
    } catch (e) {
      console.error('❌ sharp no está instalado. Instalá con: pnpm add sharp')
      console.log('📝 Creando iconos placeholder...')
      createPlaceholderIcons()
      return
    }

    const logoPath = path.join(rootDir, 'public/branding/asi-somos/logo-horizontal.svg')
    
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ No se encontró el logo en: ${logoPath}`)
      createPlaceholderIcons()
      return
    }

    console.log('🎨 Generando iconos PWA desde:', logoPath)

    // Leer SVG
    const svgBuffer = fs.readFileSync(logoPath)

    // Generar icono 192x192
    const icon192 = await sharp(svgBuffer)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer()

    fs.writeFileSync(path.join(rootDir, 'public/icon-192x192.png'), icon192)
    console.log('✅ Generado: icon-192x192.png (192x192px)')

    // Generar icono 512x512
    const icon512 = await sharp(svgBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer()

    fs.writeFileSync(path.join(rootDir, 'public/icon-512x512.png'), icon512)
    console.log('✅ Generado: icon-512x512.png (512x512px)')

    console.log('✅ Iconos PWA generados correctamente')
  } catch (error) {
    console.error('❌ Error generando iconos:', error.message)
    console.log('📝 Creando iconos placeholder...')
    createPlaceholderIcons()
  }
}

function createPlaceholderIcons() {
  // Crear iconos placeholder simples usando un SVG base64
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#000000"/>
  <text x="96" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AS</text>
</svg>`

  // Convertir SVG a PNG usando un método simple
  // Nota: Esto es un placeholder. En producción, usar sharp o ImageMagick
  console.log('⚠️  Usando iconos placeholder. Para iconos reales, instalá sharp: pnpm add sharp')
  
  // Por ahora, crear un archivo SVG que funcione como placeholder
  const placeholder192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#000000" rx="20"/>
  <text x="96" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AS</text>
</svg>`

  const placeholder512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000" rx="50"/>
  <text x="256" y="290" font-family="Arial, sans-serif" font-size="128" font-weight="bold" fill="#FFFFFF" text-anchor="middle">AS</text>
</svg>`

  fs.writeFileSync(path.join(rootDir, 'public/icon-192x192.svg'), placeholder192)
  fs.writeFileSync(path.join(rootDir, 'public/icon-512x512.svg'), placeholder512)
  
  console.log('📝 Creados iconos SVG placeholder. Actualizá el manifest para usar .svg o instalá sharp para PNG.')
}

generatePWAIcons()

