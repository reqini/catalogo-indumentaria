/**
 * Hook reutilizable para manejar selección de opciones (talles, colores, etc.)
 * Evita duplicación de código y re-renders innecesarios
 */

import { useState, useCallback, useMemo } from 'react'

export interface SelectableOption {
  value: string
  label?: string
  disabled?: boolean
  stock?: number
  metadata?: Record<string, any>
}

export interface UseSelectableOptionsProps {
  options: SelectableOption[]
  initialValue?: string
  required?: boolean
  onSelectionChange?: (value: string | null) => void
}

export interface UseSelectableOptionsReturn {
  selectedValue: string | null
  selectOption: (value: string) => void
  clearSelection: () => void
  isSelected: (value: string) => boolean
  isDisabled: (value: string) => boolean
  getSelectedOption: () => SelectableOption | null
}

export function useSelectableOptions({
  options,
  initialValue,
  required = false,
  onSelectionChange,
}: UseSelectableOptionsProps): UseSelectableOptionsReturn {
  const [selectedValue, setSelectedValue] = useState<string | null>(initialValue || null)

  // Memoizar opciones para evitar re-renders innecesarios
  const optionsMap = useMemo(() => {
    const map = new Map<string, SelectableOption>()
    options.forEach((opt) => {
      map.set(opt.value, opt)
    })
    return map
  }, [options])

  const selectOption = useCallback(
    (value: string) => {
      const option = optionsMap.get(value)

      // Validar que la opción existe y no está deshabilitada
      if (!option) {
        console.warn(`[useSelectableOptions] Opción no encontrada: ${value}`)
        return
      }

      if (option.disabled) {
        console.warn(`[useSelectableOptions] Opción deshabilitada: ${value}`)
        return
      }

      // Si ya está seleccionada y no es requerida, permitir deseleccionar
      if (selectedValue === value && !required) {
        setSelectedValue(null)
        onSelectionChange?.(null)
        return
      }

      // Seleccionar nueva opción
      setSelectedValue(value)
      onSelectionChange?.(value)
    },
    [selectedValue, required, optionsMap, onSelectionChange]
  )

  const clearSelection = useCallback(() => {
    if (!required) {
      setSelectedValue(null)
      onSelectionChange?.(null)
    }
  }, [required, onSelectionChange])

  const isSelected = useCallback(
    (value: string) => {
      return selectedValue === value
    },
    [selectedValue]
  )

  const isDisabled = useCallback(
    (value: string) => {
      const option = optionsMap.get(value)
      return option?.disabled === true
    },
    [optionsMap]
  )

  const getSelectedOption = useCallback((): SelectableOption | null => {
    if (!selectedValue) return null
    return optionsMap.get(selectedValue) || null
  }, [selectedValue, optionsMap])

  return {
    selectedValue,
    selectOption,
    clearSelection,
    isSelected,
    isDisabled,
    getSelectedOption,
  }
}
