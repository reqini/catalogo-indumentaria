'use client'

import Link from 'next/link'

export default function Footer() {
  const buildVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA 
    ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7)
    : 'dev'
  
  const buildTime = process.env.NEXT_PUBLIC_VERCEL_BUILD_TIME 
    ? new Date(process.env.NEXT_PUBLIC_VERCEL_BUILD_TIME).toLocaleDateString('es-AR')
    : 'local'
  
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || `dev-${Date.now()}`
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-4">Catálogo Indumentaria</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda online de indumentaria premium
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalogo" className="text-gray-400 hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-gray-400 hover:text-white transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="text-gray-400 hover:text-white transition-colors">
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <p className="text-gray-400 text-sm">
              ¿Tenés alguna pregunta?<br />
              Contactanos y te ayudamos
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Catálogo Indumentaria. Todos los derechos reservados.
            </p>
            <div className="text-gray-500 text-xs font-mono">
              <div>v{buildVersion} • {buildTime}</div>
              {environment === 'production' && (
                <div className="mt-1 text-gray-600">Build: {buildId.split('-')[0]}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

