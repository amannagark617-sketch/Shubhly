import {
  esc, fmt12, todayIn, nowIn, addDays, dateLabel, setDateLocale,
  inSlot, dots, moonSvg, chartSvg, westernSvg, renderMarkdown, SHORT, elementBalance, elementsSvg, timelineSvg,
} from "/lib.js";
import { makeShareCard } from "/card.js";
import { initFx, fillMarquee } from "/fx.js";
import { SIGN_EN, planetName, signName, nakName, dayName, pickName, DATE_LOCALE } from "/names.js";
import { initLiveSky } from "/livesky.js";
import { initGuides } from "/chat.js";
import { GUIDES, isResting } from "/guides.js";

// Display guide image or SVG avatar
function guideAvatar(guide) {
  if (guide.image) {
    return `<img src="${guide.image}" alt="${guide.name}" loading="lazy" class="guide-avatar">`;
  }
  // Fallback (shouldn't be needed)
  return `<span class="avatar-placeholder">${guide.name.charAt(0)}</span>`;
}
import { cardSvg, backSvg, drawThree, cardText } from "/tarot.js";
import { t, getLang, setLang, applyStatic, LANGS, LANG_NAMES } from "/i18n.js";

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

// ---------- nav dropdown menus ----------
document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const btn = dropdown.querySelector(".nav-btn");
  const menu = dropdown.querySelector(".nav-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.toggleAttribute("open");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => dropdown.removeAttribute("open"));
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".nav-dropdown[open]").forEach((d) => d.removeAttribute("open"));
});

const DEFAULT_LOC = { name: "Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };
let loc = store.get("shubhly.loc", DEFAULT_LOC);
let myRashi = store.get("shubhly.rashi", null); // 0..11
let profiles = store.get("shubhly.profiles", []);
let config = { whatsappUrl: null };

// names in the chosen language (tables live in names.js)
const L = (en, hi) => pickName(getLang(), en, hi);
const planet = (key) => planetName(getLang(), key);
const sn = (en, hi, short = false) => signName(getLang(), en, hi, short);
const nak = (en, hi) => nakName(getLang(), en, hi);
const day = (en, hi) => dayName(getLang(), en, hi);

const until = (e) => (e ? t(e.nextDay ? "until_next" : "until", { time: fmt12(e.time) }) : "");
const rng = (r) => (r ? t("range", { a: fmt12(r.from), b: fmt12(r.to) }) : "");

// ---------- helpers ----------
let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  show(el, true);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => show(el, false), 2600);
}

function setBusy(btn, busy, label) {
  btn.disabled = busy;
  btn.innerHTML = busy ? `<span class="spinner"></span>${esc(label)}` : esc(label);
}

async function api(path, options) {
  const res = await fetch(path, options);
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || t("err_generic"));
  return data;
}

