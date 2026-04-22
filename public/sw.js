// Simple Service Worker for PWA compatibility
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now, as we prefer live updates
  event.respondWith(fetch(event.request));
});
