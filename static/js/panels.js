// Navigation, the in-app dialog, the Sessions list and the menu.

// ---------- go to a surah or a page ----------
// search by number, Arabic name, or transliteration ("kahf", "al-mulk", "yasin" all work)
const norm = (t) => t.toLowerCase().replace(/[^a-z]/g, "").replace(/^(al|an|ar|as|at|az|ad|adh|ash)(?=[a-z]{3})/, "");
function buildSurahList(f) {
  const raw = f.trim(), q = norm(raw), list = $("surahlist"); list.innerHTML = "";
  $("vstep").hidden = true; list.hidden = false;
  for (const x of SURAHS) {
    const ok = !raw || String(x.sura) === raw || x.name.includes(raw) || (q && norm(x.en || "").includes(q));
    if (!ok) continue;
    const b = document.createElement("button"); b.className = "item";
    b.innerHTML = `<span class="meta">${x.sura}</span><span class="en">${x.en || ""}</span><span class="ar">${x.name}</span>`;
    b.onclick = () => showVerseStep(x, 1);
    list.appendChild(b);
  }
}
// step two: which verse, and what to do there (Read: show it / recite from it; Practise: practise it)
let vsura = null;
function showVerseStep(x, a) {
  vsura = x;
  $("surahlist").hidden = true; $("vstep").hidden = false;
  $("vname").textContent = x.name; $("ven").textContent = `${x.en || ""} · ${t("{n} verses", { n: x.ayat })}`;
  $("vnum").max = x.ayat; $("vnum").value = Math.min(Math.max(1, a), x.ayat); $("vof").textContent = t("of {n}", { n: x.ayat });
  const btns = $("vbtns"); btns.innerHTML = "";
  const add = (label, primary, fn) => { const b = document.createElement("button"); b.textContent = t(label); if (primary) b.className = "primary"; b.onclick = fn; btns.appendChild(b); };
  const num = () => Math.min(Math.max(1, +$("vnum").value || 1), x.ayat);
  if (practising) add("Practise this verse", true, () => { closeOverlays(); loadVerse(x.sura, num()); });
  else {
    add("Show", false, () => jumpVerse(x.sura, num(), false));
    add("🎙 Recite from here", true, () => jumpVerse(x.sura, num(), true));
  }
  $("vnum").focus(); $("vnum").select();
}
$("vback").onclick = () => setPickTab(pickTab);
$("t-surah").onclick = () => setPickTab("surah");
$("t-juz").onclick = () => setPickTab("juz");
$("vnum").onkeydown = (e) => { if (e.key === "Enter") $("vbtns").querySelector(".primary")?.click(); };
async function jumpVerse(s, a, recite) {
  closeOverlays();
  const v = await (await fetch(`/verse/${s}/${a}`)).json();
  goPage(v.page); await loadPage(v.page); goPage(v.page);
  const el = wsel(s, a, 0);
  if (recite) { startFrom(s, a, 0); return; }
  const vs = vsel(s, a);  // show it: mark the verse and flash its first word, without starting
  root().querySelectorAll(".v.current").forEach((e) => e.classList.remove("current"));
  vs?.classList.add("current");
  if (el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); if (!paged) el.scrollIntoView({ block: "center" }); }
  toast("Double-tap a word to start there");
}
function closeOverlays() {
  document.querySelectorAll(".overlay").forEach((o) => o.classList.remove("show"));
}
$("goto").onclick = () => { $("gotobox").classList.add("show"); $("gotofilter").value = ""; buildSurahList(""); $("gotofilter").focus(); };
$("gotoclose").onclick = closeOverlays;
$("gotofilter").oninput = (e) => { if (pickTab !== "surah") setPickTab("surah"); buildSurahList(e.target.value); };
$("gotofilter").onkeydown = (e) => {  // "18:10" (or "18 10") goes straight to that verse
  if (e.key !== "Enter") return;
  const m = e.target.value.trim().match(/^(\d{1,3})\s*[:. ]\s*(\d{1,3})$/);
  const x = m && SURAHS[+m[1] - 1];
  if (x) showVerseStep(x, +m[2]);
  else $("surahlist").querySelector(".item")?.click();
};
$("gotopage").onkeydown = (e) => { if (e.key === "Enter" && +e.target.value) { closeOverlays(); goPage(+e.target.value); } };
document.querySelectorAll(".overlay").forEach((o) => o.addEventListener("click", (e) => { if (e.target === o) closeOverlays(); }));

// ---------- an in-app yes/no ----------
function ask(text) {
  return new Promise((res) => {
    $("asktext").textContent = t(text); $("askbox").classList.add("show");
    const done = (v) => { $("askbox").classList.remove("show"); res(v); };
    $("askyes").onclick = () => done(true); $("askno").onclick = () => done(false);
  });
}

