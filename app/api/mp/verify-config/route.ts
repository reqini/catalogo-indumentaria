import { NextResponse } from 'next/server'
import { validateMercadoPagoConfig, getMercadoPagoErrorMessage } from '@/lib/mercadopago/validate'

/**
 * Endpoint para verificar configuración de Mercado Pago
 * Útil para debugging y QA
 */
export async function GET(request: Request) {
  try {
    const config = validateMercadoPagoConfig()
    const errorMessage = getMercadoPagoErrorMessage(config)

    // No exponer el token completo por seguridad
    const safeConfig = {
      ...config,
      accessToken: config.accessToken 
        ? `${config.accessToken.substring(0, 10)}...${config.accessToken.substring(config.accessToken.length - 5)}`
        : undefined,
      publicKey: config.publicKey 
        ? `${config.publicKey.substring(0, 10)}...${config.publicKey.substring(config.publicKey.length - 5)}`
        : undefined,
    }

    return NextResponse.json({
      valid: config.isValid,
      isProduction: config.isProduction,
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      errors: config.errors,
      errorMessage,
      config: safeConfig,
      help: {
        local: 'Configura MP_ACCESS_TOKEN en .env.local',
        production: 'Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables',
        docs: '/docs/configuracion-mercadopago.md',
        panel: 'https://www.mercadopago.com.ar/developers/panel',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'Error verificando configuración',
      },
      { status: 500 }
    )
  }
}

