const CACHE_NAME = 'cape-quest-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Cache OpenStreetMap tiles
const TILE_CACHE_NAME = 'osm-tiles-v1';
const GEMS_CACHE_NAME = 'gems-data-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Cache OSM tiles
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              return fetch(event.request)
                .then(fetchResponse => {
                  // Only cache successful tile requests
                  if (fetchResponse.status === 200) {
                    cache.put(event.request, fetchResponse.clone());
                  }
                  return fetchResponse;
                })
                .catch(() => {
                  // Return a default tile or empty response for offline
                  return new Response('', { status: 204 });
                });
            });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, TILE_CACHE_NAME, GEMS_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for route data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-routes') {
    event.waitUntil(syncRoutes());
  }
});

async function syncRoutes() {
  // Sync saved routes when back online
  console.log('Syncing routes in background');
}