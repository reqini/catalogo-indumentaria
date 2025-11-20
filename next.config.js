/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exponer variables de entorno de Vercel al cliente
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    NEXT_PUBLIC_VERCEL_BUILD_TIME: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.mercadopago.com https://www.google-analytics.com https://*.supabase.co https://yqggrzxjhylnxjuagfyr.supabase.co",
              "frame-src 'self' https://www.mercadopago.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
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
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  swcMinify: true,
  // Removida configuración de webpack para CSS
  // Next.js maneja PostCSS y Tailwind automáticamente cuando detecta postcss.config.js
}

module.exports = nextConfig
