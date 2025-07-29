const CACHE_NAME = 'ecommerce-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap',
    'https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2', // Example font file
    'https://fonts.gstatic.com/s/opensans/v27/memvYaGs126MiZpBA-tsgP-PzV0.woff2' // Example font file
];

// --- Install Service Worker ---
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Service Worker: Cache addAll failed', err);
            })
    );
});

// --- Activate Service Worker ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// --- Fetch Event (Cache First Strategy) ---
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // No cache hit - fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Optionally, cache new requests if they are part of the app shell or static assets
                        // For dynamic data (like API calls), you might not want to cache them here
                        if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('placehold.co')) {
                             // Only cache if it's a successful response and not a range request
                            if (networkResponse.status === 200 && networkResponse.type === 'basic') {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                            }
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, provide a fallback for HTML pages
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html'); // Fallback to offline page
                        }
                        // For other assets, you might serve a placeholder or just let it fail
                        return new Response('<h1>Offline</h1><p>You are offline and this content is not cached.</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
            })
    );
});

// --- Push Notification Listener (Client-side only) ---
// Note: For real push notifications, you need a backend server
// to send push messages to the service worker.
self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('Service Worker: Push received:', data);

    const title = data.title || 'E-Shop Update';
    const options = {
        body: data.body || 'New exciting offers available!',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-72x72.png',
        vibrate: data.vibrate || [200, 100, 200],
        data: {
            url: data.url || self.location.origin // Default to app's origin
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// --- Notification Click Listener ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification

    // This looks for a client (browser tab) that's already open
    // and focuses it, or opens a new one if none exist.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const clickedUrl = event.notification.data.url || self.location.origin;

            for (const client of clientList) {
                if (client.url === clickedUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no matching client found, open a new window
            if (clients.openWindow) {
                return clients.openWindow(clickedUrl);
            }
        })
    );
});
