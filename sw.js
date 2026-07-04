const CACHE = 'tesoro-v12';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Non mettere mai in cache le API di prezzo/cambio: servono dati freschi
  if (url.includes('gold-api.com') || url.includes('frankfurter') || url.includes('jsdelivr.net') || url.includes('currency-api') || url.includes('script.google.com') || url.includes('script.googleusercontent.com') || url.includes('firebasedatabase.app') || url.includes('firebaseio.com')) {
    return; // lascia passare alla rete
  }
  // App shell: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (e.request.method === 'GET' && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
