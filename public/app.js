import {
  HI, esc, fmt12, fmtEnds, fmtRange, todayIn, nowIn, addDays, dateLabel,
  inSlot, dots, moonSvg, chartSvg, renderMarkdown,
} from "/lib.js";
import { makeShareCard } from "/card.js";

const $ = (id) => document.getElementById(id);
const show = (el, on = true) => { el.hidden = !on; };

// ---------- storage (always optional) ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  },
};

const DEFAULT_LOC = { name: "Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };
let loc = store.get("shubhly.loc", DEFAULT_LOC);
let myRashi = store.get("shubhly.rashi", null); // 0..11
let profiles = store.get("shubhly.profiles", []);
let config = { whatsappUrl: null };

// ---------- helpers ----------
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  show(t, true);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => show(t, false), 2600);
}

function setBusy(btn, busy, label) {
  btn.disabled = busy;
  btn.innerHTML = busy ? `<span class="spinner"></span>${esc(label)}` : esc(label);
}

async function api(path, options) {
  const res = await fetch(path, options);
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
}

const q = (extra = {}) => new URLSearchParams({
  lat: loc.lat, lon: loc.lon, tz: loc.tz, ...extra,
}).toString();

// ---------- reusable place search ----------
function placeSearch({ input, list, onPick }) {
  let timer, seq = 0, active = -1, results = [];
  const close = () => {
    show(list, false);
    input.setAttribute("aria-expanded", "false");
    active = -1;
  };
  const mark = () => [...list.children].forEach((li, i) =>
    li.setAttribute("aria-selected", i === active ? "true" : "false"));
  const pick = (p) => { close(); onPick(p); };
  const render = (items) => {
    results = items;
    list.innerHTML = items.length
      ? ""
      : '<li class="none">Koi place nahi mila, spelling check karo</li>';
    items.forEach((p) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.textContent = p.label;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); pick(p); });
      list.appendChild(li);
    });
    show(list, true);
    input.setAttribute("aria-expanded", "true");
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const text = input.value.trim();
    if (text.length < 2) { close(); return; }
    timer = setTimeout(async () => {
      const mine = ++seq;
      try {
        const data = await api(`/api/places?q=${encodeURIComponent(text)}`);
        if (mine === seq) render(data.places.filter((p) => p.tz));
      } catch (e) {
        if (mine !== seq) return;
        list.innerHTML = `<li class="none">${esc(e.message)}</li>`;
        show(list, true);
      }
    }, 300);
  });
  input.addEventListener("keydown", (e) => {
    if (list.hidden || !results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % results.length; mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + results.length) % results.length; mark(); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") close();
  });
  input.addEventListener("blur", () => setTimeout(close, 120));
  return { first: async (text) => {
    const data = await api(`/api/places?q=${encodeURIComponent(text)}`);
    return data.places.find((p) => p.tz) || null;
  } };
}

// ---------- streak ----------
function touchStreak() {
  const today = todayIn(loc.tz);
  const s = store.get("shubhly.streak", { last: null, count: 0 });
  if (s.last !== today) {
    s.count = s.last === addDays(today, -1) ? s.count + 1 : 1;
    s.last = today;
    store.set("shubhly.streak", s);
  }
  if (s.count >= 2) {
    const el = $("streak");
    el.textContent = `${s.count} din ka streak`;
    show(el, true);
  }
}

// ---------- panchang ----------
let todayData = null;

function renderMoon(p) {
  $("moonBox").innerHTML = moonSvg(p.moonElongation, `Chandrama aaj, ${p.tithi.name}`);
  $("moonDay").textContent = `${p.weekday.hi}, ${dateLabel(p.date)}`;
  $("moonTithi").textContent = `${p.tithi.paksha.hi} ${p.tithi.nameHi}`;
  $("moonSub").textContent = `${p.tithi.paksha.en} ${p.tithi.name}, ${fmtEnds(p.tithi.ends)}`;
  $("moonFacts").innerHTML = `
    <div><dt>Nakshatra</dt><dd>${esc(p.nakshatra.name)}</dd></div>
    <div><dt>Chandra rashi</dt><dd>${esc(p.moonSign.sign)} ${esc(p.moonSign.signHi)}</dd></div>
    <div><dt>Sunrise</dt><dd>${fmt12(p.sunrise)}</dd></div>
    <div><dt>Sunset</dt><dd>${fmt12(p.sunset)}</dd></div>`;
}

