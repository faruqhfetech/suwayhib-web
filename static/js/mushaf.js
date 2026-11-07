// The mushaf: 604 lazily filled pages (scroll or page mode), and surah names.

// ---------- the mushaf: 604 page blocks, filled as they near the screen ----------
const NPAGES = 604;
const pageEl = (n) => document.getElementById(`p${n}`);
for (let n = 1; n <= NPAGES; n++) {
  const d = document.createElement("section"); d.className = "page"; d.id = `p${n}`; d.dataset.p = n;
  d.innerHTML = `<div class="page-head"><span class="pn">${t("Page {n}", { n })}</span><span class="pname"></span></div><div class="quran"></div>`;
  $("pages").appendChild(d);
}
const loading = {};
function loadPage(n) {
  if (n < 1 || n > NPAGES) return Promise.resolve();
  if (pageEl(n).classList.contains("loaded")) return Promise.resolve();
  return (loading[n] ||= fetch(`/page/${n}`).then((r) => r.json()).then(renderPage).catch((e) => { delete loading[n]; throw e; }));
}
let io = null, paged = store.get("suwayhib.layout", "scroll") === "paged";
function observe() {
  io?.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const n = +e.target.dataset.p; loadPage(n); loadPage(n + 1); loadPage(n - 1);
  }), paged ? { root: $("pages"), rootMargin: "0px 900px" } : { rootMargin: "1200px 0px" });
  document.querySelectorAll(".page").forEach((el) => io.observe(el));
}
function currentPage() {
  if (paged) {  // the strip scrolls sideways: which page fills it now
    const P = $("pages"), w = pageEl(1).offsetWidth + 16;
    return Math.min(NPAGES, Math.max(1, Math.round(Math.abs(P.scrollLeft) / w) + 1));
  }
  let best = 1, bestA = -1;  // long scroll: the page with the most height on screen
  for (const el of document.querySelectorAll(".page")) {
    const r = el.getBoundingClientRect();
    const a = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    if (a > bestA) { bestA = a; best = +el.dataset.p; }
    if (bestA > 0 && a === 0 && r.top > innerHeight) break;
  }
  return best;
}
function showPgNum() { $("pgnum").textContent = t("Page {n}", { n: currentPage() }); }
function setLayout(p) {
  const keep = currentPage();
  paged = p; applyLayout(); store.set("suwayhib.layout", p ? "paged" : "scroll");
  observe(); refitAll(); goPage(keep);
}
function applyLayout() {
  $("pages").classList.toggle("paged", paged); document.body.classList.toggle("paged", paged);
  $("lay-pages").setAttribute("aria-pressed", paged); $("lay-scroll").setAttribute("aria-pressed", !paged);
}
function goPage(n) {
  n = Math.min(NPAGES, Math.max(1, n));
  loadPage(n); loadPage(n + 1); loadPage(n - 1);
  if (paged) {
    const P = $("pages"), w = pageEl(1).offsetWidth + 16;
    P.scrollLeft = -(n - 1) * w;  // right to left: page n sits n-1 widths to the left
  } else pageEl(n).scrollIntoView({ block: "start" });
  $("pgnum").textContent = t("Page {n}", { n });
}
let pgT = null;
const onScroll = () => { clearTimeout(pgT); pgT = setTimeout(() => { showPgNum(); unloadFar(); }, 150); };
$("pages").addEventListener("scroll", onScroll, { passive: true });
addEventListener("scroll", onScroll, { passive: true });
$("lay-pages").onclick = () => { if (!paged) setLayout(true); };
$("lay-scroll").onclick = () => { if (paged) setLayout(false); };
$("nextpg").onclick = () => goPage(currentPage() + 1);
$("prevpg").onclick = () => goPage(currentPage() - 1);
addEventListener("keydown", (e) => {  // right to left: the left arrow turns to the next page
  if (e.target?.closest?.("input, select, textarea")) return;
  if (e.key === "ArrowLeft" && paged) goPage(currentPage() + 1);
  if (e.key === "ArrowRight" && paged) goPage(currentPage() - 1);
  if (e.key === "Escape") { hideSheet(); closeOverlays(); }
});
applyLayout(); observe();

async function showPage(n) {  // the recitation moved onto page n: make sure it is the one shown
  await Promise.all([loadPage(n - 1), loadPage(n), loadPage(n + 1)]);
  if (paged) { if (currentPage() !== n) goPage(n); return; }
  const r = pageEl(n).getBoundingClientRect();
  if (r.bottom < 80 || r.top > innerHeight) goPage(n);
}

