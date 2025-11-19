'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, LayoutDashboard, Package, Image, Tag, Sparkles } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const { logout: logoutContext } = useAuthContext()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = async () => {
    try {
      // 1. Limpiar cookie httpOnly (servidor)
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // 2. Limpiar localStorage y contexto (cliente)
      logoutContext()
      
      toast.success('Sesión cerrada')
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Aunque falle el endpoint, limpiar contexto local
      logoutContext()
      router.push('/admin/login')
    }
  }

  // No mostrar sidebar en login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Productos', icon: Package },
    { href: '/admin/productos/carga-multiple', label: 'Carga Múltiple (IA)', icon: Sparkles },
    { href: '/admin/productos/carga-multiple-v2', label: 'Carga IA V2', icon: Sparkles },
    { href: '/admin/banners', label: 'Banners', icon: Image },
    { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  ]

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
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
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}
