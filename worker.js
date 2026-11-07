// Suwayhib in the browser: everything the web server does, in a Web Worker.
//   - the phoneme model: Quran-Lab's streaming Zipformer, run by sherpa-onnx's WebAssembly
//     build (sherpa/, the model packed into its .data file by build.py)
//   - the follow-along engine: web/app's Python (Session, tracker, decoder, api) in Pyodide
// The page talks to it through bridge.js, which stands in for the server's WebSocket.
//
// page -> worker  {t: "audio", buf: Float32Array buffer (16 kHz mono, 100 ms)}
//                 {t: "cmd", json}          a text message the page would send the server
//                 {t: "req", id, path, query}  a data request (/page/12, /verse/2/255, ...)
// worker -> page  {t: "msgs", json}         JSON list of messages, as the server would send
//                 {t: "resp", id, body}     the answer to a request (null: not found)
//                 {t: "progress", text}     loading progress, before the engine is ready

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const SR = 16000;
const say = (text) => postMessage({ t: "progress", text });

// ---------- the model (sherpa-onnx, WebAssembly) ----------
// Its data file (our model + tokens) is stored in parts (build.py); join them, then hand the
// whole to sherpa's loader instead of letting it fetch one big file.
let rec = null, stream = null, emitted = 0;
async function fetchModel() {
  const { parts, size } = await (await fetch("sherpa/parts.json")).json();
  const data = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    const b = new Uint8Array(await (await fetch("sherpa/" + p)).arrayBuffer());
    data.set(b, at); at += b.length;
    say(`Downloading the recitation model… ${Math.round(100 * at / size)}%`);
  }
  if (at !== size) throw new Error("the model download was incomplete");
  return data.buffer;
}
const sherpaReady = fetchModel().then((buf) => new Promise((resolve, reject) => {
  self.Module = {
    locateFile: (p) => "sherpa/" + p,
    getPreloadedPackage: () => buf,
    onRuntimeInitialized: resolve,
    onAbort: reject,
  };
  importScripts("sherpa/sherpa-onnx-wasm-main-asr.js", "sherpa/sherpa-onnx-asr.js");
}));

function makeRecognizer() {
  return createOnlineRecognizer(self.Module, {
    featConfig: { sampleRate: SR, featureDim: 80 },
    modelConfig: {
      transducer: { encoder: "", decoder: "", joiner: "" },
      paraformer: { encoder: "", decoder: "" },
      zipformer2Ctc: { model: "./model.onnx" },
      nemoCtc: { model: "" }, toneCtc: { model: "" },
      tokens: "./tokens.txt", numThreads: 1, provider: "cpu", debug: 0,
      modelType: "", modelingUnit: "", bpeVocab: "",
    },
    decodingMethod: "greedy_search", maxActivePaths: 4,
    enableEndpoint: 0, rule1MinTrailingSilence: 2.4, rule2MinTrailingSilence: 1.2, rule3MinUtteranceLength: 20,
    hotwordsFile: "", hotwordsScore: 1.5, ctcFstDecoderConfig: { graph: "", maxActive: 3000 },
    ruleFsts: "", ruleFars: "",
  });
}
function drain(s) { while (rec.isReady(s)) rec.decode(s); }

// called from Python (zipformer_decoder's backend, in engine.py)
self.zfReset = () => { stream?.free(); stream = rec.createStream(); emitted = 0; };
// the live stream: newly emitted units [[time_s, unit], ...] as JSON
function zfAccept(x) {
  stream.acceptWaveform(SR, x);
  drain(stream);
  const r = rec.getResult(stream), out = [];
  for (let i = emitted; i < r.tokens.length; i++) out.push([r.timestamps[i], r.tokens[i]]);
  emitted = r.tokens.length;
  return JSON.stringify(out);
}
// a standalone clip (not part of the live stream): its phonemes
self.zfDecode = (bytes) => {
  const x = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const s = rec.createStream();
  try { s.acceptWaveform(SR, x); s.inputFinished(); drain(s); return rec.getResult(s).tokens.join(""); }
  finally { s.free(); }
};

// ---------- the engine (Pyodide) ----------
let engine = null;
async function startPython() {
  say("Loading Python…");
  importScripts(PYODIDE + "pyodide.js");
  const py = await loadPyodide({ indexURL: PYODIDE });
  await py.loadPackage(["numpy", "micropip", "attrs", "typing-extensions"]);
  say("Loading the follow-along engine…");
  const wheels = await (await fetch("py/wheels.json")).json();
  // the stand-ins in app.zip replace their dependencies (pydantic, Levenshtein): install without them
  const micropip = py.pyimport("micropip");
  await micropip.install.callKwargs(wheels.map((w) => new URL("py/" + w, self.location).href), { deps: false });
  py.unpackArchive(await (await fetch("py/app.zip")).arrayBuffer(), "zip", { extractDir: "/app" });
  py.runPython("import sys; sys.path.insert(0, '/app')");
  return py;
}

const ready = (async () => {
  try {
    const [py] = await Promise.all([startPython(), sherpaReady]);
    say("Starting…");
    rec = makeRecognizer();
    engine = py.pyimport("engine").create();
    postMessage({ t: "msgs", json: JSON.stringify([{ type: "status", text: "Ready. Start reciting anywhere." }]) });
    return py;
  } catch (e) {
    say(`Could not start: ${e.message || e}`);
    throw e;
  }
})();

// ---------- messages from the page, handled in order ----------
let queue = Promise.resolve();
onmessage = (ev) => { const m = ev.data; queue = queue.then(() => handle(m)).catch((e) => console.error(e)); };
async function handle(m) {
  await ready;
  if (m.t === "audio") {
    const x = new Float32Array(m.buf);
    const units = zfAccept(x);  // the model hears it first; the decoder picks the units up
    const out = engine.feed(x, units);
    if (out !== "[]") postMessage({ t: "msgs", json: out });
  } else if (m.t === "cmd") {
    const out = engine.command(m.json);
    if (out !== "[]") postMessage({ t: "msgs", json: out });
  } else if (m.t === "req") {
    const body = engine.request(m.path, m.query);
    postMessage({ t: "resp", id: m.id, body: body || null });
  }
}
