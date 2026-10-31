// Conversation popups: a short chat that shows a worry and the answer, so a new visitor sees themselves in it.
// Shown at most once per visit, never in the first seconds, and never again soon after being closed.
const track = (n, p) => window.track?.(n, p);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  sset(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
};
const lang = (() => { let v = store.get("shubhly.lang") || "en"; try { v = JSON.parse(v); } catch {} return v === "hi" ? "hi" : "en"; })();

const KAKA = { name: { en: "Kundli Kaka", hi: "कुंडली काका" }, img: "/img/logo-mark.png" };
const KRISHNA = { name: { en: "Krishna", hi: "श्रीकृष्ण" }, img: "/img/krishna-avatar.jpg" };

// Each popup: where it shows, who answers, the chat, and where the button goes.
const POPUPS = [
  { id: "career", paths: [/^\/$/, /^\/kundli/, /^\/rashifal/, /^\/premium/], who: KAKA, href: "/kundli",
    chat: {
      en: [["me", "Three years in the same job. I work hard but nothing moves. Will it ever change?"],
           ["you", "That feeling is exhausting, and you are not the only one. I will not guess. Your chart shows the timing: which period you are in now and when a better window opens."],
           ["you", "Share your date, time and place of birth. It takes two minutes."],
           ["img", "/img/kundli-banner.jpg"]],
      hi: [["me", "तीन साल से एक ही नौकरी में हूँ। मेहनत करता हूँ पर कुछ आगे नहीं बढ़ता। क्या कभी बदलेगा?"],
           ["you", "यह थकान सच में भारी होती है, और आप अकेले नहीं हैं। मैं अंदाज़ा नहीं लगाऊँगा। आपकी कुंडली समय बताती है: अभी कौन-सा दौर चल रहा है और अच्छा मौका कब खुलता है।"],
           ["you", "बस जन्म की तारीख, समय और जगह बताइए। दो मिनट लगते हैं।"],
           ["img", "/img/kundli-banner.jpg"]] },
    cta: { en: "See my career timing", hi: "मेरे करियर का समय देखें" } },
  { id: "marriage", paths: [/^\/$/, /^\/match/, /^\/kundli/, /^\/blog/], who: KAKA, href: "/match",
    chat: {
      en: [["me", "My parents have found someone. How do I know if we are really a good match?"],
           ["you", "Kundli Milan checks 36 points between your two charts: temperament, health, family, how you grow together."],
           ["you", "It also shows what needs care and what to do about it, so you go in knowing, not worrying."],
           ["img", "/img/step-2.png"]],
      hi: [["me", "मम्मी-पापा ने रिश्ता देखा है। कैसे पता चलेगा कि हम सच में अच्छे जोड़े हैं?"],
           ["you", "कुंडली मिलान आपकी दोनों कुंडलियों के 36 गुण देखता है: स्वभाव, सेहत, परिवार और साथ बढ़ने का तरीका।"],
           ["you", "यह भी बताता है कि किस बात पर ध्यान देना है और क्या करना है, ताकि आप चिंता नहीं, समझ के साथ आगे बढ़ें।"],
           ["img", "/img/step-2.png"]] },
    cta: { en: "Check our match", hi: "हमारा मिलान देखें" } },
  { id: "calm", paths: [/^\/rashifal/, /^\/blog/, /^\/panchang/, /^\/guides/], who: KRISHNA, href: "/gita",
    chat: {
      en: [["me", "I cannot sleep. My mind keeps running about work and money."],
           ["you", "Come, sit with me for a moment. Do your work with your whole heart, and let go of the fruit. That is what I told Arjuna."],
           ["you", "You do not have to fix everything tonight. One small step tomorrow is enough."],
           ["img", "/img/gita/t-2.jpg"]],
      hi: [["me", "नींद नहीं आती। काम और पैसों की चिंता दिमाग में चलती रहती है।"],
           ["you", "आओ, मेरे पास ज़रा बैठो। काम पूरे मन से करो और फल की चिंता छोड़ दो। यही मैंने अर्जुन से कहा था।"],
           ["you", "आज रात सब कुछ ठीक करना ज़रूरी नहीं। कल एक छोटा कदम काफ़ी है।"],
           ["img", "/img/gita/t-2.jpg"]] },
    cta: { en: "Talk to Krishna", hi: "श्रीकृष्ण से बात करें" } },
  { id: "gita", paths: [/^\/$/, /^\/kundli/, /^\/tarot/, /^\/store/], who: KRISHNA, href: "/gita",
    chat: {
      en: [["me", "Everyone says read the Gita, but I do not know where to start."],
           ["you", "Start anywhere. Every verse comes with its Sanskrit, a simple meaning, and what I meant by it, in English and Hindi."],
           ["you", "You can listen to it too. One verse a day is enough."],
           ["img", "/img/gita/t-cover.jpg"]],
      hi: [["me", "सब कहते हैं गीता पढ़ो, पर शुरू कहाँ से करूँ पता नहीं।"],
           ["you", "कहीं से भी शुरू करो। हर श्लोक के साथ संस्कृत, सरल अर्थ और मेरा मतलब, हिंदी और अंग्रेज़ी में है।"],
           ["you", "सुन भी सकते हो। रोज़ एक श्लोक काफ़ी है।"],
           ["img", "/img/gita/t-cover.jpg"]] },
    cta: { en: "Open the Gita", hi: "गीता खोलें" } },
  { id: "kundli", paths: [/^\/$/, /^\/rashifal/, /^\/panchang/, /^\/guides/, /^\/blog/], who: KAKA, href: "/kundli",
    chat: {
      en: [["me", "Is making a kundli complicated? I do not know my exact birth time."],
           ["you", "Not at all. Date, time and place of birth, that is all. If you are unsure of the time, give your best guess and I will tell you what it affects."],
           ["you", "Free, and ready in two minutes."],
           ["img", "/img/step-1.png"]],
      hi: [["me", "कुंडली बनाना मुश्किल है क्या? मुझे जन्म का सही समय नहीं पता।"],
           ["you", "बिल्कुल नहीं। जन्म की तारीख, समय और जगह, बस। समय पक्का न हो तो अंदाज़ा बताइए, मैं बता दूँगा कि उससे क्या बदलता है।"],
           ["you", "मुफ़्त है और दो मिनट में तैयार।"],
           ["img", "/img/step-1.png"]] },
    cta: { en: "Make my free kundli", hi: "मेरी मुफ़्त कुंडली बनाएँ" } },
];

