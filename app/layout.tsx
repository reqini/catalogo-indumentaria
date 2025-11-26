import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/lib/theme-context'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AutoFixErrorBoundary } from '@/autofix'
import { AutoFixInit } from '@/autofix/AutoFixInit'
import ScrollToTop from '@/components/ScrollToTop'
import Script from 'next/script'

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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700;900&family=Raleway:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Source+Sans+Pro:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
      <body>
        <AutoFixErrorBoundary>
          <AutoFixInit />
          <ThemeProvider>
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
          </ThemeProvider>
        </AutoFixErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('SW registered', reg))
                    .catch((err) => console.log('SW registration failed', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
