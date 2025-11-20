'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { LogOut, LayoutDashboard, Package, Image, Tag, Sparkles } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import VersionFooter from '@/components/admin/VersionFooter'

// Definir navItems fuera del componente para evitar recreación
const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/productos/carga-inteligente', label: 'Carga Inteligente (IA)', icon: Sparkles },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
] as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Proteger contra errores de AuthContext
  let logoutContext: (() => void) | null = null
  try {
    const authContext = useAuthContext()
    logoutContext = authContext.logout
  } catch (error) {
    console.warn('[AdminLayout] AuthContext no disponible, usando logout básico:', error)
  }

  useEffect(() => {
    setIsMounted(true)
    console.log('[AdminLayout] Componente montado, pathname:', pathname)
  }, [pathname])

  const handleLogout = async () => {
    try {
      // 1. Limpiar cookie httpOnly (servidor)
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // 2. Limpiar localStorage y contexto (cliente)
      if (logoutContext) {
        logoutContext()
      } else {
        // Fallback si no hay contexto
        localStorage.removeItem('tenant')
        localStorage.removeItem('token')
      }
      
      toast.success('Sesión cerrada')
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('[AdminLayout] Logout error:', error)
      // Aunque falle el endpoint, limpiar contexto local
      if (logoutContext) {
        logoutContext()
      } else {
        localStorage.removeItem('tenant')
        localStorage.removeItem('token')
      }
      router.push('/admin/login')
    }
  }

  // Memoizar navItems para evitar recreación (ANTES del return condicional)
  const navItems = useMemo(() => NAV_ITEMS, [])

  // No mostrar sidebar en login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Renderizar siempre el sidebar, incluso antes del mount para evitar flash
  // El contenido se hidratará correctamente cuando isMounted sea true
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Siempre visible, no depende de isMounted */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold text-black mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        <div className="flex-1">
          {isMounted ? (
            children
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
              </div>
            </div>
          )}
        </div>
        {/* Footer con versión */}
        <VersionFooter />
      </main>
    </div>
  )
}