const q = (extra = {}) => new URLSearchParams({
  lat: loc.lat, lon: loc.lon, tz: loc.tz, lang: getLang(), ...extra,
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
    list.innerHTML = items.length ? "" : `<li class="none">${esc(t("f_no_place"))}</li>`;
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
  return {
    first: async (text) => {
      const data = await api(`/api/places?q=${encodeURIComponent(text)}`);
      return data.places.find((p) => p.tz) || null;
    },
  };
}

// ---------- streak ----------
let streakCount = 0;
function touchStreak() {
  const today = todayIn(loc.tz);
  const s = store.get("shubhly.streak", { last: null, count: 0 });
  if (s.last !== today) {
    s.count = s.last === addDays(today, -1) ? s.count + 1 : 1;
    s.last = today;
    store.set("shubhly.streak", s);
  }
  streakCount = s.count;
  renderStreak();
}
function renderStreak() {
  const el = $("streak");
  if (streakCount >= 2) {
    el.textContent = t("streak", { n: streakCount });
    show(el, true);
  }
}

// ---------- panchang ----------
let todayData = null;

function renderMoon(p) {
  $("moonBox").innerHTML = moonSvg(p.moonElongation, p.tithi.name);
  $("moonDay").textContent = `${day(p.weekday.en, p.weekday.hi)}, ${dateLabel(p.date, { day: "numeric", month: "long" })}`;
  $("moonTithi").textContent = L(`${p.tithi.paksha.en} ${p.tithi.name}`, `${p.tithi.paksha.hi} ${p.tithi.nameHi}`);
  $("moonSub").textContent = until(p.tithi.ends);
  $("moonFacts").innerHTML = `
    <div><dt>${esc(t("m_nak"))}</dt><dd>${esc(nak(p.nakshatra.name, p.nakshatra.nameHi))}</dd></div>
    <div><dt>${esc(t("m_moon"))}</dt><dd>${esc(sn(p.moonSign.sign, p.moonSign.signHi))}</dd></div>
    <div><dt>${esc(t("m_rise"))}</dt><dd>${fmt12(p.sunrise)}</dd></div>
    <div><dt>${esc(t("m_set"))}</dt><dd>${fmt12(p.sunset)}</dd></div>`;
}

function fact(title, value, sub, cls = "") {
  return `<div class="fact ${cls}"><h3>${esc(title)}</h3><div class="v">${value}</div>${sub ? `<p class="s">${sub}</p>` : ""}</div>`;
}

function slotHtml(c, i, part, now) {
  const cls = c.quality === "good" ? "slot--good" : c.quality === "avoid" ? "slot--avoid" : "";
  const isNow = now && inSlot(now, c);
  return `<button type="button" class="slot ${cls}${isNow ? " slot--now" : ""}" data-part="${part}" data-i="${i}" aria-pressed="false"${isNow ? ` data-now="${esc(t("chog_now"))}"` : ""}>
    <b>${esc(L(c.name, c.nameHi))}</b><span>${fmt12(c.from)}</span></button>`;
}

function renderPanchang(p) {
  const isToday = p.date === todayIn(loc.tz);
  const now = isToday ? nowIn(loc.tz) : null;
  const hl = p.highlights.length
    ? `<p class="note" style="margin-bottom:14px">${esc(t("p_today_is", { tithi: p.highlights.map((h) => L(h.en, h.hi)).join(", "), note: p.highlights[0].note }))}</p>`
    : "";
  const tn = L(p.tithi.paksha.en + " " + p.tithi.name, p.tithi.paksha.hi + " " + p.tithi.nameHi);
  $("panchang").innerHTML = `
    ${hl}
    <div class="facts">
      ${fact(t("p_tithi"), esc(tn), esc(until(p.tithi.ends)))}
      ${fact(t("p_nak"), esc(nak(p.nakshatra.name, p.nakshatra.nameHi)), esc(until(p.nakshatra.ends)))}
      ${fact(t("p_yoga"), esc(L(p.yoga.name, p.yoga.nameHi)), esc(until(p.yoga.ends)))}
      ${fact(t("p_karana"), esc(L(p.karana.name, p.karana.nameHi)), esc(until(p.karana.ends)))}
      ${fact(t("p_abhijit"), esc(p.abhijit ? rng(p.abhijit) : t("p_abhijit_none")), esc(p.abhijit ? t("p_abhijit_sub") : t("p_abhijit_none_sub")), p.abhijit ? "fact--good" : "")}
      ${fact(t("p_brahma"), esc(rng(p.brahma)), esc(t("p_brahma_sub")), "fact--good")}
      ${fact(t("p_rahu"), esc(rng(p.kaal.rahu)), esc(t("p_rahu_sub")), "fact--avoid")}
      ${fact(t("p_yama"), esc(rng(p.kaal.yamaganda)), esc(t("p_gulika", { time: rng(p.kaal.gulika) })), "fact--avoid")}
    </div>
    <h3 class="sub-h">${esc(t("chog_h"))}</h3>
    <p class="sub-note">${esc(t("chog_note"))}</p>
    <div class="chog-scroll"><div class="chog" aria-label="${esc(t("chog_h"))}">${p.choghadiya.day.map((c, i) => slotHtml(c, i, "day", now)).join("")}</div></div>
    <h3 class="sub-h" style="font-size:1.1rem;margin-top:18px">${esc(t("chog_night"))}</h3>
    <div class="chog-scroll"><div class="chog" aria-label="${esc(t("chog_night"))}">${p.choghadiya.night.map((c, i) => slotHtml(c, i, "night", now)).join("")}</div></div>
    <p class="slot-info" id="slotInfo" aria-live="polite" hidden></p>
    <div class="legend"><span><i class="g"></i>${esc(t("lg_good"))}</span><span><i class="n"></i>${esc(t("lg_normal"))}</span><span><i class="a"></i>${esc(t("lg_avoid"))}</span></div>
    <p class="fine">${esc(t("p_day_line", { day: day(p.weekday.en, p.weekday.hi), lord: planet(p.weekday.lord), colour: p.weekday.colour.name, mantra: p.weekday.mantra }))}</p>`;
}

$("panchang").addEventListener("click", (e) => {
  const b = e.target.closest(".slot");
  if (!b || !todayData) return;
  document.querySelectorAll(".slot[aria-pressed='true']").forEach((x) => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", "true");
  const c = todayData.panchang.choghadiya[b.dataset.part][Number(b.dataset.i)];
  const info = $("slotInfo");
  info.textContent = `${fmt12(c.from)} - ${fmt12(c.to)}. ${t("chog_" + c.name)}`;
  info.className = `slot-info slot-info--${c.quality}`;
  show(info, true);
});

// live "right now" strip
function renderNow() {
  const box = $("nowStrip");
  const p = todayData?.panchang;
  if (!p || p.date !== todayIn(loc.tz)) { show(box, false); return; }
  const now = nowIn(loc.tz);
  const all = [...p.choghadiya.day, ...p.choghadiya.night];
  const cur = all.find((c) => inSlot(now, c));
  const m = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const r = p.kaal.rahu;
  let rahu;
  if (m(now) >= m(r.from) && m(now) < m(r.to)) rahu = t("now_rahu_on", { time: rng(r) });
  else if (m(now) < m(r.from)) rahu = t("now_rahu_in", { time: fmt12(r.from) });
  else rahu = t("now_rahu_done");
  const inRahu = m(now) >= m(r.from) && m(now) < m(r.to);
  const q = cur ? { good: "good", avoid: "avoid", neutral: "neutral" }[cur.quality] : "neutral";
  box.innerHTML = `
    <span class="now-dot now-dot--${q}"></span>
    <b>${esc(t("now_h"))}</b>
    ${cur ? `<span>${esc(t("now_chog", { name: L(cur.name, cur.nameHi), time: until({ time: cur.to, nextDay: false }) }))} <em class="tag tag--${q}">${esc(t("now_" + q))}</em></span>` : ""}
    <span class="${inRahu ? "bad" : ""}">${esc(rahu)}</span>`;
  show(box, true);
}
setInterval(renderNow, 30000);

function renderVrat(list) {
  $("vrat").innerHTML = list.slice(0, 8).map((u) => {
    const d = u.date.split("-")[2];
    return `<li><div class="d"><b>${Number(d)}</b><span>${dateLabel(u.date, { month: "short" })}</span></div>
      <div><h3>${esc(L(u.en, u.hi))}</h3>
      <p>${esc(day(u.weekday.en, u.weekday.hi))}. ${esc(u.note)}</p></div></li>`;
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
    renderNow();
    buildTicker(data.panchang);
  } catch (e) {
    $("panchang").innerHTML = `<div class="fail">${esc(e.message)}</div>`;
    $("moonBox").innerHTML = "";
  }
}

function buildTicker(p) {
  const tn = L(`${p.tithi.paksha.en} ${p.tithi.name}`, `${p.tithi.paksha.hi} ${p.tithi.nameHi}`);
  fillMarquee([
    `${t("p_tithi")}: ${tn}`,
    `${t("m_nak")}: ${nak(p.nakshatra.name, p.nakshatra.nameHi)}`,
    `${t("m_moon")}: ${sn(p.moonSign.sign, p.moonSign.signHi)}`,
    `${t("p_rahu")}: ${rng(p.kaal.rahu)}`,
    p.abhijit ? `${t("p_abhijit")}: ${rng(p.abhijit)}` : `${t("m_rise")}: ${fmt12(p.sunrise)}`,
    `${t("hero_h")}`,
  ]);
}

// ---------- location change ----------
placeSearch({
  input: $("locInput"),
  list: $("locList"),
  onPick: (p) => {
    loc = { name: p.label.split(",")[0], lat: p.lat, lon: p.lon, tz: p.tz };
    store.set("shubhly.loc", loc); liveSky3d = null;
    show($("locEdit"), false);
    $("locInput").value = "";
    horoDate = todayIn(loc.tz);
    horoCache.clear();
    loadToday();
    loadHoroscope();
    toast(t("loc_set", { city: loc.name }));
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
let shownRashi = document.body.dataset.sign != null ? Number(document.body.dataset.sign) : myRashi;
const horoCache = new Map();

function renderGrid() {
  if (!horo) return;
  $("rashiGrid").innerHTML = horo.rashis.map((r) => `
    <button type="button" class="rashi-btn${r.index === myRashi ? " mine" : ""}" data-i="${r.index}" data-mine="${esc(t("rf_mine"))}" aria-pressed="${r.index === shownRashi}">
      <img class="sym" src="/img/rashi-${String(r.index + 1).padStart(2, "0")}.png" alt="" width="256" height="256" loading="lazy" />
      <span class="hi">${esc(sn(r.sign, r.signHi, true))}</span>
    </button>`).join("");
}

function meter(label, n, kind) {
  const lvl = Math.min(5, Math.max(1, Math.round(n)));
  return `<li class="bar-${kind}"><div class="bar-top"><span>${esc(label)}</span><b>${esc(t("rf_l" + lvl))}</b></div><div class="bar-track" role="img" aria-label="${esc(t("rf_out_of", { n: lvl }))}"><i style="width:${lvl * 20}%"></i></div></li>`;
}

function readingText(r) {
  return `${sn(r.sign, r.signHi)}, ${dateLabel(horo.date)}\n${r.moodLabel}: ${r.theme}\n${r.text}\n\nKundli Kaka: ${location.origin}`;
}

function renderReading() {
  const box = $("reading");
  if (!horo) return;
  if (shownRashi === null) {
    box.innerHTML = `<div class="pick-note"><h3>${esc(t("rf_pick_h"))}</h3>
      <p>${esc(t("rf_pick_p"))}</p>
      <p class="muted" style="margin:0">${esc(t("rf_moon_today", { sign: sn(horo.moonSign.sign, horo.moonSign.signHi) }))} ${esc(horo.tithiTone)}</p></div>`;
    return;
  }
  const r = horo.rashis[shownRashi];
  const wd = horo.weekday;
  box.innerHTML = `
    <article class="reading" key="${r.index}">
      <div>
        <div class="reading-title"><h3>${r.symbol} ${esc(sn(r.sign, r.signHi, true))}</h3><small>${esc(t("rf_lord", { lord: planet(r.lord) }))}</small></div>
        <span class="mood mood--${r.mood}">${esc(r.moodLabel)}</span>
        <p class="reading-theme">${esc(r.theme)}</p>
        <p>${esc(r.text)}</p>
        <p class="reading-trait">${esc(r.trait)}</p>
        <p class="muted">${esc(horo.tithiTone)}</p>
        <div id="sati"></div>
        <div class="reading-actions">
          <button type="button" class="btn btn-dark" id="shareRead">${esc(t("rf_share"))}</button>
          ${r.index === myRashi ? "" : `<button type="button" class="btn btn-outline" id="makeMine">${esc(t("rf_make_mine"))}</button>`}
        </div>
      </div>
      <div class="reading-aside">
        <ul class="meters">
          ${meter(t("rf_love"), r.stars.love, "love")}${meter(t("rf_career"), r.stars.career, "career")}
          ${meter(t("rf_money"), r.stars.money, "money")}${meter(t("rf_health"), r.stars.health, "health")}
        </ul>
        <div class="lucky">
          <div><span class="swatch" style="background:${esc(r.lucky.colour.hex)}"></span><span>${esc(r.lucky.colour.name)}</span></div>
          <div><span class="lucky-num">${r.lucky.number}</span><span>${esc(t("rf_lucky_no"))}</span></div>
        </div>
        <div class="mantra"><small>${esc(t("rf_mantra_of", { day: day(wd.en, wd.hi) }))}</small><div class="m">${esc(wd.mantra)}</div><small>${esc(L(wd.deity, wd.deityHi))}</small></div>
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
  toast(t("rf_saved"));
}

$("rashiGrid").addEventListener("click", (e) => {
  const b = e.target.closest(".rashi-btn");
  if (!b) return;
  shownRashi = Number(b.dataset.i);
  renderGrid();
  renderReading();
});

async function loadHoroscope() {
  const today = todayIn(loc.tz);
  $("dNow").textContent = dateLabel(horoDate, { weekday: "long", day: "numeric", month: "long" });
  document.querySelectorAll(".quick button").forEach((b) => {
    b.setAttribute("aria-pressed", String(addDays(today, Number(b.dataset.day)) === horoDate));
  });
  try {
    const key = `${horoDate}|${loc.lat}|${loc.lon}|${getLang()}`;
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
document.querySelector(".quick").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  horoDate = addDays(todayIn(loc.tz), Number(b.dataset.day));
  loadHoroscope();
});

async function shareText(text) {
  try {
    if (navigator.share) { await navigator.share({ text }); return; }
  } catch (e) { if (e.name === "AbortError") return; }
  try {
    await navigator.clipboard.writeText(text);
    toast(t("rf_copy_ok"));
  } catch {
    toast(t("rf_copy_fail"));
  }
}

// ---------- kundli form ----------
let selectedPlace = null;
let lastPayload = null;
let lastResult = null;
let reportText = "";
let reportLang = "en";
const placeInput = $("place");
const picked = $("placePicked");

function pickBirthPlace(p) {
  selectedPlace = p;
  placeInput.value = p.label;
  picked.textContent = t("f_selected", { label: p.label });
  show(picked, true);
}
const birthSearch = placeSearch({ input: placeInput, list: $("places"), onPick: pickBirthPlace });
placeInput.addEventListener("input", () => { selectedPlace = null; show(picked, false); });

$("timeUnknown").addEventListener("change", (e) => {
  const tm = $("time");
  if (e.target.checked) { tm.value = "12:00"; tm.disabled = true; } else { tm.disabled = false; }
});

function renderSaved() {
  const box = $("saved");
  if (!profiles.length) { show(box, false); return; }
  box.innerHTML = `<span class="muted">${esc(t("saved_h"))}</span>` + profiles.map((p, i) => `
    <span class="saved-chip"><button type="button" class="open" data-open="${i}">${esc(p.name || p.date)}</button>
    <button type="button" class="del" data-del="${i}" aria-label="${esc(t("saved_del", { name: p.name || p.date }))}">&times;</button></span>`).join("");
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
    setTradition(p.tradition);
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
  profiles = [payload, ...profiles.filter((p) => key(p) !== key(payload))].slice(0, 8);
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
    tradition: tradition(),
  };
}

const tradition = () => document.querySelector('input[name="tradition"]:checked').value;
function setTradition(v) {
  const r = document.querySelector(`input[name="tradition"][value="${v === "western" ? "western" : "vedic"}"]`);
  if (r) r.checked = true;
  $("trHint").textContent = t(tradition() === "western" ? "tr_western_sub" : "tr_vedic_sub");
}
document.querySelectorAll('input[name="tradition"]').forEach((r) => r.addEventListener("change", () => setTradition(tradition())));

const monthYear = (iso) => dateLabel(iso, { month: "short", year: "numeric" });

function renderLifeReading(data, payload, western) {
  const box = $("readCard");
  const r = data.reading;
  if (!r) { show(box, false); return; }
  const chart = data.chart;
  const moon = chart.planets.find((p) => p.key === "Moon");
  const signBase = western ? chart.sunSign : chart.moonSign;
  const basis = t(western ? "rd_basis_sun" : "rd_basis_moon", { sign: sn(signBase.sign, signBase.signHi) });
  const fmtDay = (iso) => monthYear(iso);
  const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");

  let html = `<h2 class="read-h">${esc(t("rd_h"))}</h2><p class="muted">${esc(basis)}</p>`;
  if (r.lucky) {
    const l = r.lucky;
    html += `<div class="chips read-lucky" aria-label="${esc(t("rd_lucky"))}">
      <span class="chip"><b>${esc(t("rd_lord"))}:</b> ${esc(planet(l.lord))}</span>
      <span class="chip"><b>${esc(t("rd_day"))}:</b> ${esc(day(["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][l.weekday]))}</span>
      <span class="chip"><b>${esc(t("rd_colour"))}:</b> <i class="swatch" style="background:${esc(l.hex)}"></i>${esc(l.colour)}</span>
      <span class="chip"><b>${esc(t("rd_number"))}:</b> ${esc(l.number)}</span>
      <span class="chip"><b>${esc(t("rd_mantra"))}:</b> ${esc(l.mantra)}</span></div>`;
  }
  html += `<div class="read-cols">
    <section class="read-good"><h3>${esc(t("rd_shine"))}</h3><ul>${li(r.strengths)}</ul></section>
    <section class="read-grow"><h3>${esc(t("rd_grow"))}</h3><ul>${li([r.growth])}</ul></section></div>`;

  if (!western) {
    if (r.periods.length || r.jupiter) html += `<h3 class="read-sub">${esc(t("rd_ahead"))}</h3>`;
    if (r.jupiter) {
      html += `<div class="read-jup"><b>${esc(t("rd_jup"))}</b> ${esc(r.jupiter.text)}${r.jupiter.leaves ? ` <small>${esc(t("rd_until", { date: fmtDay(r.jupiter.leaves) }))}</small>` : ""}</div>`;
    }
    if (r.periods.length) {
      html += `<ol class="read-time">` + r.periods.map((p) => `<li${p.current ? ' class="is-now"' : ""}>
        <div class="read-when">${p.current ? `<em>${esc(t("rd_now"))}</em>` : ""}${esc(String(p.from).slice(0, 4))} – ${esc(String(p.to).slice(0, 4))}</div>
        <div><h4>${esc(t("rd_period", { planet: planet(p.lord) }))}</h4>
        <p><b>${esc(t("rd_bring"))}:</b> ${esc(p.bring)}</p><p><b>${esc(t("rd_watch"))}:</b> ${esc(p.watch)}</p></div></li>`).join("") + `</ol>`;
    } else if (payload.timeUnknown) {
      html += `<p class="note">${esc(t("rd_notime"))}</p>`;
    }
  }
  box.innerHTML = html;
  show(box, true);
}

function renderAbout(data, western) {
  const box = $("aboutCard");
  const a = data.about;
  if (western || !a) { show(box, false); return; }
  const moon = data.chart.planets.find((p) => p.key === "Moon");
  const SIGN = (i) => sn(SIGN_EN[i], "");
  const li = (x) => `<li>${esc(x)}</li>`;
  let html = `<h2 class="read-h">${esc(t("ab_h"))}</h2>`;
  if (a.big3) {
    const b = a.big3;
    const row = (k) => b[k] ? `<li><b>${esc(b.labels[k].split("{text}")[0].replace("{sign}", SIGN(b[k].signIndex)).trim())}</b> ${esc(b[k].text)}</li>` : "";
    html += `<section class="about-block"><h3>${esc(t("ab_big3"))}</h3><ul class="big3">${row("sun")}${row("moon")}${row("rising")}</ul></section>`;
  }
  html += `<div class="read-one">`;
  if (a.rising) {
    html += `<section class="read-grow"><h3>${esc(t("ab_rising", { sign: SIGN(a.rising.signIndex) }))}: ${esc(t("rd_grow"))}</h3><ul>${li(a.rising.grow)}</ul></section>`;
  }
  html += `</div>`;
  html += `<section class="about-block"><h3>${esc(t("ab_star", { star: nak(moon.nakshatra, moon.nakshatraHi || moon.nakshatra) }))}</h3><p>${esc(a.star.text)}</p></section>`;
  if (a.sub) html += `<section class="about-block"><h3>${esc(t("ab_sub"))}</h3><p>${esc(a.sub.text)}</p><p><b>${esc(t("rd_bring"))}:</b> ${esc(a.sub.bring)}</p><p><b>${esc(t("rd_watch"))}:</b> ${esc(a.sub.watch)}</p></section>`;
  if (a.focus) html += `<section class="about-block"><h3>${esc(t("ab_focus"))}</h3><p>${esc(a.focus.text)}</p></section>`;
  if (a.money) html += `<section class="about-block"><h3>${esc(t("ab_money"))}</h3><p>${esc(a.money.text)}</p></section>`;
  if (a.love) html += `<section class="about-block"><h3>${esc(t("ab_love"))}</h3><p>${esc(a.love.text)}</p></section>`;
  if (a.career) html += `<section class="about-block"><h3>${esc(t("ab_career"))}</h3><p>${esc(a.career.text)}</p></section>`;
  const good = a.strong.map((x) => x.text);
  const care = [...a.tested.map((x) => x.text), ...(a.mars ? [a.mars.text] : []), ...(a.retro ? [a.retro.text.replace("{planets}", a.retro.planets.map((k) => planet(k)).join(", "))] : [])];
  if (good.length || care.length) {
    html += `<h3 class="read-sub">${esc(t("ab_chart"))}</h3><div class="read-cols">`;
    if (good.length) html += `<section class="read-good"><h3>${esc(t("rd_shine"))}</h3><ul>${good.map(li).join("")}</ul></section>`;
    if (care.length) html += `<section class="read-grow"><h3>${esc(t("rd_grow"))}</h3><ul>${care.map(li).join("")}</ul></section>`;
    html += `</div>`;
  }
  box.innerHTML = html;
  show(box, true);
}

function renderResult(data, payload, { scroll = true } = {}) {
  const chart = data.chart;
  $("resName").textContent = data.name || t("r_title_none");
  $("resMeta").textContent =
    `${payload.date}, ${payload.timeUnknown ? t("r_time_unknown") : fmt12(payload.time)}, ${payload.place.label}`;

  const western = chart.tradition === "western";
  const asc = chart.ascendant;
  const chips = [];
  if (western) {
    chips.push([t("r_sun"), sn(chart.sunSign.sign, chart.sunSign.signHi)]);
    chips.push([t("r_moon"), sn(chart.moonSign.sign, chart.moonSign.signHi)]);
    if (!payload.timeUnknown) chips.push([t("r_rising"), `${sn(asc.sign, asc.signHi)} ${asc.degInSign.toFixed(1)}°`]);
  } else {
    if (!payload.timeUnknown) {
      chips.push([t("r_lagna"), `${sn(asc.sign, asc.signHi)} ${asc.degInSign.toFixed(1)}°`]);
    }
    chips.push([t("r_rashi"), sn(chart.moonSign.sign, chart.moonSign.signHi)]);
    const moonP = chart.planets.find((x) => x.key === "Moon");
    chips.push([t("r_nak"), `${nak(chart.nakshatra.name, moonP?.nakshatraHi || chart.nakshatra.name)}, ${t("r_pada", { n: chart.nakshatra.pada })}`]);
  }
  $("chips").innerHTML = chips.map(([k, v]) => `<span class="chip"><b>${esc(k)}:</b> ${esc(v)}</span>`).join("");
  show($("unknownNote"), payload.timeUnknown);

  const ins = data.insights || {};
  const items = [];
  if (western) {
    if (ins.sun) items.push([t("r_ins_sun"), ins.sun]);
    if (ins.rashi) items.push([t("r_ins_moon"), ins.rashi]);
    if (ins.lagna) items.push([t("r_ins_rising"), ins.lagna]);
  } else {
    if (ins.lagna) items.push([t("r_ins_lagna"), ins.lagna]);
    if (ins.rashi) items.push([t("r_ins_rashi"), ins.rashi]);
    if (ins.dasha) items.push([t("r_ins_dasha", { lord: planet(ins.dasha.lord) }), ins.dasha.text]);
  }
  $("insight").innerHTML = items.map(([h, tx]) => `<li><b>${esc(h)}</b>${esc(tx)}</li>`).join("");

  $("chart").innerHTML = western ? westernSvg(chart) : chartSvg(chart);
  const legendKeys = chart.planets.map((p) => p.key);
  $("legend").textContent =
    legendKeys.map((k) => `${SHORT[k]} ${planet(k)}`).join(", ") + ". " + t(western ? "r_legend_w" : "r_legend");

  $("thNak").hidden = western;
  $("planetTable").querySelector("tbody").innerHTML = chart.planets.map((p) => `<tr>
      <td><b>${esc(planet(p.key))}</b>${p.retrograde ? " <small>(R)</small>" : ""}</td>
      <td>${esc(sn(p.sign, p.signHi))}</td>
      <td>${p.degInSign.toFixed(1)}°</td><td>${p.house}</td>
      ${western ? "" : `<td>${esc(nak(p.nakshatra, p.nakshatraHi || p.nakshatra))} <small>${esc(t("r_pada", { n: p.pada }))}</small></td>`}</tr>`).join("");

  const ab = $("aspectBox");
  if (western && chart.aspects?.length) {
    ab.innerHTML = `<h3 class="card-h">${esc(t("asp_h"))}</h3><ul>` + chart.aspects.map((a) =>
      `<li>${esc(planet(a.a))} <b>${esc(t("asp_" + a.type))}</b> ${esc(planet(a.b))} <small>${a.orb}°</small></li>`).join("") + "</ul>";
    show(ab, true);
  } else show(ab, false);

  const cur = chart.dasha?.current;
  const box = $("dashaBox");
  if (cur && !payload.timeUnknown) {
    const md = cur.mahadasha, ad = cur.antardasha;
    box.textContent = t("r_dasha", { md: planet(md.lord), a: monthYear(md.start), b: monthYear(md.end) }) +
      (ad ? t("r_dasha_ad", { ad: planet(ad.lord), c: monthYear(ad.end) }) : "");
    show(box, true);
  } else show(box, false);

  renderLifeReading(data, payload, western);
  renderAbout(data, western);

  const s = data.sadeSati;
  const sb = $("satiBox");
  if (s && (s.active || s.dhaiya)) {
    sb.className = "callout callout--calm";
    sb.innerHTML = `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p>${esc(s.common)}</p><p><b>${esc(s.tip)}</b></p>` +
      (s.saturn ? `<p class="muted" style="margin:0">${esc(t("r_saturn", { sign: sn(s.saturn.sign, s.saturn.signHi || s.saturn.sign), a: monthYear(s.saturn.entered), b: monthYear(s.saturn.leaves) }))}</p>` : "");
    show(sb, true);
  } else show(sb, false);

  show($("result"), true);
  if (scroll) setTimeout(askInstall, 6000);
  store.set("shubhly.sky", skyFromChart(chart, payload.timeUnknown));
  mountResultSky();
  if (s3dWanted) mountSection();
  if (scroll) {
    show($("reportOut"), false);
    reportText = "";
    show($("reportError"), false);
    $("reportOut").innerHTML = "";
    setBusy($("reportBtn"), false, t("rep_btn"));
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });

    const idx = chart.moonSign.index ?? chart.moonSign.signIndex;
    if (!western && Number.isInteger(idx)) {
      myRashi = idx;
      shownRashi = idx;
      store.set("shubhly.rashi", idx);
      renderGrid();
      renderReading();
    }
  }
}

async function fetchKundli(payload) {
  return api("/api/kundli", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, lang: getLang() }),
  });
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("formError");
  show(err, false);
  if (!$("date").value) { err.textContent = t("f_err_date"); show(err); return; }
  if (!$("timeUnknown").checked && !$("time").value) { err.textContent = t("f_err_time"); show(err); return; }
  const btn = $("go");
  setBusy(btn, true, t("f_going"));
  try {
    if (!selectedPlace) {
      const text = placeInput.value.trim();
      const first = text.length >= 2 ? await birthSearch.first(text).catch(() => null) : null;
      if (!first) throw new Error(t("f_err_place"));
      pickBirthPlace(first);
    }
    const payload = collect();
    const data = await fetchKundli(payload);
    lastPayload = payload;
    lastResult = data;
    saveProfile(payload);
    renderResult(data, payload);
    guides?.refresh();
  liveSky?.refresh();
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, t("f_go"));
  }
});


// Gives the visitor a file in a way that works on desktop, Android, iPhone and
// the browsers inside WhatsApp or Instagram (which ignore normal downloads).
async function deliverFile(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return "shared"; }
    catch (e) { if (e.name === "AbortError") return "cancelled"; }
  }
  const url = URL.createObjectURL(blob);
  const ua = navigator.userAgent;
  const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat|; wv\)/i.test(ua);
  if (ios || inApp) {
    if (!window.open(url, "_blank")) location.href = url;
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  return "saved";
}

// ---------- share ----------
function kundliLink(p) {
  const o = { n: p.name || "", d: p.date, t: p.time, u: p.timeUnknown ? 1 : 0, r: p.tradition, p: [p.place.label, p.place.lat, p.place.lon, p.place.tz] };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${location.origin}/kundli#k=${b64}`;
}
function readKundliLink() {
  const m = /^#k=([\w-]+)$/.exec(location.hash);
  if (!m) return null;
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/")))));
    const [label, lat, lon, tz] = o.p;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.d) || !/^\d{2}:\d{2}$/.test(o.t) || !Number.isFinite(lat) || !Number.isFinite(lon) || typeof tz !== "string") return null;
    return { name: String(o.n || "").slice(0, 40), date: o.d, time: o.t, timeUnknown: o.u === 1, tradition: o.r === "western" ? "western" : "vedic", place: { label: String(label).slice(0, 120), lat, lon, tz } };
  } catch { return null; }
}

async function cardFile() {
  const c = lastResult?.chart;
  if (!c) return null;
  const rows = c.tradition === "western" ? [
    [t("r_sun"), sn(c.sunSign.sign, c.sunSign.signHi)],
    [t("r_moon"), sn(c.moonSign.sign, c.moonSign.signHi)],
  ] : [
    [t("r_rashi"), sn(c.moonSign.sign, c.moonSign.signHi)],
    [t("r_nak"), `${nak(c.nakshatra.name, c.planets.find((x) => x.key === "Moon")?.nakshatraHi || c.nakshatra.name)}, ${t("r_pada", { n: c.nakshatra.pada })}`],
  ];
  if (!lastPayload.timeUnknown) rows.unshift([t(c.tradition === "western" ? "r_rising" : "r_lagna"), sn(c.ascendant.sign, c.ascendant.signHi)]);
  const blob = await makeShareCard({
    title: lastResult.name ? t("card_title", { name: lastResult.name }) : t("card_title_me"),
    subtitle: t("card_sub"),
    rows,
    footer: t("card_footer"),
  });
  return new File([blob], "kundlikaka-kundli.png", { type: "image/png" });
}

// Sends the visitor's own kundli straight to a chat app: a picture and a link
// that opens the same kundli, so nobody has to save and upload anything.
async function shareKundli(who) {
  const birth = who || lastPayload || profiles[0];
  if (!birth) return;
  const url = kundliLink(birth);
  const text = t("g_share_text");
  try {
    const file = who && who !== lastPayload ? null : await cardFile().catch(() => null);
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: `${text} ${url}` });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: "Kundli Kaka", text, url });
      return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  try {
    await navigator.clipboard.writeText(url);
    toast(t("g_link_copied"));
  } catch {
    toast(url);
  }
}
$("shareBtn").addEventListener("click", () => shareKundli());

// Everyone the visitor has made a kundli for, for the chat to choose from.
const personKey = (p) => `${p.name}|${p.date}|${p.time}|${p.place?.label}`;
function chatPeople() {
  const seen = new Set();
  return [lastPayload, ...profiles].filter(Boolean).filter((p) => {
    const k = personKey(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map((p) => ({ key: personKey(p), label: p.name || p.date, payload: p }));
}

// What the guides need to greet the visitor by their own chart.
let briefFor = "", briefData = null;
async function chartBrief(birth = lastPayload || profiles[0]) {
  if (!birth) return null;
  const key = JSON.stringify([birth, getLang()]);
  if (key === briefFor && briefData) return briefData;
  const data = lastResult && lastPayload === birth ? lastResult : await fetchKundli(birth);
  const c = data.chart, asc = c.ascendant, west = c.tradition === "western";
  const chips = [];
  if (west) {
    chips.push([t("r_sun"), sn(c.sunSign.sign, c.sunSign.signHi)], [t("r_moon"), sn(c.moonSign.sign, c.moonSign.signHi)]);
    if (!birth.timeUnknown) chips.push([t("r_rising"), sn(asc.sign, asc.signHi)]);
  } else {
    if (!birth.timeUnknown) chips.push([t("r_lagna"), sn(asc.sign, asc.signHi)]);
    chips.push([t("r_rashi"), sn(c.moonSign.sign, c.moonSign.signHi)],
      [t("r_nak"), nak(c.nakshatra.name, c.planets.find((x) => x.key === "Moon")?.nakshatraHi || c.nakshatra.name)]);
  }
  briefFor = key;
  briefData = {
    user: birth.name || "",
    chips,
    moon: sn(c.moonSign.sign, c.moonSign.signHi),
    summary: chips.map(([k, v]) => `${k} ${v}`).join(", "),
  };
  return briefData;
}

// Opening a shared link shows that kundli at once, without saving it here.
function openSharedKundli() {
  const p = readKundliLink();
  if (!p) return;
  if (document.body.dataset.page !== "kundli") { location.replace("/kundli" + location.hash); return; }
  history.replaceState(null, "", location.pathname + location.search);
  $("name").value = p.name;
  $("date").value = p.date;
  $("timeUnknown").checked = p.timeUnknown;
  $("time").disabled = p.timeUnknown;
  $("time").value = p.time;
  $("remember").checked = false;
  setTradition(p.tradition);
  pickBirthPlace(p.place);
  $("form").requestSubmit();
}

$("scrollReport").addEventListener("click", () => {
  $("reportCard").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ---------- Kundli Milan ----------
const matchPlace = { a: null, b: null };
for (const k of ["a", "b"]) {
  const input = $(`m${k}Place`), picked = $(`m${k}Picked`);
  placeSearch({
    input, list: $(`m${k}Places`),
    onPick: (p) => { matchPlace[k] = p; input.value = p.label; picked.textContent = t("f_selected", { label: p.label }); show(picked, true); },
  });
  input.addEventListener("input", () => { matchPlace[k] = null; show(picked, false); });
  $(`m${k}Unknown`).addEventListener("change", (e) => {
    const tm = $(`m${k}Time`);
    if (e.target.checked) { tm.value = "12:00"; tm.disabled = true; } else tm.disabled = false;
  });
}
function matchPerson(k) {
  const unknown = $(`m${k}Unknown`).checked;
  return { name: $(`m${k}Name`).value.trim(), date: $(`m${k}Date`).value, time: unknown ? "12:00" : $(`m${k}Time`).value, timeUnknown: unknown, place: matchPlace[k] };
}
$("mUseMine").addEventListener("click", () => {
  const p = lastPayload || profiles[0];
  if (!p) { toast(t("g_chart_off")); return; }
  $("maName").value = p.name || "";
  $("maDate").value = p.date;
  $("maUnknown").checked = !!p.timeUnknown;
  $("maTime").disabled = !!p.timeUnknown;
  $("maTime").value = p.time;
  matchPlace.a = p.place;
  $("maPlace").value = p.place.label;
  $("maPicked").textContent = t("f_selected", { label: p.place.label });
  show($("maPicked"), true);
});
let matchText = "";
$("matchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("matchError"), btn = $("matchGo");
  show(err, false);
  const a = matchPerson("a"), b = matchPerson("b");
  if (![a, b].every((x) => x.date && x.time && x.place)) { err.textContent = t("m_err"); show(err, true); return; }
  setBusy(btn, true, t("m_busy"));
  try {
    const lang = getLang();
    const r = await api("/api/match", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ a, b, lang }),
    });
    const n1 = r.names[0] || t("m_p1"), n2 = r.names[1] || t("m_p2");
    const num = (x) => String(Number.isInteger(x) ? x : x.toFixed(1));
    const best = r.items.find((i) => i.key === r.best);
    const care = r.care ? r.items.find((i) => i.key === r.care) : null;
    const out = $("matchOut");
    out.innerHTML = `<div class="match-score"><div class="ring" style="--p:${(r.total / r.outOf * 100).toFixed(1)}"><b>${esc(num(r.total))}</b><small>/ ${r.outOf}</small></div>
      <div><h3>${esc(n1)} &amp; ${esc(n2)}</h3><p class="match-verdict">${esc(r.verdict)}</p>
      <p class="muted">${esc(t("m_of", { n: num(r.total) }))}</p></div></div>
      <h3 class="read-sub">${esc(t("m_areas"))}</h3>
      <ul class="koota">${r.areas.map((i) => `<li class="koota--${i.level}">
        <div class="koota-top"><b>${esc(i.name)}</b><span>${i.pct}%</span></div>
        <div class="bar" aria-hidden="true"><i style="width:${i.pct}%"></i></div><p>${esc(i.text)}</p></li>`).join("")}</ul>
      <div class="read-cols">
        <section class="read-good"><h3>${esc(t("m_best"))}</h3><ul><li>${esc(best.name)}: ${esc(best.text)}</li></ul></section>
        ${care ? `<section class="read-grow"><h3>${esc(t("m_care"))}</h3><ul><li>${esc(care.name)}: ${esc(care.text)}</li></ul></section>` : ""}
      </div>
      <h3 class="read-sub">${esc(t("m_people"))}</h3>
      <div class="read-cols">${r.people.map((pp, idx) => `<section class="about-block"><h3>${esc(idx ? n2 : n1)}</h3>
        <p><b>${esc(sn(SIGN_EN[pp.signIndex], ""))}</b></p><ul><li>${esc(pp.strength)}</li><li>${esc(pp.grow)}</li></ul></section>`).join("")}</div>
      ${r.mangal ? `<section class="about-block"><h3>${esc(t("m_mangal"))}</h3><p>${esc(r.mangal)}</p></section>` : ""}
      <h3 class="read-sub">${esc(t("m_rows"))}</h3>
      <ul class="koota">${r.items.map((i) => `<li class="koota--${i.level}">
        <div class="koota-top"><b>${esc(i.name)}</b><span>${esc(num(i.score))} / ${i.max}</span></div>
        <div class="bar" aria-hidden="true"><i style="width:${(i.score / i.max * 100).toFixed(0)}%"></i></div>
        <small>${esc(i.measures)}</small><p>${esc(i.text)}</p></li>`).join("")}</ul>
      <p class="fine">${esc(r.summary)}</p>
      <button type="button" class="btn btn-outline" id="matchShare">${esc(t("m_share"))}</button>`;
    matchText = `${n1} & ${n2}: ${num(r.total)}/36 (${r.verdict})\nKundli Kaka Kundli Milan: ${location.origin}/match`;
    show(out, true);
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (ex) {
    err.textContent = ex.message; show(err, true);
  } finally {
    setBusy(btn, false, t("m_go"));
  }
});
$("matchOut").addEventListener("click", async (e) => {
  if (!e.target.closest("#matchShare")) return;
  if (navigator.share) { try { await navigator.share({ text: matchText }); return; } catch { /* cancelled */ } }
  try { await navigator.clipboard.writeText(matchText); toast(t("rf_copy_ok")); } catch { toast(t("rf_copy_fail")); }
});

// ---------- AI report ----------
const REP_DEFAULT = {
  strengths: "Your strengths", watch: "Room to grow", now: "The time you are in", tips: "Simple tips",
  elements: "Your elements", timeline: "Your life periods", fire: "Fire", earth: "Earth", air: "Air", water: "Water",
};
function renderReport(r, chart, timeUnknown) {
  if (!r || typeof r === "string") return renderMarkdown(r || "");
  if (r.markdown) return renderMarkdown(r.markdown);
  const L = (k) => r.labels?.[k] || REP_DEFAULT[k];
  const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
  const west = chart.tradition === "western";
  const names = ["fire", "earth", "air", "water"].map(L);
  const dasha = !west && !timeUnknown ? timelineSvg(chart) : "";
  const card = (cls, h, body) => body ? `<section class="rc ${cls}"><h4>${esc(h)}</h4>${body}</section>` : "";
  return `<div class="rcards">
    ${r.headline ? `<p class="rc-head">${esc(r.headline)}</p>` : ""}
    ${r.glance ? `<p class="rc-glance">${esc(r.glance)}</p>` : ""}
    <div class="rc-grid">
      ${card("rc--good", L("strengths"), r.strengths.length ? `<ul>${li(r.strengths)}</ul>` : "")}
      ${card("rc--grow", L("watch"), r.watch.length ? `<ul>${li(r.watch)}</ul>` : "")}
    </div>
    ${card("rc--focus", r.focusTitle || t("rep_focus"), r.focus.length ? `<ul>${li(r.focus)}</ul>` : "")}
    <div class="rc-grid">
      ${card("rc--viz", L("elements"), elementsSvg(elementBalance(chart, { timeUnknown }), names))}
      ${dasha ? card("rc--viz", L("timeline"), dasha + (r.now ? `<p class="rc-now">${esc(r.now)}</p>` : "")) : ""}
    </div>
    ${!dasha && r.now ? card("rc--now", L("now"), `<p>${esc(r.now)}</p>`) : ""}
    ${card("rc--tips", L("tips"), r.tips.length ? `<ul>${li(r.tips)}</ul>` : "")}
    ${r.closing ? `<p class="rc-close">${esc(r.closing)}</p>` : ""}
    <button type="button" class="btn btn-primary" id="reportPdf">${esc(t("rep_pdf"))}</button>
  </div>`;
}
$("reportOut").addEventListener("click", (e) => { if (e.target.closest("#reportPdf")) $("pdfBtn").click(); });

$("reportBtn").addEventListener("click", async () => {
  if (!lastPayload) return;
  const btn = $("reportBtn"), err = $("reportError");
  show(err, false);
  setBusy(btn, true, t("rep_busy"));
  try {
    const lang = $("repLang").value;
    const data = await api("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lastPayload, topic: $("topic").value, language: lang }),
    });
    $("reportOut").innerHTML = renderReport(data.report, data.chart, lastPayload?.timeUnknown);
    show($("reportOut"), true);
    reportText = data.report;
    reportLang = lang;
    $("reportOut").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, t("rep_btn"));
  }
});
$("pdfBtn").addEventListener("click", async () => {
  if (!lastPayload) return;
  const btn = $("pdfBtn");
  setBusy(btn, true, t("pdf_busy"));
  try {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lastPayload, lang: reportText ? reportLang : getLang(), report: reportText }),
    });
    if (!res.ok) {
      let msg = t("err_generic");
      try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
      throw new Error(msg);
    }
    const blob = await res.blob();
    if (await deliverFile(blob, "kundlikaka-kundli.pdf") === "cancelled") return;
    toast(t("pdf_done"));
  } catch (ex) {
    toast(ex.message);
  } finally {
    setBusy(btn, false, t("rep_pdf"));
  }
});