function fact(title, value, sub, cls = "") {
  return `<div class="fact ${cls}"><h3>${esc(title)}</h3><div class="v">${value}</div>${sub ? `<p class="s">${sub}</p>` : ""}</div>`;
}

function slotHtml(c, now) {
  const cls = c.quality === "good" ? "slot--good" : c.quality === "avoid" ? "slot--avoid" : "";
  return `<div class="slot ${cls}${now && inSlot(now, c) ? " slot--now" : ""}">
    <b>${esc(c.nameHi)}</b><span>${esc(c.name)}</span><span>${fmt12(c.from)}</span></div>`;
}

function renderPanchang(p) {
  const now = p.date === todayIn(loc.tz) ? nowIn(loc.tz) : null;
  const hl = p.highlights.length
    ? `<p class="note" style="margin-bottom:14px">Aaj: <b>${p.highlights.map((h) => esc(h.hi)).join(", ")}</b>. ${esc(p.highlights[0].note)}</p>`
    : "";
  $("panchang").innerHTML = `
    ${hl}
    <div class="facts">
      ${fact("Tithi", `${esc(p.tithi.paksha.hi)} ${esc(p.tithi.nameHi)}`, fmtEnds(p.tithi.ends))}
      ${fact("Nakshatra", esc(p.nakshatra.nameHi), `${esc(p.nakshatra.name)}, ${fmtEnds(p.nakshatra.ends)}`)}
      ${fact("Yoga", esc(p.yoga.nameHi), fmtEnds(p.yoga.ends))}
      ${fact("Karana", esc(p.karana.nameHi), fmtEnds(p.karana.ends))}
      ${fact("Abhijit muhurat", p.abhijit ? fmtRange(p.abhijit) : "Aaj nahi", p.abhijit ? "Shubh kaam ke liye achha samay maana jata hai" : "Budhvar ko nahi maana jata", p.abhijit ? "fact--good" : "")}
      ${fact("Brahma muhurta", fmtRange(p.brahma), "Dhyan aur path ke liye", "fact--good")}
      ${fact("Rahu kaal", fmtRange(p.kaal.rahu), "Naya kaam shuru karne se bachte hain", "fact--avoid")}
      ${fact("Yamaganda", fmtRange(p.kaal.yamaganda), `Gulika: ${fmtRange(p.kaal.gulika)}`, "fact--avoid")}
    </div>
    <h3 class="sub-h">Aaj ka choghadiya</h3>
    <p class="sub-note">Din ke 8 hisse. Amrit, Shubh, Labh achhe maane jaate hain; Udveg, Rog, Kaal se bachte hain.</p>
    <div class="chog-scroll"><div class="chog" aria-label="Din ka choghadiya">${p.choghadiya.day.map((c) => slotHtml(c, now)).join("")}</div></div>
    <h3 class="sub-h" style="font-size:1.1rem;margin-top:18px">Raat ka choghadiya</h3>
    <div class="chog-scroll"><div class="chog" aria-label="Raat ka choghadiya">${p.choghadiya.night.map((c) => slotHtml(c, now)).join("")}</div></div>
    <div class="legend"><span><i class="g"></i>Shubh</span><span><i class="n"></i>Normal</span><span><i class="a"></i>Bachein</span></div>
    <p class="fine">Din ${esc(p.weekday.hi)} ka hai, swami ${esc(p.weekday.lordHi)}. Shubh rang: ${esc(p.weekday.colour.hi)}. Mantra: ${esc(p.weekday.mantra)}</p>`;
}

function renderVrat(list) {
  $("vrat").innerHTML = list.slice(0, 8).map((u) => {
    const [, m, d] = u.date.split("-");
    return `<li><div class="d"><b>${Number(d)}</b><span>${dateLabel(u.date, { month: "short" })}</span></div>
      <div><h3>${esc(u.hi)} <small class="muted">${esc(u.en)}</small></h3>
      <p>${esc(u.weekday.hi)}. ${esc(u.note)}</p></div></li>`;
  }).join("");
}

