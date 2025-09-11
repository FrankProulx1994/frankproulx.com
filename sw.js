// Version de cache (bump si tu changes les assets)
const APP_VERSION = 'v1';

// Les fichiers “shell” à precacher (même-origin)
const APP_SHELL = [
  '/',                       // page d'accueil
  '/manifest.json',
  '/A.png',
  '/B.png',
  // Ajoute ici tes fichiers hébergés chez toi si tu veux offline plus solide :
  // '/styles.css',
  // '/app.js',
  // '/favicon.ico'
];

// Installation : précache le shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activation : nettoie anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== APP_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch :
// - HTML en "network-first" (pour éviter de servir trop vieux)
// - Assets même-origin en "cache-first"
// - Cross-origin (CDN Chart.js) : passe au réseau (laisser le navigateur gérer)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Pages navigables (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/'))
    );
    return;
  }

  // Même-origin : cache d'abord, sinon réseau
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((res) => res || fetch(req))
    );
    return;
  }

  // Cross-origin : réseau direct
  // (Optionnel: tu peux mettre un runtime cache ici si tu veux)
});
