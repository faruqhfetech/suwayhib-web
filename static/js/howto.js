// "How to use Suwayhib": a short manual in the ⋯ menu, one section per feature.
// Every line is an i18n key (English is the key itself), so it follows the chosen language.

const HOWTO = [
  ["Start reciting", "i-mic", [
    "Tap the microphone and recite from anywhere in the Qur'an. Suwayhib finds the verse within a few seconds and opens its page.",
    "Or double-tap any word to start exactly there.",
    "Tap the microphone again to stop. A session is saved 15 seconds after you stop.",
  ]],
  ["What the colours mean", "i-eye", [
    "Green: said correctly.",
    "Red: a clear mistake. A dashed red line means the word was skipped.",
    "Amber: a tajweed detail to polish, such as the length of a madd.",
    "Light green: recited before Suwayhib found your place.",
    "Tap a red or amber word to see what was expected and what was heard, and to hear the reciter say it.",
  ]],
  ["Pausing and going back", "i-pause", [
    "Pause whenever you need to, and go back as you would with a teacher, even into the previous verse. Suwayhib follows you, and a word you fix turns green.",
    "If you skip a verse, Suwayhib marks it and offers to take you back.",
  ]],
  ["Strict order", "i-stop", [
    "When it is on, a skipped or wrong word pulses, and you are asked to go back to it before carrying on.",
    "After three tries it lets you move on, and leaves the word for your teacher.",
    "Turn it off in ⋯ → Strict order.",
  ]],
  ["Reading options", "i-sliders", [
    "The sliders button at the top: Pages (one page at a time, swipe to turn) or Scroll.",
    "Memorise: show only the first word, the first and last words, or hide the text. Tap a hidden word to peek.",
    "To clear all colours, hold the microphone for 3 seconds.",
  ]],
  ["Practise", "i-practise", [
    "Listen and repeat: the reciter plays one verse a few times, then it is your turn. Mistakes are played back so you can hear the difference.",
    "Listening cascade: the reciter plays a range of verses, each verse on its own and then everything so far together.",
  ]],
  ["Repeat", "i-repeat", [
    "Recite a range of verses again and again, for memorising and revision.",
    "Loop repeats the whole range. Cascade builds it up: each verse, then everything so far.",
    "Double-tap a word to carry on from there. Start over at any time.",
  ]],
  ["Sessions", "i-history", [
    "Every sitting is saved on this device, with its colours and, if you allow it, your recording.",
    "Review a session to see your mistakes, hear yourself, or practise the verses you found hard. Repeat sessions can be repeated again.",
  ]],
  ["Pace and language", "i-theme", [
    "⋯ → Pace: any valid pace (default), or practise one of ḥadr, tadwīr or taḥqīq.",
    "⋯ → Language: English, Hausa or Arabic. ⋯ → Light / dark.",
  ]],
  ["Downloads and offline use", "i-download", [
    "In the phone app and on the website, a reciter's verse is kept on your device the first time it plays. ⋯ → Downloads shows what is kept, and lets you delete it.",
    "On the website, everything works offline after the first visit. You can also install it as an app.",
  ]],
  ["Good to know", "i-help", [
    "The colours come from an automatic check and can be wrong. Suwayhib does not replace a qualified teacher.",
    "Everything runs on your device. Nothing you recite is sent anywhere.",
  ]],
];

function buildHowto() {
  const box = $("howtolist");
  box.innerHTML = "";
  HOWTO.forEach(([title, icon, lines], i) => {
    const d = document.createElement("details");
    d.className = "howto";
    if (i === 0) d.open = true;
    d.innerHTML = `<summary><svg class="i"><use href="#${icon}"/></svg><span>${t(title)}</span></summary>` +
      `<ul>${lines.map((x) => `<li>${t(x)}</li>`).join("")}</ul>`;
    box.appendChild(d);
  });
}
$("howtobtn").onclick = () => { $("menu").classList.remove("show"); buildHowto(); $("howtobox").classList.add("show"); };
$("howtoclose").onclick = closeOverlays;
document.addEventListener("langchange", () => { if ($("howtobox").classList.contains("show")) buildHowto(); });