async function loadToday() {
  $("locName").textContent = loc.name;
  try {
    const data = await api(`/api/today?${q()}`);
    todayData = data;
    renderMoon(data.panchang);
    renderPanchang(data.panchang);
    renderVrat(data.panchang.upcoming || []);
  } catch (e) {
    $("panchang").innerHTML = `<div class="fail">${esc(e.message)}</div>`;
    $("moonBox").innerHTML = "";
  }
}

// ---------- location change ----------
const locSearch = placeSearch({
  input: $("locInput"),
  list: $("locList"),
  onPick: (p) => {
    loc = { name: p.label.split(",")[0], lat: p.lat, lon: p.lon, tz: p.tz };
    store.set("shubhly.loc", loc);
    show($("locEdit"), false);
    $("locInput").value = "";
    horoDate = todayIn(loc.tz);
    loadToday();
    loadHoroscope();
    toast(`${loc.name} set`);
  },
});
$("locChange").addEventListener("click", () => {
  const box = $("locEdit");
  show(box, box.hidden);
  if (!box.hidden) $("locInput").focus();
});

// ---------- rashifal ----------
let horoDate = todayIn(loc.tz);
let horo = null;
let shownRashi = myRashi;
const horoCache = new Map();

function renderGrid() {
  const rashis = horo ? horo.rashis : null;
  if (!rashis) return;
  $("rashiGrid").innerHTML = rashis.map((r) => `
    <button type="button" class="rashi-btn${r.index === myRashi ? " mine" : ""}" data-i="${r.index}" aria-pressed="${r.index === shownRashi}">
      <span class="sym" aria-hidden="true">${r.symbol}</span>
      <span class="hi">${esc(r.signHi)}</span>
      <span class="en">${esc(r.sign)}</span>
    </button>`).join("");
}

function meter(label, n) {
  return `<li><span>${label}</span><span class="dots" role="img" aria-label="${n} out of 5">${dots(n)}</span></li>`;
}

function readingText(r) {
  return `${r.signHi} (${r.sign}), ${dateLabel(horo.date)}\n${r.moodLabel}: ${r.theme}\n${r.text}\n\nShubhly: ${location.origin}`;
}

async function renderReading() {
  const box = $("reading");
  if (!horo) return;
  if (shownRashi === null) {
    box.innerHTML = `<div class="pick-note"><h3>Apni rashi chuno</h3>
      <p>Upar se apni chandra rashi chuno. Pata nahi? Kundli banao, hum yaad rakh lenge.</p>
      <p class="muted" style="margin:0">Aaj chandrama ${esc(horo.moonSign.signHi)} mein hai. ${esc(horo.tithiTone)}</p></div>`;
    return;
  }
  const r = horo.rashis[shownRashi];
  const wd = horo.weekday;
  box.innerHTML = `
    <article class="reading">
      <div>
        <div class="reading-title"><h3>${r.symbol} ${esc(r.signHi)}</h3><small>${esc(r.sign)}, swami ${esc(HI[r.lord] || r.lord)}</small></div>
        <span class="mood mood--${r.mood}">${esc(r.moodLabel)}</span>
        <p class="reading-theme">${esc(r.theme)}</p>
        <p>${esc(r.text)}</p>
        <p class="reading-trait">${esc(r.trait)}</p>
        <p class="muted">${esc(horo.tithiTone)}</p>
        <div id="sati"></div>
        <div class="reading-actions">
          <button type="button" class="btn btn-dark" id="shareRead">Share karo</button>
          ${r.index === myRashi ? "" : '<button type="button" class="btn btn-outline" id="makeMine">Yeh meri rashi hai</button>'}
        </div>
      </div>
      <div class="reading-aside">
        <ul class="meters">
          ${meter("Pyaar", r.stars.love)}${meter("Career", r.stars.career)}
          ${meter("Paisa", r.stars.money)}${meter("Sehat", r.stars.health)}
        </ul>
        <div class="lucky">
          <div><span class="swatch" style="background:${esc(r.lucky.colour.hex)}"></span><span>${esc(r.lucky.colour.hi)}</span></div>
          <div><span class="lucky-num">${r.lucky.number}</span><span>shubh ank</span></div>
        </div>
        <div class="mantra"><small>${esc(wd.hi)} ka mantra</small><div class="m">${esc(wd.mantra)}</div><small>${esc(wd.deityHi)}</small></div>
      </div>
    </article>`;

  $("shareRead").addEventListener("click", () => shareText(readingText(r)));
  const mk = $("makeMine");
  if (mk) mk.addEventListener("click", () => setMyRashi(r.index));

  if (horoDate === todayIn(loc.tz)) loadSati(r.index);
}

