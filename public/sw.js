const CACHE_NAME = 'market-pulse-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/Logo_Market_Pulse_Minimalist.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and avoid extension files/external APIs for core shell
  if (event.request.method !== 'GET' || event.request.url.includes('chrome-extension')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        // Cache new local assets dynamically if needed, or just return
        return response;
      }).catch(() => {
        // Fallback for offline if they are hitting the root
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
