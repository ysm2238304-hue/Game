const CACHE_NAME = 'hoshino-game-v29'; // 每次大更新請遞增版號

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/styles/main.css',
  './assets/mascot/icon180.png',
  './assets/mascot/aoi-happy.png'
];

// 1. 安裝階段：容錯預載入資源，單一圖片缺漏不會導致整個 SW 崩潰
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url))
      );
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          console.warn(`[SW] 預載入略過: ${PRECACHE_ASSETS[idx]}`, res.reason);
        }
      });
    })
  );
});

// 2. 啟動階段：自動清除舊版號（如 v1）的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 3. 攔截請求：HTML/JS/CSS 走「網路優先」，圖片音效走「快取優先」
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  const isAsset =
    url.pathname.includes('/assets/') ||
    /\.(png|jpg|jpeg|webp|gif|svg|mp3|wav|ogg|woff2?)$/i.test(url.pathname);

  if (isAsset) {
    // 圖片與媒體資源：Cache First (快取優先)
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
  } else {
    // 程式碼與頁面：Network First (網路優先，離線才用快取)
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
  }
});
