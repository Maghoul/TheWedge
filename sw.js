const CACHE_NAME = 'wedge-cache-v1.0.3';
// Cache versioning to handle updates vMajor.minor.patch
// Version 1.0.1 - Initial release with basic caching functionality
// Version 1.0.2 - updated styles for ios support
// Version 1.0.3 - Added versioning display
// This service worker caches essential files for offline use and handles fetch requests
const urlsToCache = [
    './',
    './index.html',
    './wx.html',
    './fraam.html',
    './frm.html',
    './wx.js',
    './styles.css',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Handle messages from the client to skip waiting
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});