// Service Worker für Bredis Homelab Dashboard.
// Wichtig: NUR Icons werden gecacht. HTML/JS/CSS kommt immer frisch aus dem
// Netz, damit nach einem Deploy nie eine veraltete UI angezeigt wird.
const CACHE = 'homelab-icons-v1';
const ICON_EXTS = ['.png', '.svg', '.ico', '.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isIcon = ICON_EXTS.some((ext) => url.pathname.endsWith(ext));
  if (!isIcon) return; // alles andere: normales Netzwerk-Verhalten, kein Caching

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((resp) => {
          if (resp.ok) cache.put(event.request, resp.clone());
          return resp;
        });
      })
    )
  );
});
