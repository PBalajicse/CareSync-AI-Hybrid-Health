const CACHE_NAME = 'caresync-enterprise-v4';
const ASSETS = [
    '/index.html',
    '/family-hub.html',
    '/style.css',
    '/family-hub.css',
    '/ai-engine.js',
    '/app.js',
    '/family-hub.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Only handle same-origin GET requests; let external URLs & API calls pass through cleanly
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
