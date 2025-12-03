'use client'

import { useMemo } from 'react'
import { useSelectableOptions, SelectableOption } from '@/hooks/useSelectableOptions'
import { getStockStatus } from '@/utils/getStockStatus'

interface ColorSelectorProps {
  colores: string[]
  stock?: { [key: string]: { [color: string]: number } } // stock[talle][color] = cantidad
  selectedColor: string | null
  onColorChange: (color: string | null) => void
  selectedTalle?: string // Necesario para verificar stock por talle+color
  className?: string
}

// Mapeo de nombres de colores a códigos hex (extensible)
const COLOR_MAP: Record<string, string> = {
  negro: '#000000',
  blanco: '#FFFFFF',
  gris: '#808080',
  rojo: '#FF0000',
  azul: '#0000FF',
  verde: '#008000',
  amarillo: '#FFFF00',
  rosa: '#FFC0CB',
  beige: '#F5F5DC',
  marron: '#8B4513',
  naranja: '#FFA500',
  violeta: '#8A2BE2',
  celeste: '#87CEEB',
  coral: '#FF7F50',
  turquesa: '#40E0D0',
  dorado: '#FFD700',
  plateado: '#C0C0C0',
}

// Función helper para obtener código de color
function getColorCode(colorName: string): string {
  const normalized = colorName.toLowerCase().trim()
  return COLOR_MAP[normalized] || '#CCCCCC' // Gris por defecto si no se encuentra
}

export default function ColorSelector({
  colores,
  stock,
  selectedColor,
  onColorChange,
  selectedTalle,
  className = '',
}: ColorSelectorProps) {
  // Convertir colores a formato SelectableOption (debe estar antes de cualquier return)
  const colorOptions: SelectableOption[] = useMemo(() => {
    if (!colores || colores.length === 0) return []
    return colores.map((color) => {
      // Calcular stock disponible para este color
      let stockDisponible = 0
      let isDisabled = false

      if (stock && selectedTalle) {
        // Si hay talle seleccionado, verificar stock por talle+color
        const stockTalle = stock[selectedTalle] || {}
        stockDisponible = stockTalle[color] || 0
        isDisabled = stockDisponible === 0
      } else if (stock) {
        // Si no hay talle seleccionado, sumar stock de todos los talles para este color
        stockDisponible = Object.values(stock).reduce((total, stockTalle) => {
          return total + (stockTalle[color] || 0)
        }, 0)
        isDisabled = stockDisponible === 0
      }

      return {
        value: color,
        label: color,
        disabled: isDisabled,
        stock: stockDisponible,
      }
    })
  }, [colores, stock, selectedTalle])

  const { isSelected, isDisabled, selectOption } = useSelectableOptions({
    options: colorOptions,
    initialValue: selectedColor || undefined,
    required: false,
    onSelectionChange: onColorChange,
  })

  // Si no hay colores, no renderizar nada (después de hooks)
  if (!colores || colores.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h3 className="mb-3 font-semibold text-black">Color</h3>
      <div className="flex flex-wrap gap-3">
        {colores.map((color) => {
          const isColorSelected = isSelected(color)
          const isColorDisabled = isDisabled(color)
          const colorCode = getColorCode(color)
          const stockInfo = colorOptions.find((opt) => opt.value === color)

          return (
            <button
              key={color}
              onClick={() => !isColorDisabled && selectOption(color)}
              disabled={isColorDisabled}
              className={`
                relative h-12 w-12 rounded-full border-2 transition-all
                ${isColorSelected ? 'scale-110 border-black ring-2 ring-black ring-offset-2' : 'border-gray-300'}
                ${isColorDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
              `}
              style={{
                backgroundColor: colorCode,
              }}
              title={`${color}${stockInfo?.stock !== undefined ? ` (${stockInfo.stock} disponibles)` : ''}`}
              aria-label={`Seleccionar color ${color}`}
            >
              {isColorSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {isColorDisabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-full rotate-45 bg-gray-500"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>
      {selectedColor && (
        <p className="mt-2 text-sm capitalize text-gray-600">
          Color seleccionado: <span className="font-semibold">{selectedColor}</span>
          {selectedTalle && stock?.[selectedTalle]?.[selectedColor] !== undefined && (
            <span className="ml-2">({stock[selectedTalle][selectedColor]} disponibles)</span>
          )}
        </p>
      )}
    </div>
  )
}