// ---------- analytics (Google Analytics, only when GA_ID is set) ----------
window.track = (name, params = {}) => { try { if (window.gtag) window.gtag("event", name, params); } catch { /* ignore */ } };
function startAnalytics(id) {
  if (!id || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
}

// ---------- premium ----------
function renderPremium() {
  const joined = store.get("shubhly.premium", false);
  $("premiumNote").textContent = t(joined ? "pr_joined" : "pr_note");
  $("premiumNote").classList.toggle("ok", !!joined);
}
$("premiumBtn").addEventListener("click", () => {
  window.track("premium_interest");
  store.set("shubhly.premium", true);
  renderPremium();
  if (config.built) {
    const tag = $("buildTag");
    tag.textContent = "Version " + new Date(config.built).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    show(tag, true);
  }
  if (config.whatsappUrl) {
    const u = config.whatsappUrl;
    window.open(`${u}${u.includes("?") ? "&" : "?"}text=${encodeURIComponent(t("pr_wa_text"))}`, "_blank", "noopener");
  } else {
    toast(t("pr_toast"));
  }
});

// ---------- language ----------
let guides = null;
let liveSky = null;
function setLanguage(l, { first = false } = {}) {
  setLang(l);
  const lang = getLang();
  store.set("shubhly.lang", lang);
  document.documentElement.lang = lang === "hn" ? "en" : lang;
  setDateLocale(DATE_LOCALE[lang] || "en-IN");
  applyStatic();
  decorateHero();
  renderOnline();
  renderTarot();
  renderLangMenu();
  fillRepLang(lang);
  setTradition(tradition());
  setBusy($("go"), false, t("f_go"));
  setBusy($("reportBtn"), false, t("rep_btn"));
  renderPremium();
  renderStreak();
  renderSaved();
  guides?.refresh();
  if (selectedPlace) picked.textContent = t("f_selected", { label: selectedPlace.label });
  if (first) return;
  refreshSky();
  loadToday();
  loadHoroscope();
  if (lastPayload) {
    fetchKundli(lastPayload)
      .then((d) => { lastResult = d; renderResult(d, lastPayload, { scroll: false }); })
      .catch(() => {});
  }
}
function fillRepLang(lang) {
  const sel = $("repLang");
  sel.innerHTML = LANGS.map((l) => `<option value="${l}">${esc(LANG_NAMES[l])}</option>`).join("");
  sel.value = lang;
}
function renderLangMenu() {
  const lang = getLang();
  $("langCur").textContent = LANG_NAMES[lang];
  $("langList").innerHTML = LANGS.map((l) => `<li role="option" tabindex="-1" data-lang="${l}" aria-selected="${l === lang}">${esc(LANG_NAMES[l])}</li>`).join("");
}
function toggleLangMenu(open) {
  const list = $("langList"), btn = $("langBtn");
  const want = open ?? list.hidden;
  list.hidden = !want;
  btn.setAttribute("aria-expanded", String(want));
  if (want) list.querySelector('[aria-selected="true"]')?.focus();
}
$("langBtn").addEventListener("click", () => toggleLangMenu());
$("langList").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-lang]");
  if (!li) return;
  toggleLangMenu(false);
  setLanguage(li.dataset.lang);
  $("langBtn").focus();
});
$("langList").addEventListener("keydown", (e) => {
  const items = [...$("langList").querySelectorAll("li")];
  const i = items.indexOf(document.activeElement);
  if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(i - 1, 0)].focus(); }
  else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.activeElement.click(); }
  else if (e.key === "Escape") { toggleLangMenu(false); $("langBtn").focus(); }
});
document.addEventListener("click", (e) => { if (!e.target.closest("#langMenu")) toggleLangMenu(false); });

