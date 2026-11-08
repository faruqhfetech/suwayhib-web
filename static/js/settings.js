// Memorise mode, pace, language, theme and the first-run guide.

// ---------- memorise (hifz) mode, and pace ----------
let hifz = store.get("suwayhib.hifz", "off");
function setHifz(m) {
  hifz = m; store.set("suwayhib.hifz", m);
  for (const c of ["first", "ends", "hide"]) document.body.classList.toggle(`hz-${c}`, m === c);
  for (const v of ["off", "first", "ends", "hide"]) $(`hz-${v}`).setAttribute("aria-pressed", m === v);
  const CAP = { off: "The whole text is shown.", first: "Only each verse's first word is shown; the rest appears as you recite. Tap a word to peek.",
                ends: "Each verse's first and last words are shown; the rest appears as you recite. Tap a word to peek.",
                hide: "The text is hidden and appears as you recite. Tap a word to peek." };
  $("hzcap").textContent = t(CAP[m]);
}
setHifz(hifz);
for (const v of ["off", "first", "ends", "hide"]) $(`hz-${v}`).onclick = () => setHifz(v);
function peek(el) {  // a hidden word, tapped: show it for a moment
  el.classList.add("peek"); clearTimeout(el._pk); el._pk = setTimeout(() => el.classList.remove("peek"), 1800);
}
let strictOn = store.get("suwayhib.strict", true);
$("strict").checked = strictOn;
// Practise has its own tries and replays, so strict order applies to Read and Repeat only
function sendStrict() { send({ type: "strict", on: strictOn && !practising }); }
$("strict").onchange = (e) => { strictOn = e.target.checked; store.set("suwayhib.strict", strictOn); sendStrict(); };
let pace = store.get("suwayhib.pace", "any");
$("pace").value = pace;
$("pace").onchange = (e) => { pace = e.target.value; store.set("suwayhib.pace", pace); send({ type: "pace", pace }); };

// ---------- language ----------
function langButtons() {
  return `<div class="pctl">${[["en", "English"], ["ha", "Hausa"], ["ar", "العربية"]].map(([c, n]) =>
    `<button class="${c === LANG ? "primary" : ""}" onclick="setLang('${c}')">${n}</button>`).join("")}</div>`;
}
$("lang").value = LANG;
$("lang").onchange = (e) => setLang(e.target.value);
document.addEventListener("langchange", () => {
  $("lang").value = LANG; showPgNum(); setHifz(hifz);
  document.querySelectorAll(".page .pn").forEach((x) => (x.textContent = t("Page {n}", { n: x.closest(".page").dataset.p })));
  if ($("guidebox").classList.contains("show")) showStep();
  status(lastStatus);
  if (practising && P.s) $("pref").textContent = t("Verse {a} of {n}", { a: P.a, n: P.ayat }) + (P.queue ? ` · ${P.qi + 1}/${P.queue.length}` : "");
  if (!$("vstep").hidden && vsura) showVerseStep(vsura, +$("vnum").value);
  if (pickTab === "juz") buildJuzList();
  $("pstart").textContent = t(NOREF ? (P.tries ? "Try again" : "Start") : P.tries ? "Try again: listen, then recite" : "Start: listen, then recite");
  micOn(running);
});
applyLang();
document.body.classList.toggle("reading", !practising && !repeating);
$("pstart").textContent = t(NOREF ? "Start" : "Start: listen, then recite");
pstep(NOREF ? "Recite the verse when you're ready." : "Listen to the reciter, then it's your turn.");

// ---------- light / dark ----------
function applyTheme(t) { if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); }
applyTheme(store.get("suwayhib.theme", null));
$("theme").onclick = () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const t = dark ? "light" : "dark"; applyTheme(t); store.set("suwayhib.theme", t);
};

// ---------- first-run guide ----------
const STEPS = [
  { icon: "mic", title: "Tap the mic and recite", text: "Start anywhere in the Qur'an. The page opens where you are and follows you." },
  { icon: "book", title: "Double-tap a word", text: "Start, or pick up again, from exactly that word. The mic comes on by itself. Tap a verse number ﴿ ﴾ to practise that verse." },
  { icon: "eye", title: "What the colours mean", text: "Tap a coloured word to see it and hear it read correctly.",
    extra: () => `<div class="swatches legend"><span class="lg-ok">${t("correct")}</span><span class="lg-cur">${t("you are here")}</span><span class="lg-slight">${t("tajweed detail")}</span><span class="lg-err">${t("check this word")}</span></div>` +
      `<p class="gnote">${t("The colours come from an automatic check and can be wrong. Suwayhib does not replace a qualified teacher.")}</p>` },
];
let step = 0;
function showStep() {
  const s = STEPS[step];
  $("gicon").innerHTML = `<svg class="i"><use href="#i-${s.icon}"/></svg>`; $("gtitle").textContent = t(s.title); $("gtext").textContent = t(s.text);
  $("gextra").innerHTML = (typeof s.extra === "function" ? s.extra() : s.extra) || "";
  if (step === 0) $("gextra").innerHTML = langButtons();  // the language can be chosen right at the start
  $("gdots").innerHTML = STEPS.map((_, i) => `<i class="${i === step ? "on" : ""}"></i>`).join("");
  $("gnext").textContent = t(step === STEPS.length - 1 ? "Start" : "Next");
}
function openGuide() { step = 0; showStep(); $("guidebox").classList.add("show"); }
function doneGuide() { closeOverlays(); store.set("suwayhib.guided", true); }
$("gnext").onclick = () => { if (step < STEPS.length - 1) { step++; showStep(); } else doneGuide(); };
$("gskip").onclick = doneGuide;
$("help").onclick = () => { $("menu").classList.remove("show"); openGuide(); };
if (!store.get("suwayhib.guided", false)) openGuide();
