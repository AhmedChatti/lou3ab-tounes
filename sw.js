/* Lou3ab Tounes service worker: network first (content changes every day), cache as offline fallback. */
const C = 'l3b-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['/', '/manifest.webmanifest', '/assets/app/icon-192.png']).catch(() => {}))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(r => r || caches.match('/'))));
});
