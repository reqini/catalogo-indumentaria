'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import CurrencySelector from './CurrencySelector'
import DarkModeToggle from './DarkModeToggle'
import LogoAsiSomosHorizontal from '@/components/branding/LogoAsiSomosHorizontal'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getTotalItems } = useCart()

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center h-full py-2">
            <LogoAsiSomosHorizontal width={200} height={50} className="h-full w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/catalogo"
              className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Admin
            </Link>
            <CurrencySelector />
            <DarkModeToggle />
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black dark:bg-white dark:text-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <Link
              href="/catalogo"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            <Link
              href="/carrito"
              className="flex items-center gap-2 py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart size={20} />
              Carrito
              {getTotalItems() > 0 && (
                <span className="bg-black text-white text-xs rounded-full px-2 py-1">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

