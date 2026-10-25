import {
  esc, fmt12, todayIn, nowIn, addDays, dateLabel, setDateLocale,
  inSlot, dots, moonSvg, chartSvg, westernSvg, renderMarkdown, SHORT,
} from "/lib.js";
import { makeShareCard } from "/card.js";
import { initFx, fillMarquee } from "/fx.js";
import { SIGN_EN, planetName, signName, nakName, dayName, pickName, DATE_LOCALE } from "/names.js";
import { initGuides } from "/chat.js";
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
    store.set("shubhly.loc", loc);
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
let shownRashi = myRashi;
const horoCache = new Map();

function renderGrid() {
  if (!horo) return;
  $("rashiGrid").innerHTML = horo.rashis.map((r) => `
    <button type="button" class="rashi-btn${r.index === myRashi ? " mine" : ""}" data-i="${r.index}" data-mine="${esc(t("rf_mine"))}" aria-pressed="${r.index === shownRashi}">
      <img class="sym" src="/img/rashi-${String(r.index + 1).padStart(2, "0")}.png" alt="" width="256" height="256" loading="lazy" />
      <span class="hi">${esc(sn(r.sign, r.signHi, true))}</span>
    </button>`).join("");
}

function meter(label, n) {
  return `<li><span>${esc(label)}</span><span class="dots" role="img" aria-label="${esc(t("rf_out_of", { n }))}">${dots(n)}</span></li>`;
}

function readingText(r) {
  return `${sn(r.sign, r.signHi)}, ${dateLabel(horo.date)}\n${r.moodLabel}: ${r.theme}\n${r.text}\n\nShubhly: ${location.origin}`;
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
          ${meter(t("rf_love"), r.stars.love)}${meter(t("rf_career"), r.stars.career)}
          ${meter(t("rf_money"), r.stars.money)}${meter(t("rf_health"), r.stars.health)}
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

  const s = data.sadeSati;
  const sb = $("satiBox");
  if (s && (s.active || s.dhaiya)) {
    sb.className = "callout callout--calm";
    sb.innerHTML = `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p>${esc(s.common)}</p><p><b>${esc(s.tip)}</b></p>` +
      (s.saturn ? `<p class="muted" style="margin:0">${esc(t("r_saturn", { sign: sn(s.saturn.sign, s.saturn.signHi || s.saturn.sign), a: monthYear(s.saturn.entered), b: monthYear(s.saturn.leaves) }))}</p>` : "");
    show(sb, true);
  } else show(sb, false);

  show($("result"), true);
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
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, t("f_go"));
  }
});

// ---------- share card ----------
$("shareBtn").addEventListener("click", async () => {
  if (!lastResult) return;
  const c = lastResult.chart;
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
  const file = new File([blob], "shubhly-kundli.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: t("card_text") });
      return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "shubhly-kundli.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(t("card_done"));
});

$("scrollReport").addEventListener("click", () => {
  $("reportCard").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ---------- AI report ----------
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
    $("reportOut").innerHTML = renderMarkdown(data.report);
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
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shubhly-kundli.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast(t("pdf_done"));
  } catch (ex) {
    toast(ex.message);
  } finally {
    setBusy(btn, false, t("rep_pdf"));
  }
});

// ---------- premium ----------
function renderPremium() {
  const joined = store.get("shubhly.premium", false);
  $("premiumNote").textContent = t(joined ? "pr_joined" : "pr_note");
  $("premiumNote").classList.toggle("ok", !!joined);
}
$("premiumBtn").addEventListener("click", () => {
  store.set("shubhly.premium", true);
  renderPremium();
  if (config.whatsappUrl) {
    const u = config.whatsappUrl;
    window.open(`${u}${u.includes("?") ? "&" : "?"}text=${encodeURIComponent(t("pr_wa_text"))}`, "_blank", "noopener");
  } else {
    toast(t("pr_toast"));
  }
});

// ---------- language ----------
let guides = null;
function setLanguage(l, { first = false } = {}) {
  setLang(l);
  const lang = getLang();
  store.set("shubhly.lang", lang);
  document.documentElement.lang = lang === "hn" ? "en" : lang;
  setDateLocale(DATE_LOCALE[lang] || "en-IN");
  applyStatic();
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

// ---------- section highlight in nav ----------
function watchSections() {
  if (!("IntersectionObserver" in window)) return;
  const links = [...document.querySelectorAll(".tabbar a, .nav-links a")];
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["aaj", "rashifal", "kundli", "guides", "premium", "store", "faq"].forEach((id) => io.observe($(id)));
}

// ---------- start ----------
(async function init() {
  const saved = store.get("shubhly.lang", "en");
  setLanguage(LANGS.includes(saved) ? saved : "en", { first: true });
  guides = initGuides({ t, getLang, store, toast, getBirth: () => lastPayload || profiles[0] || null });
  initFx();
  touchStreak();
  watchSections();
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


// ---------- real 3D sky ----------
// Sample positions (a made-up birth) shown until the visitor makes their own chart.
const SAMPLE_SKY = {
  sample: true, tradition: "vedic", ascLon: 178.45,
  planets: [["Sun", 118.1, 11], ["Moon", 354.9, 7], ["Mars", 171.3, 1], ["Mercury", 135.3, 12], ["Jupiter", 222, 3], ["Venus", 116.5, 11], ["Saturn", 329.7, 6], ["Rahu", 186, 2], ["Ketu", 6, 8]]
    .map(([key, lon, house]) => ({ key, lon, house })),
};
let skyMod = null, s3dCtl = null, skyCtl = null, s3dWanted = false;

function skyFromChart(chart, timeUnknown) {
  return {
    sample: false, tradition: chart.tradition || "vedic",
    ascLon: timeUnknown ? null : chart.ascendant.lon,
    planets: chart.planets.map((p) => ({ key: p.key, lon: p.lon, house: timeUnknown ? null : p.house })),
  };
}
const currentSky = () => store.get("shubhly.sky", null) || SAMPLE_SKY;

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

async function mountSection() {
  const host = $("s3dSky");
  if (!host) return;
  try {
    const mod = await loadSkyModule();
    s3dCtl?.destroy();
    const src = currentSky();
    host.classList.add("on");
    s3dCtl = mod.mountSky(host, skyOpts(src, { scrollDriven: true }));
    show($("s3dBadge"), src.sample);
    updateSectionProgress();
  } catch {
    host.classList.remove("on"); // no WebGL: the flat version stays
  }
}
function updateSectionProgress() {
  if (!s3dCtl) return;
  const sec = $("s3d"), r = sec.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  s3dCtl.setProgress(Math.max(0, Math.min(1, total > 0 ? -r.top / total : 0)));
}
window.addEventListener("scroll", () => { if (s3dCtl) requestAnimationFrame(updateSectionProgress); }, { passive: true });

async function mountResultSky() {
  const host = $("sky3d");
  if (!host || !lastResult) return;
  try {
    const mod = await loadSkyModule();
    skyCtl?.destroy();
    const src = skyFromChart(lastResult.chart, lastPayload?.timeUnknown);
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

function refreshSky() {
  if (s3dWanted) mountSection();
  if (lastResult) mountResultSky();
}

if ("IntersectionObserver" in window && $("s3d")) {
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { s3dWanted = true; o.disconnect(); mountSection(); }
  }, { rootMargin: "500px 0px" }).observe($("s3d"));
}
