/* Depot-Rechner – Service Worker: hält alle Dateien für den Offline-Betrieb vor.
   Bei einer neuen Version der App hier die Versionsnummer erhöhen. */
const VERSION = "depot-2026-11-24-5";
const FILES = ["./", "index.html", "html2pdf.bundle.min.js", "manifest.webmanifest",
               "icon-v2-180.png", "icon-v2-192.png", "icon-v2-512.png", "icon-v2-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });

/* Zuerst aus dem Speicher (sofort, auch offline); nur bei Fehlendem ins Netz. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit ||
      fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))
  );
});
