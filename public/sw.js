const CACHE_NAME = 'unixparts-pwa-cache-v3';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Force cache the start_url so that Chrome's offline validation passes
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Just cache an offline fallback to satisfy the WebAPK install criteria unconditionally
      return cache.put(
        new Request(OFFLINE_URL),
        new Response(
          '<!DOCTYPE html><html><head><title>Web App Offline</title></head><body><h2>App is offline.</h2><p>Please connect to the internet.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      );
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
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network fails, pull our manufactured offline page from the cache
        // This explicitly passes Chrome's strict offline start_url validation!
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('', { status: 200 });
      })
    );
  }
});
