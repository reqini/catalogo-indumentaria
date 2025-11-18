'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/utils/api'
import toast from 'react-hot-toast'

export function useAdmin() {
  const { isAuthenticated, tenant } = useAuthContext()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProducts = async () => {
    if (!isAuthenticated) return
    
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData)
      toast.success('Producto creado exitosamente')
      await fetchProducts()
      return true
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Error al crear producto')
      return false
    }
  }

  const handleUpdateProduct = async (id: string, productData: any) => {
    try {
      await updateProduct(id, productData)
      toast.success('Producto actualizado exitosamente')
      await fetchProducts()
      return true
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error al actualizar producto')
      return false
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return false
    }

    try {
      await deleteProduct(id)
      toast.success('Producto eliminado exitosamente')
      await fetchProducts()
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar producto')
      return false
    }
  }

  return {
    products,
    loading,
    isAuthenticated,
    tenant,
    fetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  }
}

