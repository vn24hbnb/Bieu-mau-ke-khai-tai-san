/* Service worker của bản web Kê khai TSTN. Chỉ đọc/ghi bộ nhớ đệm của chính trang này; không gọi mạng nào khác, không phân tích, không theo dõi. */
'use strict';
var BO_NHO = 'kktn-web-ddd9130b30f5ccb1';
var TAI_NGUYEN = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-512-maskable.png","apple-touch-icon.png"];

self.addEventListener('install', function (e) {
  // Không skipWaiting tự động: bản mới chờ đến khi người dùng bấm "Tải lại" trên băng cập nhật.
  e.waitUntil(caches.open(BO_NHO).then(function (c) { return c.addAll(TAI_NGUYEN); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ds) {
      return Promise.all(ds.filter(function (k) { return k.indexOf('kktn-web-') === 0 && k !== BO_NHO; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.loai === 'BO_QUA_CHO') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // không đụng tới nơi khác
  e.respondWith(
    caches.open(BO_NHO).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (r) {
        if (r) return r;
        if (req.mode === 'navigate') return c.match('./index.html');
        return fetch(req);
      });
    })
  );
});
