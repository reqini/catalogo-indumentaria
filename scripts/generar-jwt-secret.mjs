#!/usr/bin/env node

/**
 * Genera un JWT_SECRET seguro para producción
 * 
 * PROPÓSITO:
 *   Genera un secreto aleatorio de 64 caracteres hexadecimales para JWT
 * 
 * CUÁNDO EJECUTAR:
 *   - Manualmente cuando necesites generar un nuevo JWT_SECRET
 *   - Solo una vez durante el setup inicial del proyecto
 *   - NO se ejecuta automáticamente en build de Vercel
 * 
 * USO:
 *   pnpm jwt:generate
 * 
 * REQUISITOS:
 *   - Node.js con módulo crypto (incluido por defecto)
 *   - NO requiere dependencias externas
 * 
 * NOTA:
 *   Este script NO debe ejecutarse en el build de Vercel porque:
 *   1. Genera valores aleatorios diferentes cada vez
 *   2. El JWT_SECRET debe ser consistente entre builds
 *   3. Debe configurarse manualmente en variables de entorno
 * 
 * DESPUÉS DE EJECUTAR:
 *   1. Copia el valor generado
 *   2. Configúralo en .env.local (local)
 *   3. Configúralo en Vercel Dashboard → Environment Variables (producción)
 *   4. NO lo commitees al repositorio
 */

import { randomBytes } from 'crypto'

const secret = randomBytes(32).toString('hex')

console.log('\n🔐 JWT_SECRET GENERADO:\n')
console.log('='.repeat(60))
console.log(secret)
console.log('='.repeat(60))
console.log('\n📝 Copia este valor y configúralo en:')
console.log('   • .env.local (local)')
console.log('   • Vercel Dashboard → Environment Variables')
console.log('   • Variable: JWT_SECRET')
console.log('   • Entorno: Production\n')
console.log('⚠️  IMPORTANTE: Guarda este secret de forma segura')
console.log('   No lo compartas ni lo commitees al repositorio\n')
