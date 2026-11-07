// Audio in: microphone or file -> 16 kHz float32 chunks of 100 ms. Runs last.

// ---------- audio: mic or file -> 16 kHz float32 chunks of 100 ms ----------
const WORKLET = `
class Down extends AudioWorkletProcessor {
  constructor(o) { super(); this.ratio = sampleRate / ${SR}; this.acc = []; this.pos = 0; this.prev = 0; this.n = ${SR / 10}; }
  process(inputs) {
    const ch = inputs[0][0]; if (!ch) return true;
    // linear-interpolation resample to 16 kHz; position -1 is the previous block's last sample
    while (this.pos < ch.length - 1) {
      const i = Math.floor(this.pos), f = this.pos - i;
      const a = i < 0 ? this.prev : ch[i];
      this.acc.push(a * (1 - f) + ch[i + 1] * f); this.pos += this.ratio;
    }
    this.pos -= ch.length; this.prev = ch[ch.length - 1];
    while (this.acc.length >= this.n) { this.port.postMessage(new Float32Array(this.acc.splice(0, this.n))); }
    return true;
  }
}
registerProcessor("down", Down);`;

let level = 0;  // shown as the ring around the mic button, so you can see it hears you
let ctxReady = null;
function ensureCtx() { return (ctxReady ||= setupCtx()); }
async function setupCtx() {
  ctx = new AudioContext();
  await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" })));
  node = new AudioWorkletNode(ctx, "down");
  node.port.onmessage = (e) => {
    const x = e.data; let s = 0; for (let i = 0; i < x.length; i += 4) s += x[i] * x[i];
    level = Math.max(Math.min(1, Math.sqrt(s / (x.length / 4)) * 8), level * 0.8);
    $("mic").style.setProperty("--lvl", level.toFixed(2));
    if (practising && running && !muteSend && !P.done) P.take.push(x);  // this attempt only, in memory
    if (running && !muteSend) AUD.push(x);  // the session's recording (if saving is on)
    if (running && !muteSend && ws.readyState === 1) ws.send(x.buffer);
  };
}
function micOn(on) {
  $("mic").classList.toggle("on", on); $("mic").querySelector("use").setAttribute("href", on ? "#i-stop" : "#i-mic");
  $("mic").setAttribute("aria-label", t(on ? "Stop" : "Start reciting"));
  if (!on) $("mic").style.setProperty("--lvl", 0);
}
let starting = false, cancelStart = false;
async function startMic() {
  if (running || starting) return;
  starting = true; cancelStart = false;
  try {
    clearTimeout(endT);
    ensureSession();
    await ensureCtx(); await ctx.resume();
    const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
    if (cancelStart) { st.getTracks().forEach((x) => x.stop()); return; }  // stopped while asking
    stream = st; srcNode = ctx.createMediaStreamSource(stream); srcNode.connect(node);
    running = true; micOn(true); $("micdenied").hidden = true;
    if (!verse) status("Listening… start anywhere");
  } catch (e) {
    if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) $("micdenied").hidden = false;
    throw e;
  } finally { starting = false; }
}
let endT = null;
function autoEnd() {  // the mic has been off a while: save the sitting and start the next one clean
  if (running || inPanel() || reviewing || !SES || !Object.keys(SES.words).length) return;
  archiveSession(); clearColours(); send({ type: "reset" }); verse = null;
  toast(t("Session saved. The next one starts fresh."));
}
function stopAll() {
  if (starting) cancelStart = true;
  running = false;
  clearTimeout(endT); if (!inPanel()) endT = setTimeout(autoEnd, IDLE_MS);
  srcNode?.disconnect(); stream?.getTracks().forEach((t) => t.stop()); fileSrc?.stop(); fileSrc = null;
  micOn(false);
}
$("mic").onclick = () => (running ? stopAll() : startMic().catch((e) => status(t("Microphone: {x}", { x: e.message }))));

async function playBuffers(bufs, label) {
  stopAll(); ensureSession(); await ensureCtx(); await ctx.resume();
  const gap = Math.round(0.6 * ctx.sampleRate);
  const len = bufs.reduce((n, b) => n + b.length + gap, 0);
  const out = ctx.createBuffer(1, len, ctx.sampleRate);
  let off = 0;
  for (const b of bufs) { out.getChannelData(0).set(b.getChannelData(0), off); off += b.length + gap; }
  fileSrc = ctx.createBufferSource(); fileSrc.buffer = out;
  fileSrc.connect(node); fileSrc.connect(ctx.destination);  // you hear it while it is followed
  fileSrc.onended = () => { if (fileSrc) stopAll(); };
  running = true; micOn(true); status(t("Playing {x}…", { x: label }));
  fileSrc.start();
}
$("file").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  $("menu").classList.remove("show"); await ensureCtx();
  await playBuffers([await ctx.decodeAudioData(await f.arrayBuffer())], f.name); e.target.value = "";
};

// demo mode: ?demo=Alafasy_128kbps/103001,103002,testset/000208_103003_word_substitution
const demo = new URLSearchParams(location.search).get("demo");
if (demo && DEV) {  // developer tool: only with ?dev=1
  let src = "";
  const items = demo.split(",").map((it) => { if (it.includes("/")) [src, it] = it.split("/"); return [src, it]; });
  const b = document.createElement("button"); b.id = "demobtn"; b.className = "ghost";
  b.innerHTML = `<svg class="i"><use href="#i-play"/></svg><span>Play demo (${items.length})</span>`;
  b.onclick = async () => {
    $("menu").classList.remove("show"); await ensureCtx();
    const bufs = [];
    for (const [s, n] of items) bufs.push(await ctx.decodeAudioData(await (await fetch(s === "testset" ? `/clip/${n}` : `/ref/${s}/${n}`)).arrayBuffer()));
    await playBuffers(bufs, "demo");
  };
  $("demoslot").replaceWith(b);
}
