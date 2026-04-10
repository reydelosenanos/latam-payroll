const CACHE = "latam-payroll-v1";
const ASSETS = [
  "./",
  "./index.html",
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Don't intercept GitHub API calls
  if (e.request.url.includes("api.github.com") ||
      e.request.url.includes("fonts.gstatic.com")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
