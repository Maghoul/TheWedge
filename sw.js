const CACHE_NAME = 'wedge-cache-v1.2.0';
// Cache versioning to handle updates vMajor.minor.patch
// Version 1.2.0 - Updated icons and added navbar
// This service worker caches essential files for offline use and handles fetch requests
const urlsToCache = [
    './',
    './index.html',
    './wx.html',
    './fraam.html',
    './contact.html',
    './frm.html',
    './navbar.html',
    './preflight-checklist.html',
    './preflight.js',
    './navbar.js',
    './frm.js',
    './fraam.js',
    './wx.js',
    './styles.css',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-180.png',
    './images/icon-512.png',
    './images/home-icon.png',
    './images/checklist-icon.png',
    './images/contact-icon.png',
    './images/rest-icon.png',
    './images/risk-icon.png',
    './images/weather-icon.png',
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

// Archived version updates
// Version 1.0.1 - Initial release with basic caching functionality
// Version 1.0.2 - updated styles for ios support
// Version 1.0.3 - Added versioning display
// Version 1.1.0 - Added preflight checklist and FRAAM fatigue assessment
// Version 1.1.1 - revamped preflight checklist UI
// Version 1.1.2 - Updated bugs in etd/eta on wx
// Version 1.1.3 - Fixed submit button on wx.html
// Version 1.1.4 - Found another submit button bug on wx.html
// Version 1.1.5 - Added error checking before submitting wx.html
// Version 1.1.6 - Error handling for wx departure and arrival airports in wx.js
// Version 1.1.7 - Improved TAF readability in wx.js
// Version 1.1.8 - Dept/Arr error handling and improved styling for results
// Version 1.1.9 - Added alternate logic for wx.js
// Version 1.1.10 - small index update
// Version 1.1.11 - Updated wx.js to handle new AVWX API key
// Version 1.1.12 - added contact form  
// Version 1.1.13 - skipped
// Version 1.1.14 - New icons
// Version 1.1.15 - More new icons