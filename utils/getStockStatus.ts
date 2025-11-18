export type StockStatus = 'disponible' | 'ultimas_unidades' | 'agotado'

export function getStockStatus(
  product: { stock?: { [key: string]: number } },
  talle: string
): StockStatus {
  if (!product.stock || !talle) {
    return 'agotado'
  }

  const stockTalle = product.stock[talle] || 0

  if (stockTalle === 0) {
    return 'agotado'
  }

  if (stockTalle < 5) {
    return 'ultimas_unidades'
  }

  return 'disponible'
}

export function getStockColor(status: StockStatus): string {
  switch (status) {
    case 'disponible':
      return 'text-green-600'
    case 'ultimas_unidades':
      return 'text-yellow-600'
    case 'agotado':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getStockBadgeColor(status: StockStatus): string {
  switch (status) {
    case 'disponible':
      return 'bg-green-100 text-green-800'
    case 'ultimas_unidades':
      return 'bg-yellow-100 text-yellow-800'
    case 'agotado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
