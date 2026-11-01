// Conversation popups: a short chat that shows a worry and the answer, so a new visitor sees themselves in it.
// Shown at most once per visit, never in the first seconds, and never again soon after being closed.
const track = (n, p) => window.track?.(n, p);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  sset(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
};
const rawLang = (() => { let v = store.get("shubhly.lang") || "en"; try { v = JSON.parse(v); } catch {} return v; })();
const lang = rawLang === "hi" ? "hi" : "en";
const picSuffix = rawLang === "hi" || rawLang === "hn" ? "-hi" : ""; // the finished pictures are English, and Hinglish for Hindi and Hinglish visitors

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
           ["img", "/img/step-2.webp"]],
      hi: [["me", "मम्मी-पापा ने रिश्ता देखा है। कैसे पता चलेगा कि हम सच में अच्छे जोड़े हैं?"],
           ["you", "कुंडली मिलान आपकी दोनों कुंडलियों के 36 गुण देखता है: स्वभाव, सेहत, परिवार और साथ बढ़ने का तरीका।"],
           ["you", "यह भी बताता है कि किस बात पर ध्यान देना है और क्या करना है, ताकि आप चिंता नहीं, समझ के साथ आगे बढ़ें।"],
           ["img", "/img/step-2.webp"]] },
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
           ["img", "/img/step-1.webp"]],
      hi: [["me", "कुंडली बनाना मुश्किल है क्या? मुझे जन्म का सही समय नहीं पता।"],
           ["you", "बिल्कुल नहीं। जन्म की तारीख, समय और जगह, बस। समय पक्का न हो तो अंदाज़ा बताइए, मैं बता दूँगा कि उससे क्या बदलता है।"],
           ["you", "मुफ़्त है और दो मिनट में तैयार।"],
           ["img", "/img/step-1.webp"]] },
    cta: { en: "Make my free kundli", hi: "मेरी मुफ़्त कुंडली बनाएँ" } },
  { id: "money", paths: [/^\/$/, /^\/kundli/, /^\/rashifal/, /^\/premium/, /^\/blog/], who: KAKA, href: "/kundli",
    chat: {
      en: [["me", "Money goes out as fast as it comes in. Is something wrong with my chart?"],
           ["you", "Not necessarily. A chart shows patterns, like which years favour saving and which favour spending. Knowing them helps you plan."],
           ["you", "Let us look at yours. Date, time and place of birth is all I need."],
           ["img", "/img/step-2.webp"]],
      hi: [["me", "पैसा जितनी तेज़ी से आता है उतनी ही तेज़ी से चला जाता है। क्या मेरी कुंडली में कुछ गड़बड़ है?"],
           ["you", "ज़रूरी नहीं। कुंडली पैटर्न दिखाती है, जैसे कौन-से साल बचत के हैं और कौन-से खर्च के। यह जानकर आप बेहतर योजना बना सकते हैं।"],
           ["you", "चलिए आपकी देखते हैं। बस जन्म की तारीख, समय और जगह चाहिए।"],
           ["img", "/img/step-2.webp"]] },
    cta: { en: "See my money timing", hi: "मेरे धन का समय देखें" } },
  { id: "love", paths: [/^\/$/, /^\/match/, /^\/rashifal/, /^\/tarot/], who: KAKA, href: "/match",
    chat: {
      en: [["me", "We keep fighting over small things. Are we even right for each other?"],
           ["you", "Fights over small things often come from different natures, not a wrong person. Comparing both charts shows where you fit and where you need patience."],
           ["you", "Add both birth details and I will show you."],
           ["img", "/img/step-2.webp"]],
      hi: [["me", "हम छोटी-छोटी बातों पर झगड़ते हैं। क्या हम एक-दूसरे के लिए सही हैं?"],
           ["you", "छोटी बातों पर झगड़ा अक्सर अलग स्वभाव से होता है, गलत इंसान से नहीं। दोनों कुंडलियाँ देखने से पता चलता है कि कहाँ मेल है और कहाँ धैर्य चाहिए।"],
           ["you", "दोनों की जन्म जानकारी डालिए, मैं दिखाता हूँ।"],
           ["img", "/img/step-2.webp"]] },
    cta: { en: "Compare our charts", hi: "हमारी कुंडलियाँ मिलाएँ" } },
  { id: "puja", paths: [/^\/$/, /^\/kundli/, /^\/rashifal/, /^\/panchang/, /^\/blog/, /^\/guides/, /^\/store/], who: KAKA, href: "/puja",
    chat: {
      en: [["me", "Diwali puja is coming and I am not sure what to buy. I do not want to miss anything."],
           ["you", "Every puja page has the full samagri list with a small picture for each item, and the steps in order. Tick things off as you collect them."],
           ["you", "You can send the list to your family on WhatsApp in one tap."],
           ["img", "/img/puja/samagri-1.jpg"]],
      hi: [["me", "पूजा आने वाली है और मुझे पता नहीं क्या-क्या लाना है। कुछ छूट न जाए।"],
           ["you", "हर पूजा के पेज पर पूरी सामग्री की सूची है, हर चीज़ की छोटी तस्वीर के साथ, और विधि क्रम से। चीज़ें जमा करते हुए टिक करते जाइए।"],
           ["you", "सूची एक टैप में WhatsApp पर परिवार को भेज सकते हैं।"],
           ["img", "/img/puja/samagri-1.jpg"]] },
    cta: { en: "See puja guides", hi: "पूजा गाइड देखें" } },
  { id: "puja-index", paths: [/^\/puja\/?$/], who: KAKA, href: "/puja/ganesh",
    chat: {
      en: [["me", "I want to do a puja at home, but I do not know the vidhi."],
           ["you", "Start with Ganesh Puja. It is simple, takes about 30 minutes, and every step is written plainly in English and Hindi."],
           ["you", "Pick the god you pray to and the list and steps are ready."],
           ["img", "/img/puja/ganesh.jpg"]],
      hi: [["me", "घर पर पूजा करना चाहता हूँ, पर विधि नहीं पता।"],
           ["you", "गणेश पूजा से शुरू कीजिए। यह सरल है, लगभग 30 मिनट लगते हैं, और हर कदम हिंदी और अंग्रेज़ी में सीधे शब्दों में लिखा है।"],
           ["you", "अपने इष्ट देव चुनिए, सूची और विधि तैयार है।"],
           ["img", "/img/puja/ganesh.jpg"]] },
    cta: { en: "Open Ganesh Puja", hi: "गणेश पूजा खोलें" } },
  { id: "puja-day", paths: [/^\/puja\/.+/], who: KAKA, href: "/panchang",
    chat: {
      en: [["me", "Is today a good day to do this puja?"],
           ["you", "The panchang tells you the tithi, nakshatra and the good hours of the day, and when to avoid Rahu Kaal."],
           ["you", "Check it before you begin, so the puja lands at the right time."],
           ["img", "/img/puja/samagri-1.jpg"]],
      hi: [["me", "क्या आज यह पूजा करने का अच्छा दिन है?"],
           ["you", "पंचांग में तिथि, नक्षत्र और दिन के शुभ समय बताए जाते हैं, और राहु काल कब है यह भी।"],
           ["you", "शुरू करने से पहले देख लीजिए, ताकि पूजा सही समय पर हो।"],
           ["img", "/img/puja/samagri-1.jpg"]] },
    cta: { en: "Check today's panchang", hi: "आज का पंचांग देखें" } },
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

