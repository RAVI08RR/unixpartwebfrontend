const CACHE_NAME = 'unixparts-pwa-cache-v4';
const OFFLINE_URL = '/';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache essential assets
      return Promise.all([
        cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' }))),
        // Add offline fallback
        cache.put(
          new Request(OFFLINE_URL),
          new Response(
            '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unixparts Offline</title><style>body{font-family:system-ui;display:flex;align-items:center;justify-center;min-height:100vh;margin:0;background:#f5f5f5}div{text-align:center;padding:2rem;background:white;border-radius:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1)}</style></head><body><div><h2>App is offline</h2><p>Please connect to the internet to continue.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        )
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // For non-navigation requests, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || new Response('', { status: 200 });
          });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
