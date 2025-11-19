#!/usr/bin/env node

/**
 * Genera un JWT_SECRET seguro para producción
 */

import { randomBytes } from 'crypto'

const secret = randomBytes(32).toString('hex')

console.log('\n🔐 JWT_SECRET GENERADO:\n')
console.log('='.repeat(60))
console.log(secret)
console.log('='.repeat(60))
console.log('\n📝 Copia este valor y configúralo en:')
console.log('   • Vercel Dashboard → Environment Variables')
console.log('   • Variable: JWT_SECRET')
console.log('   • Entorno: Production\n')
console.log('⚠️  IMPORTANTE: Guarda este secret de forma segura')
console.log('   No lo compartas ni lo commitees al repositorio\n')

