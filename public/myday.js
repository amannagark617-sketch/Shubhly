// "Your day": asks once for name, birth date, time and place, keeps them on
// this phone, then shows a detailed guide for today: what to do, what to
// avoid, what to wear, the best times and the day's mantra.
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KEY = "kk.me";
const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const lang = () => { try { return localStorage.getItem("shubhly.lang") === "hi" ? "hi" : "en"; } catch { return "en"; } };

const S = {
  en: {
    h: "Your day, made for you", p: "Tell us your birth details once. We read today's sky against your own chart and tell you what to do, what to avoid and what to wear.",
    name: "Your name", dob: "Date of birth", tob: "Time of birth", unk: "I don't know my birth time", place: "Birth place", placeHint: "Start typing your city and choose from the list",
    go: "Show my day", note: "Saved only on this phone. Not shared.", loading: "Reading your chart…", err: "Could not read your day. Please check the details.",
    pickPlace: "Please choose your birth place from the list.", need: "Please fill in all the details.",
    hi: (n) => `Namaste, ${n}`, rashi: "Moon sign", lagna: "Rising sign", nak: "Nakshatra", dasha: "Running period",
    do: "Do today", avoid: "Avoid today", wear: "What to wear", food: "Food", daan: "Giving", best: "Good times to start important things", abhijit: "Abhijit (very good)", rahu: "Rahu Kaal (avoid starting new things)",
    love: "Love", career: "Work", money: "Money", health: "Health", mantra: "Today's mantra", change: "Not you? Change details", share: "Share my day",
    sati: "Saturn note", about: "Today is", moon: "Moon is in", of5: "out of 5", tips: "Your sign today", more: "Want the full picture? Make your complete kundli.", kundli: "Make my kundli",
  },
  hi: {
    h: "आपका दिन, सिर्फ़ आपके लिए", p: "अपनी जन्म की जानकारी एक बार बताइए। हम आज के आसमान को आपकी अपनी कुंडली से मिलाकर बताएँगे कि क्या करें, किससे बचें और क्या पहनें।",
    name: "आपका नाम", dob: "जन्म की तारीख", tob: "जन्म का समय", unk: "मुझे जन्म का समय नहीं पता", place: "जन्म स्थान", placeHint: "अपना शहर लिखिए और सूची से चुनिए",
    go: "मेरा दिन दिखाइए", note: "सिर्फ़ इसी फ़ोन में सेव होता है। किसी को नहीं भेजा जाता।", loading: "आपकी कुंडली देख रहे हैं…", err: "आपका दिन नहीं बन पाया। कृपया जानकारी जाँच लें।",
    pickPlace: "कृपया सूची से अपना जन्म स्थान चुनिए।", need: "कृपया सारी जानकारी भरिए।",
    hi: (n) => `नमस्ते, ${n}`, rashi: "चंद्र राशि", lagna: "लग्न", nak: "नक्षत्र", dasha: "चल रही दशा",
    do: "आज क्या करें", avoid: "आज किससे बचें", wear: "क्या पहनें", food: "खान-पान", daan: "दान", best: "ज़रूरी काम शुरू करने के अच्छे समय", abhijit: "अभिजीत (बहुत शुभ)", rahu: "राहु काल (नया काम शुरू न करें)",
    love: "प्रेम", career: "काम", money: "पैसा", health: "सेहत", mantra: "आज का मंत्र", change: "आप नहीं हैं? जानकारी बदलें", share: "मेरा दिन शेयर करें",
    sati: "शनि की बात", about: "आज", moon: "चंद्रमा", of5: "में से 5", tips: "आज आपकी राशि", more: "पूरी तस्वीर चाहिए? अपनी पूरी कुंडली बनाइए।", kundli: "मेरी कुंडली बनाएँ",
  },
};
const f12 = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };
const rng = (r) => `${f12(r.from)} to ${f12(r.to)}`;

let sec;
function mount() {
  const host = $("#rashifal .wrap");
  if (!host || $("#rashifal")?.hasAttribute("data-off")) return false;
  sec = document.createElement("section");
  sec.id = "myday"; sec.className = "md";
  const head = host.querySelector(".sec-head");
  (head ? head.after(sec) : host.prepend(sec));
  return true;
}