// Menu drawer
function toggleNavDrawer(open) {
  const drawer = $("navDrawer"), btn = $("menuBtn");
  const want = open ?? drawer.hidden;
  drawer.hidden = !want;
  btn.setAttribute("aria-expanded", String(want));
}
const menuBtn = $("menuBtn");
if (menuBtn) {
  menuBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleNavDrawer(); });
  $("navDrawer").addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      // Close drawer and let link navigate naturally
      toggleNavDrawer(false);
    }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav")) toggleNavDrawer(false); });
}

// ---------- animated headline: each phrase is lit in turn ----------
function decorateHero() {
  const h = document.getElementById("hero-h");
  if (!h) return;
  const parts = h.textContent.split(/(?<=[,،、।])\s*/).filter(Boolean);
  if (parts.length !== 3) return;
  h.innerHTML = parts.map((p, i) => `<span class="ph ph${i + 1}">${esc(p)}</span>`).join(" ");
}

// ---------- tarot ----------
let tarotTopic = "love";
let tarotHand = [];
const tarotOpened = new Set();
let tarotShuffling = false;
const tarotLang = () => (["hi", "hn"].includes(getLang()) ? getLang() : "en");
function renderTarot() {
  const table = $("tarotTable");
  if (!table) return;
  const slots = [t("tr_past"), t("tr_now"), t("tr_next")];
  table.className = "tarot-table" + (tarotShuffling ? " shuffling" : "");
  table.innerHTML = slots.map((label, i) => {
    const h = tarotHand[i];
    const open = h && tarotOpened.has(i);
    const info = h ? cardText(h.id, h.reversed, tarotLang()) : null;
    return `<div class="tslot"><span class="tlabel">${esc(label)}</span>
      <button type="button" class="tcard${open ? " flipped" : ""}${h ? " dealt" : ""}" data-i="${i}" ${h ? "" : "disabled"} aria-label="${esc(h ? (open ? info.name : label) : label)}" style="--d:${i * 0.12}s">
        <span class="tinner">
          <span class="tface tback">${backSvg}</span>
          <span class="tface tfront${h?.reversed ? " rev" : ""}">${h ? `${cardSvg(h.id)}<em class="tnum">${esc(info.numeral)}</em><strong>${esc(info.name)}</strong>` : ""}</span>
        </span>
      </button></div>`;
  }).join("");
  const done = tarotHand.length && tarotOpened.size === 3;
  $("tarotHint").textContent = tarotHand.length && !done ? t("tr_tap") : "";
  $("tarotMeanings").innerHTML = tarotHand.map((h, i) => {
    if (!tarotOpened.has(i)) return "";
    const c = cardText(h.id, h.reversed, tarotLang());
    return `<article class="tmean"><small>${esc(slots[i])}</small><h3>${esc(c.name)}${h.reversed ? ` <span class="trev">${esc(t("tr_rev"))}</span>` : ""}</h3><p>${esc(c.body)}</p></article>`;
  }).join("");
  show($("tarotAsk"), !!done);
  $("tarotDraw").textContent = tarotHand.length ? t("tr_again") : t("tr_draw");
}
$("tarotTopics")?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-topic]");
  if (!b) return;
  tarotTopic = b.dataset.topic;
  document.querySelectorAll("#tarotTopics [data-topic]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
});
$("tarotDraw")?.addEventListener("click", () => {
  if (tarotShuffling) return;
  tarotHand = []; tarotOpened.clear();
  tarotShuffling = true;
  renderTarot();
  setTimeout(() => { tarotShuffling = false; tarotHand = drawThree(3); renderTarot(); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 1300);
});
$("tarotTable")?.addEventListener("click", (e) => {
  const b = e.target.closest(".tcard.dealt");
  if (!b) return;
  const i = Number(b.dataset.i);
  if (tarotOpened.has(i)) return;
  tarotOpened.add(i);
  b.classList.add("flipped");
  setTimeout(renderTarotKeep, 700);
});
function renderTarotKeep() { // refresh text only, so the flip is not interrupted
  const done = tarotOpened.size === 3;
  const slots = [t("tr_past"), t("tr_now"), t("tr_next")];
  $("tarotHint").textContent = done ? "" : t("tr_tap");
  $("tarotMeanings").innerHTML = tarotHand.map((h, i) => {
    if (!tarotOpened.has(i)) return "";
    const c = cardText(h.id, h.reversed, tarotLang());
    return `<article class="tmean"><small>${esc(slots[i])}</small><h3>${esc(c.name)}${h.reversed ? ` <span class="trev">${esc(t("tr_rev"))}</span>` : ""}</h3><p>${esc(c.body)}</p></article>`;
  }).join("");
  show($("tarotAsk"), done);
}
$("tarotTable")?.addEventListener("pointermove", (e) => {
  const c = e.target.closest(".tcard.flipped");
  if (!c || e.pointerType !== "mouse") return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width) - 0.5) * 22}deg`);
  c.style.setProperty("--rx", `${(0.5 - ((e.clientY - r.top) / r.height)) * 16}deg`);
});
$("tarotTable")?.addEventListener("pointerleave", () => document.querySelectorAll(".tcard").forEach((c) => { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }));
$("tarotAsk")?.addEventListener("click", () => {
  const names = tarotHand.map((h) => { const c = cardText(h.id, h.reversed, tarotLang()); return h.reversed ? `${c.name} (${t("tr_rev")})` : c.name; }).join(", ");
  const label = document.querySelector(`#tarotTopics [data-topic="${tarotTopic}"]`)?.textContent || tarotTopic;
  guides.ask(t("tr_ask_q", { cards: names, topic: label }), "tarot");
});

