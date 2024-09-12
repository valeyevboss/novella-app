self.addEventListener('install', (event) => {
    self.skipWaiting(); // Обновляем сервисного работника немедленно
});

self.addEventListener('activate', (event) => {
    // Очищаем старые кеши
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
