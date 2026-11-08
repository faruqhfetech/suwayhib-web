// Shared state, the WebSocket to the server, and saved progress on this device.

const $ = (id) => document.getElementById(id);
const SR = 16000;
const DEV = new URLSearchParams(location.search).has("dev");
if (DEV) document.getElementById("filebtn").hidden = false;  // developer tools only with ?dev=1
let ws, ctx, node, srcNode, stream, fileSrc, running = false, verse = null, muteSend = false;
const store = {  // localStorage that never throws (private mode, blocked storage)
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

// ---------- websocket ----------
function connect() {
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  ws.binaryType = "arraybuffer";
  ws.onopen = () => { status("Ready — tap 🎙 and recite"); const pc = store.get("suwayhib.pace", "any"); if (pc !== "any") ws.send(JSON.stringify({ type: "pace", pace: pc })); };
  ws.onclose = () => { status("Not connected — retrying…"); setTimeout(connect, 1500); };
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.type !== "cursor") { (window.__log ||= []).push([+(performance.now() / 1000).toFixed(1), m]); if (__log.length > 500) __log.shift(); }
    handle(m);
  };
}
connect();
const send = (o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };

let lastStatus = "Connecting…";
function status(x) { lastStatus = x; $("status").textContent = tStatus(x); bootStatus(x); }
// the loading cover: steps (and a download percentage) move the bar; the engine's own
// "Ready. Start reciting anywhere." (server, Android and in-browser alike) lifts it
const BOOT_STEPS = [["Preparing", 0.05], ["Loading Python", 0.05], ["Downloading", 0.1], ["Unpacking", 0.1],
                    ["Loading the model", 0.6], ["Loading the follow-along engine", 0.85], ["Starting", 0.95]];
let bootAt = 0;
function bootStatus(x) {
  const b = $("boot"); if (!b || b.classList.contains("done")) return;
  if (/^Ready\. /.test(x)) { b.classList.add("done"); setTimeout(() => b.remove(), 400); return; }
  b.classList.toggle("failed", /^Could not start/.test(x));
  for (const [k, v] of BOOT_STEPS) if (x.startsWith(k)) bootAt = Math.max(bootAt, v);
  const pct = /(\d+)%/.exec(x);
  if (pct && /^(Downloading|Unpacking)/.test(x)) bootAt = Math.max(bootAt, 0.1 + 0.75 * pct[1] / 100);
  b.querySelector(".bbar i").style.width = `${Math.max(6, Math.round(100 * bootAt))}%`;
  $("boottext").textContent = tStatus(x);
}
function toast(x) {
  const el = $("toast"); el.textContent = t(x); el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2600);
}
// the in-browser build (inweb/) has no reference recitations and keeps no recordings
const NOREF = !!window.SUWAYHIB_INWEB;
let practising = false, repeating = false;  // the Practise or Repeat tab, rather than the mushaf
const inPanel = () => practising || repeating;
const root = () => (practising ? $("practice") : repeating ? $("repeat") : $("pages"));
const wsel = (s, a, w) => root().querySelector(`.w[data-s="${s}"][data-a="${a}"][data-w="${w}"]`);
const vsel = (s, a) => root().querySelector(`.v[data-s="${s}"][data-a="${a}"]`);
const words = (m) => (m.words && m.words.length ? m.words : [m.word]);

