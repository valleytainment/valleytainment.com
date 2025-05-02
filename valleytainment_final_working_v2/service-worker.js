// service-worker.js

self.addEventListener('install', function(event) {
  // you could pre-cache assets here
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // you could clean up old caches here
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // simple network‐first strategy (no caching)
  event.respondWith(fetch(event.request));
});
