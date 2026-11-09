// A live voice call with Krishna. The microphone is streamed to Gemini Live with a short-lived token from our server;
// Krishna's voice comes back as audio. Each minute after the free one is charged from the wallet as it begins.

const IN_RATE = 16000, OUT_RATE = 24000;
// Playback speed. 1 is natural. Below 1 slows the voice but also makes it artificially deep, so it is left at 1.
const PLAY_RATE = 1;
const WORKLET = `class Cap extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/16000;this.inp=[];this.pos=0;this.out=[]}process(i){const c=i[0]&&i[0][0];if(!c)return true;for(let n=0;n<c.length;n++)this.inp.push(c[n]);while(this.pos+1<this.inp.length){const k=Math.floor(this.pos),f=this.pos-k;this.out.push(this.inp[k]*(1-f)+this.inp[k+1]*f);this.pos+=this.r}const d=Math.floor(this.pos);if(d>0){this.inp=this.inp.slice(d);this.pos-=d}while(this.out.length>=1600){const a=new Int16Array(1600);for(let n=0;n<1600;n++){const v=Math.max(-1,Math.min(1,this.out[n]));a[n]=v<0?v*32768:v*32767}this.out=this.out.slice(1600);this.port.postMessage(a.buffer,[a.buffer])}return true}}registerProcessor("cap",Cap)`;

const b64 = (buf) => { let s = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };

