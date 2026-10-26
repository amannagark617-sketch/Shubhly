// Shubhly service worker: keeps the app opening fast and shows a friendly page
// when there is no internet. Pages and code always try the network first, so
// updates appear at once; pictures and fonts are kept for speed.

const VERSION = "shubhly-v1";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  // Pages: network first, then the last copy, then the offline page.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(OFFLINE)))
    );
    return;
  }

  // Code: network first so a new version shows up straight away.
  if (/\.(js|css|webmanifest)$/.test(url.pathname)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Pictures and fonts: use the saved copy, refresh it quietly.
  e.respondWith(
    caches.open(STATIC).then(async (c) => {
      const hit = await c.match(req);
      const fresh = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || fresh;
    })
  );
});
