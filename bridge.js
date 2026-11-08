// Suwayhib in the browser: there is no server. The page's WebSocket and its data requests
// (/page/12, /verse/2/255, /surahs, ...) are answered by worker.js, which runs the model and
// server/app's Python engine. Loaded before the app's own scripts.
//
// Reference recitations come from everyayah.com and the service worker keeps each one, so a
// verse played once plays offline (the Downloads page lists and deletes them). Sessions, colours,
// Repeat setups and the learner's recordings (compressed, see AUD in core.js) are saved in this browser.
(() => {
  window.SUWAYHIB_INWEB = true;
  const worker = new Worker("worker.js");
  let sock = null;
  const held = [];  // engine replies that arrive before the page's handler exists

  // ---------- the WebSocket ----------
  class WorkerSocket {
    constructor() {
      this.readyState = 0; this.binaryType = "arraybuffer"; sock = this;
      // open once every script has loaded (the app's message handler is defined last)
      const go = () => { this.readyState = 1; this.onopen && this.onopen(); while (held.length) deliver(held.shift()); };
      if (document.readyState === "complete") setTimeout(go, 0); else addEventListener("load", go, { once: true });
    }
    send(d) {
      if (this.readyState !== 1) return;
      if (typeof d === "string") worker.postMessage({ t: "cmd", json: d });
      else { const b = d instanceof ArrayBuffer ? d : d.buffer; worker.postMessage({ t: "audio", buf: b }, [b]); }
    }
    close() { this.readyState = 3; }
  }
  WorkerSocket.OPEN = 1;
  window.WebSocket = WorkerSocket;
  function deliver(json) {
    if (!sock || sock.readyState !== 1 || !sock.onmessage) { held.push(json); return; }
    for (const m of JSON.parse(json)) sock.onmessage({ data: JSON.stringify(m) });
  }

  // ---------- data requests ----------
  const API = /^\/(page|verse|surahs|juz|reciters|timing)(\/|$)/;
  const waiting = new Map();
  let nextId = 1;
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin === location.origin && API.test(url.pathname)) {
      return new Promise((resolve) => {
        const id = nextId++;
        waiting.set(id, resolve);
        worker.postMessage({ t: "req", id, path: url.pathname, query: url.search.slice(1) });
      });
    }
    const ref = url.origin === location.origin && /^\/ref\/([\w-]+)\/(\d{6})$/.exec(url.pathname);
    if (ref) return realFetch(`https://everyayah.com/data/${ref[1]}/${ref[2]}.mp3`);  // kept by sw.js
    if (url.origin === location.origin && /^\/clip\//.test(url.pathname))
      return Promise.resolve(new Response("not in this version", { status: 404 }));
    return realFetch(input, init);
  };

  worker.onmessage = (ev) => {
    const m = ev.data;
    if (m.t === "msgs") {
      try { deliver(m.json); } catch (e) { console.error(e); }
    }
    else if (m.t === "resp") {
      const resolve = waiting.get(m.id); waiting.delete(m.id);
      resolve(m.body == null ? new Response("not found", { status: 404 })
                             : new Response(m.body, { headers: { "Content-Type": "application/json" } }));
    } else if (m.t === "progress") deliver(JSON.stringify([{ type: "status", text: m.text }]));  // shown on the loading cover
  };
  worker.onerror = (e) => deliver(JSON.stringify([{ type: "status", text: `Could not start: ${e.message}` }]));


  // downloads: the recitations the service worker has kept (sw.js, cache "suwayhib-heavy")
  const EA = /^https:\/\/everyayah\.com\/data\/([\w-]+)\/(\d{6})\.mp3$/;
  window.SuwayhibDownloads = {
    async list() {
      if (!("caches" in window)) return [];
      const c = await caches.open("suwayhib-heavy"), out = [];
      for (const req of await c.keys()) {
        const m = EA.exec(req.url); if (!m) continue;
        const r = await c.match(req);
        out.push({ rec: m[1], stem: m[2], bytes: +(r?.headers.get("content-length") || 0) });
      }
      return out;
    },
    async remove(rec, stems) {
      const c = await caches.open("suwayhib-heavy");
      for (const req of await c.keys()) {
        const m = EA.exec(req.url);
        if (m && m[1] === rec && (!stems.length || stems.includes(m[2]))) await c.delete(req);
      }
    },
  };

  // installable, and offline after the first visit (sw.js)
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

  // ---------- "Install app": Chrome/Edge/Android offer it through beforeinstallprompt; Safari
  // (iPhone, iPad) has no prompt, so it is explained: Share, then Add to Home Screen ----------
  let installEvt = null;
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const SNOOZE = "suwayhib.installSnooze";
  const snoozed = () => { try { return Date.now() < +(localStorage.getItem(SNOOZE) || 0); } catch (e) { return false; } };
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; offerInstall(); });
  addEventListener("appinstalled", () => { installEvt = null; hideInstall(); });
  function hideInstall() {
    document.getElementById("installbar")?.remove();
    const b = document.getElementById("m-install"); if (b) b.hidden = true;
  }
  async function doInstall() {
    if (installEvt) {
      installEvt.prompt();
      const { outcome } = await installEvt.userChoice.catch(() => ({}));
      installEvt = null;
      if (outcome === "accepted") hideInstall(); else document.getElementById("installbar")?.remove();
    } else if (ios) {
      alert(T("To install: tap the Share button, then “Add to Home Screen”."));
    }
  }
  const T = (k) => (typeof t === "function" ? t(k) : k);
  function offerInstall() {
    if (standalone() || !document.body) return;
    const b = document.getElementById("m-install"); if (b) b.hidden = false;
    if (snoozed() || document.getElementById("installbar")) return;
    const bar = document.createElement("div"); bar.id = "installbar"; bar.setAttribute("role", "region");
    bar.innerHTML = `<img src="static/icons/icon-192.png" alt="" width="36" height="36">
      <span><b>${T("Install Suwayhib")}</b><br><small>${T(ios ? "Add it to your home screen: it opens like an app and works offline." : "It opens like an app and works offline.")}</small></span>
      <button class="primary" id="installgo">${T(ios ? "How" : "Install")}</button>
      <button class="icon-btn ghost" id="installno" aria-label="${T("Not now")}">✕</button>`;
    document.body.appendChild(bar);
    bar.querySelector("#installgo").onclick = doInstall;
    bar.querySelector("#installno").onclick = () => { try { localStorage.setItem(SNOOZE, Date.now() + 14 * 864e5); } catch (e) {} bar.remove(); };
  }

  const CONTACT = "umarhfe@gmail.com";
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("inweb");
    document.getElementById("boothint").hidden = false;
    if (ios && !standalone()) setTimeout(offerInstall, 4000);
    if (installEvt) setTimeout(offerInstall, 0);  // the offer came before the page was built  // the first visit's download, explained
    // the menu: a way to get in touch (this version only)
    const a = document.createElement("a");
    a.className = "menulink"; a.href = `mailto:${CONTACT}`;
    a.innerHTML = `<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>` +
                  `<span><span data-i18n="Contact">Contact</span>: ${CONTACT}</span>`;
    const ib = document.createElement("button"); ib.className = "ghost"; ib.id = "m-install"; ib.hidden = true;
    ib.innerHTML = `<svg class="i"><use href="#i-download"/></svg><span data-i18n="Install app">Install app</span>`;
    ib.onclick = () => { document.getElementById("menu").classList.remove("show"); doInstall(); };
    document.getElementById("menu").appendChild(ib);
    document.getElementById("menu").appendChild(a);
    const st = document.createElement("style");
    st.textContent = `#installbar { position: fixed; left: 12px; right: 12px; bottom: calc(76px + env(safe-area-inset-bottom)); z-index: 30;
      display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card); color: var(--ink);
      border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow); max-width: 520px; margin: 0 auto; }
      #installbar span { flex: 1; line-height: 1.3; } #installbar small { color: var(--muted); } #installbar img { border-radius: 50%; }
      .menulink { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 8px 16px;
      color: var(--ink); text-decoration: none; border-radius: 12px; } .menulink:hover { background: var(--surface-2); }`;
    document.head.appendChild(st);
  });
})();
