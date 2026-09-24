// Service Worker — every open fetches the latest version straight from the
// server (bypassing the browser's 10-minute cache), so the same fixed URL
// always shows the newest app. Falls back to the last copy only when offline.
const VERSION = 'v91';
const CACHE = 'site-inspection-' + VERSION;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-store' })          // skip the HTTP cache — always latest
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)); // keep an offline copy
        return res;
      })
      .catch(() => caches.match(req))          // offline: use last saved copy
  );
});
