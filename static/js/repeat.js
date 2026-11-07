// Repeat: recite a range of verses again and again, for memorising and revising.
//   Loop:    the whole range, N times.
//   Cascade: each verse A times, then everything so far B times, building up:
//            v1 ×A, v2 ×A, v1–2 ×B, v3 ×A, v1–3 ×B, …
// Recite only (Listen stays in the word sheet). The counts are typed in and remembered.

const R = {
  s: store.get("suwayhib.rsura", 67), from: store.get("suwayhib.rfrom", 1), to: store.get("suwayhib.rto", 5),
  mode: store.get("suwayhib.rmode", "loop"),
  rounds: store.get("suwayhib.rrounds", 5), per: store.get("suwayhib.rper", 5), joint: store.get("suwayhib.rjoint", 5),
  plan: [], step: 0, count: 0, on: false, words: {},  // words: "a" -> that verse's written words
};

// ---------- the plan: a list of stretches, each recited some number of times ----------
function buildPlan() {
  if (R.mode === "loop") return [{ a: R.from, b: R.to, times: R.rounds }];
  const plan = [];
  for (let v = R.from; v <= R.to; v++) {
    plan.push({ a: v, b: v, times: R.per });
    if (v > R.from) plan.push({ a: R.from, b: v, times: R.joint });
  }
  return plan;
}
const seg = () => R.plan[R.step];
function segLabel(g) { return g.a === g.b ? t("Verse {a}", { a: g.a }) : t("Verses {a}–{b}", { a: g.a, b: g.b }); }

// ---------- the controls ----------
function surahAyat(s) { return (SURAHS.find((x) => x.sura === s) || { ayat: 286 }).ayat; }
function fillSurahs() {
  if (!SURAHS.length) { setTimeout(fillSurahs, 300); return; }
  $("rsura").innerHTML = SURAHS.map((x) => `<option value="${x.sura}"${x.sura === R.s ? " selected" : ""}>${x.sura}. ${x.name}</option>`).join("");
  clampRange();
}
function clampRange() {
  const n = surahAyat(R.s);
  R.from = Math.min(Math.max(1, R.from | 0), n); R.to = Math.min(Math.max(R.from, R.to | 0), n);
  $("rfrom").value = R.from; $("rto").value = R.to; $("rfrom").max = $("rto").max = n;
  $("rref").textContent = t("Verses {a}–{b} of {n}", { a: R.from, b: R.to, n });
  $("rname").textContent = `سورة ${(SURAHS.find((x) => x.sura === R.s) || {}).name || ""}`;
  store.set("suwayhib.rsura", R.s); store.set("suwayhib.rfrom", R.from); store.set("suwayhib.rto", R.to);
  if (!R.on) showSeg({ a: R.from, b: R.to });
}
function setMode(m) {
  R.mode = m; store.set("suwayhib.rmode", m);
  $("rm-loop").setAttribute("aria-pressed", m === "loop"); $("rm-casc").setAttribute("aria-pressed", m === "cascade");
  $("rloopc").hidden = m !== "loop"; $("rcascc").hidden = m !== "cascade";
  $("rcap").textContent = t(m === "loop" ? "Recite the whole range again and again." :
    "Each verse on its own, then everything so far together, one verse more each time.");
}
function counter(id, key) {  // a typed-in count, remembered
  $(id).value = R[key];
  $(id).onchange = () => { R[key] = Math.min(99, Math.max(1, $(id).value | 0)); $(id).value = R[key]; store.set(`suwayhib.r${key}`, R[key]); };
}
$("rsura").onchange = () => { R.s = +$("rsura").value; R.from = 1; R.to = Math.min(5, surahAyat(R.s)); clampRange(); };
$("rfrom").onchange = () => { R.from = +$("rfrom").value; if (R.to < R.from) R.to = R.from; clampRange(); };
$("rto").onchange = () => { R.to = +$("rto").value; if (R.to < R.from) R.from = R.to; clampRange(); };
$("rm-loop").onclick = () => setMode("loop");
$("rm-casc").onclick = () => setMode("cascade");
counter("rrounds", "rounds"); counter("rper", "per"); counter("rjoint", "joint");
document.querySelectorAll("#repeat .stepper [data-for]").forEach((b) => {  // − / + beside each number
  b.onclick = () => { const el = $(b.dataset.for); el.value = (+el.value || 0) + +b.dataset.d; el.onchange(); };
});
document.addEventListener("langchange", () => { setMode(R.mode); clampRange(); });
$("rtext").onclick = () => {
  const on = $("rverse").classList.toggle("hidetext"); $("rtext").setAttribute("aria-pressed", on);
  const lab = $("rtext").querySelector("span"); lab.dataset.i18n = on ? "Show text" : "Hide text"; lab.textContent = t(lab.dataset.i18n);
};

