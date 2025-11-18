'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  nombre: string
  precio: number
  descuento?: number
  imagenPrincipal: string
  talle: string
  cantidad: number
  stock?: { [key: string]: number }
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, talle: string) => void
  updateQuantity: (id: string, talle: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    // Validar stock disponible
    if (item.stock && item.talle) {
      const stockDisponible = item.stock[item.talle] || 0
      const cantidadSolicitada = item.cantidad
      
      // Verificar si ya existe en el carrito para sumar cantidades
      const existingItem = cart.find(
        (cartItem) => cartItem.id === item.id && cartItem.talle === item.talle
      )
      const cantidadTotal = existingItem 
        ? existingItem.cantidad + cantidadSolicitada
        : cantidadSolicitada

      if (cantidadTotal > stockDisponible) {
        throw new Error(
          `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidadTotal}`
        )
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id && cartItem.talle === item.talle
      )

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id && cartItem.talle === item.talle
            ? { ...cartItem, cantidad: cartItem.cantidad + item.cantidad }
            : cartItem
        )
      }

      return [...prevCart, item]
    })
  }

  const removeFromCart = (id: string, talle: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (cartItem) => !(cartItem.id === id && cartItem.talle === talle)
      )
    )
  }

  const updateQuantity = (id: string, talle: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, talle)
      return
    }

    // Validar stock disponible
    const cartItem = cart.find(
      (item) => item.id === id && item.talle === talle
    )
    
    if (cartItem && cartItem.stock && cartItem.talle) {
      const stockDisponible = cartItem.stock[cartItem.talle] || 0
      if (quantity > stockDisponible) {
        throw new Error(
          `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${quantity}`
        )
      }
    }

    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id && cartItem.talle === talle
          ? { ...cartItem, cantidad: quantity }
          : cartItem
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.descuento
        ? item.precio * (1 - item.descuento / 100)
        : item.precio
      return total + price * item.cantidad
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}



