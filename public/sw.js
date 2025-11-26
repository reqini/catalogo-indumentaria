// CACHE DESHABILITADO - Usar Network First siempre
// Si necesitas cache, cambia NETWORK_FIRST a false
const NETWORK_FIRST = true
const CACHE_NAME = 'catalogo-indumentaria-v' + Date.now() // Version dinámica para forzar actualización
const STATIC_CACHE = 'static-v' + Date.now()
const DYNAMIC_CACHE = 'dynamic-v' + Date.now()

const STATIC_ASSETS = ['/', '/catalogo', '/offline', '/icon-192x192.png', '/icon-512x512.png']

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - NETWORK FIRST siempre para evitar cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API requests - nunca cachear
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // NETWORK FIRST siempre - nunca usar cache para páginas HTML
  if (NETWORK_FIRST || request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          // No cachear páginas HTML
          return response
        })
        .catch(() => {
          // Solo si falla la red, intentar cache (pero nunca debería pasar)
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.warn('[SW] Usando cache como fallback (no debería pasar)')
            }
            return cachedResponse || new Response('Offline', { status: 503 })
          })
        })
    )
    return
  }

  // Para imágenes y otros assets: Network First también
  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .then((response) => {
        // No cachear nada
        return response
      })
      .catch(() => {
        // Fallback solo si es crítico
        if (request.destination === 'image') {
          return caches.match('/icon-192x192.png')
        }
        return new Response('Offline', { status: 503 })
      })
  )
})

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'Nueva notificación'
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data || '/'))
})
