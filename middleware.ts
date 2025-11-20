import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Rate limiting mejorado
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// CSP Headers - CRÍTICO: Permitir Supabase Storage completamente
// IMPORTANTE: Incluir todos los dominios posibles de Supabase para evitar bloqueos
const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'yqggrzxjhylnxjuagfyr'
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https: https://*.supabase.co https://${SUPABASE_PROJECT_ID}.supabase.co;
  font-src 'self' data:;
  connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com https://*.supabase.co https://${SUPABASE_PROJECT_ID}.supabase.co wss://*.supabase.co wss://${SUPABASE_PROJECT_ID}.supabase.co;
  frame-src 'self' https://www.mercadopago.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

export function middleware(request: NextRequest) {
  // Rate limiting para API (excluir endpoints críticos de pago)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Excluir endpoints críticos del rate limiting
    const criticalEndpoints = [
      '/api/pago', 
      '/api/mp/webhook', 
      '/api/mp/subscription',
      '/api/admin/upload-image' // CRÍTICO: Subida de imágenes no debe tener rate limiting estricto
    ]
    const isCriticalEndpoint = criticalEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    )
    
    // Solo aplicar rate limiting a endpoints no críticos
    if (!isCriticalEndpoint) {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const now = Date.now()
      const windowMs = 60 * 1000 // 1 minuto
      const max = 30 // 30 requests por minuto (aumentado de 10)

      const record = rateLimitMap.get(ip)
      
      if (record) {
        if (now > record.resetTime) {
          rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
        } else {
          if (record.count >= max) {
            return NextResponse.json(
              { error: 'Too many requests' },
              { status: 429 }
            )
          }
          record.count++
        }
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
      }

      // Limpiar entradas antiguas
      if (Math.random() < 0.01) {
        for (const [key, value] of rateLimitMap.entries()) {
          if (now > value.resetTime) {
            rateLimitMap.delete(key)
          }
        }
      }
    }
  }

  // Proteger rutas admin (modo demo): solo verificamos presencia de cookie
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Proteger API admin: requerir token en cookie O header Authorization
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const tokenCookie = request.cookies.get('auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const tokenHeader = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    
    // Permitir si hay token en cookie O en header
    if (!tokenCookie && !tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Headers de seguridad
  const response = NextResponse.next()
  
  // CSP Header
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Otros headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Solo en producción, agregar HSTS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/:path*',
  ],
}
