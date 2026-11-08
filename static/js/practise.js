// Practise: one verse, listen N times, then recite it.

// ---------- Practise: one verse, listen N times, then recite it ----------
const MAX_TRIES = 3;  // after three tries: "practise this one with your teacher"
const P = { s: 1, a: 1, ayat: 7, reps: store.get("suwayhib.reps", 3), done: false, playing: null,
            rec: store.get("suwayhib.reciter", "Husary_64kbps"), tries: 0, take: [], run: 0 };
fetch("/reciters").then((r) => r.json()).then((l) => {
  $("preciter").innerHTML = l.map((x) => `<option value="${x.id}"${x.id === P.rec ? " selected" : ""}>${x.name}</option>`).join("");
});
$("preciter").onchange = (e) => { P.rec = e.target.value; store.set("suwayhib.reciter", P.rec); };
$("ptext").onclick = () => {
  const on = $("pverse").classList.toggle("hidetext"); $("ptext").setAttribute("aria-pressed", on);
  const lab = $("ptext").querySelector("span"); lab.dataset.i18n = on ? "Show text" : "Hide text"; lab.textContent = t(lab.dataset.i18n);
};
function renderTries() {
  $("ptries").innerHTML = Array.from({ length: MAX_TRIES }, (_, i) => `<i class="${i < P.tries ? "used" : ""}"></i>`).join("");
}
let readPage = null;  // where the learner was in Read, to come back to
function setSection(prac, verseGiven) {
  leaveSessions();
  if (typeof lStop === "function" && L.on) lStop();  // the listening cascade (listen.js)
  if (repeating) { repeating = false; R.on = false; $("repeat").classList.remove("running"); document.body.classList.remove("repeating"); $("m-rep").setAttribute("aria-pressed", false); }
  if (prac && !practising) readPage = currentPage();
  practising = prac;
  document.body.classList.toggle("practising", prac); document.body.classList.toggle("reading", !prac);
  if (prac) { $("readopts").hidden = true; $("readopts-btn").setAttribute("aria-expanded", false); }
  $("m-read").setAttribute("aria-pressed", !prac); $("m-prac").setAttribute("aria-pressed", prac); $("m-sess").setAttribute("aria-pressed", false);
  P.run++; P.queue = null;  // stop practise audio/replays; a queue is set again by "Practise these"
  stopAll(); stopRef(); hideSheet(); send({ type: "reset" }); if (typeof sendStrict === "function") sendStrict();
  if (prac) {
    if (!verseGiven) {
      const pos = store.get("suwayhib.pos", null);
      const [s, a] = verse || (pos ? [pos.s, pos.a] : [1, 1]);
      loadVerse(s, Math.max(1, a));
    }
  } else {
    clearTimeout(endT); endT = setTimeout(autoEnd, IDLE_MS); verse = null;
    refitAll(); goPage(readPage || store.get("suwayhib.pos", null)?.page || 1);
    status("Ready — tap 🎙 and recite");
  }
}
$("m-read").onclick = () => { if (practising || repeating || insessions) setSection(false); };
$("m-prac").onclick = () => { if (!practising) setSection(true); };
async function loadVerse(s, a) {
  stopAll(); stopRef();
  const v = await (await fetch(`/verse/${s}/${a}`)).json();
  P.run++;  // anything still playing for the old verse stops
  Object.assign(P, { s, a, ayat: v.ayat, done: false, tries: 0, take: [] });
  if (P.queue) $("pref").dataset.q = `${P.qi + 1}/${P.queue.length}`;
  renderTries(); $("pturn").disabled = false; $("pstart").disabled = false;
  $("pname").textContent = `سورة ${v.sura_name}`;
  $("pref").textContent = t("Verse {a} of {n}", { a, n: v.ayat }) + (P.queue ? ` · ${P.qi + 1}/${P.queue.length}` : "");
  const q = $("pverse"); q.innerHTML = "";
  const vs = document.createElement("span"); vs.className = "v current"; vs.dataset.s = s; vs.dataset.a = a;
  v.words.forEach((w, i) => {
    const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w;
    sp.dataset.s = s; sp.dataset.a = a; sp.dataset.w = i;
    vs.appendChild(sp); vs.appendChild(document.createTextNode(" "));
  });
  q.appendChild(vs);
  $("pdots").innerHTML = v.words.map(() => "<i></i>").join("");
  verse = [s, a];
  pstep(NOREF ? "Recite the verse when you're ready." : "Listen to the reciter, then it's your turn.");
}
function pstep(x, good) { $("pstep").textContent = t(x); $("pstep").classList.toggle("good", !!good); }
$("preps").textContent = P.reps;
$("pminus").onclick = () => { P.reps = Math.max(1, P.reps - 1); $("preps").textContent = P.reps; store.set("suwayhib.reps", P.reps); };
$("pplus").onclick = () => { P.reps = Math.min(5, P.reps + 1); $("preps").textContent = P.reps; store.set("suwayhib.reps", P.reps); };
$("pprev").onclick = () => { if (P.a > 1) loadVerse(P.s, P.a - 1); else if (P.s > 1) fetch(`/verse/${P.s - 1}/1`).then((r) => r.json()).then((v) => loadVerse(P.s - 1, v.ayat)); };
$("pnext").onclick = () => {
  if (P.queue && P.qi < P.queue.length - 1) { P.qi++; loadVerse(...P.queue[P.qi]); return; }
  if (P.queue) { P.queue = null; toast(t("Mā shāʾ Allāh — that was the last one")); return; }
  if (P.a < P.ayat) loadVerse(P.s, P.a + 1); else if (P.s < 114) loadVerse(P.s + 1, 1);
};
async function refVerse(s, a) {  // the chosen reciter's verse audio and word timings
  await ensureCtx();
  const t = await (await fetch(`/timing/${s}/${a}?rec=${encodeURIComponent(P.rec)}`)).json();
  const key = `${t.reciter}/${t.stem}`;
  refAudio[key] ||= fetch(`/ref/${key}`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).catch((e) => { delete refAudio[key]; throw e; });
  return { buf: await refAudio[key], words: t.words };
}
function playSlice(buf, from, dur) {  // one stretch of an audio buffer; the mic is paused meanwhile
  return new Promise((res) => {
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    P.playing = src; muteSend = true;
    src.onended = () => { P.playing = null; res(); };
    src.start(0, Math.max(0, from), Math.max(0.05, dur));
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function stopRef() { if (P.playing) { try { P.playing.stop(); } catch (e) {} P.playing = null; } muteSend = false; }
async function listenTimes(n) {  // the reference reciter, n times, with a short pause between
  stopAll(); stopRef(); const run = ++P.run;
  await ensureCtx(); await ctx.resume();
  const { buf } = await refVerse(P.s, P.a);
  for (let i = 1; i <= n; i++) {
    if (run !== P.run) break;
    pstep(n > 1 ? t("Listening {i} of {n}…", { i, n }) : "Listening…");
    await new Promise((res) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
      P.playing = src; muteSend = true; src.onended = res; src.start();
    });
    P.playing = null;
    if (i < n) await new Promise((r) => setTimeout(r, 700));
  }
  if (run === P.run) muteSend = false;
  return run === P.run;
}
async function practiceWrongVerse() {
  if (P.done) return;
  P.done = true; stopAll();
  const run = P.run;
  P.tries++; renderTries();
  pstep(NOREF ? "That sounds like a different verse." : "That sounds like a different verse. Listen again.");
  await wait(400);
  if (!NOREF && !(await listenTimes(1))) return;
  pstep(P.tries >= MAX_TRIES ? "Practise this one with your teacher." : "Now recite this verse.");
  if (P.tries >= MAX_TRIES) { $("pturn").disabled = true; $("pstart").disabled = true; }
}
// stopped before the end: some words still unheard and a few quiet seconds (the "not finished" case)
setInterval(() => {
  if (!practising || P.done || !running || !P.lastWordAt) return;
  const left = $("pverse").querySelectorAll(".w:not(.ok):not(.err):not(.slight)").length;
  if (left && Date.now() - P.lastWordAt > 6000 && level < 0.08) practiceDone("unfinished");
}, 500);
function myTurn() {
  stopRef(); P.run++;  // whatever was still playing or replaying for this verse stops here
  root().querySelectorAll(".w").forEach((x) => x.classList.remove("ok", "err", "slight", "cur"));
  for (const k in flagged) if (k.startsWith(`${P.s}:${P.a}:`)) delete flagged[k];
  if (P.tries >= MAX_TRIES) return;
  P.done = false; P.take = []; P.lastWordAt = 0;  // set by the first judged word, not before
  [...$("pdots").children].forEach((d) => (d.className = ""));
  send({ type: "start_at", sura: P.s, aya: P.a, word: 0 });
  setCursor(P.s, P.a, 0);
  pstep("Your turn — recite the verse");
  if (!running) startMic().catch((e) => pstep(t("Microphone: {x}", { x: e.message })));
}
async function practiceDone(why) {
  if (P.done) return;
  P.done = true; stopAll();
  const run = P.run;
  P.tries++; renderTries();
  root().querySelectorAll(".w.cur").forEach((x) => x.classList.remove("cur"));
  const flaggedEls = [...root().querySelectorAll(".w.err, .w.slight")];  // verse order
  const missed = flaggedEls.some((el) => flagged[`${el.dataset.s}:${el.dataset.a}:${el.dataset.w}`]?.missing);
  if (why === "unfinished") {
    pstep("It sounds like the verse was not finished.");
  } else if (!flaggedEls.length) {
    pstep("Mā shāʾ Allāh. Recite it again, or move on.", true);
  } else if (NOREF) {
    pstep(missed ? "It sounds like a word was missed. Tap the coloured words to see them." :
          "Tap the coloured words to see them, then recite the verse again.");
  } else {
    pstep(missed ? "It sounds like a word was missed. Listen to this part." :
          flaggedEls.length > 1 ? "Listen to these parts." : "Listen to this part.");
    await wait(900);
    await replayWords(flaggedEls.map((el) => +el.dataset.w), run);
    if (run !== P.run) return;
    pstep("Now recite the whole verse again.");
  }
  if (P.tries >= MAX_TRIES) {
    pstep(flaggedEls.length ? "Practise this one with your teacher." : "Mā shāʾ Allāh. Move on when you're ready.", !flaggedEls.length);
    $("pturn").disabled = true; $("pstart").disabled = true;
    $("pover").hidden = false;
  }
  $("pstart").textContent = t(NOREF ? "Try again" : "Try again: listen, then recite");
}
// Where a word is in the learner's take: the reciter's word timings stretched over the
// stretch of the take that has speech in it (a rough map; padded so the word sounds whole).
function learnerSpan(take, refWords, w) {
  const n = take.length, x = new Float32Array(n * 1600);
  take.forEach((c, i) => x.set(c, i * 1600));
  const fr = 320, e = [];  // 20 ms frames
  for (let i = 0; i + fr <= x.length; i += fr) { let s = 0; for (let j = i; j < i + fr; j++) s += x[j] * x[j]; e.push(Math.sqrt(s / fr)); }
  const top = Math.max(...e, 1e-6), on = e.map((v) => v > 0.12 * top);
  const first = on.indexOf(true), last = on.lastIndexOf(true);
  const ls = Math.max(0, first) * 0.02, le = Math.max(first + 1, last + 1) * 0.02;
  const known = refWords.filter(Boolean);
  if (!known.length || !refWords[w]) return { x, from: ls, dur: le - ls };
  const rs = known[0][0] / 1000, re = known[known.length - 1][1] / 1000;
  const k = (le - ls) / Math.max(0.1, re - rs);
  const a = ls + (refWords[w][0] / 1000 - rs) * k, b = ls + (refWords[w][1] / 1000 - rs) * k;
  return { x, from: a - 0.15, dur: b - a + 0.3 };
}
async function replayWords(idxs, run) {
  try { await replayWordsInner(idxs, run); } finally { if (run === P.run) muteSend = false; }
}
async function replayWordsInner(idxs, run) {
  await ensureCtx(); await ctx.resume();
  const { buf, words } = await refVerse(P.s, P.a);
  const mine = learnerSpan(P.take, words, 0);
  const take = ctx.createBuffer(1, mine.x.length, SR); take.getChannelData(0).set(mine.x);
  await wait(450);
  for (const w of idxs) {
    if (run !== P.run) return;
    const sp = learnerSpan(P.take, words, w);
    const cur = wsel(P.s, P.a, w); cur?.classList.add("cur");
    await playSlice(take, sp.from, sp.dur);            // the learner's own word first...
    await wait(400); if (run !== P.run) return;
    if (words[w]) {                                     // ...then the reciter's, twice: it stays in the ear
      const [t0, t1] = words[w];
      await playSlice(buf, t0 / 1000 - 0.08, (t1 - t0) / 1000 + 0.16);
      await wait(280); if (run !== P.run) return;
      await playSlice(buf, t0 / 1000 - 0.08, (t1 - t0) / 1000 + 0.16);
    }
    cur?.classList.remove("cur");
    await wait(450);
  }
  muteSend = false;
}
$("plisten").onclick = () => listenTimes(1).then((ok) => { if (ok) pstep("Tap My turn when ready."); });
$("pturn").onclick = myTurn;
$("pstart").onclick = async () => { if (NOREF || await listenTimes(P.reps)) myTurn(); };
$("pnext2").onclick = () => $("pnext").onclick();
$("pover").onclick = () => { $("pover").hidden = true; loadVerse(P.s, P.a); };
$("practice").addEventListener("click", (e) => {  // tap a coloured word: hear and see it
  const el = e.target.closest(".w.err, .w.slight"); if (!el) return;
  const m = flagged[`${el.dataset.s}:${el.dataset.a}:${el.dataset.w}`]; if (m) showSheet(m);
});
