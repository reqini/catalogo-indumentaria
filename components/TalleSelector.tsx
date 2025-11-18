'use client'

import { getStockStatus } from '@/utils/getStockStatus'

interface TalleSelectorProps {
  talles: string[]
  stock?: { [key: string]: number }
  selectedTalle: string
  onTalleChange: (talle: string) => void
}

export default function TalleSelector({
  talles,
  stock,
  selectedTalle,
  onTalleChange,
}: TalleSelectorProps) {
  return (
    <div>
      <h3 className="font-semibold text-black mb-3">Talle</h3>
      <div className="flex flex-wrap gap-2">
        {talles.map((talle) => {
          const status = getStockStatus({ stock }, talle)
          const isSelected = selectedTalle === talle
          const isDisabled = status === 'agotado'

          return (
            <button
              key={talle}
              onClick={() => !isDisabled && onTalleChange(talle)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all
                ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }
                ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed line-through'
                    : 'cursor-pointer'
                }
              `}
            >
              {talle}
              {status === 'ultimas_unidades' && (
                <span className="ml-1 text-xs">⚠️</span>
              )}
            </button>
          )
        })}
      </div>
      {selectedTalle && (
        <p className="text-sm text-gray-600 mt-2">
          Stock disponible: {stock?.[selectedTalle] || 0} unidades
        </p>
      )}
    </div>
  )
}

