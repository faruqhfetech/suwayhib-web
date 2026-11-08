// Listening cascade (in Practise): the reciter plays a range, the way Repeat has you recite it.
//   Loop:    the whole range, N times.
//   Cascade: each verse A times, then everything so far B times: v1 ×A, v2 ×A, v1–2 ×B, v3 ×A, …
// The verse being played is marked and its words follow the reciter (the word timings).
// All verses of the range are fetched before it starts, so a cascade never waits on the
// network, and plays offline after (they show in Downloads).

const L = {
  s: store.get("suwayhib.lsura", 67), from: store.get("suwayhib.lfrom", 1), to: store.get("suwayhib.lto", 5),
  mode: store.get("suwayhib.lmode", "cascade"),
  rounds: store.get("suwayhib.lrounds", 3), per: store.get("suwayhib.lper", 3), joint: store.get("suwayhib.ljoint", 2),
  gap: store.get("suwayhib.lgap", 1),
  plan: [], step: 0, count: 0, on: false, paused: false, run: 0, src: null, words: {}, skip: false,
};

function lPlan() {
  if (L.mode === "loop") return [{ a: L.from, b: L.to, times: L.rounds }];
  const plan = [];
  for (let v = L.from; v <= L.to; v++) {
    plan.push({ a: v, b: v, times: L.per });
    if (v > L.from) plan.push({ a: L.from, b: v, times: L.joint });
  }
  return plan;
}

// ---------- which of Practise's two ways ----------
function setPracMode(m, first = false) {
  if (m === "cascade" && NOREF) m = "one";  // it needs the reciters' audio
  store.set("suwayhib.pmode", m);
  $("pm-one").setAttribute("aria-pressed", m === "one"); $("pm-casc").setAttribute("aria-pressed", m === "cascade");
  $("plr").hidden = m !== "one"; $("lcas").hidden = m !== "cascade";
  if (first) return;  // at load: just show the remembered mode (audio.js, with stopAll, is not loaded yet)
  if (m === "cascade") { stopAll(); stopRef(); P.run++; send({ type: "reset" }); lClamp(); }
  else lStop();
}
$("pm-one").onclick = () => setPracMode("one");
$("pm-casc").onclick = () => setPracMode("cascade");
if (NOREF) $("pm-casc").disabled = true;

// ---------- the controls ----------
function lFillSurahs() {
  if (!SURAHS.length) { setTimeout(lFillSurahs, 300); return; }
  $("lsura").innerHTML = SURAHS.map((x) => `<option value="${x.sura}"${x.sura === L.s ? " selected" : ""}>${x.sura}. ${x.name}</option>`).join("");
  lClamp();
}
function lClamp() {
  const n = surahAyat(L.s);
  L.from = Math.min(Math.max(1, L.from | 0), n); L.to = Math.min(Math.max(L.from, L.to | 0), n);
  $("lfrom").value = L.from; $("lto").value = L.to; $("lfrom").max = $("lto").max = n;
  $("lname").textContent = `سورة ${(SURAHS.find((x) => x.sura === L.s) || {}).name || ""}`;
  store.set("suwayhib.lsura", L.s); store.set("suwayhib.lfrom", L.from); store.set("suwayhib.lto", L.to);
  if (!L.on) {
    $("lref").textContent = t("Verses {a}–{b} of {n}", { a: L.from, b: L.to, n });
    lShow({ a: L.from, b: L.to });
  }
}
function lSetMode(m) {
  L.mode = m; store.set("suwayhib.lmode", m);
  $("lm-loop").setAttribute("aria-pressed", m === "loop"); $("lm-casc").setAttribute("aria-pressed", m === "cascade");
  $("lloopc").hidden = m !== "loop"; $("lcascc").hidden = m !== "cascade";
  $("lcap").textContent = t(m === "loop" ? "Hear the whole range again and again." :
    "Hear each verse on its own, then everything so far together, one verse more each time.");
}
function lCounter(id, key, lo, hi) {  // a typed-in count, remembered
  $(id).value = L[key];
  $(id).onchange = () => { L[key] = Math.min(hi, Math.max(lo, $(id).value | 0)); $(id).value = L[key]; store.set(`suwayhib.l${key}`, L[key]); };
}
$("lsura").onchange = () => { L.s = +$("lsura").value; L.from = 1; L.to = Math.min(5, surahAyat(L.s)); lClamp(); };
$("lfrom").onchange = () => { L.from = +$("lfrom").value; if (L.to < L.from) L.to = L.from; lClamp(); };
$("lto").onchange = () => { L.to = +$("lto").value; if (L.to < L.from) L.from = L.to; lClamp(); };
$("lm-loop").onclick = () => lSetMode("loop");
$("lm-casc").onclick = () => lSetMode("cascade");
lCounter("lrounds", "rounds", 1, 99); lCounter("lper", "per", 1, 99); lCounter("ljoint", "joint", 1, 99); lCounter("lgap", "gap", 0, 5);
document.querySelectorAll("#lcas .stepper [data-for]").forEach((b) => {
  b.onclick = () => { const el = $(b.dataset.for); el.value = (+el.value || 0) + +b.dataset.d; el.onchange(); };
});
$("ltext").onclick = () => {
  const on = $("lverse").classList.toggle("hidetext"); $("ltext").setAttribute("aria-pressed", on);
  const lab = $("ltext").querySelector("span"); lab.dataset.i18n = on ? "Show text" : "Hide text"; lab.textContent = t(lab.dataset.i18n);
};
document.addEventListener("langchange", () => { lSetMode(L.mode); lClamp(); });

