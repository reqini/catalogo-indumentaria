import { NextResponse } from 'next/server'

/**
 * Endpoint de prueba exhaustiva para Mercado Pago en producción
 *
 * Este endpoint prueba:
 * 1. Que las variables están disponibles
 * 2. Que el token es válido haciendo una llamada real a la API
 * 3. Que se puede crear una preferencia de prueba
 *
 * GET /api/mp/test-production
 */
export async function GET() {
  try {
    // Leer token con múltiples formas
    const token =
      process.env.MP_ACCESS_TOKEN ||
      process.env['MP_ACCESS_TOKEN'] ||
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      process.env['MERCADOPAGO_ACCESS_TOKEN']

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
        VERCEL: process.env.VERCEL || 'not set',
        VERCEL_URL: process.env.VERCEL_URL || 'not set',
      },
      token: {
        found: !!token,
        length: token?.length || 0,
        startsWith: token?.substring(0, 15) || 'N/A',
        isValidFormat: token ? token.startsWith('APP_USR-') || token.startsWith('TEST-') : false,
        isProduction: token ? token.startsWith('APP_USR-') : false,
      },
      tests: {
        tokenValidation: { passed: false, error: null as string | null },
        preferenceCreation: {
          passed: false,
          error: null as string | null,
          preferenceId: null as string | null,
        },
      },
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token no encontrado',
          results,
          help: {
            step1: 'Ve a Vercel Dashboard → Settings → Environment Variables',
            step2: 'Agrega MP_ACCESS_TOKEN con tu token de producción',
            step3: 'Asegúrate de marcarlo para Production',
            step4: 'Haz REDEPLOY después de agregarlo',
          },
        },
        { status: 503 }
      )
    }

    // Test 1: Validar token con API de Mercado Pago
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        results.tests.tokenValidation.error = `Status ${response.status}: ${errorText}`
      } else {
        results.tests.tokenValidation.passed = true
      }
    } catch (error: any) {
      results.tests.tokenValidation.error = error.message
    }

    // Test 2: Crear preferencia de prueba
    if (results.tests.tokenValidation.passed) {
      try {
        const preferenceData = {
          items: [
            {
              title: 'Producto de Prueba',
              quantity: 1,
              unit_price: 100,
            },
          ],
          back_urls: {
            success: 'https://example.com/success',
            failure: 'https://example.com/failure',
            pending: 'https://example.com/pending',
          },
          notification_url: 'https://example.com/webhook',
          statement_descriptor: 'TEST',
          external_reference: `test-${Date.now()}`,
        }

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferenceData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          results.tests.preferenceCreation.error = `Status ${response.status}: ${JSON.stringify(errorData)}`
        } else {
          const data = await response.json()
          results.tests.preferenceCreation.passed = true
          results.tests.preferenceCreation.preferenceId = data.id
        }
      } catch (error: any) {
        results.tests.preferenceCreation.error = error.message
      }
    }

    const allTestsPassed =
      results.tests.tokenValidation.passed && results.tests.preferenceCreation.passed

    return NextResponse.json(
      {
        success: allTestsPassed,
        message: allTestsPassed
          ? '✅ Todas las pruebas pasaron - Mercado Pago está funcionando correctamente'
          : '❌ Algunas pruebas fallaron',
        results,
      },
      {
        status: allTestsPassed ? 200 : 503,
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
