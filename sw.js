const CACHE_NAME = 'wedge-cache-v1.4.2';
// Cache versioning to handle updates vMajor.minor.patch
// Version 1.3.0 - Changed preflight-checklist to before pushback and eliminated stale info
// Version 1.3.1 - Changed file structure for The Wedge
// Version 1.4.0 - Added Sub Considerations
// Version 1.4.1 - sub coloring on apple, sub icon added, and error checking
// Version 1.4.2 - sub links and flow chart
// This service worker caches essential files for offline use and handles fetch requests
const urlsToCache = [
    './',
    './index.html',
    './html/wx.html',
    './html/fraam.html',
    './html/contact.html',
    './html/frm.html',
    './html/navbar.html',
    './html/bpb.html',
    './html/sub.html',
    './script/bpb.js',
    './script/navbar.js',
    './script/frm.js',
    './script/fraam.js',
    './script/wx.js',
    './script/sub.js',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
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
    './images/sub-icon.png',
    './images/weather-icon.png',
    './images/subflow.png'
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

// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(cache => {
//             return Promise.all(
//                 urlsToCache.map(url => {
//                     return fetch(url, { mode: 'no-cors' }) // Use no-cors to avoid CORS issues
//                         .then(response => {
//                             if (!response.ok) {
//                                 console.error(`Failed to fetch ${url}: ${response.statusText}`);
//                                 throw new Error(`Failed to fetch ${url}`);
//                             }
//                             return cache.put(url, response);
//                         })
//                         .catch(error => {
//                             console.error(`Error fetching ${url}:`, error);
//                             throw error;
//                         });
//                 })
//             );
//         })
//     );
// });

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
// Version 1.2.0 - Updated icons and added navbar
// Version 1.2.1 - Updated wx.js output format
// Version 1.2.2 - Updated wx.js to add favorite and swap dept/arr
// Version 1.2.3 - Updated README
// Version 1.2.4 - bug fixes to wx.js
// Version 1.2.5 - Updated contact page for email handling
// Version 1.2.6 - Updated some styling
// Version 1.2.7 - Added transition start time for BECMG logic in wx.js
// Version 1.2.8 - Added City info to wx.js and minor bug fix
// Version 1.2.9 - wx.js ICAO bug fix
// Version 1.2.10 - fixed navbar not remaining sticky
// Version 1.2.11 - cleaned up html code comments
// Version 1.2.12 - Added helper function to wx.js
// Version 1.2.13 - Added console logs
// Version 1.2.14 - Updated fraam.js and associated files
// Version 1.2.15 - wx.html disabled autocorrect, wx.js check for internet, 'encrypted' API Token
// Version 1.2.16 - fixed API token bug
// Version 1.2.17 - fixed fraam.js checkbox logic
// Version 1.2.18 - updated wx.js to reduce code
// Version 1.2.19 - Fixed status bar coloring
// Version 1.2.20 - Status bar update and color bug fix