// Plays a verse: the Sanskrit, or its meaning. One clip at a time.
const track = (n, p) => window.track?.(n, p);
let audio = null, active = null;

const toast = (m) => { const d = document.createElement("div"); d.className = "gv-toast"; d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 2600); };
function reset() {
  if (audio) { audio.pause(); audio = null; }
  speechSynthesis?.cancel?.();
  if (active) { active.setAttribute("aria-pressed", "false"); active.classList.remove("on", "wait"); active.textContent = active.dataset.label; active = null; }
}
function browserSpeak(text, lang, btn) {
  if (!("speechSynthesis" in window)) return toast("Voice is not available on this device");
  const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.8;
  u.onend = () => reset();
  btn.setAttribute("aria-pressed", "true"); btn.classList.add("on"); btn.textContent = "Stop";
  active = btn; speechSynthesis.speak(u);
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-listen]"); if (!b) return;
  b.dataset.label ||= b.textContent;
  if (active === b) return reset();
  reset();
  const [ch, v] = b.dataset.listen.split(".");
  const art = b.closest(".gv");
  const wrap = b.closest(".gita-wrap");
  const lang = b.dataset.kind === "sa" ? "sa" : (wrap?.dataset.lang === "hi" ? "hi" : "en");
  active = b; b.classList.add("wait"); b.textContent = "Loading…";
  track("gita_listen", { verse: b.dataset.listen, kind: lang });
  try {
    const r = await fetch(`/api/gita/audio/${ch}-${v}-${lang}.wav`);
    if (!r.ok) throw new Error(String(r.status));
    const url = URL.createObjectURL(await r.blob());
    if (active !== b) return;
    audio = new Audio(url);
    audio.onended = () => reset();
    audio.onerror = () => reset();
    b.classList.remove("wait"); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.textContent = "Stop";
    await audio.play();
  } catch {
    reset();
    // Fall back to the phone's own voice so there is always something to hear.
    active = b; b.classList.remove("wait");
    const text = lang === "sa" ? art.dataset.sa : lang === "hi" ? art.dataset.hi : art.dataset.en;
    browserSpeak(text, lang === "sa" ? "hi-IN" : lang === "hi" ? "hi-IN" : "en-IN", b);
  }
});
window.addEventListener("pagehide", reset);
