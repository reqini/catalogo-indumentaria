'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency } from '@/utils/currency'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('ARS')

  useEffect(() => {
    const stored = localStorage.getItem('currency')
    if (stored && ['ARS', 'USD', 'EUR'].includes(stored)) {
      setCurrencyState(stored as Currency)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

