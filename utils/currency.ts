export type Currency = 'ARS' | 'USD' | 'EUR'

const EXCHANGE_RATES: Record<Currency, number> = {
  ARS: 1,
  USD: 1000, // 1 USD = 1000 ARS (ejemplo)
  EUR: 1100, // 1 EUR = 1100 ARS (ejemplo)
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  const amountInARS = amount * EXCHANGE_RATES[from]
  return amountInARS / EXCHANGE_RATES[to]
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    ARS: '$',
    USD: 'US$',
    EUR: '€',
  }

  const symbol = symbols[currency]
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${symbol} ${formatted}`
}

export function getCurrencyFromStorage(): Currency {
  if (typeof window === 'undefined') return 'ARS'
  const stored = localStorage.getItem('currency') as Currency | null
  return stored && ['ARS', 'USD', 'EUR'].includes(stored) ? stored : 'ARS'
}

export function setCurrencyToStorage(currency: Currency): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currency', currency)
}
