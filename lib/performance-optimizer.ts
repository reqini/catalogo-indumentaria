/**
 * Performance Optimizer - Utilidades para optimización de performance
 */

import React from 'react'

/**
 * Lazy load de componentes pesados
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

/**
 * Debounce para evitar llamadas excesivas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle para limitar frecuencia de ejecución
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Preload de recursos críticos
 */
export function preloadResource(href: string, as: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * Prefetch de recursos que probablemente se necesiten
 */
export function prefetchResource(href: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Intersection Observer para lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

/**
 * Medir performance de una función
 */
export async function measurePerformance<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return await Promise.resolve(fn())
  }

  const start = performance.now()
  const result = await Promise.resolve(fn())
  const end = performance.now()
  const duration = end - start

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
  }

  // Enviar métrica a analytics si está disponible
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'performance', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(duration),
    })
  }

  return result
}

/**
 * Verificar si está en viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  if (typeof window === 'undefined') return false

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Obtener tamaño de bundle aproximado
 */
export function getBundleSize(): number {
  if (typeof window === 'undefined') return 0

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  let totalSize = 0

  scripts.forEach((script) => {
    const src = script.getAttribute('src')
    if (src) {
      // Estimación basada en nombre de archivo
      // En producción, esto debería venir de webpack-bundle-analyzer
      totalSize += 100000 // Estimación conservadora
    }
  })

  return totalSize
}