export function initCall({ root, wallet, lang, track = () => {} }) {
  const $ = (id) => root.querySelector("#" + id);
  const panel = $("kr-call"), status = $("kc-status"), clock = $("kc-clock"), price = $("kc-price"), caps = $("kc-caps"), endBtn = $("kc-end"), startBtn = $("kc-start"), open = $("kr-callbtn");
  if (!panel || !open) return;
  let s = null; // the call in progress
  // Soft bansuri in the background, if the file public/audio/krishna-bansuri.mp3 exists. It gets quieter while Krishna speaks.
  let music = null;
  const MUSIC_LOW = 0.035, MUSIC_HIGH = 0.1;
  const startMusic = () => {
    try {
      const m = new Audio("/audio/krishna-bansuri.mp3"); m.loop = true; m.volume = MUSIC_HIGH; music = m;
      m.addEventListener("error", () => { if (music === m) music = null; });
      m.play().catch(() => { if (music === m) music = null; });
    } catch { music = null; }
  };
  const duck = (speaking) => { if (music) music.volume = speaking ? MUSIC_LOW : MUSIC_HIGH; };
  const stopMusic = () => { if (music) { const m = music; music = null; let v = m.volume; const t = setInterval(() => { v -= 0.02; if (v <= 0) { clearInterval(t); m.pause(); } else m.volume = v; }, 60); } };

  const inr = (p) => "₹" + (p / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const say = (t) => { status.textContent = t; };
  const show = (on) => { panel.hidden = !on; root.classList.toggle("on-call", on); };

  function priceNote() {
    const w = wallet();
    const p = w?.prices?.call;
    price.textContent = p ? `Your first minute each day is free. After that it is ${inr(p)} a minute from your wallet.` : "";
  }

  const caption = (who, text, replace) => {
    if (!text) return;
    let last = caps.lastElementChild;
    if (!last || last.dataset.who !== who || !replace) { last = document.createElement("p"); last.dataset.who = who; last.className = who === "me" ? "kc-me" : "kc-ai"; caps.appendChild(last); }
    last.textContent += text;
    while (caps.children.length > 6) caps.firstElementChild.remove();
    caps.scrollTop = caps.scrollHeight;
  };

  async function begin() {
    const w = wallet();
    if (!w) { say("Calling Krishna needs an account. Please log in."); return; }
    if (!w.loggedIn()) { w.prompt("login"); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.WebSocket || !(window.AudioContext || window.webkitAudioContext)) { say("Your browser cannot make calls. Please open this page in Chrome or Safari."); return; }
    startBtn.hidden = true; endBtn.hidden = false; caps.textContent = ""; say("Connecting…"); clock.textContent = "0:00";
    s = { ended: false, sources: new Set(), nextAt: 0, started: 0, timer: 0, ws: null, ctx: null, mic: null, minute: 1, callId: "" };
    // Phones only allow sound that is set up straight from the tap, so the audio parts are created here, before any waiting.
    const AC = window.AudioContext || window.webkitAudioContext;
    let stage = "start";
    try {
      stage = "audio";
      s.ctx = new AC(); s.out = new AC();
      s.ctx.resume?.(); s.out.resume?.();
      playUnlock(s.out);
      startMusic();
      stage = "microphone";
      s.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      stage = "server";
      const r = await fetch("/api/krishna/call/start", { method: "POST", headers: { "Content-Type": "application/json", ...(await w.headers()) }, body: JSON.stringify({ language: lang() }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401 || r.status === 402) { w.prompt(r.status === 401 ? "login" : "funds", j.needPaise); return finish(""); }
      if (!r.ok) throw new Error(j.error || "Krishna cannot take your call right now. Please try again.");
      if (j.balancePaise != null) w.setBalance(j.balancePaise);
      s.callId = j.callId; s.max = j.maxMinutes; s.free = j.free;
      stage = "sound";
      await openAudio();
      stage = "connection";
      await openSocket(j);
      track("krishna_call_start");
    } catch (e) {
      const denied = e?.name === "NotAllowedError" || e?.name === "SecurityError";
      const detail = ` [${stage}: ${e?.name || "error"}${e?.message ? " " + String(e.message).slice(0, 90) : ""}]`;
      finish(denied
        ? "Please allow the microphone to talk with Krishna. On iPhone: Settings, then Safari, then Microphone, then Allow. You were not charged."
        : ((e?.message && !/^(NotSupported|Invalid|Type|Reference|Range)/.test(e?.name || "") ? e.message : "The call did not connect. Please try again.") + detail));
    }
  }

  // A silent blip played during the tap, which switches sound on for phones.
  function playUnlock(ctx) { try { const b = ctx.createBuffer(1, 1, 22050), x = ctx.createBufferSource(); x.buffer = b; x.connect(ctx.destination); x.start(0); } catch { /* not needed */ } }

  async function openAudio() {
    const ctx = s.ctx;
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    await ctx.audioWorklet.addModule(url); URL.revokeObjectURL(url);
    s.node = new AudioWorkletNode(ctx, "cap");
    ctx.createMediaStreamSource(s.mic).connect(s.node);
    s.node.port.onmessage = (e) => {
      if (!s?.ws || s.ws.readyState !== 1 || !s.ready) return;
      s.ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64(e.data), mimeType: `audio/pcm;rate=${IN_RATE}` } } }));
    };
  }

  // The call goes through our own server (a one-use ticket), which talks to Google for us.
  async function openSocket(j) {
    const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${j.path || "/api/krishna/live"}?ticket=${encodeURIComponent(j.ticket)}`;
    await attempt(url, j.model);
  }

  function attempt(url, model) {
    return new Promise((ok, fail) => {
      const ws = new WebSocket(url);
      s.ws = ws; s.ready = false; let done = false;
      const bail = (m) => { if (!done) { done = true; clearTimeout(to); try { ws.close(); } catch { /* closed */ } fail(new Error(m)); } };
      const to = setTimeout(() => bail("It took too long to connect."), 12000);
      ws.onopen = () => ws.send(JSON.stringify({ setup: { model: model.startsWith("models/") ? model : "models/" + model } }));
      ws.onerror = () => setTimeout(() => bail("Please check your internet and try again. (no reply from the call service)"), 600); // wait a moment: the close message that follows says why
      ws.onclose = (ev) => { if (!done) bail(`(${ev.code}${ev.reason ? ": " + String(ev.reason).slice(0, 120) : ""})`); else if (s && !s.ended && s.ws === ws) finish("The call ended."); };
      ws.onmessage = async (ev) => {
        let m; try { m = JSON.parse(typeof ev.data === "string" ? ev.data : await ev.data.text()); } catch { return; }
        if (m.setupComplete && !done) {
          done = true; clearTimeout(to); s.ready = true; s.connected = true; s.started = Date.now();
          say("Krishna is joining…"); tick(); s.timer = setInterval(tick, 1000);
          ws.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text: "(कॉल जुड़ गया है। हिंदी में वत्स को स्नेह से आशीर्वाद दो और पूछो कि उनके मन में क्या है।)" }] }], turnComplete: true } }));
          ok();
        }
        const c = m.serverContent;
        if (!c) return;
        if (c.interrupted) stopPlayback();
        for (const p of c.modelTurn?.parts || []) if (p.inlineData?.data) play(p.inlineData.data);
        if (c.inputTranscription?.text) caption("me", c.inputTranscription.text, true);
        if (c.outputTranscription?.text) caption("ai", c.outputTranscription.text, true);
        if (c.turnComplete && s && !s.sources.size) say("Listening…");
      };
    });
  }

  function play(data) {
    const ctx = s.out; if (!ctx) return;
    const i16 = new Int16Array(unb64(data)), f = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f[i] = i16[i] / 0x8000;
    const buf = ctx.createBuffer(1, f.length, OUT_RATE); buf.copyToChannel(f, 0);
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = PLAY_RATE; src.connect(ctx.destination);
    const at = Math.max(ctx.currentTime + 0.02, s.nextAt); src.start(at); s.nextAt = at + buf.duration / PLAY_RATE;
    s.sources.add(src); say("Krishna is speaking"); duck(true);
    src.onended = () => { s?.sources.delete(src); if (s && !s.sources.size && !s.ended) { say("Listening…"); duck(false); } };
  }
  function stopPlayback() { if (!s) return; for (const x of s.sources) { try { x.stop(); } catch { /* ended */ } } s.sources.clear(); s.nextAt = 0; duck(false); }

  // The clock, and the charge for each new minute as it begins.
  async function tick() {
    if (!s || s.ended) return;
    const secs = Math.floor((Date.now() - s.started) / 1000);
    clock.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    if (secs >= s.minute * 60 && !s.charging) {
      s.charging = true;
      try {
        const w = wallet();
        const r = await fetch("/api/krishna/call/minute", { method: "POST", headers: { "Content-Type": "application/json", ...(await w.headers()) }, body: JSON.stringify({ callId: s.callId }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) { s.minute = j.minute; if (j.balancePaise != null) w.setBalance(j.balancePaise); }
        else if (r.status === 402) { if (j.balancePaise != null) w.setBalance(j.balancePaise); finish("Your wallet is empty, so the call has ended. Add money to keep talking with Krishna."); w.prompt("funds", j.needPaise); return; }
        else if (r.status === 409) return finish("This call has reached its longest time. You can call again any time.");
        else s.minute += 1; // a hiccup: try again next minute rather than cutting the call
      } catch { /* network blip: the next tick tries again */ } finally { if (s) s.charging = false; }
    }
  }

  function finish(message) {
    if (!s) { show(true); return; }
    const old = s; s = null; old.ended = true;
    clearInterval(old.timer); stopPlayback.call(null);
    for (const x of old.sources) { try { x.stop(); } catch { /* ended */ } }
    stopMusic();
    try { old.ws?.close(); } catch { /* closed */ }
    try { old.mic?.getTracks().forEach((t) => t.stop()); } catch { /* stopped */ }
    try { old.node?.disconnect(); old.ctx?.close(); old.out?.close(); } catch { /* closed */ }
    if (old.callId) { wallet()?.headers().then((h) => fetch("/api/krishna/call/end", { method: "POST", headers: { "Content-Type": "application/json", ...h }, body: JSON.stringify({ callId: old.callId, failed: !old.connected }) })).catch(() => {}); }
    startBtn.hidden = false; endBtn.hidden = true; startBtn.textContent = "Call again";
    say(message || "The call has ended. Thank you for talking with Krishna.");
    track("krishna_call_end", { minutes: old.minute });
  }

  open.addEventListener("click", () => { show(true); priceNote(); if (!s) say("Press Call to speak with Krishna."); });
  startBtn.addEventListener("click", begin);
  endBtn.addEventListener("click", () => finish(""));
  $("kc-close").addEventListener("click", () => { if (s) finish(""); show(false); });
  window.addEventListener("pagehide", () => { if (s) finish(""); });
  document.addEventListener("kk:balance", priceNote);
}