// ---------- astrologers online now, and the welcome offer ----------
function renderOnline() {
  const pill = $("onlinePill");
  if (!pill) return;
  const up = GUIDES.filter((g) => !isResting(g));
  show(pill, up.length > 0);
  $("onlineText").textContent = t("on_now", { n: up.length });
  const first = up[0];
  if (first && $("welcomeAv")) { $("welcomeAv").innerHTML = guideAvatar(first); $("welcomeName").textContent = first.name; }
  $("onlineFaces").innerHTML = up.slice(0, 3).map((g) => `<span class="face">${guideAvatar(g)}</span>`).join("");
}
setInterval(renderOnline, 60_000);

const welcomeEl = $("welcome");
function closeWelcome() {
  if (welcomeEl.hidden) return;
  store.set("shubhly.welcomeNo", Date.now());
  show(welcomeEl, false);
}
function openWelcome() {
  if (!welcomeEl || document.body.dataset.page !== "home") return;
  if (Date.now() - store.get("shubhly.welcomeNo", 0) < 3 * 86_400_000) return;
  if (!$("chat").hidden || !$("installBar").hidden) return;
  show(welcomeEl, true);
  $("welcomeX").focus();
}
$("welcomeX")?.addEventListener("click", closeWelcome);
$("welcomeBack")?.addEventListener("click", closeWelcome);
document.querySelectorAll("#welcomeTopics [data-topic]").forEach((b) => b.addEventListener("click", () => {
  store.set("shubhly.welcomeNo", Date.now());
  location.href = "/guides#ask=" + b.dataset.topic;
}));
$("welcomeGo")?.addEventListener("click", () => store.set("shubhly.welcomeNo", Date.now()));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeWelcome(); });
setTimeout(openWelcome, 8_000);

