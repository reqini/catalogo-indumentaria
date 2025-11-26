'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import CurrencySelector from './CurrencySelector'
import DarkModeToggle from './DarkModeToggle'
import Image from 'next/image'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getTotalItems } = useCart()

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-surface">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex h-full items-center py-2">
            <Image
              src="/branding/asi-somos/logo-horizontal.svg"
              alt="Así Somos"
              width={200}
              height={50}
              className="h-full w-auto"
              priority
            />
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/catalogo"
              className="text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Admin
            </Link>
            <CurrencySelector />
            <DarkModeToggle />
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
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
                <span className="rounded-full bg-black px-2 py-1 text-xs text-white">
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