// ---------- the verses being recited ----------
async function versesOf(a, b) {
  for (let v = a; v <= b; v++) if (!R.words[`${R.s}:${v}`]) R.words[`${R.s}:${v}`] = (await (await fetch(`/verse/${R.s}/${v}`)).json()).words;
}
async function showSeg(g) {
  const s = R.s; await versesOf(g.a, g.b);
  if (s !== R.s) return;
  const q = $("rverse"); q.innerHTML = "";
  for (let v = g.a; v <= g.b; v++) {
    const vs = document.createElement("span"); vs.className = "v"; vs.dataset.s = s; vs.dataset.a = v;
    R.words[`${s}:${v}`].forEach((w, i) => {
      const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w;
      sp.dataset.s = s; sp.dataset.a = v; sp.dataset.w = i;
      vs.appendChild(sp); vs.appendChild(document.createTextNode(" "));
    });
    const n = document.createElement("span"); n.className = "num"; n.textContent = `﴿${v.toLocaleString("ar-EG")}﴾`;
    vs.appendChild(n); vs.appendChild(document.createTextNode(" "));
    q.appendChild(vs);
  }
}
function rstep(x, good) { $("rstep").textContent = x; $("rstep").classList.toggle("good", !!good); }
function progress() {
  const g = seg();
  rstep(t("{what} · {i} of {n}", { what: segLabel(g), i: R.count + 1, n: g.times }) +
        (R.plan.length > 1 ? ` · ${t("step {i} of {n}", { i: R.step + 1, n: R.plan.length })}` : ""));
}

// ---------- running ----------
async function beginPass() {
  const g = seg();
  await showSeg(g);
  for (const k in flagged) { const [s, a] = k.split(":").map(Number); if (s === R.s && a >= g.a && a <= g.b) delete flagged[k]; }
  send({ type: "start_at", sura: R.s, aya: g.a, word: 0 });
  setVerse(R.s, g.a); setCursor(R.s, g.a, 0);
  progress();
}
async function startRepeat() {
  clampRange();
  R.plan = buildPlan(); R.step = 0; R.count = 0; R.on = true; setRunning(true);
  $("rtally").innerHTML = "";
  $("rstart").hidden = true; $("rrun").hidden = false; $("rstop").hidden = false;
  ensureSession();
  // the session remembers this setup, so it can be repeated again from Sessions
  SES.repeat = { s: R.s, from: R.from, to: R.to, mode: R.mode, rounds: R.rounds, per: R.per, joint: R.joint }; saveSession();
  await beginPass();
  if (!running) startMic().catch((e) => rstep(t("Microphone: {x}", { x: e.message })));
}
// the setup (surah, verses, mode, counts) folds away while it runs; the title sums it up
const SETUP = ["rsura", "rfrom", "rto", "rm-loop", "rrounds", "rper"].map((id) => $(id).closest(".optrow"))
  .concat([$("rcap"), $("rcascc")]);
SETUP.forEach((el) => el.classList.add("rsetup"));
function setRunning(on) {
  $("repeat").classList.toggle("running", on);
  if (on) {
    const counts = R.mode === "loop" ? `${t("Loop")} · ${R.rounds}×` : `${t("Cascade")} · ${R.per}× / ${R.joint}×`;
    $("rref").textContent = `${t("Verses {a}–{b}", { a: R.from, b: R.to })} · ${counts}`;
  } else clampRange();
}
function stopRepeat(msg, good) {
  setRunning(false);
  R.on = false; stopAll(); send({ type: "reset" });
  $("rstart").hidden = false; $("rstop").hidden = true; $("rrun").hidden = !$("rtally").children.length;
  rstep(msg ? t(msg) : "", good);
}
$("rstart").onclick = () => startRepeat();
$("rstop").onclick = () => stopRepeat("Stopped.");
// start over, at any time: stop, clear this run's colours and tally, back to the first pass
$("rreset").onclick = () => {
  stopRepeat(); $("rtally").innerHTML = ""; $("rrun").hidden = true;
  for (const k in flagged) { const [s] = k.split(":").map(Number); if (s === R.s) delete flagged[k]; }
  showSeg({ a: R.from, b: R.to }); rstep(t("Choose the verses, then Start."));
};

