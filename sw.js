// Service Worker - LATAM Payroll PWA
// Strategy: Network first for HTML (always fresh), cache only fonts
const CACHE = "latam-fonts-v2";

self.addEventListener("install", e => {
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
  const url = e.request.url;

  // Never intercept GitHub API
  if (url.includes("api.github.com")) return;

  // HTML: always network, never cache
  if (url.endsWith("/") || url.endsWith(".html") ||
      url.includes("reydelosenanos.github.io")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Fonts: cache first
  if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
      )
    );
    return;
  }

  // Default: network no-cache
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .catch(() => caches.match(e.request))
  );
});
