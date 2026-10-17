const CACHE_NAME = 'hoshino-game-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/styles/main.css',
  './src/themes/index.js',
  './src/themes/japanese/index.js',
  './src/themes/taiwan/index.js',
  './mascot/aoi-happy.png',
  './mascot/aoi-star.png',
  './mascot/aoi-worry.png',
  './assets/food/onigiri.png',
  './assets/food/sushi.png',
  './assets/food/ramen.png',
  './assets/food/tamagoyaki.png',
  './assets/food/takoyaki.png',
  './assets/food/yakitori.png',
  './assets/food/inari.png',
  './assets/food/ikura.png',
  './assets/food/daifuku.png',
  './assets/food/pudding.png'
];

// 安裝時快取所有資源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 啟用時清理舊快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求，優先使用快取，實現離線遊玩
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
