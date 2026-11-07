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
    if (m.t === "msgs") deliver(m.json);
    else if (m.t === "resp") {
      const resolve = waiting.get(m.id); waiting.delete(m.id);
      resolve(m.body == null ? new Response("not found", { status: 404 })
                             : new Response(m.body, { headers: { "Content-Type": "application/json" } }));
    } else if (m.t === "progress") deliver(JSON.stringify([{ type: "status", text: m.text }]));
  };
  worker.onerror = (e) => deliver(JSON.stringify([{ type: "status", text: `Could not start: ${e.message}` }]));

  document.addEventListener("DOMContentLoaded", () => document.body.classList.add("inweb"));
})();
