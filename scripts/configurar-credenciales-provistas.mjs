#!/usr/bin/env node

/**
 * Script para configurar las credenciales proporcionadas por el usuario
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
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

async function main() {
  console.log('\n🔧 Configurando Credenciales de Supabase\n')
  console.log('='.repeat(60))

  const envPath = join(__dirname, '..', '.env.local')
  let envContent = ''

  // Leer .env.local si existe
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
  }

  // Credenciales proporcionadas
  const publishableKey = 'sb_publishable_TGYS5tsv3tEY9rxHx9-ZHQ_F9a64G0t'
  const secretKey = 'sb_secret_Aes4CjU2mwX2R1zgJyWibQ_FytVUNSR'

  console.log('\n📋 Credenciales detectadas:')
  console.log(`   Publishable: ${publishableKey.substring(0, 30)}...`)
  console.log(`   Secret: ${secretKey.substring(0, 30)}...`)

  console.log('\n⚠️  NOTA: Estas credenciales tienen formato diferente.')
  console.log('   Las credenciales estándar de Supabase son JWT tokens (eyJhbGci...)\n')

  // Pedir Project URL
  console.log('📝 Necesito la URL del proyecto de Supabase:')
  console.log('   Ve a: Supabase Dashboard → Settings → API')
  console.log('   Busca "Project URL" o "Project URL"')
  console.log('   Ejemplo: https://xxxxx.supabase.co\n')

  const projectUrl = await question('🔗 Project URL: ')

  if (!projectUrl || !projectUrl.includes('supabase.co')) {
    console.log('\n⚠️  La URL no parece válida. Debería ser algo como:')
    console.log('   https://xxxxx.supabase.co')
    console.log('\n¿Quieres continuar de todas formas? (s/n): ')
    const confirm = await question('')
    if (confirm.toLowerCase() !== 's') {
      console.log('\n❌ Configuración cancelada')
      rl.close()
      return
    }
  }

  // Construir nuevo contenido
  const supabaseLines = [
    '# Supabase Configuration',
    `NEXT_PUBLIC_SUPABASE_URL=${projectUrl.trim()}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${publishableKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${secretKey}`,
    '',
  ]

  // Mantener otras variables existentes (excepto las de Supabase)
  const existingLines = envContent
    .split('\n')
    .filter((line) => {
      return (
        !line.includes('NEXT_PUBLIC_SUPABASE') &&
        !line.includes('SUPABASE_SERVICE_ROLE_KEY') &&
        line.trim() !== '' &&
        !line.trim().startsWith('# Supabase')
      )
    })

  const finalContent = [...supabaseLines, ...existingLines].join('\n')

  // Escribir archivo
  writeFileSync(envPath, finalContent, 'utf-8')

  console.log('\n✅ Variables configuradas en .env.local')
  console.log('\n📋 Configuración guardada:')
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=${projectUrl.trim()}`)
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${publishableKey.substring(0, 30)}...`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY=${secretKey.substring(0, 30)}...`)

  console.log('\n🧪 Próximos pasos:')
  console.log('   1. Verifica: pnpm verify-supabase')
  console.log('   2. Prueba conexión: pnpm test-supabase')
  console.log('   3. Si hay errores, verifica las credenciales en Supabase Dashboard\n')

  rl.close()
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message)
  rl.close()
  process.exit(1)
})

