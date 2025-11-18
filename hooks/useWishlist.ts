import { useState, useEffect } from 'react'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      setWishlist(JSON.parse(stored))
    }
  }, [])

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev
      const newWishlist = [...prev, productId]
      localStorage.setItem('wishlist', JSON.stringify(newWishlist))
      return newWishlist
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = prev.filter((id) => id !== productId)
      localStorage.setItem('wishlist', JSON.stringify(newWishlist))
      return newWishlist
    })
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  }
}