// ---------- sessions list ----------
$("saveaudio").checked = AUD.on;
$("saveaudio").onchange = (e) => { AUD.on = e.target.checked; store.set("suwayhib.saveaudio", AUD.on); };
const KIND = { read: "Read", practise: "Practise", repeat: "Repeat", "memorise-first": "Memorise: first word", "memorise-ends": "Memorise: first + last", "memorise-hide": "Memorise: hidden" };
function sessLabel(x) { return x.kinds.length > 1 ? t("Mixed") : t(KIND[x.kinds[0]] || "Read"); }
function sessRange(x) {
  const vs = [...x.verses].map((v) => v.split(":").map(Number)).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (!vs.length) return "";
  const f = vs[0], l = vs[vs.length - 1];
  const nm = (su) => SURAHS[su - 1]?.en || su;
  return f[0] === l[0] ? `${nm(f[0])} ${f[1]}${l[1] !== f[1] ? "–" + l[1] : ""}` : `${nm(f[0])} ${f[1]} – ${nm(l[0])} ${l[1]}`;
}
function sessCounts(x) {
  const c = { ok: 0, slight: 0, error: 0 };
  for (const v of Object.values(x.words)) c[v] = (c[v] || 0) + 1;
  return c;
}
function buildSessList() {
  const list = $("sesslist"); list.innerHTML = "";
  const all = (SES && Object.keys(SES.words).length ? [Object.assign({ current: true }, SES)] : []).concat(store.get("suwayhib.sessions", []));
  $("endsess").hidden = !(SES && Object.keys(SES.words).length);
  $("delall").hidden = !store.get("suwayhib.sessions", []).length;
  if (!all.length) { list.innerHTML = `<div class="sessempty">${t("No sessions yet. Tap the mic and recite to start one.")}</div>`; return; }
  for (const x of all) {
    const c = sessCounts(x), mins = Math.max(1, Math.round((x.last - x.start) / 60000));
    const d = document.createElement("div"); d.className = "sess";
    d.innerHTML = `<div class="top"><span class="kind">${sessLabel(x)}${x.current ? " · " + t("now") : ""}</span>
      <span class="when">${new Date(x.start).toLocaleString(LANG === "en" ? undefined : LANG, { dateStyle: "medium", timeStyle: "short" })} · ${t("{n} min", { n: mins })}</span></div>
      <div class="range">${sessRange(x)}${x.samples ? " · 🎙 " + t("{n} min", { n: Math.max(1, Math.round(x.samples / SR / 60)) }) : ""}</div>
      <div class="counts"><span class="c-ok">${c.ok}</span><span class="c-sl">${c.slight}</span><span class="c-er">${c.error}</span></div>
      <div class="acts"></div>`;
    const acts = d.querySelector(".acts");
    if (x.repeat) d.querySelector(".range").textContent += ` · ${t(x.repeat.mode === "loop" ? "Loop" : "Cascade")}`;
    if (!x.current) {
      const rv = document.createElement("button"); rv.textContent = t("Review"); rv.className = "primary"; rv.onclick = () => startReview(x);
      const del = document.createElement("button"); del.textContent = t("Delete"); del.className = "ghost";
      del.onclick = async () => { if (!(await ask("Delete this session?"))) return; AUD.drop(x.id); store.set("suwayhib.sessions", store.get("suwayhib.sessions", []).filter((y) => y.id !== x.id)); buildSessList(); };
      acts.append(rv, del);
    }
    if (x.repeat) {  // a Repeat sitting (current or past): run it again with the same setup
      const again = document.createElement("button"); again.textContent = t("Repeat again");
      again.onclick = () => repeatAgain(x.repeat);
      acts.prepend(again);
    }
    list.appendChild(d);
  }
}
async function startReview(x) {  // that session's colours back on the mushaf, until "Back to now"
  closeOverlays(); if (running) stopAll(); leaveSessions(); if (inPanel()) setSection(false); else { document.body.classList.add("reading"); $("m-read").setAttribute("aria-pressed", true); }
  reviewing = x; paintAll();
  $("reviewtext").textContent = t("Reviewing {x}", { x: `${sessLabel(x)} · ${sessRange(x)}` });
  $("reviewbar").classList.add("show");
  const first = [...x.verses].map((v) => v.split(":").map(Number)).sort((p, q) => p[0] - q[0] || p[1] - q[1])[0];
  if (first) { const v = await (await fetch(`/verse/${first[0]}/${Math.max(1, first[1])}`)).json(); goPage(v.page); }
}
function exitReview() {
  if (!reviewing) return;
  try { revSrc?.stop(); } catch (e) {}
  reviewing = null; $("reviewbar").classList.remove("show"); paintAll();
}
$("reviewexit").onclick = exitReview;
let revAudio = null, revSrc = null;
async function reviewAudio() {
  if (!reviewing || !reviewing.samples) return null;
  if (!revAudio || revAudio.sid !== reviewing.id) {
    await ensureCtx(); const x = await AUD.load(reviewing.id);
    const b = ctx.createBuffer(1, Math.max(1, x.length), SR); b.getChannelData(0).set(x);
    revAudio = { sid: reviewing.id, buf: b };
  }
  return revAudio.buf;
}
function playBuf(buf, from, dur) {
  try { revSrc?.stop(); } catch (e) {}
  const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
  revSrc = src; src.start(0, Math.max(0, from), dur > 0 ? dur : undefined);
}
async function playMyWord(m) {  // from where the word before it was judged, to where this one was
  const buf = await reviewAudio(); if (!buf) return;
  const at = reviewing.at || {}, k = `${m.sura}:${m.aya}:${m.word}`;
  const here = at[k]; if (here == null) return;
  const prev = Object.values(at).filter((v) => v < here).reduce((a2, v) => Math.max(a2, v), here - 1.6 * SR);
  const from = Math.max(0, prev / SR - 0.45), to = here / SR - 0.15;
  playBuf(buf, from, Math.max(0.4, to - from));
}
$("mine").onclick = () => { if (sheetMsg) playMyWord(sheetMsg).catch(() => {}); };
$("reviewplay").onclick = async () => { const b = await reviewAudio(); if (b) playBuf(b, 0); };
$("reviewprac").onclick = () => {  // the verses that had red or amber words, in order, as a practise queue
  if (!reviewing) return;
  const vs = [...new Set(Object.entries(reviewing.words).filter(([, v]) => v !== "ok").map(([k]) => k.split(":").slice(0, 2).join(":")))]
    .map((v) => v.split(":").map(Number)).filter(([, a]) => a > 0).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (!vs.length) { toast(t("Nothing to practise — Mā shāʾ Allāh")); return; }
  exitReview(); setSection(true, true); P.queue = vs; P.qi = 0; loadVerse(...vs[0]);
  toast(t("{n} verses to practise", { n: vs.length }));
};
let insessions = false;
function openSessions() {  // Sessions is a page of its own, like Practise and Repeat
  $("menu").classList.remove("show"); hideSheet();
  if (inPanel()) setSection(false);  // leaves Practise or Repeat
  insessions = true; document.body.classList.add("insessions"); document.body.classList.remove("reading");
  $("readopts").hidden = true; $("readopts-btn").setAttribute("aria-expanded", false);
  for (const id of ["m-read", "m-prac", "m-rep"]) $(id).setAttribute("aria-pressed", false);
  $("m-sess").setAttribute("aria-pressed", true);
  buildSessList(); scrollTo(0, 0);
}
function leaveSessions() {
  if (!insessions) return;
  insessions = false; document.body.classList.remove("insessions"); $("m-sess").setAttribute("aria-pressed", false);
}
$("m-sess").onclick = () => { if (!insessions) openSessions(); };
// every saved session (and its recording) on this device; the one in progress stays
$("delall").onclick = async () => {
  const hist = store.get("suwayhib.sessions", []);
  if (!hist.length) { toast(t("No saved sessions to delete.")); return; }
  if (!(await ask(t("Delete all {n} saved sessions? This can't be undone.", { n: hist.length })))) return;
  for (const x of hist) AUD.drop(x.id);
  store.set("suwayhib.sessions", []); buildSessList();
  toast(t("All saved sessions deleted."));
};
$("endsess").onclick = () => {
  if (running) stopAll();
  hideSheet(); archiveSession(); send({ type: "reset" }); verse = null;
  toast(t("Session saved. The next one starts fresh."));
  buildSessList();
};
// opening the app long after the last session: that one is finished, and the page starts clean
if (SES && Date.now() - SES.last > IDLE_MS) { archiveSession(); clearColours(); }