// If a finished conversation picture exists (public/img/popups/<id>.png, and <id>-hi.png for Hindi), show it instead of the typed chat.
const loadPic = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i.naturalWidth ? src : null); i.onerror = () => res(null); i.src = src; });

async function show(p) {
  store.sset("kk.pop.shown", "1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = el("aside", "kkp");
  root.setAttribute("role", "dialog"); root.setAttribute("aria-label", p.who.name[lang]);
  const hm = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  let clock = new Date();
  root.innerHTML = `<div class="kkp-back" data-back></div>
    <div class="kkp-card">
      <button type="button" class="kkp-x" aria-label="${lang === "hi" ? "बंद करें" : "Close"}">×</button>
      <header class="kkp-head"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><img src="${p.who.img}" alt="" width="40" height="40"><div><b>${esc(p.who.name[lang])}</b><span class="kkp-st">${lang === "hi" ? "ऑनलाइन" : "online"}</span></div></header>
      <div class="kkp-log" aria-live="polite"><div class="kkp-day">${lang === "hi" ? "आज" : "Today"}</div></div>
      <div class="kkp-foot" hidden><a class="kkp-cta" href="${p.href}">${esc(p.cta[lang])}</a></div>
      <div class="kkp-bar" aria-hidden="true"><span>${lang === "hi" ? "संदेश लिखिए" : "Type a message"}</span></div>
    </div>
    <button type="button" class="kkp-later">${lang === "hi" ? "अभी नहीं" : "Not now"}</button>`;
  document.body.append(root);
  requestAnimationFrame(() => root.classList.add("in"));
  track("popup_view", { id: p.id });
  const log = root.querySelector(".kkp-log"), foot = root.querySelector(".kkp-foot"), st = root.querySelector(".kkp-st");
  const tick = '<svg viewBox="0 0 18 12" width="16" height="11" aria-hidden="true"><path d="M1 6.500l3.500 3.500L11 2.500M7 9.500l1 1L16 2.500" fill="none" stroke="#53bdeb" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let closed = false;
  const close = (why) => {
    if (closed) return; closed = true;
    const m = seenMap(); m[p.id] = Date.now(); store.set(SEEN_KEY, JSON.stringify(m));
    track("popup_close", { id: p.id, how: why });
    root.classList.remove("in"); setTimeout(() => root.remove(), 350);
  };
  root.querySelector(".kkp-x").onclick = () => close("x");
  root.querySelector(".kkp-later").onclick = () => close("later");
  root.querySelector(".kkp-back").onclick = () => close("backdrop");
  root.querySelector(".kkp-cta").addEventListener("click", () => { track("popup_cta", { id: p.id }); const m = seenMap(); m[p.id] = Date.now(); store.set(SEEN_KEY, JSON.stringify(m)); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close("esc"); }, { once: true });

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };
  for (const [who, body] of p.chat[lang]) {
    if (closed) return;
    if (who === "me") {
      clock = new Date(clock.getTime() + 60000);
      const b = el("div", "kkp-b me", `${esc(body)}<small>${hm(clock)} ${tick}</small>`); log.append(b); scrollDown(); await wait(reduce ? 0 : 900);
    } else if (who === "you") {
      st.textContent = lang === "hi" ? "लिख रहे हैं…" : "typing…";
      const t = el("div", "kkp-b you typing", "<i></i><i></i><i></i>"); log.append(t); scrollDown();
      await wait(reduce ? 0 : 900 + Math.min(1400, body.length * 14));
      if (closed) return;
      clock = new Date(clock.getTime() + 60000);
      st.textContent = lang === "hi" ? "ऑनलाइन" : "online";
      t.className = "kkp-b you"; t.innerHTML = `${esc(body)}<small>${hm(clock)}</small>`; scrollDown();
      await wait(reduce ? 0 : 500);
    } else {
      const f = el("div", "kkp-b you img", `<img src="${body}" alt="" loading="eager">`); log.append(f); scrollDown(); await wait(reduce ? 0 : 400);
    }
  }
  if (closed) return;
  foot.hidden = false; scrollDown();
}