function renderForm(prefill = {}) {
  const s = S[lang()];
  sec.innerHTML = `<div class="md-card md-form">
    <h3>${esc(s.h)}</h3><p>${esc(s.p)}</p>
    <form id="md-f" autocomplete="off" novalidate>
      <label>${esc(s.name)}<input name="name" maxlength="40" value="${esc(prefill.name || "")}" autocomplete="given-name"></label>
      <div class="md-row">
        <label>${esc(s.dob)}<input type="date" name="date" value="${esc(prefill.date || "")}" max="${new Date().toISOString().slice(0, 10)}"></label>
        <label>${esc(s.tob)}<input type="time" name="time" value="${esc(prefill.time || "")}"></label>
      </div>
      <label class="md-chk"><input type="checkbox" name="unk"${prefill.timeUnknown ? " checked" : ""}> ${esc(s.unk)}</label>
      <label class="md-place">${esc(s.place)}<input name="place" value="${esc(prefill.place?.label || "")}" placeholder="${esc(s.placeHint)}" role="combobox" aria-expanded="false"></label>
      <ul class="md-list" id="md-list" hidden></ul>
      <p class="md-err" id="md-err" role="alert"></p>
      <button class="btn btn-primary" type="submit">${esc(s.go)}</button>
      <p class="md-fine">${esc(s.note)}</p>
    </form></div>`;
  const f = $("#md-f"), list = $("#md-list");
  let place = prefill.place || null, timer, seq = 0;
  const unk = f.elements.unk, time = f.elements.time;
  const sync = () => { time.disabled = unk.checked; };
  unk.addEventListener("change", sync); sync();
  f.elements.place.addEventListener("input", () => {
    place = null; clearTimeout(timer);
    const v = f.elements.place.value.trim();
    if (v.length < 2) { list.hidden = true; return; }
    timer = setTimeout(async () => {
      const me = ++seq;
      try {
        const r = await fetch("/api/places?q=" + encodeURIComponent(v)); const d = await r.json();
        if (me !== seq) return;
        list.innerHTML = "";
        (d.places || []).filter((p) => p.tz).forEach((p) => {
          const li = document.createElement("li"); li.textContent = p.label;
          li.addEventListener("mousedown", (e) => { e.preventDefault(); place = p; f.elements.place.value = p.label; list.hidden = true; });
          list.appendChild(li);
        });
        list.hidden = !list.children.length;
      } catch { list.hidden = true; }
    }, 300);
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#md-err");
    const name = f.elements.name.value.trim(), date = f.elements.date.value, t = unk.checked ? "12:00" : f.elements.time.value;
    if (!name || !date || !t) { err.textContent = s.need; return; }
    if (!place) { err.textContent = s.pickPlace; return; }
    const me = { name, date, time: t, timeUnknown: unk.checked, place: { label: place.label, lat: place.lat, lon: place.lon, tz: place.tz } };
    wr(KEY, me); window.track?.("myday_saved");
    load(me);
  });
}

async function load(me) {
  const s = S[lang()];
  sec.innerHTML = `<div class="md-card"><p class="md-load">${esc(s.loading)}</p></div>`;
  let here = null;
  try { here = JSON.parse(localStorage.getItem("shubhly.loc")); } catch { /* none */ }
  try {
    const r = await fetch("/api/myday", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...me, lang: lang(), here }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || s.err);
    render(d, me);
  } catch (e) {
    sec.innerHTML = `<div class="md-card"><p class="md-err">${esc(e.message || s.err)}</p><button class="btn" type="button" id="md-edit">${esc(s.change)}</button></div>`;
    $("#md-edit").addEventListener("click", () => renderForm(me));
  }
}

