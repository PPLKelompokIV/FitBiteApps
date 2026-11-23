/* eslint-disable no-restricted-globals */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Menerima Web Push dari backend FastAPI meskipun tab aplikasi sedang ditutup
self.addEventListener("push", (event) => {
  let data = {
    title: "Pengingat FitBite",
    body: "Waktunya melengkapi catatan kesehatan harianmu.",
    url: "/profil-pengingat",
    kategori: "pengingat",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: `fitbite-${data.kategori || "reminder"}`,
      renotify: true,
      requireInteraction: true,
      data: { url: data.url || "/profil-pengingat" },
    })
  );
});

// Saat notifikasi browser diklik, langsung buka atau fokuskan tab ke halaman log terkait
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || "/profil-pengingat";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});