// one pass of the current stretch is done: note how it went, then the next pass or stretch
function passDone() {
  const g = seg(), q = $("rverse");
  const red = q.querySelectorAll(".w.err").length, amber = q.querySelectorAll(".w.slight").length;
  const li = document.createElement("li");
  li.textContent = `${segLabel(g)} · ${R.count + 1}/${g.times}: ` +
    (red || amber ? [red && t("{n} to check", { n: red }), amber && t("{n} tajweed", { n: amber })].filter(Boolean).join(", ") : t("clean"));
  li.className = red ? "err" : amber ? "slight" : "ok";
  $("rtally").prepend(li);
  R.count++;
  if (R.count >= g.times) { R.step++; R.count = 0; }
  if (R.step >= R.plan.length) { stopRepeat("All done.", true); return; }
  if (R.count === 0) toast(t("Next: {what}", { what: segLabel(seg()) }));
  beginPass();
}
// from follow.js: tracker messages while repeating
function repeatOwns(m) { const g = seg(); return R.on && g && m.sura === R.s && m.aya >= g.a && m.aya <= g.b; }
function repeatVerseDone(m) {
  if (!repeatOwns(m)) return;
  vsel(m.sura, m.aya)?.querySelector(".num")?.classList.add("done");
  if (m.aya === seg().b) passDone();
}
function repeatLost() {
  if (!R.on) return;
  toast(t("Lost your place — this pass starts again"));
  beginPass();
}

// ---------- the tab ----------
function setRepeat(on) {
  leaveSessions();
  if (on === repeating) return;
  if (on && practising) setSection(false);
  repeating = on;
  document.body.classList.toggle("repeating", on); document.body.classList.toggle("reading", !on);
  if (on) { $("readopts").hidden = true; $("readopts-btn").setAttribute("aria-expanded", false); }
  $("m-rep").setAttribute("aria-pressed", on);
  if (on) { $("m-read").setAttribute("aria-pressed", false); $("m-prac").setAttribute("aria-pressed", false); }
  R.on = false; $("repeat").classList.remove("running");
  $("rstart").hidden = false; $("rstop").hidden = true; $("rrun").hidden = !$("rtally").children.length;
  stopAll(); hideSheet(); send({ type: "reset" }); verse = null;
  if (on) { rstep(t("Choose the verses, then Start.")); clampRange(); }
  else { $("m-read").setAttribute("aria-pressed", true); refitAll(); goPage(store.get("suwayhib.pos", null)?.page || 1); }
}
$("m-rep").onclick = () => setRepeat(true);
// from Sessions: the same range, mode and counts, ready to start
function repeatAgain(cfg) {
  setRepeat(true);
  Object.assign(R, { s: cfg.s, from: cfg.from, to: cfg.to, rounds: cfg.rounds, per: cfg.per, joint: cfg.joint });
  for (const k of ["rounds", "per", "joint"]) { $(`r${k}`).value = R[k]; store.set(`suwayhib.r${k}`, R[k]); }
  $("rsura").value = R.s; setMode(cfg.mode); clampRange();
  rstep(t("Same verses and counts as before. Press Start."));
}
// one tap on a coloured word: hear and see it; double tap any word: carry on from there
let rtapT = null;
$("repeat").addEventListener("click", (e) => {
  const el = e.target.closest(".w.err, .w.slight"); if (!el) return;
  clearTimeout(rtapT);
  rtapT = setTimeout(() => { const m = flagged[`${el.dataset.s}:${el.dataset.a}:${el.dataset.w}`]; if (m) showSheet(m, el); }, 280);
});
$("repeat").addEventListener("dblclick", (e) => {
  const el = e.target.closest(".w"); if (!el) return;
  clearTimeout(rtapT); hideSheet();
  repeatFrom(+el.dataset.a, +el.dataset.w);
});
// Carry on the current pass from a word (the pass count stays): its colours from there on
// are cleared and the tracker starts there. Not running yet: start, then jump there.
async function repeatFrom(a, w) {
  if (!R.on) {
    await startRepeat();
    // the first stretch that contains this verse (cascade: its single-verse stretch)
    const i = R.plan.findIndex((g) => a >= g.a && a <= g.b);
    if (i > 0) { R.step = i; await beginPass(); }
  }
  const g = seg(); if (!g || a < g.a || a > g.b) return;
  $("rverse").querySelectorAll(".w").forEach((x) => {
    const xa = +x.dataset.a, xw = +x.dataset.w;
    if (xa > a || (xa === a && xw >= w)) {
      x.classList.remove("ok", "err", "slight", "cur"); delete flagged[`${R.s}:${xa}:${xw}`];
      if (xw === 0) vsel(R.s, xa)?.querySelector(".num")?.classList.remove("done");
    }
  });
  send({ type: "start_at", sura: R.s, aya: a, word: w });
  setVerse(R.s, a); setCursor(R.s, a, w);
  toast("Listening — recite from here");
}
setMode(R.mode); fillSurahs();
