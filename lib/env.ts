// Validación de variables de entorno al inicio

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
] as const

const optionalEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'MP_ACCESS_TOKEN',
] as const

export interface EnvStatus {
  mongodb: 'ok' | 'fail' | 'not_configured'
  cloudinary: 'ok' | 'fail' | 'not_configured'
  mercadoPago: 'ok' | 'fail' | 'not_configured'
  missing: string[]
}

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

export function getEnvStatus(): EnvStatus {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  const mongodb = process.env.MONGODB_URI ? 'ok' : 'fail'
  
  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  const cloudinary = cloudinaryConfigured ? 'ok' : 'not_configured'

  const mercadoPago = process.env.MP_ACCESS_TOKEN ? 'ok' : 'not_configured'

  return {
    mongodb,
    cloudinary,
    mercadoPago,
    missing,
  }
}

// Validar al importar
if (typeof window === 'undefined') {
  const { valid, missing } = validateEnv()
  if (!valid) {
    console.error('❌ Variables de entorno faltantes:', missing.join(', '))
    console.error('   Por favor, configura .env.local con las variables requeridas')
  }
}