const path = location.pathname;
const SEEN_KEY = "kk.pop.seen";
const seenMap = () => { try { return JSON.parse(store.get(SEEN_KEY) || "{}"); } catch { return {}; } };
const WEEK = 7 * 864e5;

function pick() {
  if (store.sget("kk.pop.shown")) return null;
  if (/[?&]internal=1/.test(location.search)) return null;
  const seen = seenMap(), now = Date.now();
  const ok = POPUPS.filter((p) => p.paths.some((r) => r.test(path)) && !(seen[p.id] && now - seen[p.id] < WEEK));
  if (!ok.length) return null;
  // Gita and chat pages keep their own helper; do not stack popups on top of an open chat.
  if (document.querySelector("#krishna:not([hidden]), #chat:not([hidden])")) return null;
  return ok[Math.floor(Math.random() * ok.length)];
}

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function show(p) {
  store.sset("kk.pop.shown", "1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = el("aside", "kkp");
  root.setAttribute("role", "dialog"); root.setAttribute("aria-label", p.who.name[lang]);
  root.innerHTML = `<div class="kkp-glow" aria-hidden="true"></div>
    <div class="kkp-spark" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
    <div class="kkp-card">
      <header class="kkp-head"><img src="${p.who.img}" alt="" width="40" height="40"><div><b>${esc(p.who.name[lang])}</b><span><i></i>${lang === "hi" ? "ऑनलाइन" : "online"}</span></div><button type="button" class="kkp-x" aria-label="${lang === "hi" ? "बंद करें" : "Close"}">×</button></header>
      <div class="kkp-log" aria-live="polite"></div>
      <div class="kkp-foot" hidden><a class="kkp-cta" href="${p.href}">${esc(p.cta[lang])}</a><button type="button" class="kkp-later">${lang === "hi" ? "अभी नहीं" : "Not now"}</button></div>
    </div>`;
  document.body.append(root);
  requestAnimationFrame(() => root.classList.add("in"));
  track("popup_view", { id: p.id });
  const log = root.querySelector(".kkp-log"), foot = root.querySelector(".kkp-foot");
  let closed = false;
  const close = (why) => {
    if (closed) return; closed = true;
    const m = seenMap(); m[p.id] = Date.now(); store.set(SEEN_KEY, JSON.stringify(m));
    track("popup_close", { id: p.id, how: why });
    root.classList.remove("in"); setTimeout(() => root.remove(), 350);
  };
  root.querySelector(".kkp-x").onclick = () => close("x");
  root.querySelector(".kkp-later").onclick = () => close("later");
  root.querySelector(".kkp-cta").addEventListener("click", () => { track("popup_cta", { id: p.id }); const m = seenMap(); m[p.id] = Date.now(); store.set(SEEN_KEY, JSON.stringify(m)); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close("esc"); }, { once: true });

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };
  for (const [who, body] of p.chat[lang]) {
    if (closed) return;
    if (who === "me") {
      const b = el("div", "kkp-b me", esc(body)); log.append(b); scrollDown(); await wait(reduce ? 0 : 900);
    } else if (who === "you") {
      const t = el("div", "kkp-b you typing", "<i></i><i></i><i></i>"); log.append(t); scrollDown();
      await wait(reduce ? 0 : 900 + Math.min(1400, body.length * 14));
      if (closed) return;
      t.className = "kkp-b you"; t.textContent = body; scrollDown();
      await wait(reduce ? 0 : 500);
    } else {
      const f = el("div", "kkp-b you img", `<img src="${body}" alt="" loading="eager">`); log.append(f); scrollDown(); await wait(reduce ? 0 : 400);
    }
  }
  if (closed) return;
  foot.hidden = false; scrollDown();
}

function arm() {
  const p = pick(); if (!p) return;
  let fired = false;
  const fire = () => { if (fired) return; fired = true; cleanup(); const q = pick(); if (q) show(q); };
  const timer = setTimeout(fire, 14000);
  const onScroll = () => { const h = document.documentElement; if (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight) > 0.45 && performance.now() > 8000) fire(); };
  const onLeave = (e) => { if (e.clientY < 8 && performance.now() > 8000) fire(); };
  const cleanup = () => { clearTimeout(timer); removeEventListener("scroll", onScroll); document.removeEventListener("mouseleave", onLeave); };
  addEventListener("scroll", onScroll, { passive: true }); document.addEventListener("mouseleave", onLeave);
}
if (document.readyState === "complete") arm(); else addEventListener("load", arm, { once: true });
