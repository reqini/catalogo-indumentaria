'use client'

import { useState, useEffect } from 'react'

interface Filters {
  categoria: string
  color: string
  nombre: string
  precio: 'asc' | 'desc' | ''
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    categoria: '',
    color: '',
    nombre: '',
    precio: '',
  })

  useEffect(() => {
    const savedFilters = localStorage.getItem('filters')
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters))
      } catch (error) {
        console.error('Error loading filters from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters))
  }, [filters])

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      categoria: '',
      color: '',
      nombre: '',
      precio: '',
    })
  }

  return {
    filters,
    updateFilter,
    clearFilters,
  }
}



