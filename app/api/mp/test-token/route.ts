import { NextResponse } from 'next/server'

/**
 * Endpoint de prueba para verificar que MP_ACCESS_TOKEN está disponible
 * Útil para debugging rápido en producción
 *
 * GET /api/mp/test-token
 */
export async function GET() {
  try {
    // Leer directamente de process.env
    const tokenDirect = process.env.MP_ACCESS_TOKEN
    const tokenBracket = process.env['MP_ACCESS_TOKEN']

    // Información del entorno
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
    }

    // Verificar ambas formas de lectura
    const tokenFound = !!(tokenDirect || tokenBracket)
    const token = tokenDirect || tokenBracket

    // Listar todas las variables relacionadas
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
        success: tokenFound,
        token: {
          found: tokenFound,
          method1_direct: !!tokenDirect,
          method2_bracket: !!tokenBracket,
          length: token?.length || 0,
          startsWith: token?.substring(0, 15) || 'N/A',
          isValidFormat: token ? token.startsWith('APP_USR-') || token.startsWith('TEST-') : false,
        },
        environment: envInfo,
        allMPVariables: allMPVars,
        timestamp: new Date().toISOString(),
        message: tokenFound
          ? '✅ Token encontrado correctamente'
          : '❌ Token NO encontrado - Verifica configuración en Vercel',
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
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
