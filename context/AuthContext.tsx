'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Tenant {
  tenantId: string
  nombreNegocio: string
  email: string
  plan: 'free' | 'pro' | 'premium'
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    font?: string
  }
  rol: 'tenant' | 'superadmin'
}

interface AuthContextType {
  tenant: Tenant | null
  login: (token: string, tenant: Tenant) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)

  useEffect(() => {
    const savedTenant = localStorage.getItem('tenant')
    const savedToken = localStorage.getItem('token')
    if (savedTenant && savedToken) {
      try {
        setTenant(JSON.parse(savedTenant))
      } catch (error) {
        console.error('Error loading tenant from localStorage:', error)
      }
    }
  }, [])

  const login = (token: string, tenantData: Tenant) => {
    setTenant(tenantData)
    localStorage.setItem('tenant', JSON.stringify(tenantData))
    localStorage.setItem('token', token)
  }

  const logout = async () => {
    // Limpiar estado local
    setTenant(null)
    localStorage.removeItem('tenant')
    localStorage.removeItem('token')
    
    // Intentar limpiar cookie en servidor (no bloquea si falla)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignorar errores, el logout local ya se hizo
      console.warn('Error limpiando cookie en logout:', error)
    }
  }

  const isAuthenticated = !!tenant

  return (
    <AuthContext.Provider value={{ tenant, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