// ---------- Read options: a fold-out strip under the header ----------
$("readopts-btn").onclick = () => {
  const open = $("readopts").hidden; $("readopts").hidden = !open; $("readopts-btn").setAttribute("aria-expanded", open);
  if (paged) setTimeout(refitAll, 0);  // the page area changed height
};

// ---------- menu ----------
$("more").onclick = (e) => { e.stopPropagation(); $("menu").classList.toggle("show"); };
addEventListener("click", (e) => { if (!e.target?.closest?.("#menu")) $("menu").classList.remove("show"); });
$("reset").onclick = async () => {
  $("menu").classList.remove("show");
  if (!(await ask("Clear all colours and saved progress on this device?"))) return;
  send({ type: "reset" }); hideSheet(); verse = null;
  document.querySelectorAll(".w").forEach((x) => x.classList.remove("ok", "err", "slight", "cur"));
  root().querySelectorAll(".v.current").forEach((x) => x.classList.remove("current"));
  document.querySelectorAll(".num.done").forEach((x) => x.classList.remove("done"));
  for (const k in flagged) delete flagged[k];
  for (const k in marks) delete marks[k];
  store.del("suwayhib.marks"); store.del("suwayhib.flagged"); store.del("suwayhib.pos");
  $("where").textContent = "";
};