const KEEP = 3;  // pages either side of the one in view that keep their words; the rest are emptied
function unloadFar() {
  const c = currentPage();
  for (const pg of document.querySelectorAll(".page.loaded")) {
    const n = +pg.dataset.p;
    if (Math.abs(n - c) <= KEEP || (verse && pg.contains(vsel(...verse)))) continue;
    if (!paged) pg.style.height = pg.offsetHeight + "px";  // keep its place in the long scroll
    pg.querySelector(".quran").innerHTML = ""; pg.classList.remove("loaded"); delete loading[n];
  }
}
function mkWord(s, a, i, w, n) {  // one word, with its saved colour; n = words in the verse
  const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w;
  if (i === 0) sp.classList.add("first");                         // memorise prompts: the first word,
  if (n && i >= n - (n >= 6 ? 3 : 2) && i > 0) sp.classList.add("last");  // and the last 3 (2 if short)
  sp.dataset.s = s; sp.dataset.a = a; sp.dataset.w = i;
  const st = viewMarks()[`${s}:${a}:${i}`];
  if (st) sp.classList.add(st === "error" ? "err" : st);
  return sp;
}
function renderPage(p) {
  const pg = pageEl(p.page); if (!pg || pg.classList.contains("loaded")) return;
  const q = pg.querySelector(".quran"); q.innerHTML = ""; pg.style.height = "";
  pg.querySelector(".pname").textContent = p.verses.length ? p.verses[0].sura_name : "";
  for (const v of p.verses) {
    if (v.aya === 1) {
      const h = document.createElement("span"); h.className = "surah"; h.textContent = `سورة ${v.sura_name}`; q.appendChild(h);
      if (v.basmala) {  // the basmala on its own line; it is "verse 0" to the tracker's messages
        const b = document.createElement("span"); b.className = "v basmala"; b.dataset.s = v.sura; b.dataset.a = 0;
        v.basmala.forEach((w, i) => { b.appendChild(mkWord(v.sura, 0, i, w, v.basmala.length)); b.appendChild(document.createTextNode(" ")); });
        q.appendChild(b);
      }
    }
    const vs = document.createElement("span"); vs.className = "v"; vs.dataset.s = v.sura; vs.dataset.a = v.aya;
    v.words.forEach((w, i) => { vs.appendChild(mkWord(v.sura, v.aya, i, w, v.words.length)); vs.appendChild(document.createTextNode(" ")); });
    const n = document.createElement("span"); n.className = "num"; n.textContent = `﴿${v.aya.toLocaleString("ar-EG")}﴾`;
    vs.appendChild(n); vs.appendChild(document.createTextNode(" "));
    q.appendChild(vs);
  }
  pg.classList.add("loaded");
  if (verse) { const v = vsel(...verse); if (v) v.classList.add("current"); }
  fitPage(pg);
}

// page mode: each page's text at the largest size that fits the screen height (no scrolling
// inside a page, so a swipe always turns it). MIN_FIT is the floor: a phone page normally fits at
// 20 px or more; only a crowded page (surah headings, basmala) goes lower.
// The search runs once per page and screen size (orientation); after that the size is reused.
const MIN_FIT = 14;
const fitCache = {};
function fitPage(pg) {
  const q = pg.querySelector(".quran");
  if (!paged || !pg.classList.contains("loaded")) { q.style.fontSize = ""; return; }
  if (!q.clientHeight || !q.clientWidth) return;  // hidden (e.g. while practising): fit later
  const key = `${pg.dataset.p}:${q.clientWidth}x${q.clientHeight}`;
  if (fitCache[key]) { q.style.fontSize = fitCache[key] + "px"; return; }
  let lo = MIN_FIT, hi = 44;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    q.style.fontSize = mid + "px";
    if (q.scrollHeight <= q.clientHeight + 1) lo = mid; else hi = mid;
  }
  q.style.fontSize = lo + "px";
  fitCache[key] = lo;
}
function refitAll() { document.querySelectorAll(".page.loaded").forEach(fitPage); }
let fitT = null;
addEventListener("resize", () => { clearTimeout(fitT); fitT = setTimeout(() => { const n = currentPage(); refitAll(); if (paged) goPage(n); }, 150); });

function setCursor(s, a, w) {
  root().querySelectorAll(".w.cur").forEach((e) => e.classList.remove("cur"));
  const el = wsel(s, a, w);
  if (el) { el.classList.add("cur"); if (!paged) el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  savePos(s, a, w);
}
function setVerse(s, a) {
  root().querySelectorAll(".v.current").forEach((e) => e.classList.remove("current"));
  verse = [s, a]; const v = vsel(s, a); if (v) v.classList.add("current");
  $("where").textContent = `${s}:${a}`;
}

// ---------- surah names (for the picker) ----------
let SURAHS = [], JUZ = [], pickTab = "surah";
fetch("/juz").then((r) => r.json()).then((l) => (JUZ = l));
function buildJuzList() {
  const list = $("surahlist"); list.innerHTML = ""; $("vstep").hidden = true; list.hidden = false;
  for (const j of JUZ) {
    const b = document.createElement("button"); b.className = "item";
    b.innerHTML = `<span class="meta">${j.juz}</span><span class="en">${t("Juz {n}", { n: j.juz })} — ${SURAHS[j.sura - 1]?.en || ""} ${j.aya}</span><span class="ar">${SURAHS[j.sura - 1]?.name || ""}</span>`;
    b.onclick = () => showVerseStep(SURAHS[j.sura - 1], j.aya);
    list.appendChild(b);
  }
}
function setPickTab(t) {
  pickTab = t;
  $("t-surah").setAttribute("aria-pressed", t === "surah"); $("t-juz").setAttribute("aria-pressed", t === "juz");
  if (t === "juz") buildJuzList(); else buildSurahList($("gotofilter").value);
}
const surahName = (s) => SURAHS[s - 1]?.name || `Surah ${s}`;
fetch("/surahs").then((r) => r.json()).then((l) => { SURAHS = l; buildSurahList(""); openLastPage(); });
