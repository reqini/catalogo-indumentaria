#!/usr/bin/env node

/**
 * Guía interactiva paso a paso para configurar Supabase
 * 
 * PROPÓSITO:
 *   Proporciona una guía interactiva paso a paso para configurar Supabase
 *   Incluye prompts y pausas para que el usuario siga las instrucciones
 * 
 * CUÁNDO EJECUTAR:
 *   - Manualmente durante el setup inicial del proyecto
 *   - Cuando necesites ayuda para configurar Supabase
 *   - NO se ejecuta automáticamente en build de Vercel
 * 
 * USO:
 *   pnpm supabase:help
 * 
 * REQUISITOS:
 *   - Node.js con módulo readline (incluido por defecto)
 *   - Terminal interactiva (NO funciona en CI/CD)
 * 
 * NOTA CRÍTICA:
 *   Este script NO debe ejecutarse en el build de Vercel porque:
 *   1. Requiere entrada interactiva del usuario (readline)
 *   2. Espera que el usuario presione Enter en cada paso
 *   3. No tiene sentido en un entorno automatizado
 *   4. Causaría que el build se quede colgado esperando input
 * 
 * ALTERNATIVA:
 *   Si necesitas configurar Supabase en CI/CD, usa:
 *   - Variables de entorno pre-configuradas
 *   - Scripts no interactivos (setup-supabase-env.mjs)
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

function pause() {
  return new Promise((resolve) => {
    rl.question('\n⏸️  Presiona Enter para continuar...', resolve)
  })
}

async function showStep(stepNum, title, instructions) {
  console.log('\n' + '='.repeat(60))
  console.log(`📋 PASO ${stepNum}: ${title}`)
  console.log('='.repeat(60))
  console.log(instructions)
  await pause()
}

async function main() {
  console.log('\n🚀 GUÍA INTERACTIVA - CONFIGURACIÓN DE SUPABASE')
  console.log('='.repeat(60))
  console.log('\nEsta guía te llevará paso a paso para configurar Supabase.')
  console.log('Tómate tu tiempo en cada paso.\n')

  // Paso 1: Crear proyecto
  await showStep(
    1,
    'Crear Proyecto en Supabase',
    `
1. Ve a: https://supabase.com
2. Click en "Start your project" o "Sign In"
3. Crea cuenta (puedes usar GitHub, Google, o email)
4. Click en "New Project"
5. Completa:
   - Name: catalogo-indumentaria (o el que prefieras)
   - Database Password: Crea una contraseña segura (¡GUÁRDALA!)
   - Region: Elige la más cercana
   - Pricing Plan: Selecciona "Free"
6. Click en "Create new project"
7. Espera 2-3 minutos

✅ Verificación:
   - [ ] Proyecto creado en Supabase Dashboard
   - [ ] Puedes ver el dashboard del proyecto
    `
  )

  // Paso 2: Ejecutar SQL
  const sqlPath = join(__dirname, '..', 'supabase/migrations/001_initial_schema.sql')
  const sqlExists = existsSync(sqlPath)
  
  await showStep(
    2,
    'Ejecutar Migración SQL',
    `
1. En el dashboard de tu proyecto, ve a "SQL Editor" (sidebar izquierdo)
2. Click en "New query"
3. Abre el archivo: supabase/migrations/001_initial_schema.sql
4. Copia TODO el contenido (Cmd+A, Cmd+C)
5. Pega en el SQL Editor de Supabase (Cmd+V)
6. Click en "Run" o presiona Cmd+Enter

✅ Verificación:
   - [ ] SQL ejecutado sin errores
   - [ ] Mensaje "Success. No rows returned"
   - [ ] Tablas creadas (ver en "Table Editor")
    `
  )

  if (!sqlExists) {
    console.log('\n⚠️  ADVERTENCIA: No se encontró el archivo SQL')
    console.log('   Verifica que existe: supabase/migrations/001_initial_schema.sql')
  }

  // Paso 3: Obtener credenciales
  await showStep(
    3,
    'Obtener Credenciales y Configurar Variables',
    `
1. En el dashboard, ve a "Settings" (ícono de engranaje)
2. Click en "API" en el menú lateral
3. Copia estos 3 valores:

   a) Project URL
      - Busca "Project URL"
      - Copia el valor (ej: https://xxxxx.supabase.co)

   b) anon/public key
      - Busca "Project API keys"
      - Busca la fila con "anon" o "public"
      - Copia el valor (empieza con eyJhbGci...)

   c) service_role key
      - En la misma sección "Project API keys"
      - Busca la fila con "service_role"
      - ⚠️ IMPORTANTE: Esta clave es SECRETA
      - Copia el valor (empieza con eyJhbGci...)

4. Ahora configura las variables:
   
   Opción A (RECOMENDADO): Ejecuta el script interactivo
   → pnpm setup-supabase-env
   
   Opción B: Edita manualmente .env.local
   → Abre .env.local y reemplaza los valores

✅ Verificación:
   - [ ] 3 variables configuradas en .env.local
   - [ ] Valores son URLs/keys reales (no placeholders)
    `
  )

  // Paso 4: Verificar
  await showStep(
    4,
    'Verificar que Todo Funciona',
    `
1. Verifica la configuración:
   → pnpm verify-supabase
   
   Deberías ver:
   ✅ .env.local existe
   ✅ NEXT_PUBLIC_SUPABASE_URL: https://...
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...
   ✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGci...
   ✅ TODO CONFIGURADO CORRECTAMENTE

2. Prueba la conexión:
   → pnpm test-supabase
   
   Deberías ver un mensaje de éxito.

✅ Verificación:
   - [ ] verify-supabase muestra todo correcto
   - [ ] test-supabase conecta exitosamente
    `
  )

  console.log('\n' + '='.repeat(60))
  console.log('🎉 ¡CONFIGURACIÓN COMPLETA!')
  console.log('='.repeat(60))
  console.log(`
Ahora tu proyecto está completamente configurado con Supabase.

✅ Puedes ejecutar: pnpm dev
✅ La app funcionará con Supabase
✅ Crear productos desde el admin
✅ Ver productos en el catálogo

📚 Recursos:
   - docs/GUIA-PASO-A-PASO-SUPABASE.md (guía completa)
   - docs/migracion-supabase.md (detalles técnicos)
   - docs/configurar-variables-entorno.md (variables)

🚀 ¡Todo funcionará automáticamente!
  `)

  rl.close()
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message)
  rl.close()
  process.exit(1)
})
