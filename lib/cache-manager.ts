/**
 * Cache Manager - Sistema de cacheo inteligente para el frontend
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private maxSize = 100 // Máximo de entradas en cache

  /**
   * Obtiene un valor del cache si existe y no ha expirado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // Cache expirado, eliminarlo
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Guarda un valor en el cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Si el cache está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Elimina una entrada del cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtiene o ejecuta función y cachea el resultado
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fn()
    this.set(key, data, ttl)
    return data
  }

  /**
   * Verifica si una clave existe en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// Singleton para uso global
let cacheInstance: CacheManager | null = null

export function getCacheManager(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager()
  }
  return cacheInstance
}

/**
 * Cache para productos (TTL más largo)
 */
export const productCache = {
  get: (key: string) => getCacheManager().get(key),
  set: (key: string, data: any) => getCacheManager().set(key, data, 10 * 60 * 1000), // 10 minutos
  delete: (key: string) => getCacheManager().delete(key),
  clear: () => {
    // Limpiar solo productos
    const cache = getCacheManager()
    const keys = Array.from((cache as any).cache.keys()) as string[]
    keys.forEach((key) => {
      if (key.startsWith('product:')) {
        cache.delete(key)
      }
    })
  },
}

/**
 * Cache para API responses (TTL corto)
 */
export const apiCache = {
  get: (key: string) => getCacheManager().get(key),
  set: (key: string, data: any) => getCacheManager().set(key, data, 2 * 60 * 1000), // 2 minutos
  delete: (key: string) => getCacheManager().delete(key),
}

export default CacheManager
