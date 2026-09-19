// Service Worker - 每次部署自動更新，不需要手動清快取
const VERSION = 'v70'; // 每次推送自動更新這個版本號

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 立即啟用新版本
});

self.addEventListener('activate', (e) => {
  // 清除所有舊快取
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Network first — 永遠先抓最新版，抓不到才用快取
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => res)
      .catch(() => caches.match(e.request))
  );
});
