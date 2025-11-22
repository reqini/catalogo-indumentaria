import { NextResponse } from 'next/server'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'

/**
 * Endpoint para verificar configuración de Mercado Pago
 * Útil para debugging en producción
 *
 * GET /api/mp/verify-config
 */
export async function GET() {
  try {
    const mpConfig = validateMercadoPagoConfig()

    // Información de entorno
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
    }

    // Verificar variables directamente
    const directCheck = {
      MP_ACCESS_TOKEN: {
        exists: !!process.env.MP_ACCESS_TOKEN,
        length: process.env.MP_ACCESS_TOKEN?.length || 0,
        preview: process.env.MP_ACCESS_TOKEN
          ? `${process.env.MP_ACCESS_TOKEN.substring(0, 20)}...`
          : 'not found',
        startsWith: process.env.MP_ACCESS_TOKEN?.substring(0, 10) || 'N/A',
      },
      NEXT_PUBLIC_MP_PUBLIC_KEY: {
        exists: !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        length: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY?.length || 0,
        preview: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
          ? `${process.env.NEXT_PUBLIC_MP_PUBLIC_KEY.substring(0, 20)}...`
          : 'not found',
      },
    }

    // Listar todas las variables que contienen MP o MERCADO
    const allMPVars = Object.keys(process.env)
      .filter((key) => key.toUpperCase().includes('MP') || key.toUpperCase().includes('MERCADO'))
      .reduce(
        (acc, key) => {
          const value = process.env[key]
          acc[key] = {
            exists: !!value,
            length: value?.length || 0,
            preview: value ? `${value.substring(0, 20)}...` : 'not found',
          }
          return acc
        },
        {} as Record<string, any>
      )

    return NextResponse.json(
      {
        status: mpConfig.isValid ? 'ok' : 'error',
        config: {
          isValid: mpConfig.isValid,
          isProduction: mpConfig.isProduction,
          errors: mpConfig.errors,
          hasAccessToken: !!mpConfig.accessToken,
          hasPublicKey: !!mpConfig.publicKey,
        },
        environment: envInfo,
        directCheck,
        allMPVariables: allMPVars,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
