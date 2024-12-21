const CACHE_NAME = "myphlex-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/app.css",
  "/js/app.js",
  "/js/api.js",
  "/js/msg.js",
  "/js/main.js",
  "/manifest.json",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "https://s4.zstatic.net/ajax/libs/mdui/2.1.1/mdui.min.css",
  "https://s4.zstatic.net/ajax/libs/mdui/2.1.1/mdui.global.min.js",
  "https://s4.zstatic.net/ajax/libs/eruda/3.2.1/eruda.min.js",
  "https://s4.zstatic.net/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
  "https://s4.zstatic.net/ajax/libs/clipboard.js/2.0.11/clipboard.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