async function loadSati(idx) {
  try {
    const d = await api(`/api/today?${q({ moon: idx })}`);
    const s = d.personal?.sadeSati;
    if (!s || (!s.active && !s.dhaiya) || shownRashi !== idx) return;
    const el = $("sati");
    if (!el) return;
    el.innerHTML = `<div class="callout callout--calm"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p>${esc(s.tip)}</p></div>`;
  } catch { /* optional card */ }
}

function setMyRashi(i) {
  myRashi = i;
  shownRashi = i;
  store.set("shubhly.rashi", i);
  renderGrid();
  renderReading();
  toast("Rashi yaad rakh li");
}

$("rashiGrid").addEventListener("click", (e) => {
  const b = e.target.closest(".rashi-btn");
  if (!b) return;
  shownRashi = Number(b.dataset.i);
  renderGrid();
  renderReading();
});

async function loadHoroscope() {
  $("dNow").textContent = dateLabel(horoDate, { weekday: "long", day: "numeric", month: "long" });
  show($("dToday"), horoDate !== todayIn(loc.tz));
  try {
    const key = `${horoDate}|${loc.lat}|${loc.lon}`;
    if (!horoCache.has(key)) horoCache.set(key, await api(`/api/horoscope?${q({ date: horoDate })}`));
    horo = horoCache.get(key);
    renderGrid();
    renderReading();
  } catch (e) {
    $("reading").innerHTML = `<div class="fail">${esc(e.message)}</div>`;
  }
}

$("dPrev").addEventListener("click", () => { horoDate = addDays(horoDate, -1); loadHoroscope(); });
$("dNext").addEventListener("click", () => { horoDate = addDays(horoDate, 1); loadHoroscope(); });
$("dToday").addEventListener("click", () => { horoDate = todayIn(loc.tz); loadHoroscope(); });

async function shareText(text) {
  try {
    if (navigator.share) { await navigator.share({ text }); return; }
  } catch (e) { if (e.name === "AbortError") return; }
  try {
    await navigator.clipboard.writeText(text);
    toast("Copy ho gaya, ab kahin bhi paste karo");
  } catch {
    toast("Copy nahi ho paya");
  }
}

// ---------- kundli form ----------
let selectedPlace = null;
let lastPayload = null;
let lastResult = null;
const placeInput = $("place");
const picked = $("placePicked");

function pickBirthPlace(p) {
  selectedPlace = p;
  placeInput.value = p.label;
  picked.textContent = `Selected: ${p.label}`;
  show(picked, true);
}
const birthSearch = placeSearch({ input: placeInput, list: $("places"), onPick: pickBirthPlace });
placeInput.addEventListener("input", () => { selectedPlace = null; show(picked, false); });

$("timeUnknown").addEventListener("change", (e) => {
  const t = $("time");
  if (e.target.checked) { t.value = "12:00"; t.disabled = true; } else { t.disabled = false; }
});

function renderSaved() {
  const box = $("saved");
  if (!profiles.length) { show(box, false); return; }
  box.innerHTML = '<span class="muted">Saved:</span>' + profiles.map((p, i) => `
    <span class="saved-chip"><button type="button" class="open" data-open="${i}">${esc(p.name || p.date)}</button>
    <button type="button" class="del" data-del="${i}" aria-label="${esc(p.name || p.date)} hatao">&times;</button></span>`).join("");
  show(box, true);
}

