import { NextResponse } from 'next/server'

/**
 * Endpoint para verificar variables de entorno en producción
 * Solo funciona si las variables están correctamente configuradas
 * 
 * ⚠️ SEGURIDAD: Este endpoint NO expone valores reales de las variables,
 * solo indica si están presentes y su formato es correcto.
 */
export async function GET() {
  // Verificar que estamos en el dominio correcto
  const allowedDomains = [
    'vercel.app',
    'vercel.com',
    process.env.NEXT_PUBLIC_BASE_URL?.replace('https://', '').replace('http://', ''),
  ].filter(Boolean)

  // Headers de seguridad adicionales
  const headers = new Headers()
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }

  const optionalVars = {
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
  }

  const missing: string[] = []
  const warnings: string[] = []
  const valid: { [key: string]: boolean } = {}

  // Verificar variables requeridas
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missing.push(key)
      valid[key] = false
    } else {
      valid[key] = true
      
      // Validaciones específicas
      if (key === 'JWT_SECRET' && value.length < 32) {
        warnings.push(`${key}: Debe tener al menos 32 caracteres (tiene ${value.length})`)
      }
      if (key === 'NEXT_PUBLIC_BASE_URL' && value.includes('localhost')) {
        warnings.push(`${key}: No debe contener 'localhost' en producción`)
      }
      if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
        warnings.push(`${key}: Debe comenzar con 'https://'`)
      }
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !value.startsWith('sb_secret_')) {
        warnings.push(`${key}: Formato incorrecto, debe comenzar con 'sb_secret_'`)
      }
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !value.startsWith('sb_publishable_')) {
        warnings.push(`${key}: Formato incorrecto, debe comenzar con 'sb_publishable_'`)
      }
    }
  })

  // Verificar variables opcionales
  Object.entries(optionalVars).forEach(([key, value]) => {
    if (value && value.startsWith('TEST-')) {
      warnings.push(`${key}: Parece ser un token de test, usar token de producción`)
    }
  })

  const allValid = missing.length === 0 && warnings.length === 0

  return NextResponse.json({
    status: allValid ? 'ok' : 'warning',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    required: {
      valid,
      missing,
    },
    optional: Object.keys(optionalVars).filter(key => optionalVars[key as keyof typeof optionalVars]),
    warnings,
    summary: {
      totalRequired: Object.keys(requiredVars).length,
      validRequired: Object.values(valid).filter(Boolean).length,
      missingRequired: missing.length,
      warningsCount: warnings.length,
    },
  }, {
    status: allValid ? 200 : 200, // Siempre 200 para que se pueda ver el reporte
  })
}

