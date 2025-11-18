import fs from 'fs'
import { createCanvas } from 'canvas'

// Crear icono 192x192
const canvas192 = createCanvas(192, 192)
const ctx192 = canvas192.getContext('2d')

// Fondo negro
ctx192.fillStyle = '#000000'
ctx192.fillRect(0, 0, 192, 192)

// Texto blanco "CI"
ctx192.fillStyle = '#FFFFFF'
ctx192.font = 'bold 80px Arial'
ctx192.textAlign = 'center'
ctx192.textBaseline = 'middle'
ctx192.fillText('CI', 96, 96)

const buffer192 = canvas192.toBuffer('image/png')
fs.writeFileSync('public/icon-192x192.png', buffer192)
console.log('✅ Icono 192x192 creado')

// Crear icono 512x512
const canvas512 = createCanvas(512, 512)
const ctx512 = canvas512.getContext('2d')

// Fondo negro
ctx512.fillStyle = '#000000'
ctx512.fillRect(0, 0, 512, 512)

// Texto blanco "CI"
ctx512.fillStyle = '#FFFFFF'
ctx512.font = 'bold 200px Arial'
ctx512.textAlign = 'center'
ctx512.textBaseline = 'middle'
ctx512.fillText('CI', 256, 256)

const buffer512 = canvas512.toBuffer('image/png')
fs.writeFileSync('public/icon-512x512.png', buffer512)
console.log('✅ Icono 512x512 creado')

