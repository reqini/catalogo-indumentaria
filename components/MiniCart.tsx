'use client'

import { useState } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/formatPrice'
import Link from 'next/link'

export default function MiniCart() {
  const { cart, getTotalPrice, removeFromCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  if (cart.length === 0) return null

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Ver carrito"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">Carrito</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.talle}`} className="flex gap-4 pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">Talle: {item.talle}</p>
                      <p className="text-sm font-semibold text-black mt-1">
                        {formatPrice(item.precio * item.cantidad)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.talle)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-black">Total:</span>
                  <span className="text-2xl font-bold text-black">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <Link
                  href="/carrito"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  Ver Carrito Completo
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