$("saved").addEventListener("click", (e) => {
  const o = e.target.closest("[data-open]");
  const d = e.target.closest("[data-del]");
  if (o) {
    const p = profiles[Number(o.dataset.open)];
    $("name").value = p.name || "";
    $("date").value = p.date;
    $("timeUnknown").checked = !!p.timeUnknown;
    $("time").disabled = !!p.timeUnknown;
    $("time").value = p.time;
    pickBirthPlace(p.place);
    $("form").requestSubmit();
  } else if (d) {
    profiles.splice(Number(d.dataset.del), 1);
    store.set("shubhly.profiles", profiles);
    renderSaved();
  }
});

function saveProfile(payload) {
  if (!$("remember").checked) return;
  const key = (p) => `${p.name}|${p.date}|${p.time}|${p.place.label}`;
  profiles = [payload, ...profiles.filter((p) => key(p) !== key(payload))].slice(0, 4);
  store.set("shubhly.profiles", profiles);
  renderSaved();
}

function collect() {
  const timeUnknown = $("timeUnknown").checked;
  return {
    name: $("name").value.trim(),
    date: $("date").value,
    time: timeUnknown ? "12:00" : $("time").value,
    timeUnknown,
    place: selectedPlace,
  };
}

function fmtMonth(iso) {
  return dateLabel(iso, { month: "short", year: "numeric" });
}

function renderResult(data, payload) {
  const chart = data.chart;
  $("resName").textContent = data.name || "Aapki kundli";
  $("resMeta").textContent =
    `${payload.date}, ${payload.timeUnknown ? "time pata nahi" : fmt12(payload.time)}, ${payload.place.label}`;

  const asc = chart.ascendant;
  const chips = [
    ["Lagna", `${asc.sign} (${asc.signHi}) ${asc.degInSign.toFixed(1)}°`],
    ["Rashi", `${chart.moonSign.sign} (${chart.moonSign.signHi})`],
    ["Nakshatra", `${chart.nakshatra.name}, pada ${chart.nakshatra.pada}`],
  ];
  $("chips").innerHTML = chips
    .filter(([k]) => !(payload.timeUnknown && k === "Lagna"))
    .map(([k, v]) => `<span class="chip"><b>${esc(k)}:</b> ${esc(v)}</span>`).join("");
  show($("unknownNote"), payload.timeUnknown);

  const ins = data.insights || {};
  const items = [];
  if (ins.lagna) items.push(["Aapka swabhav (lagna)", ins.lagna]);
  if (ins.rashi) items.push(["Aapka mann (chandra rashi)", ins.rashi]);
  if (ins.dasha) items.push([`Abhi ka daur: ${ins.dasha.lord}`, ins.dasha.text]);
  $("insight").innerHTML = items.map(([h, t]) => `<li><b>${esc(h)}</b>${esc(t)}</li>`).join("");

  $("chart").innerHTML = chartSvg(chart);
  $("legend").textContent =
    "Su सूर्य, Mo चंद्र, Ma मंगल, Me बुध, Ju गुरु, Ve शुक्र, Sa शनि, Ra राहु, Ke केतु. Number = rashi (1 Aries … 12 Pisces).";

  $("planetTable").querySelector("tbody").innerHTML = chart.planets.map((p) => `<tr>
      <td><b>${esc(p.key)}</b> <small>${esc(p.hi)}</small>${p.retrograde ? " <small>(R)</small>" : ""}</td>
      <td>${esc(p.sign)} <small>${esc(p.signHi)}</small></td>
      <td>${p.degInSign.toFixed(1)}°</td><td>${p.house}</td>
      <td>${esc(p.nakshatra)} <small>pada ${p.pada}</small></td></tr>`).join("");

  const cur = chart.dasha.current;
  const box = $("dashaBox");
  if (cur && !payload.timeUnknown) {
    const md = cur.mahadasha, ad = cur.antardasha;
    box.innerHTML = `<b>Abhi ka dasha:</b> ${esc(md.lord)} (${esc(HI[md.lord])}) mahadasha, ${fmtMonth(md.start)} se ${fmtMonth(md.end)} tak` +
      (ad ? `. Antardasha: ${esc(ad.lord)} (${esc(HI[ad.lord])}), ${fmtMonth(ad.end)} tak.` : ".");
    show(box, true);
  } else show(box, false);

  const s = data.sadeSati;
  const sb = $("satiBox");
  if (s && (s.active || s.dhaiya)) {
    sb.className = "callout callout--calm";
    sb.innerHTML = `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p>${esc(s.common)}</p><p><b>${esc(s.tip)}</b></p>` +
      (s.saturn ? `<p class="muted" style="margin:0">Shani ${esc(s.saturn.sign)} mein hai, ${fmtMonth(s.saturn.entered)} se ${fmtMonth(s.saturn.leaves)} tak.</p>` : "");
    show(sb, true);
  } else show(sb, false);

  show($("result"), true);
  show($("reportOut"), false);
  show($("printBtn"), false);
  show($("reportError"), false);
  $("reportOut").innerHTML = "";
  setBusy($("reportBtn"), false, "Get my AI report");
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });

  // personalise the rashifal for this person
  const idx = chart.moonSign.index ?? chart.moonSign.signIndex;
  if (Number.isInteger(idx)) {
    myRashi = idx;
    shownRashi = idx;
    store.set("shubhly.rashi", idx);
    renderGrid();
    renderReading();
  }
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("formError");
  show(err, false);
  if (!$("date").value) { err.textContent = "Janm ki date daalo."; show(err); return; }
  if (!$("timeUnknown").checked && !$("time").value) { err.textContent = "Janm ka time daalo, ya 'time nahi pata' chuno."; show(err); return; }
  const btn = $("go");
  setBusy(btn, true, "Kundli ban rahi hai...");
  try {
    if (!selectedPlace) {
      const text = placeInput.value.trim();
      const first = text.length >= 2 ? await birthSearch.first(text).catch(() => null) : null;
      if (!first) throw new Error("Janm ki jagah list se chuno.");
      pickBirthPlace(first);
    }
    const payload = collect();
    const data = await api("/api/kundli", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    lastPayload = payload;
    lastResult = data;
    saveProfile(payload);
    renderResult(data, payload);
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, "Get my kundli");
  }
});