// ---------- install as an app ----------
let installEvent = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
let installable = false;
function showInstall(on) {
  installable = on;
  document.querySelectorAll("[data-install]").forEach((b) => show(b, on));
  if (!on) show($("installBar"), false);
}
// A gentle, dismissible ask to keep the app: after a few seconds on the site, and right after a kundli is made.
const DAY = 86_400_000;
function askInstall() {
  if (!installable || standalone()) return;
  if (Date.now() - store.get("shubhly.installNo", 0) < 10 * DAY) return;
  show($("installBar"), true);
}
$("installNo")?.addEventListener("click", () => { store.set("shubhly.installNo", Date.now()); show($("installBar"), false); });
setTimeout(askInstall, 15_000);
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; showInstall(!standalone()); });
window.addEventListener("appinstalled", () => { window.track("app_installed"); installEvent = null; showInstall(false); toast(t("pwa_done")); });
document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-install]")) return;
  window.track("install_click");
  if (installEvent) {
    installEvent.prompt();
    await installEvent.userChoice.catch(() => {});
    installEvent = null;
    showInstall(false);
  } else { toast(t("pwa_ios")); show($("installBar"), false); store.set("shubhly.installNo", Date.now()); }
});
if (isIos() && !standalone()) showInstall(true); // iPhone has no install prompt, so we show the steps
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));