const bar = (n) => `<span class="md-bar" role="img" aria-label="${n}/5"><i style="width:${n * 20}%"></i></span>`;
function render(d, me) {
  const s = S[lang()], hi = lang() === "hi";
  const sg = (en, h) => (hi ? h : en);
  const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
  const areas = d.areas.map((a) => `<li><div><b>${esc(s[a.key])}</b>${bar(a.level)}</div><p>${esc(a.text)}</p></li>`).join("");
  const sw = d.wear.colours.map((c) => `<span class="md-sw"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}</span>`).join("");
  sec.innerHTML = `<article class="md-card md-day">
    <header><div><h3>${esc(s.hi(d.name))}</h3><p>${esc(s.about)} ${esc(hi ? d.weekday.hi : d.weekday.name)}, ${esc(d.tithi.paksha)} ${esc(d.tithi.name)}. ${esc(s.moon)} ${esc(sg(d.moonToday.sign, d.moonToday.signHi))}.</p></div>
      <span class="mood mood--${esc(d.mood)}">${esc(d.moodLabel)}</span></header>
    <ul class="md-chips"><li><small>${esc(s.rashi)}</small><b>${esc(sg(d.rashi.sign, d.rashi.signHi))}</b></li>${d.lagna ? `<li><small>${esc(s.lagna)}</small><b>${esc(sg(d.lagna.sign, d.lagna.signHi))}</b></li>` : ""}<li><small>${esc(s.nak)}</small><b>${esc(sg(d.nakshatra.name, d.nakshatra.nameHi))}</b></li></ul>
    <p class="md-theme"><b>${esc(d.theme)}.</b> ${esc(d.summary)}</p>
    <div class="md-two"><section><h4>${esc(s.do)}</h4><ul class="md-do">${li(d.do)}</ul></section><section><h4>${esc(s.avoid)}</h4><ul class="md-no">${li(d.avoid)}</ul></section></div>
    <section class="md-wear"><h4>${esc(s.wear)}</h4><p>${esc(d.wear.note)}</p><div>${sw}</div><p><b>${esc(s.food)}:</b> ${esc(d.food)}</p><p><b>${esc(s.daan)}:</b> ${esc(d.daan)}</p></section>
    <section><h4>${esc(s.love)} · ${esc(s.career)} · ${esc(s.money)} · ${esc(s.health)}</h4><ul class="md-areas">${areas}</ul></section>
    <section class="md-times"><h4>${esc(s.best)}</h4><div>${d.best.map((b) => `<span class="md-t md-t--good">${esc(rng(b))}<small>${esc(b.name)}</small></span>`).join("")}${d.abhijit ? `<span class="md-t md-t--good">${esc(rng(d.abhijit))}<small>${esc(s.abhijit)}</small></span>` : ""}<span class="md-t md-t--bad">${esc(rng(d.rahu))}<small>${esc(s.rahu)}</small></span></div></section>
    ${d.dasha ? `<section><h4>${esc(s.dasha)}</h4><p>${esc(d.dasha.text)}</p></section>` : ""}
    ${d.lagnaNote ? `<section><h4>${esc(s.tips)}</h4><p>${esc(d.lagnaNote)}</p></section>` : ""}
    ${d.sadeSati ? `<section><h4>${esc(s.sati)}</h4><p><b>${esc(d.sadeSati.title)}.</b> ${esc(d.sadeSati.text)} ${esc(d.sadeSati.tip)}</p></section>` : ""}
    <section class="md-mantra"><small>${esc(s.mantra)}</small><div>${esc(d.mantra.text)}</div><small>${esc(d.mantra.deity)}</small></section>
    <footer><button class="btn btn-dark" type="button" id="md-share">${esc(s.share)}</button><button class="btn" type="button" id="md-edit">${esc(s.change)}</button><a class="btn btn-outline" href="/kundli">${esc(s.kundli)}</a></footer></article>`;
  $("#md-edit").addEventListener("click", () => renderForm(me));
  $("#md-share").addEventListener("click", async () => {
    const text = `${s.hi(d.name)}\n${d.theme}. ${d.summary}\n\n${s.do}:\n- ${d.do.join("\n- ")}\n\n${s.avoid}:\n- ${d.avoid.join("\n- ")}\n\nKundli Kaka: https://kundlikaka.in/rashifal`;
    try { if (navigator.share) { await navigator.share({ text }); return; } await navigator.clipboard.writeText(text); } catch { /* cancelled */ }
  });
  window.track?.("myday_view");
}

if (mount()) {
  const me = rd(KEY, null);
  if (me?.date && me.place) load(me); else renderForm();
  document.addEventListener("kk:lang", () => { const m = rd(KEY, null); if (m?.date) load(m); else renderForm(); });
}
