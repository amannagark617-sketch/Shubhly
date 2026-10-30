// Plays a verse: the Sanskrit, or its meaning. One clip at a time.
const track = (n, p) => window.track?.(n, p);
let audio = null, active = null, token = 0, noServerAudio = false;

const toast = (m) => { const d = document.createElement("div"); d.className = "gv-toast"; d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 2600); };
function reset() {
  if (audio) { audio.pause(); audio = null; }
  speechSynthesis?.cancel?.();
  if (active) { active.setAttribute("aria-pressed", "false"); active.classList.remove("on", "wait"); active.textContent = active.dataset.label; active = null; }
}
// The phone's own voice: free. Pick the nicest one it has for the language.
let voicesTried = false;
const loadVoices = () => new Promise((res) => {
  const v = speechSynthesis.getVoices(); if (v.length || voicesTried) return res(v);
  voicesTried = true;
  speechSynthesis.addEventListener("voiceschanged", () => res(speechSynthesis.getVoices()), { once: true });
  setTimeout(() => res(speechSynthesis.getVoices()), 1200);
});
const score = (v) => (/google|neural|natural|online/i.test(v.name) ? 3 : 0) + (/microsoft|lekha|kalpana|hemant|veena|rishi/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
async function pickVoice(lang) {
  const all = await loadVoices();
  const base = lang.slice(0, 2);
  const exact = all.filter((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase());
  const loose = all.filter((v) => v.lang.toLowerCase().startsWith(base));
  return [...(exact.length ? exact : loose)].sort((a, b) => score(b) - score(a))[0] || null;
}
// Long text is read in short pieces, because some phones stop after about 15 seconds.
const pieces = (t) => t.replace(/\s+/g, " ").split(/(?<=[।.!?])\s+/).flatMap((x) => (x.length > 170 ? x.match(/.{1,170}(\s|$)/g) : [x])).filter(Boolean);
async function browserSpeak(text, lang, btn) {
  if (!("speechSynthesis" in window)) { reset(); return toast("Voice is not available on this device"); }
  const voice = await pickVoice(lang);
  await new Promise((r) => setTimeout(r, 120));
  if (active !== btn) return;
  const parts = pieces(text);
  btn.classList.remove("wait"); btn.setAttribute("aria-pressed", "true"); btn.classList.add("on"); btn.textContent = "Stop";
  active = btn;
  parts.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t); u.lang = lang; u.rate = lang === "en-IN" ? 0.88 : 0.78; u.pitch = 0.95;
    if (voice) u.voice = voice;
    if (i === parts.length - 1) u.onend = () => { if (active === btn) reset(); };
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") reset(); };
    speechSynthesis.speak(u);
  });
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-listen]"); if (!b) return;
  b.dataset.label ||= b.textContent;
  token++;                       // any earlier, still-loading click is now out of date
  if (active === b) return reset();
  reset();
  const mine = token;
  const [ch, v] = b.dataset.listen.split(".");
  const art = b.closest(".gv");
  const wrap = b.closest(".gita-wrap");
  const lang = b.dataset.kind === "sa" ? "sa" : (wrap?.dataset.lang === "hi" ? "hi" : "en");
  active = b; b.classList.add("wait"); b.textContent = "Loading…";
  track("gita_listen", { verse: b.dataset.listen, kind: lang });
  try {
    if (noServerAudio) throw new Error("none");
    const r = await fetch(`/api/gita/audio/${ch}-${v}-${lang}.wav`);
    if (!r.ok) throw new Error(String(r.status));
    if (!/^audio\//.test(r.headers.get("content-type") || "")) throw new Error("none");
    const url = URL.createObjectURL(await r.blob());
    if (mine !== token) return;
    audio = new Audio(url);
    audio.onended = () => reset();
    audio.onerror = () => reset();
    b.classList.remove("wait"); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.textContent = "Stop";
    await audio.play();
  } catch (err) {
    if (mine !== token) return;  // a newer click took over
    if (String(err.message) !== "none" || true) noServerAudio = noServerAudio || /^(503|404|none)$/.test(String(err.message));
    reset();
    // Fall back to the phone's own voice so there is always something to hear.
    active = b; b.classList.remove("wait");
    const text = lang === "sa" ? art.dataset.sa : lang === "hi" ? art.dataset.hi : art.dataset.en;
    browserSpeak(text, lang === "en" ? "en-IN" : "hi-IN", b);
  }
});
window.addEventListener("pagehide", reset);
