/** @type {import('next').NextConfig} */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const nextConfig = {
  reactStrictMode: true,
  images: {
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
  // Asegurar que PostCSS se procese correctamente
  webpack: (config, { isServer }) => {
    // No interferir con el procesamiento de CSS de Next.js
    // Next.js maneja PostCSS y Tailwind automáticamente
    if (!isServer) {
      // Solo para plugins específicos que lo requieran
      const hasMiniCssExtract = config.plugins.some(
        (plugin) => plugin && plugin.constructor && plugin.constructor.name === 'MiniCssExtractPlugin'
      )

      if (!hasMiniCssExtract) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash].css',
            chunkFilename: 'static/css/[id].[contenthash].css',
          })
        )
      }
    }

    return config
  },
}

module.exports = nextConfig