function showPic(p, src) {
  const root = el("aside", "kkp kkp-picmode");
  root.setAttribute("role", "dialog"); root.setAttribute("aria-label", p.who.name[lang]);
  root.innerHTML = `<div class="kkp-glow" aria-hidden="true"></div>
    <div class="kkp-spark" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
    <div class="kkp-card"><button type="button" class="kkp-x" aria-label="${lang === "hi" ? "बंद करें" : "Close"}">×</button>
      <a href="${p.href}" class="kkp-picl" aria-label="${esc(p.cta[lang])}"><img class="kkp-pic" src="${src}" alt=""></a>
      <div class="kkp-foot"><a class="kkp-cta" href="${p.href}">${esc(p.cta[lang])}</a><button type="button" class="kkp-later">${lang === "hi" ? "अभी नहीं" : "Not now"}</button></div></div>`;
  document.body.append(root);
  requestAnimationFrame(() => root.classList.add("in"));
  track("popup_view", { id: p.id, mode: "picture" });
  const done = () => { const m = seenMap(); m[p.id] = Date.now(); store.set(SEEN_KEY, JSON.stringify(m)); };
  const close = (how) => { done(); track("popup_close", { id: p.id, how }); root.classList.remove("in"); setTimeout(() => root.remove(), 350); };
  root.querySelector(".kkp-x").onclick = () => close("x");
  root.querySelector(".kkp-later").onclick = () => close("later");
  root.querySelectorAll(".kkp-cta, .kkp-picl").forEach((a) => a.addEventListener("click", () => { track("popup_cta", { id: p.id }); done(); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close("esc"); }, { once: true });
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
