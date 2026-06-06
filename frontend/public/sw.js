self.addEventListener('push', function (event) {
    let data = { title: "HBN24 News", body: "नयी खबर!" };
    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        console.error("Error parsing push data", e);
    }

    const options = {
        body: data.body,
        icon: data.icon || '/favicon.png',
        image: data.image, // Adds large banner image
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2',
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
