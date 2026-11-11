/* Service Worker — اجرای کامل آفلاین (آکادمی ایران / ClassBook)
   با هر نسخهٔ جدید، عدد CACHE_VERSION را یکی بالا ببرید تا کش قدیمی پاک شود. */
const CACHE_VERSION = 'classbook-v239-offline';
const CORE = [
  './',
  'index.html',
  'parent.html',
  'split.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // درخواست‌های POST (همگام‌سازی سرور) دست‌نخورده می‌مانند
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // لینک‌های بیرونی (ایتا/بله) فقط آنلاین

  // portal.json: اگر آنلاین بود تازه‌ترین نسخه، وگرنه نسخهٔ ذخیره‌شده
  if (url.pathname.endsWith('/portal.json')) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE_VERSION).then(c => c.put(url.pathname, copy));
        return r;
      }).catch(() => caches.match(url.pathname).then(r => r || new Response('{}', { status: 404 })))
    );
    return;
  }

  // بقیه: اول کش (سریع و آفلاین)، در پس‌زمینه به‌روزرسانی
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(r => {
        if (r && r.ok) {
          const copy = r.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return r;
      }).catch(() => null);
      if (hit) return hit;
      return net.then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});
