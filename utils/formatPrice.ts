export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function calculateDiscount(price: number, discount?: number): number {
  if (!discount || discount <= 0) return price
  return price * (1 - discount / 100)
}



