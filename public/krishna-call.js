// A live voice call with Krishna. The microphone is streamed to Gemini Live with a short-lived token from our server;
// Krishna's voice comes back as audio. Each minute after the free one is charged from the wallet as it begins.

const IN_RATE = 16000, OUT_RATE = 24000;
// Krishna's voice is played a little slower, which also makes it deeper and calmer. 1 is normal; 0.85 is slower still.
const PLAY_RATE = 0.9;
const WORKLET = `class Cap extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor("cap",Cap)`;

const b64 = (buf) => { let s = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };

export function initCall({ root, wallet, lang, track = () => {} }) {
  const $ = (id) => root.querySelector("#" + id);
  const panel = $("kr-call"), status = $("kc-status"), clock = $("kc-clock"), price = $("kc-price"), caps = $("kc-caps"), endBtn = $("kc-end"), startBtn = $("kc-start"), open = $("kr-callbtn");
  if (!panel || !open) return;
  let s = null; // the call in progress
  // Soft bansuri in the background, if the file public/audio/krishna-bansuri.mp3 exists. It gets quieter while Krishna speaks.
  let music = null;
  const MUSIC_LOW = 0.05, MUSIC_HIGH = 0.14;
  const startMusic = async () => {
    try {
      const head = await fetch("/audio/krishna-bansuri.mp3", { method: "HEAD" });
      if (!head.ok) return;
      music = new Audio("/audio/krishna-bansuri.mp3"); music.loop = true; music.volume = MUSIC_HIGH;
      await music.play();
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
    if (!navigator.mediaDevices?.getUserMedia || !window.WebSocket || !window.AudioContext) { say("Your browser cannot make calls. Please open this page in Chrome or Safari."); return; }
    startBtn.hidden = true; endBtn.hidden = false; caps.textContent = ""; say("Connecting…"); clock.textContent = "0:00";
    s = { ended: false, sources: new Set(), nextAt: 0, started: 0, timer: 0, ws: null, ctx: null, mic: null, minute: 1, callId: "" };
    try {
      const r = await fetch("/api/krishna/call/start", { method: "POST", headers: { "Content-Type": "application/json", ...(await w.headers()) }, body: JSON.stringify({ language: lang() }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401 || r.status === 402) { w.prompt(r.status === 401 ? "login" : "funds", j.needPaise); return finish(""); }
      if (!r.ok) throw new Error(j.error || "Krishna cannot take your call right now. Please try again.");
      if (j.balancePaise != null) w.setBalance(j.balancePaise);
      s.callId = j.callId; s.max = j.maxMinutes; s.free = j.free;
      await openAudio(); await openSocket(j.token, j.model); startMusic();
      track("krishna_call_start");
    } catch (e) {
      const m = e?.name === "NotAllowedError" ? "Please allow the microphone to talk with Krishna. You were not charged for a call you could not make." : (e.message || "The call did not connect. Please try again.");
      finish(m);
    }
  }

  async function openAudio() {
    const ctx = new AudioContext({ sampleRate: IN_RATE });
    await ctx.resume();
    const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    s.ctx = ctx; s.mic = mic;
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    await ctx.audioWorklet.addModule(url); URL.revokeObjectURL(url);
    s.node = new AudioWorkletNode(ctx, "cap");
    ctx.createMediaStreamSource(mic).connect(s.node);
    s.out = new AudioContext({ sampleRate: OUT_RATE });
    s.node.port.onmessage = (e) => {
      if (!s?.ws || s.ws.readyState !== 1 || !s.ready) return;
      const f = e.data, pcm = new Int16Array(f.length);
      for (let i = 0; i < f.length; i++) { const v = Math.max(-1, Math.min(1, f[i])); pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff; }
      s.ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64(pcm.buffer), mimeType: `audio/pcm;rate=${IN_RATE}` } } }));
    };
  }

  function openSocket(token, model) {
    return new Promise((ok, fail) => {
      const ws = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`);
      s.ws = ws; let done = false;
      const bail = (m) => { if (!done) { done = true; fail(new Error(m)); } };
      const to = setTimeout(() => bail("The call did not connect. You were charged only if your minute began. Please try again."), 15000);
      ws.onopen = () => ws.send(JSON.stringify({ setup: { model: model.startsWith("models/") ? model : "models/" + model } }));
      ws.onerror = () => bail("The call did not connect. Please check your internet and try again.");
      ws.onclose = () => { clearTimeout(to); if (!done) bail("The call did not connect."); else if (s && !s.ended) finish("The call ended."); };
      ws.onmessage = async (ev) => {
        let m; try { m = JSON.parse(typeof ev.data === "string" ? ev.data : await ev.data.text()); } catch { return; }
        if (m.setupComplete && !done) {
          done = true; clearTimeout(to); s.ready = true; s.started = Date.now();
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
        if (c.turnComplete) { if (s) { s.sources.size ? null : say("Listening…"); } }
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
    if (old.callId) { wallet()?.headers().then((h) => fetch("/api/krishna/call/end", { method: "POST", headers: { "Content-Type": "application/json", ...h }, body: JSON.stringify({ callId: old.callId }) })).catch(() => {}); }
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