// ---------- saved progress (this device): last place, and each word's colour ----------
const marks = store.get("suwayhib.marks", {});        // "s:a:w" -> "ok" | "slight" | "error"
const flagged = store.get("suwayhib.flagged", {});    // "s:a:w" -> details for the sheet
let saveT = null;
function saveSoon() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    const keys = Object.keys(marks);
    if (keys.length > 8000) keys.slice(0, keys.length - 8000).forEach((k) => delete marks[k]);
    store.set("suwayhib.marks", marks); store.set("suwayhib.flagged", flagged);
  }, 400);
}
// A session is one sitting: it starts with the first recitation after opening the app (or after
// the last one ended) and ends after IDLE of no reciting, or with "End session". Each new session
// starts with a clean page; past sessions are kept (last 100) and can be reviewed.
const IDLE_MS = 15 * 1000;  // 15 s after the mic stops (in Read), the sitting is saved and the page clears
let SES = store.get("suwayhib.session", null), reviewing = null;
const viewMarks = () => (reviewing ? reviewing.words : marks);
const viewFlagged = () => (reviewing ? reviewing.flagged : flagged);
function kindNow() { return practising ? "practise" : repeating ? "repeat" : hifz !== "off" ? `memorise-${hifz}` : "read"; }
function saveSession() { if (SES) store.set("suwayhib.session", SES); }
function newSession() {
  archiveSession();
  AUD.flush(); AUD.n = 0; AUD.buf = [];
  SES = { id: Date.now(), start: Date.now(), last: Date.now(), kinds: [], words: {}, flagged: {}, verses: [], pace, at: {}, samples: 0, pieces: 0 };
  clearColours(); saveSession();
}
function ensureSession() {
  $("hint").hidden = true;
  if (!SES || (Date.now() - SES.last > IDLE_MS && !inPanel() && !running)) newSession();
  exitReview();
}
function archiveSession() {  // the finished session goes into the list (only if something was recited)
  if (SES) AUD.flush();
  if (!SES || !Object.keys(SES.words).length) { if (SES) AUD.drop(SES.id); SES = null; store.del("suwayhib.session"); return; }
  const hist = store.get("suwayhib.sessions", []);
  hist.unshift(SES);
  for (const old of hist.slice(100)) AUD.drop(old.id);  // sessions past the last 100: their audio too
  if (!store.set("suwayhib.sessions", hist.slice(0, 100))) {  // storage full: keep the live one rather than lose it
    toast(t("Storage is full — delete some old sessions")); return;
  }
  SES = null; store.del("suwayhib.session");
}
const AUD = {
  db: null, buf: [], n: 0,  // n: samples recorded in the current session
  on: !NOREF && store.get("suwayhib.saveaudio", true),
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open("suwayhib", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("audio", { keyPath: ["sid", "i"] });
      r.onsuccess = () => res((this.db = r.result)); r.onerror = () => rej(r.error);
    });
  },
  push(x) {  // a 100 ms chunk of what the learner said (not while a reference plays)
    if (!this.on || !SES) return;
    this.buf.push(x); this.n += x.length;
    if (this.buf.length >= 50) this.flush();
  },
  async flush() {
    if (!this.buf.length || !SES) return;
    const parts = this.buf; this.buf = [];
    const len = parts.reduce((k, c) => k + c.length, 0), pcm = new Int16Array(len);
    let o = 0; for (const c of parts) { for (let j = 0; j < c.length; j++) pcm[o + j] = Math.max(-1, Math.min(1, c[j])) * 32767; o += c.length; }
    SES.pieces = (SES.pieces || 0) + 1; SES.samples = this.n; saveSession();
    const sid = SES.id, i = SES.pieces;  // taken now: the session may be archived before the write below
    try { const db = await this.open(); db.transaction("audio", "readwrite").objectStore("audio").put({ sid, i, pcm }); } catch (e) {}
  },
  async load(sid) {  // the whole session's recording as one Float32Array
    const db = await this.open();
    const rows = await new Promise((res) => {
      const out = [], q = db.transaction("audio").objectStore("audio").openCursor(IDBKeyRange.bound([sid, 0], [sid, Infinity]));
      q.onsuccess = () => { const c = q.result; if (c) { out.push(c.value.pcm); c.continue(); } else res(out); };
      q.onerror = () => res(out);
    });
    const len = rows.reduce((k, r) => k + r.length, 0), x = new Float32Array(len);
    let o = 0; for (const r of rows) { for (let j = 0; j < r.length; j++) x[o + j] = r[j] / 32767; o += r.length; }
    return x;
  },
  async drop(sid) {
    try { const db = await this.open(); db.transaction("audio", "readwrite").objectStore("audio").delete(IDBKeyRange.bound([sid, 0], [sid, Infinity])); } catch (e) {}
  },
};
addEventListener("pagehide", () => AUD.flush());
if (SES) AUD.n = SES.samples || 0;  // reopened within the session: positions continue from here
function recordWord(s, a, w, st, m) {
  if (!SES) ensureSession();
  const k = `${s}:${a}:${w}`;
  if (st) SES.words[k] = st; else delete SES.words[k];
  if (m && st && st !== "ok") SES.flagged[k] = { sura: s, aya: a, word: w, status: st, expected: m.expected, expected_ph: m.expected_ph,
                                                 heard: m.heard, missing: m.missing, offpace: m.offpace, style: m.style };
  else delete SES.flagged[k];
  const kind = kindNow(); if (st && !SES.kinds.includes(kind)) SES.kinds.push(kind);
  const v = `${s}:${a}`; if (st && !SES.verses.includes(v)) SES.verses.push(v);
  SES.last = Date.now(); SES.pace = pace;
  if (st) (SES.at ||= {})[k] = AUD.n;  // where in the recording it was judged (samples so far)
  clearTimeout(recordWord._t); recordWord._t = setTimeout(saveSession, 400);
}
function clearColours() {  // a fresh page: no colours, no flags
  for (const k in flagged) delete flagged[k];
  for (const k in marks) delete marks[k];
  store.del("suwayhib.marks"); store.del("suwayhib.flagged");
  document.querySelectorAll("#pages .w").forEach((x) => x.classList.remove("ok", "err", "slight", "cur"));
  document.querySelectorAll("#pages .num.done").forEach((x) => x.classList.remove("done"));
  document.querySelectorAll("#pages .rep").forEach((x) => x.remove());
  document.querySelectorAll("#pages .v.current").forEach((x) => x.classList.remove("current"));
}
function paintAll() {  // recolour the loaded pages from the current (or reviewed) session
  const vm = viewMarks();
  document.querySelectorAll("#pages .w").forEach((x) => {
    x.classList.remove("ok", "err", "slight");
    const st = vm[`${x.dataset.s}:${x.dataset.a}:${x.dataset.w}`];
    if (st) x.classList.add(st === "error" ? "err" : st);
  });
}
function mark(s, a, w, st, m) {
  recordWord(s, a, w, st, m);
  if (inPanel()) return;
  const k = `${s}:${a}:${w}`;
  if (st) marks[k] = st; else delete marks[k];
  saveSoon();
}
function savePos(s, a, w) {  // the page the word is on, not the one being looked at
  if (inPanel()) return;
  const page = +(wsel(s, a, w)?.closest(".page")?.dataset.p || currentPage());
  store.set("suwayhib.pos", { s, a, w, page, name: surahName(s) });
}
