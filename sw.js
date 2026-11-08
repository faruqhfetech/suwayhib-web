// Suwayhib's service worker: installable, and offline after the first visit.
//   the app (page, scripts, Python files): network first, so a new build arrives; cache when offline
//   heavy files (model parts, the speech engine, Pyodide from its CDN, reciter recitations): cache first. They never
//   change at the same URL: the model parts carry a version (?v=, see worker.js), the engine and
//   Pyodide are pinned versions.
// build.py fills in VERSION and SHELL.
const VERSION = "2208176ef813";
const SHELL = ["./", "index.html", "bridge.js", "worker.js", "manifest.webmanifest", "sherpa/parts.json", "sherpa/sherpa-onnx-wasm-main-asr.js", "sherpa/sherpa-onnx-asr.js", "static/app.css", "static/fonts/AmiriQuran.woff2", "static/fonts/OFL.txt", "static/i18n.js", "static/icons/icon-192.png", "static/icons/icon-512.png", "static/icons/maskable-192.png", "static/icons/maskable-512.png", "static/index.html", "static/js/audio.js", "static/js/core.js", "static/js/follow.js", "static/js/listen.js", "static/js/mushaf.js", "static/js/panels.js", "static/js/practise.js", "static/js/repeat.js", "static/js/settings.js", "py/app.zip", "py/quran_transcript-0.6.1-py3-none-any.whl", "py/wheels.json", "py/xmltodict-1.0.4-py3-none-any.whl"];
const APP = `suwayhib-app-${VERSION}`;
const HEAVY = "suwayhib-heavy";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("suwayhib-app-") && k !== APP) await caches.delete(k);
    await self.clients.claim();
  })());
});

const heavy = (url) => /\/sherpa\/(model\.part\d+|sherpa-onnx-wasm-main-asr\.wasm)/.test(url.pathname) ||
                       url.hostname === "cdn.jsdelivr.net" || url.hostname === "everyayah.com";  // recitations: kept once played
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (heavy(url)) {
    e.respondWith(caches.open(HEAVY).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone());
      return r;
    }));
  } else if (url.origin === location.origin) {
    e.respondWith((async () => {
      try {
        const r = await fetch(e.request);
        if (r.ok) (await caches.open(APP)).put(e.request, r.clone());
        return r;
      } catch (err) {
        const hit = await caches.match(e.request, { ignoreSearch: true });
        if (hit) return hit;
        throw err;
      }
    })());
  }
});
