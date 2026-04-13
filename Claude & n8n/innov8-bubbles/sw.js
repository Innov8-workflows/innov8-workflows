// ============================================================
// sw.js — Service Worker for Innov8 Bubbles PWA
// Caches static assets for offline use, passes API calls through
// ============================================================

const CACHE_NAME = 'innov8-bubbles-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/bubble-engine.js',
  '/data-service.js',
  '/portfolio.js',
  '/auth.js',
  '/ads.js',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls — always go to network (never cache market data)
  if (url.hostname.includes('coingecko.com') ||
      url.hostname.includes('financialmodelingprep.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('stripe.com')) {
    return; // Let the browser handle normally
  }

  // Static assets — cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for next time
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
