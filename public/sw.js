// Service Worker para optimización de cache y PWA
const CACHE_NAME = 'tablero-estadistico-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const API_CACHE = 'api-v1'

// Recursos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/favicon.png',
  '/logo-saem.svg',
  '/Imagotipo-Horizontal.svg'
]

// Rutas de API para cachear con estrategia stale-while-revalidate
const API_ROUTES = [
  '/api/entes',
  '/api/directorio-oic',
  '/api/users',
  '/api/diagnosticos'
]

// Tiempo de vida del cache en milisegundos
const CACHE_DURATION = {
  STATIC: 24 * 60 * 60 * 1000, // 24 horas
  DYNAMIC: 60 * 60 * 1000, // 1 hora
  API: 5 * 60 * 1000 // 5 minutos
}

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      self.skipWaiting()
    ])
  )
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE
            )
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Solo cachear requests de nuestro dominio
  if (url.origin !== self.location.origin) {
    return
  }

  // Estrategia para archivos estáticos
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Estrategia para APIs
  if (isApiRoute(request)) {
    // Solo cachear métodos GET para APIs
    if (request.method === 'GET') {
      event.respondWith(staleWhileRevalidate(request, API_CACHE))
    } else {
      // Para métodos no GET (POST, PUT, DELETE, etc), no usar cache
      event.respondWith(fetch(request))
    }
    return
  }

  // Estrategia para páginas dinámicas
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }

  // Para todo lo demás, usar network first
  event.respondWith(
    fetch(request).catch(() => {
      // Si falla la red, intentar obtener de cualquier cache
      return caches.match(request)
    })
  )
})

// Estrategia Cache First para archivos estáticos
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Verificar si el cache ha expirado
    const cacheTime = cachedResponse.headers.get('sw-cache-time')
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION.STATIC) {
      return cachedResponse
    }
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName)
      const responseToCache = networkResponse.clone()
      
      // Añadir timestamp al cache
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-time', Date.now().toString())
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      })
      
      cache.put(request, cachedResponse)
    }
    
    return networkResponse
  } catch (error) {
    return cachedResponse || new Response('Recurso no disponible', { status: 404 })
  }
}

// Estrategia Network First para páginas dinámicas
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName)
      const responseToCache = networkResponse.clone()
      
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-time', Date.now().toString())
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      })
      
      cache.put(request, cachedResponse)
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Página no disponible sin conexión', { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Estrategia Stale While Revalidate para APIs
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && request.method === 'GET') {
      const cache = caches.open(cacheName)
      const responseToCache = networkResponse.clone()
      
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-time', Date.now().toString())
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      })
      
      cache.then(c => c.put(request, cachedResponse))
    }
    return networkResponse
  }).catch(() => null)
  
  // Devolver cache inmediatamente si existe, sino esperar network
  if (cachedResponse) {
    // Verificar si no ha expirado
    const cacheTime = cachedResponse.headers.get('sw-cache-time')
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION.API) {
      // Actualizar en background
      fetchPromise
      return cachedResponse
    }
  }
  
  return fetchPromise || cachedResponse || new Response('API no disponible', { status: 503 })
}

// Utilidades
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/img/municipios/')
}

function isApiRoute(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') && 
         API_ROUTES.some(route => url.pathname.startsWith(route))
}

// Limpiar cache periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanExpiredCache()
  }
})

async function cleanExpiredCache() {
  const cacheNames = await caches.keys()
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      const cacheTime = response?.headers.get('sw-cache-time')
      
      if (cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        const maxAge = cacheName.includes('static') ? CACHE_DURATION.STATIC :
                      cacheName.includes('api') ? CACHE_DURATION.API :
                      CACHE_DURATION.DYNAMIC
        
        if (age > maxAge) {
          await cache.delete(request)
          console.log('[SW] Deleted expired cache entry:', request.url)
        }
      }
    }
  }
}
