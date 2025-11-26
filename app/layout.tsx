import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AutoFixErrorBoundary } from '@/autofix'
import { AutoFixInit } from '@/autofix/AutoFixInit'
import ScrollToTop from '@/components/ScrollToTop'
import Script from 'next/script'
import { inter, fontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Catálogo de Indumentaria - Premium Fashion',
  description:
    'Catálogo premium de indumentaria con las mejores prendas. Running, Training, Lifestyle y más.',
  keywords: 'indumentaria, ropa, running, training, lifestyle, moda, deporte',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    title: 'Catálogo de Indumentaria - Premium Fashion',
    description: 'Catálogo premium de indumentaria con las mejores prendas',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo de Indumentaria - Premium Fashion',
    description: 'Descubrí las mejores prendas deportivas y de lifestyle',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Catálogo de Indumentaria',
              description: 'Catálogo premium de indumentaria',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <AutoFixErrorBoundary>
          <AutoFixInit />
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <ScrollToTop />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#000',
                    color: '#fff',
                    borderRadius: '8px',
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </AutoFixErrorBoundary>
        {/* Service Worker DESHABILITADO para evitar cache agresivo */}
        {/* Si necesitas PWA en el futuro, configura NEXT_PUBLIC_ENABLE_PWA=true */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Desregistrar todos los Service Workers existentes para evitar cache
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    console.log('[CACHE FIX] Desregistrando Service Worker:', registration.scope);
                    registration.unregister();
                  }
                });
                
                // Limpiar todos los caches
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) {
                      console.log('[CACHE FIX] Eliminando cache:', name);
                      caches.delete(name);
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
