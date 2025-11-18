'use client'

import { useState, useEffect } from 'react'
import { getCurrencyFromStorage, setCurrencyToStorage, type Currency } from '@/utils/currency'

export default function CurrencySelector() {
  const [currency, setCurrency] = useState<Currency>('ARS')

  useEffect(() => {
    setCurrency(getCurrencyFromStorage())
  }, [])

  const handleChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    setCurrencyToStorage(newCurrency)
    window.dispatchEvent(new Event('currencychange'))
  }

  return (
    <select
      value={currency}
      onChange={(e) => handleChange(e.target.value as Currency)}
      className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
    >
      <option value="ARS">ARS $</option>
      <option value="USD">USD $</option>
      <option value="EUR">EUR €</option>
    </select>
  )
}