// ---------- start ----------
(async function init() {
  const saved = store.get("shubhly.lang", "en");
  setLanguage(LANGS.includes(saved) ? saved : "en", { first: true });
  guides = initGuides({ t, getLang, store, toast, getPeople: chatPeople, getBrief: chartBrief, share: shareKundli });
  openSharedKundli();
  const askHash = location.hash.match(/^#ask=(love|money|job|marriage|family|health)$/);
  if (askHash) { history.replaceState(null, "", location.pathname + location.search); guides.ask(t("wl_q_" + askHash[1]), askHash[1]); }
  initFx();
  liveSky = initLiveSky({ t, getLang });
  touchStreak();
  try { config = await api("/api/config"); } catch { /* optional */ }
  startAnalytics(config.gaId);
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


// ---------- real 3D sky ----------
let skyMod = null, s3dCtl = null, skyCtl = null, s3dWanted = false;

function skyFromChart(chart, timeUnknown) {
  return {
    sample: false, tradition: chart.tradition || "vedic",
    ascLon: timeUnknown ? null : chart.ascendant.lon,
    planets: chart.planets.map((p) => ({ key: p.key, lon: p.lon, house: timeUnknown ? null : p.house })),
  };
}
const mySky = () => { const k = store.get("shubhly.sky", null); return k && !k.sample ? k : null; };

// The sky right now over the visitor's place, from the server's ephemeris.
let liveSky3d = null;
async function getLiveSky() {
  if (liveSky3d && Date.now() - liveSky3d.fetched < 5 * 60_000) return liveSky3d;
  const q = new URLSearchParams({ lat: loc.lat, lon: loc.lon, tz: loc.tz || "Asia/Kolkata" });
  const d = await api(`/api/sky/now?${q}`);
  liveSky3d = { sample: false, live: true, tradition: "vedic", ascLon: d.ascLon, planets: d.planets, at: d.at, place: loc.name || "", fetched: Date.now() };
  return liveSky3d;
}
const liveTime = (src) => new Date(src.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: loc.tz || "Asia/Kolkata" });

function skyOpts(src, extra = {}) {
  return {
    planets: src.planets, ascLon: src.ascLon, lagnaText: t(src.tradition === "western" ? "r_rising" : "r_lagna"),
    names: { planet: (k) => planet(k), sign: (i) => signName(getLang(), SIGN_EN[i], "", true) },
    ...extra,
  };
}

async function loadSkyModule() {
  if (!skyMod) skyMod = await import("/sky3d.js");
  return skyMod;
}

let s3dMode = store.get("shubhly.s3dMode", "live"); // "live" or "mine"
async function mountSection() {
  const host = $("s3dSky");
  if (!host) return;
  try {
    const mod = await loadSkyModule();
    const mine = s3dMode === "mine" ? mySky() : null;
    const src = mine || await getLiveSky();
    s3dCtl?.destroy();
    host.classList.add("on");
    s3dCtl = mod.mountSky(host, skyOpts(src, { scrollDriven: true }));
    $("s3dLabel").textContent = mine ? t("sky_birth") : t("s3d_live_at", { place: src.place || "India", time: liveTime(src) });
    $("s3dMode").textContent = mine ? t("sky_now") : t("s3d_mine");
    show($("s3dBadge"), true);
    updateSectionProgress();
  } catch {
    host.classList.remove("on"); // no WebGL: the flat version stays
  }
}
$("s3dMode")?.addEventListener("click", () => {
  if (s3dMode === "live" && !mySky()) { location.href = "/kundli"; return; }
  s3dMode = s3dMode === "live" ? "mine" : "live";
  store.set("shubhly.s3dMode", s3dMode);
  mountSection();
});
function updateSectionProgress() {
  if (!s3dCtl) return;
  const sec = $("s3d"), r = sec.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  s3dCtl.setProgress(Math.max(0, Math.min(1, total > 0 ? -r.top / total : 0)));
}
window.addEventListener("scroll", () => { if (s3dCtl) requestAnimationFrame(updateSectionProgress); }, { passive: true });

let resultSkyMode = "birth";
async function mountResultSky() {
  const host = $("sky3d");
  if (!host || !lastResult) return;
  try {
    const mod = await loadSkyModule();
    document.querySelectorAll("[data-skymode]").forEach((b) => b.classList.toggle("is-on", b.dataset.skymode === resultSkyMode));
    const src = resultSkyMode === "now" ? await getLiveSky() : skyFromChart(lastResult.chart, lastPayload?.timeUnknown);
    skyCtl?.destroy();
    const info = $("skyInfo");
    info.textContent = "";
    skyCtl = mod.mountSky(host, skyOpts(src, {
      onPick(key) {
        const p = src.planets.find((x) => x.key === key);
        const si = Math.floor(p.lon / 30) % 12;
        info.textContent = t(p.house ? "sky_planet" : "sky_planet_nh", {
          planet: planet(key), sign: signName(getLang(), SIGN_EN[si], "", true), deg: (p.lon % 30).toFixed(1), house: p.house || "",
        });
      },
    }));
    show($("skyCard"), true);
  } catch {
    show($("skyCard"), false);
  }
}

$("skyMode")?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-skymode]");
  if (!b || b.dataset.skymode === resultSkyMode) return;
  resultSkyMode = b.dataset.skymode;
  mountResultSky();
});

function refreshSky() {
  if (s3dWanted) mountSection();
  if (lastResult) mountResultSky();
}

if ("IntersectionObserver" in window && $("s3d")) {
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { s3dWanted = true; o.disconnect(); mountSection(); }
  }, { rootMargin: "500px 0px" }).observe($("s3d"));
}
