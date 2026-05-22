const CACHE_NAME = 'unixparts-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// A fetch listener is absolutely required by Chrome/Android to trigger the "Add to Home Screen" PWA install prompt.
self.addEventListener('fetch', (event) => {
  // We can just pass the request through, no complex caching needed 
  // if the primary goal is just to enable the PWA install popup.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
