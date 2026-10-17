const CACHE_NAME = 'hoshino-game-v2'; // 每次大更新請遞增版號

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/styles/main.css',
  './assets/mascot/icon180.png',
  './assets/mascot/aoi-happy.png'
  // 若有其他核心圖片，請確認皆加上 ./assets/ 前綴
];

// 1. 安裝階段：容錯預載入資源，並立即接管
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url))
      );
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          console.warn(`[SW] 預載入失敗 (略過): ${PRECACHE_ASSETS[idx]}`, res.reason);
        }
      });
    })
  );
});

// 2. 啟動階段：自動清除舊版號的快取
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

// 3. 攔截請求：程式碼走「網路優先」，圖片素材走「快取優先」
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 忽略非 http/https 請求（例如 chrome-extension）
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
    // HTML / JS / CSS：Network First (網路優先，確保遊戲更新即時生效)
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