// ---------- the verses on the card ----------
async function lShow(g) {
  const s = L.s;
  for (let v = g.a; v <= g.b; v++) if (!L.words[`${s}:${v}`]) L.words[`${s}:${v}`] = (await (await fetch(`/verse/${s}/${v}`)).json()).words;
  if (s !== L.s) return;
  const q = $("lverse"); q.innerHTML = "";
  for (let v = g.a; v <= g.b; v++) {
    const vs = document.createElement("span"); vs.className = "v"; vs.dataset.a = v;
    L.words[`${s}:${v}`].forEach((w, i) => {
      const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w; sp.dataset.w = i;
      vs.appendChild(sp); vs.appendChild(document.createTextNode(" "));
    });
    const n = document.createElement("span"); n.className = "num"; n.textContent = `﴿${v.toLocaleString("ar-EG")}﴾`;
    vs.appendChild(n); vs.appendChild(document.createTextNode(" "));
    q.appendChild(vs);
  }
}
function lstep(x, good) { $("lstep").textContent = x; $("lstep").classList.toggle("good", !!good); }
const lLabel = (g) => g.a === g.b ? t("Verse {a}", { a: g.a }) : t("Verses {a}–{b}", { a: g.a, b: g.b });

// ---------- playing ----------
// waits on the audio clock, so a pause (ctx.suspend) pauses the gaps too
async function lWait(sec, run) {
  const end = ctx.currentTime + sec;
  while (run === L.run && !L.skip && ctx.currentTime < end) await wait(80);
}
// one verse, its words marked as the reciter reaches them; resolves when it ends or is stopped
function lPlayVerse(a, ref, run) {
  return new Promise((res) => {
    const vs = $("lverse").querySelector(`.v[data-a="${a}"]`);
    $("lverse").querySelectorAll(".v.current").forEach((x) => x.classList.remove("current"));
    vs?.classList.add("current");
    const ws = vs ? [...vs.querySelectorAll(".w")] : [];
    const src = ctx.createBufferSource(); src.buffer = ref.buf; src.connect(ctx.destination);
    L.src = src; muteSend = true;
    const t0 = ctx.currentTime;
    let last = -1, done = false;
    const tick = () => {
      if (done) return;
      const ms = (ctx.currentTime - t0) * 1000;
      let w = -1;
      for (let i = 0; i < ref.words.length; i++) if (ref.words[i] && ref.words[i][0] <= ms) w = i;
      if (w !== last) { ws[last]?.classList.remove("cur"); ws[w]?.classList.add("cur"); last = w; }
      requestAnimationFrame(tick);
    };
    src.onended = () => {
      done = true; ws[last]?.classList.remove("cur"); vs?.classList.add("played");
      if (L.src === src) L.src = null;
      res();
    };
    src.start(); tick();
  });
}
async function lRun() {
  const run = ++L.run;
  while (run === L.run && L.step < L.plan.length) {
    const g = L.plan[L.step];
    if (L.count === 0 || $("lverse").dataset.seg !== `${g.a}-${g.b}`) { await lShow(g); $("lverse").dataset.seg = `${g.a}-${g.b}`; }
    if (run !== L.run) return;
    $("lverse").querySelectorAll(".v.played").forEach((x) => x.classList.remove("played"));
    lstep(t("{what} · {i} of {n}", { what: lLabel(g), i: L.count + 1, n: g.times }) +
          (L.plan.length > 1 ? ` · ${t("step {i} of {n}", { i: L.step + 1, n: L.plan.length })}` : ""));
    for (let v = g.a; v <= g.b && run === L.run && !L.skip; v++) {
      const ref = await refVerse(L.s, v);
      if (run !== L.run || L.skip) break;
      await lPlayVerse(v, ref, run);
      if (v < g.b) await lWait(0.35, run);  // a breath between verses of one stretch
    }
    if (run !== L.run) return;
    if (L.skip) { L.skip = false; L.step++; L.count = 0; continue; }
    L.count++;
    if (L.count >= g.times) { L.step++; L.count = 0; }
    if (L.step < L.plan.length) await lWait(L.gap, run);
    L.skip = false;
  }
  if (run === L.run) { lStop(); lstep(t("All done."), true); }
}
async function lStart() {
  lClamp();
  L.plan = lPlan(); L.step = 0; L.count = 0; L.on = true; L.paused = false; L.skip = false;
  stopAll(); stopRef(); P.run++;
  $("lcas").classList.add("running");
  $("lstart").hidden = true; $("lrun").hidden = false; lPauseLabel();
  const counts = L.mode === "loop" ? `${t("Loop")} · ${L.rounds}×` : `${t("Cascade")} · ${L.per}× / ${L.joint}×`;
  $("lref").textContent = `${t("Verses {a}–{b}", { a: L.from, b: L.to })} · ${counts}`;
  const run = L.run;
  try {
    await ensureCtx(); await ctx.resume();
    // every verse of the range first: a cascade plays the early ones many times
    for (let v = L.from; v <= L.to; v++) {
      lstep(t("Getting the recitation… {i} of {n}", { i: v - L.from + 1, n: L.to - L.from + 1 }));
      await refVerse(L.s, v);
      if (run !== L.run || !L.on) return;
    }
  } catch (e) { lStop(); lstep(t("Could not get the recitation. Check the connection.")); return; }
  lRun();
}
function lStop() {
  L.run++; L.on = false; L.paused = false;
  if (L.src) { try { L.src.stop(); } catch (e) {} L.src = null; }
  if (typeof ctx !== "undefined" && ctx && ctx.state === "suspended") ctx.resume();
  muteSend = false;
  $("lcas").classList.remove("running");
  $("lstart").hidden = false; $("lrun").hidden = true;
  $("lverse").querySelectorAll(".w.cur").forEach((x) => x.classList.remove("cur"));
  if (typeof surahAyat === "function" && SURAHS.length) $("lref").textContent = t("Verses {a}–{b} of {n}", { a: L.from, b: L.to, n: surahAyat(L.s) });
}
function lPauseLabel() {
  $("lpause").querySelector("use").setAttribute("href", L.paused ? "#i-play" : "#i-pause");
  const lab = $("lpause").querySelector("span"); lab.dataset.i18n = L.paused ? "Resume" : "Pause"; lab.textContent = t(lab.dataset.i18n);
}
$("lstart").onclick = () => lStart();
$("lpause").onclick = async () => {
  if (!L.on) return;
  L.paused = !L.paused;
  if (L.paused) await ctx.suspend(); else await ctx.resume();
  lPauseLabel();
};
$("lskip").onclick = () => {
  if (!L.on) return;
  L.skip = true;
  if (L.src) { try { L.src.stop(); } catch (e) {} }
  if (L.paused) { L.paused = false; ctx.resume(); lPauseLabel(); }
};
$("lreset").onclick = () => { lStop(); lClamp(); lstep(t("Choose the verses, then Start listening.")); };

lSetMode(L.mode); lFillSurahs();
setPracMode(store.get("suwayhib.pmode", "one"), true);
