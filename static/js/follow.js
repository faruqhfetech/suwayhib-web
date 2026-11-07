// Live follow-along: tracker messages, the word-details sheet, taps, the last page read.

// ---------- messages from the tracker ----------
function handle(m) {
  switch (m.type) {
    case "status": status(m.text); break;
    case "page": renderPage(m); if (!inPanel()) showPage(m.page); break;
    case "located": toast(t("Found you — {x}", { x: `${surahName(m.sura)} ${m.aya}` })); break;
    case "verse": if (practising && P.done) break; setVerse(m.sura, m.aya); setCursor(m.sura, m.basmala ? 0 : m.aya, m.word); status(`${surahName(m.sura)} ${m.aya}`); break;
    case "cursor": setCursor(m.sura, m.aya, m.word); break;
    case "word": {
      if (practising && (m.sura !== P.s || m.aya !== P.a)) break;  // a late message about another verse
      if (repeating && !repeatOwns(m)) break;
      const cls = m.status === "error" ? "err" : m.status === "slight" ? "slight" : "ok";
      for (const w of words(m)) {
        const el = wsel(m.sura, m.aya, w);
        if (el) { el.classList.remove("err", "slight", "ok", "cur"); el.classList.add(cls); }
        mark(m.sura, m.aya, w, m.status, m);
        if (practising) { const d = $("pdots").children[w]; if (d) d.className = cls; }
      }
      if (practising) P.lastWordAt = Date.now();
      for (const w of words(m)) {  // (a merged word: each of its written words)
        if (m.status !== "ok") flagged[`${m.sura}:${m.aya}:${w}`] = m;
        else delete flagged[`${m.sura}:${m.aya}:${w}`];  // fixed on a re-read
      }
      break;
    }
    case "back": {
      const cur = root().querySelector(".w.cur");
      const same = cur && cur.dataset.s == m.sura && cur.dataset.a == m.aya;
      if (same && (+cur.dataset.w < m.word || +cur.dataset.w - m.word <= 1)) { setCursor(m.sura, m.aya, m.word); break; }
      // went back: un-mark what is being re-recited, flash where it picks up again
      root().querySelectorAll(`.w[data-s="${m.sura}"][data-a="${m.aya}"]`).forEach((el) => {
        if (+el.dataset.w >= m.word) { el.classList.remove("ok", "err", "slight"); mark(m.sura, m.aya, +el.dataset.w, null); }
      });
      const el = wsel(m.sura, m.aya, m.word);
      if (el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
      setCursor(m.sura, m.aya, m.word); hideSheet(); break;
    }
    case "note": {
      if (m.kind === "tawbah_basmala") { toast("at-Tawbah is recited without the basmala"); break; }
      if (m.kind === "mixed_pace") { toast("Your madd lengths changed within this verse — try to keep one pace"); break; }
      const el = wsel(m.sura, m.aya, m.word);
      if (el && !el.querySelector(".rep")) { const d = document.createElement("span"); d.className = "rep"; d.title = "repeated"; el.appendChild(d); }
      break;
    }
    case "verse_done": {
      if (practising) { if (m.sura === P.s && m.aya === P.a) practiceDone(); break; }
      if (repeating) { repeatVerseDone(m); break; }
      const v = vsel(m.sura, m.aya), n = v?.querySelector(".num");
      if (n) n.classList.add("done");
      break;
    }
    case "lost":
      if (practising) { practiceWrongVerse(); break; }
      if (repeating) { repeatLost(); break; }
      root().querySelectorAll(".w.cur").forEach((e) => e.classList.remove("cur")); verse = null; break;
    case "lag": if (DEV) { $("lag").textContent = `${m.ms} ms`; setTimeout(() => ($("lag").textContent = ""), 2000); } break;
  }
}

// ---------- the sheet: what a red/amber word should be, and how it sounds ----------
let sheetMsg = null;
function showSheet(m, el) {
  sheetMsg = m;
  const r = el?.getBoundingClientRect();
  $("sheet").classList.toggle("top", !!r && r.top > innerHeight * 0.5);  // keep the word in view
  const slight = m.status === "slight";
  $("sheet").classList.toggle("slight", slight);
  const PACE = { hadr: "ḥadr", tadwir: "tadwīr", tahqiq: "taḥqīq" };
  $("sheettitle").textContent = m.offpace ? t("Read at {p} pace — you chose {q}", { p: PACE[m.style] || m.style, q: PACE[pace] || pace }) :
    t(slight ? "A tajweed detail to polish" : m.missing ? "This word was missed" : "Try this word again");
  $("sheetterm").textContent = slight ? "laḥn khafī" : "laḥn jalī";
  $("exp").textContent = m.expected || "";
  $("expph").textContent = m.expected_ph || ""; $("heard").textContent = m.heard || "—";
  $("sounds").classList.remove("show"); $("showsounds").textContent = t("Show sounds");
  $("sheetprac").hidden = inPanel();
  $("mine").hidden = !(reviewing && reviewing.samples && (reviewing.at || {})[`${m.sura}:${m.aya}:${m.word}`] != null);
  $("sheet").classList.add("show");
}
function hideSheet() { $("sheet").classList.remove("show"); }
$("sheetclose").onclick = hideSheet;
$("sheetstart").onclick = () => { const m = sheetMsg; hideSheet(); if (!m) return; if (reviewing) exitReview(); if (practising) myTurn(); else if (repeating) repeatFrom(m.aya, m.word); else startFrom(m.sura, m.aya, m.word); };
$("sheetprac").onclick = () => { const m = sheetMsg; hideSheet(); if (!m) return; if (reviewing) exitReview(); setSection(true, true); loadVerse(m.sura, Math.max(1, m.aya)); };
$("showsounds").onclick = () => {
  const on = $("sounds").classList.toggle("show");
  $("showsounds").textContent = t(on ? "Hide sounds" : "Show sounds");
};
// Listen: the reference reciter saying just this word (the whole verse if no timing is known).
// The mic is paused while it plays, so the tracker doesn't hear the speaker.
const refAudio = {};
async function playRefWord(s, a, w) {
  await ensureCtx(); await ctx.resume();
  const t = await (await fetch(`/timing/${s}/${a}${practising ? "?rec=" + encodeURIComponent(P.rec) : ""}`)).json();
  const key = `${t.reciter}/${t.stem}`;
  refAudio[key] ||= fetch(`/ref/${key}`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).catch((e) => { delete refAudio[key]; throw e; });
  const buf = await refAudio[key];
  const seg = t.words[w];
  const from = seg ? Math.max(0, seg[0] / 1000 - 0.08) : 0;
  const dur = seg ? (seg[1] - seg[0]) / 1000 + 0.16 : buf.duration;
  const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
  muteSend = true;
  src.onended = () => setTimeout(() => (muteSend = false), 300);
  src.start(0, from, dur);
}
$("listen").onclick = () => { if (sheetMsg) playRefWord(sheetMsg.sura, sheetMsg.aya, sheetMsg.word).catch((e) => toast(t("Couldn't play: {x}", { x: e.message }))); };

// ---------- taps: one tap on a coloured word = details; double tap any word = recite from it ----------
let tapT = null;
$("pages").addEventListener("click", (e) => {
  const num = e.target.closest?.(".num");
  if (num) {  // the verse number: practise this verse
    const v = num.closest(".v"); clearTimeout(tapT);
    tapT = setTimeout(() => { setSection(true, true); loadVerse(+v.dataset.s, +v.dataset.a); }, 280);
    return;
  }
  const el = e.target.closest?.(".w"); if (!el) return;
  const coloured = el.matches(".err, .slight");
  if (!coloured && hifz === "off") return;
  clearTimeout(tapT);
  tapT = setTimeout(() => {
    if (coloured) { const m = viewFlagged()[`${el.dataset.s}:${el.dataset.a}:${el.dataset.w}`]; if (m) showSheet(m, el); }
    else if (!el.matches(".ok")) peek(el);
  }, 280);
});
$("pages").addEventListener("dblclick", (e) => {
  const el = e.target.closest(".w"); if (!el) return;
  clearTimeout(tapT); hideSheet();
  startFrom(+el.dataset.s, +el.dataset.a, +el.dataset.w);
});
function startFrom(s, a, w) {
  ensureSession();
  // a fresh attempt from here: clear marks from this word on, in this verse
  document.querySelectorAll(`.w[data-s="${s}"][data-a="${a}"]`).forEach((x) => {
    if (+x.dataset.w >= w) { x.classList.remove("ok", "err", "slight"); mark(s, a, +x.dataset.w, null); delete flagged[`${s}:${a}:${x.dataset.w}`]; }
  });
  send({ type: "start_at", sura: s, aya: a, word: w });
  setVerse(s, a); setCursor(s, a, w);
  if (!running) startMic().then(() => toast("Listening — recite from here")).catch((err) => status(t("Microphone: {x}", { x: err.message })));
}

// ---------- open where you left off: the last page read ----------
function openLastPage() {
  const pos = store.get("suwayhib.pos", null);
  if (pos) goPage(pos.page || 1); else showPgNum();
  $("hint").hidden = !!pos || !!(SES || store.get("suwayhib.sessions", []).length);
}
