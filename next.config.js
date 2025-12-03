/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desactivar cache problemático durante build
  ...(process.env.NEXT_IGNORE_CACHE === 'true' && {
    experimental: {
      forceSwcTransforms: true,
    },
  }),
  // Exponer variables de entorno de Vercel al cliente
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    NEXT_PUBLIC_VERCEL_BUILD_TIME: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
    // BUILD_ID único para identificar cada deploy
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA
      ? `${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}-${Date.now()}`
      : `dev-${Date.now()}`,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, Pragma: no-cache',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https: https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1 https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/bucket https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object https://yqggrzxjhylnxjuagfyr.supabase.co/storage/v1/object/* wss://*.supabase.co wss://yqggrzxjhylnxjuagfyr.supabase.co",
              "frame-src 'self' https://www.mercadopago.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'yqggrzxjhylnxjuagfyr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: ['res.cloudinary.com', 'localhost', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
    optimizeCss: true,
    forceSwcTransforms: true, // Forzar SWC para builds más rápidos y confiables
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false, // Desactivar ETags para evitar cache problemático
  swcMinify: true,
  // Optimizaciones de performance
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  // Configuración de build más estricta
  eslint: {
    // NO ignorar durante builds - detectar errores reales
    ignoreDuringBuilds: false,
  },
  typescript: {
    // NO ignorar errores de TypeScript durante build
    ignoreBuildErrors: false,
  },
  // Removida configuración de webpack para CSS
  // Next.js maneja PostCSS y Tailwind automáticamente cuando detecta postcss.config.js
}

module.exports = nextConfig