// ---------- share card ----------
$("shareBtn").addEventListener("click", async () => {
  if (!lastResult) return;
  const c = lastResult.chart;
  const rows = [["Chandra rashi", `${c.moonSign.sign} ${c.moonSign.signHi}`],
    ["Nakshatra", `${c.nakshatra.name}, pada ${c.nakshatra.pada}`]];
  if (!lastPayload.timeUnknown) rows.unshift(["Lagna", `${c.ascendant.sign} ${c.ascendant.signHi}`]);
  const blob = await makeShareCard({
    title: lastResult.name ? `${lastResult.name} ki kundli` : "Meri kundli",
    subtitle: "shubhly.com par apni kundli banao",
    rows,
  });
  const file = new File([blob], "shubhly-kundli.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: "Meri kundli, Shubhly par" });
      return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "shubhly-kundli.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast("Card download ho gaya");
});

$("scrollReport").addEventListener("click", () => {
  $("reportCard").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ---------- AI report ----------
$("reportBtn").addEventListener("click", async () => {
  if (!lastPayload) return;
  const btn = $("reportBtn"), err = $("reportError");
  show(err, false);
  setBusy(btn, true, "Report likh rahe hain...");
  try {
    const lang = document.querySelector('input[name="lang"]:checked').value;
    const data = await api("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lastPayload, topic: $("topic").value, language: lang }),
    });
    $("reportOut").innerHTML = renderMarkdown(data.report);
    show($("reportOut"), true);
    show($("printBtn"), true);
    $("reportOut").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, "Get my AI report");
  }
});
$("printBtn").addEventListener("click", () => window.print());

// ---------- start ----------
(async function init() {
  touchStreak();
  renderSaved();
  try { config = await api("/api/config"); } catch { /* optional */ }
  if (config.whatsappUrl) {
    const wa = $("waBtn");
    wa.href = config.whatsappUrl;
    show(wa, true);
    $("storeWa").href = config.whatsappUrl;
    $("storeWa").target = "_blank";
    $("storeWa").rel = "noopener";
  }
  loadToday();
  loadHoroscope();
})();
