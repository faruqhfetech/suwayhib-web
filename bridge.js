// Suwayhib in the browser: there is no server. The page's WebSocket and its data requests
// (/page/12, /verse/2/255, /surahs, ...) are answered by worker.js, which runs the model and
// web/app's Python engine. Loaded before the app's own scripts.
//
// This build has no reference recitations (no Listen) and keeps no recordings: the page hides
// those (window.SUWAYHIB_INWEB, read by the app's scripts). Sessions, colours and Repeat
// setups are still saved in this browser.
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
  let started = false;
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
    if (url.origin === location.origin && /^\/(ref|clip)\//.test(url.pathname))
      return Promise.resolve(new Response("not in this version", { status: 404 }));  // no reciter audio here
    return realFetch(input, init);
  };

  worker.onmessage = (ev) => {
    const m = ev.data;
    if (m.t === "msgs") {
      // the engine is ready: lift the cover, and load the pages in view again (the mushaf
      // asks for its first pages while the engine is still starting, and those can be lost)
      if (!started && m.json.includes("Ready.")) {
        started = true; unboot();
        setTimeout(() => {
          try { if (typeof observe === "function") observe(); if (typeof goPage === "function") goPage(currentPage()); }
          catch (e) { console.error(e); }
        }, 0);
      }
      try { deliver(m.json); } catch (e) { console.error(e); }
    }
    else if (m.t === "resp") {
      const resolve = waiting.get(m.id); waiting.delete(m.id);
      resolve(m.body == null ? new Response("not found", { status: 404 })
                             : new Response(m.body, { headers: { "Content-Type": "application/json" } }));
    } else if (m.t === "progress") { deliver(JSON.stringify([{ type: "status", text: m.text }])); boot(m.text); }
  };
  worker.onerror = (e) => { const t = `Could not start: ${e.message}`; deliver(JSON.stringify([{ type: "status", text: t }])); boot(t); };

  // ---------- the loading cover: shown until the engine is ready ----------
  // first visit: the model (73 MB) and Python download; later visits load from the cache
  const STEPS = [["Loading Python", 0.05], ["Downloading the recitation model", 0.1], ["Loading the follow-along engine", 0.85], ["Starting", 0.95]];
  let cover = null, shown = 0;
  function boot(text) {
    if (!cover) return;
    if (/^Could not start/.test(text)) { cover.classList.add("failed"); cover.querySelector(".bt").textContent = text; return; }
    const pct = /(\d+)%/.exec(text);
    let f = shown;
    for (const [k, v] of STEPS) if (text.startsWith(k)) f = Math.max(f, v);
    if (pct && text.startsWith("Downloading")) f = Math.max(f, 0.1 + 0.75 * pct[1] / 100);
    shown = f;
    cover.querySelector(".bt").textContent = text;
    cover.querySelector(".bbar i").style.width = `${Math.round(100 * f)}%`;
  }
  function unboot() { const c = cover; cover = null; if (c) { c.classList.add("done"); setTimeout(() => c.remove(), 400); } }

  // installable, and offline after the first visit (sw.js)
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

  const CONTACT = "umarhfe@gmail.com";
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("inweb");
    if (!started) {
      cover = document.createElement("div"); cover.id = "boot"; cover.setAttribute("role", "status");
      cover.innerHTML = `<img src="icons/icon-192.png" alt="" width="88" height="88"><div class="bn">Suwayhib</div>
        <div class="bbar"><i></i></div><div class="bt">Starting…</div>
        <div class="bh">The first visit downloads about 90 MB, then it works offline.</div>`;
      document.body.appendChild(cover);
    }
    // the menu: a way to get in touch (this version only)
    const a = document.createElement("a");
    a.className = "menulink"; a.href = `mailto:${CONTACT}`;
    a.innerHTML = `<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>` +
                  `<span><span data-i18n="Contact">Contact</span>: ${CONTACT}</span>`;
    document.getElementById("menu").appendChild(a);
    const st = document.createElement("style");
    st.textContent = `#boot { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 14px; padding: 24px; background: var(--bg); color: var(--ink); text-align: center; transition: opacity .35s; }
      #boot.done { opacity: 0; pointer-events: none; }
      #boot img { border-radius: 22px; box-shadow: var(--shadow); }
      #boot .bn { font-size: 24px; font-weight: 650; }
      #boot .bbar { width: min(280px, 80vw); height: 6px; border-radius: 3px; background: var(--surface-2); overflow: hidden; }
      #boot .bbar i { display: block; height: 100%; width: 3%; background: var(--accent); transition: width .3s; }
      #boot .bt { color: var(--muted); min-height: 1.4em; } #boot .bh { color: var(--muted); font-size: 13px; max-width: 320px; }
      #boot.failed .bbar { display: none; } #boot.failed .bt { color: var(--err); }
      .menulink { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 8px 16px;
      color: var(--ink); text-decoration: none; border-radius: 12px; } .menulink:hover { background: var(--surface-2); }`;
    document.head.appendChild(st);
  });
})();
