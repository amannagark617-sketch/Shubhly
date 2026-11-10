// Analytics for every page: what people do, where they get stuck, and how fast the site feels.
//
// Privacy by design: this never sends names, birth details, places typed, chat
// messages or any text people write. Only the kind of action, simple labels
// (page, section, button, language, guide) and numbers (time, counts, speed).
//
// Developer helpers:   ?ga_debug=1   shows events live in GA4 > Admin > DebugView
//                      ?internal=1   marks this browser as the owner's (use once), ?internal=0 undoes it

const page = location.pathname.replace(/\/+$/, "") || "/";
const seg = page.split("/").filter(Boolean);

const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

// ---- who is looking: the owner's own visits are marked so they can be filtered out ----
const qs = new URLSearchParams(location.search);
if (qs.get("internal") === "1") set("kk.internal", true);
if (qs.get("internal") === "0") set("kk.internal", false);
const internal = get("kk.internal", false) === true;

// ---- what kind of page is this ----
function pageInfo() {
  const [a, b] = seg;
  if (!a) return { type: "home" };
  if (a === "gita") return b ? { type: "gita_chapter", id: b } : { type: "gita_index" };
  if (a === "blog") return b ? { type: "blog_post", id: b } : { type: "blog_index" };
  if (a === "rashifal" && b) return { type: "rashifal_sign", id: b };
  return { type: a };
}
const info = pageInfo();

// ---- sending ----
let gaId = null, started = false;
const pending = [];
const clean = (p) => {
  const o = {};
  for (const [k, v] of Object.entries(p || {})) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "items" && Array.isArray(v)) { o.items = v.slice(0, 10).map((i) => ({ item_id: String(i.item_id || "").slice(0, 40), item_name: String(i.item_name || "").slice(0, 60), price: Number(i.price) || 0, quantity: Number(i.quantity) || 1 })); continue; }
    o[String(k).slice(0, 40)] = typeof v === "number" ? (Number.isFinite(v) ? v : 0) : typeof v === "boolean" ? String(v) : String(v).slice(0, 100);
  }
  return o;
};
function send(name, params) {
  const p = clean(params);
  if (!started) { if (pending.length < 100) pending.push([name, p]); return; }
  try { window.gtag("event", String(name).slice(0, 40), p); } catch { /* ignore */ }
}
window.track = (name, params = {}) => send(name, params);

function visitInfo() {
  const now = Date.now();
  const v = get("kk.visits", { n: 0, first: now, last: 0 });
  if (now - v.last > 30 * 60 * 1000) v.n += 1; // a new visit after 30 quiet minutes
  v.last = now;
  set("kk.visits", v);
  return v;
}

function start(id) {
  if (started || !id) return;
  gaId = id;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());

  const v = visitInfo();
  const lang = get("shubhly.lang", "en");
  const profiles = get("shubhly.profiles", []);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  window.gtag("set", "user_properties", clean({
    site_language: lang,
    visitor_type: v.n > 1 ? "returning" : "new",
    visit_count: v.n,
    days_since_first: Math.floor((Date.now() - v.first) / 86400000),
    has_kundli: Array.isArray(profiles) && profiles.length > 0,
    app_mode: standalone ? "installed_app" : "browser",
    device_class: innerWidth < 640 ? "phone" : innerWidth < 1024 ? "tablet" : "desktop",
  }));
  window.gtag("set", clean({ page_type: info.type, content_id: info.id }));
  const cfg = clean({ traffic_type: internal ? "internal" : undefined });
  if (qs.get("ga_debug") === "1") cfg.debug_mode = true; // a real true, not the text "true", or DebugView ignores it
  window.gtag("config", id, cfg);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);
  started = true;
  pending.splice(0).forEach(([n, p]) => send(n, p));
}

fetch("/api/config").then((r) => r.json()).then((c) => start(c.gaId)).catch(() => {});

// ---- the app's own requests: what people use, how fast it is, what fails ----
const nativeFetch = window.fetch.bind(window);
const band = (ratio) => (ratio >= 0.75 ? "great" : ratio >= 0.5 ? "good" : ratio >= 0.33 ? "mixed" : "low");
window.fetch = async function (input, init = {}) {
  let url;
  try { url = new URL(typeof input === "string" ? input : input.url, location.origin); } catch { return nativeFetch(input, init); }
  const api = url.origin === location.origin && url.pathname.startsWith("/api/") ? url.pathname : null;
  if (!api || api === "/api/config" || api === "/api/health") return nativeFetch(input, init);

  let body = null;
  try { body = typeof init.body === "string" ? JSON.parse(init.body) : null; } catch { /* not JSON */ }
  const t0 = performance.now();
  const isChat = api === "/api/chat" || api === "/api/krishna";
  const guide = api === "/api/krishna" ? "krishna" : body?.guide;
  if (isChat) {
    send("chat_message_sent", {
      guide, turn: Array.isArray(body?.messages) ? Math.ceil(body.messages.length / 2) : undefined,
      with_kundli: Array.isArray(body?.people) ? body.people.length > 0 : undefined,
      people: Array.isArray(body?.people) ? body.people.length : undefined,
      language: body?.language,
    });
  }

  let res;
  try {
    res = await nativeFetch(input, init);
  } catch (e) {
    send("api_error", { endpoint: api, status: "network", latency_ms: Math.round(performance.now() - t0), online: navigator.onLine });
    if (isChat) send("chat_reply", { guide, status: "network" });
    throw e;
  }
  const ms = Math.round(performance.now() - t0);
  const ok = res.ok;
  const base = { endpoint: api, status: res.status, latency_ms: ms };
  if (!ok && res.status !== 402) send("api_error", base);
  // Paid things people could not open: wants to log in, or wallet too low. Which feature, no personal details.
  if (res.status === 401) send("login_required", { endpoint: api });
  if (res.status === 402) send("wallet_insufficient", { endpoint: api });

  // Read a copy of the answer for the few numbers worth keeping. Never the text.
  const peek = (fn) => res.clone().json().then(fn).catch(() => {});
  if (isChat) {
    peek((d) => send("chat_reply", { guide, status: res.status, latency_ms: ms, free_left: Number.isInteger(d?.left) ? d.left : undefined }));
  } else if (api === "/api/kundli" && init.method === "POST") {
    send("kundli_generated", { status: res.status, latency_ms: ms, tradition: body?.tradition || "vedic", time_known: body ? body.timeUnknown !== true : undefined, ok });
  } else if (api === "/api/match") {
    peek((d) => {
      const total = d?.total ?? d?.match?.total, out = d?.outOf ?? d?.match?.outOf;
      send("match_generated", { status: res.status, latency_ms: ms, score_band: total && out ? band(total / out) : undefined });
    });
  } else if (api === "/api/report") {
    send("report_requested", { status: res.status, latency_ms: ms });
  } else if (api === "/api/match/report") {
    send("milan_report_requested", { status: res.status, latency_ms: ms });
  } else if (api === "/api/match/pdf") {
    send("milan_pdf_download", { status: res.status, latency_ms: ms });
  } else if (api === "/api/report/preview") {
    send("report_preview", { status: res.status, latency_ms: ms });
  } else if (api === "/api/myday") {
    send("myday_loaded", { status: res.status, latency_ms: ms });
  } else if (api === "/api/krishna/speak") {
    send("krishna_listen", { status: res.status, latency_ms: ms });
  } else if (api === "/api/pdf") {
    send("pdf_download", { status: res.status, latency_ms: ms });
  } else if (api === "/api/places") {
    peek((d) => { const n = Array.isArray(d?.places) ? d.places.length : Array.isArray(d) ? d.length : undefined; send("place_search", { status: res.status, results: n, no_results: n === 0 }); });
  } else if (api === "/api/today") {
    send("panchang_loaded", { status: res.status, latency_ms: ms });
  } else if (api === "/api/horoscope") {
    send("rashifal_loaded", { status: res.status, latency_ms: ms });
  }
  return res;
};

// ---- where on the page a thing happened ----
const where = (el) => (el.closest?.("section[id], main[id], header, footer, nav, aside")?.id || el.closest?.("header, footer, nav, aside")?.tagName?.toLowerCase() || info.type);

// ---- clicks ----
const lastClick = { el: null, t: 0, n: 0 };
document.addEventListener("click", (e) => {
  const el = e.target.closest?.("a[href], button, [role=button], summary, li[data-lang], [data-topic]");
  if (!el) return;
  const key = el.dataset?.i || el.dataset?.l || el.dataset?.day || el.dataset?.tab || undefined;
  const id = el.id || undefined;
  const section = where(el);

  // three quick clicks on the same thing usually means it feels broken
  const now = performance.now();
  if (lastClick.el === el && now - lastClick.t < 700) lastClick.n += 1; else lastClick.n = 1;
  lastClick.el = el; lastClick.t = now;
  if (lastClick.n === 3) send("rage_click", { el_id: id, el_key: key, section, page_type: info.type });

  // The ways in to Krishna's call: the landing hero, the floating button, the call button inside Krishna's box.
  const talk = el.closest?.(".kr-hero, .kr-float, #kr-callbtn, a[href$='#call']");
  if (talk) send("talk_to_krishna_click", { placement: talk.classList.contains("kr-hero") ? "hero" : talk.classList.contains("kr-float") ? "float" : talk.id === "kr-callbtn" ? "krishna_box" : "link", page_type: info.type });

  const a = el.closest("a[href]");
  if (a) {
    let u; try { u = new URL(a.getAttribute("href"), location.href); } catch { u = null; }
    if (u && /^mailto:/i.test(a.getAttribute("href"))) { send("contact_click", { method: "email", section }); return; }
    if (u && /wa\.me|whatsapp/i.test(u.host + u.pathname)) { send("contact_click", { method: "whatsapp", section }); return; }
    if (u && u.origin !== location.origin) { send("outbound_click", { host: u.host, section }); return; }
    send("ui_click", { kind: "link", to: u ? u.pathname + (u.hash || "") : undefined, el_id: id, el_key: key, section });
    return;
  }

  if (el.matches("li[data-lang]")) { send("language_change", { to: el.dataset.lang, section }); return; }
  if (el.dataset?.topic) { send("topic_select", { topic: el.dataset.topic, section }); return; }
  const label = `${id || ""} ${el.className || ""} ${key || ""}`;
  if (/share/i.test(label)) send("share_click", { el_id: id, section });
  else if (/download|pdf/i.test(label)) send("download_click", { el_id: id, section });
  send("ui_click", { kind: "button", el_id: id, el_key: key, section });
}, { capture: true, passive: true });

// ---- forms: where people start and where they stop ----
const started_forms = new Set();
const submitted = new Set();
document.addEventListener("focusin", (e) => {
  const f = e.target.closest?.("form");
  if (!f || !f.id || started_forms.has(f.id)) return;
  started_forms.add(f.id);
  send("form_begin", { form_id: f.id, section: where(f) });
}, { passive: true });
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (f?.id) submitted.add(f.id), send("form_send", { form_id: f.id, section: where(f) });
}, { capture: true });
// the last field touched before leaving a form that was started but never submitted
const touched = {};
document.addEventListener("change", (e) => {
  const el = e.target;
  const f = el.closest?.("form");
  if (f?.id) touched[f.id] = el.id || el.name || undefined;
  if (el.matches?.("input[type=checkbox]")) send("setting_change", { field: el.id || el.name, value: el.checked });
  else if (el.matches?.("input[type=radio]")) send("setting_change", { field: el.name || el.id, value: el.value });
}, { passive: true });

document.addEventListener("copy", () => send("copy_text", { section: where(document.activeElement || document.body), page_type: info.type }), { passive: true });
addEventListener("online", () => send("connection", { state: "online" }));
addEventListener("offline", () => send("connection", { state: "offline" }));

// ---- reading: scroll depth, sections seen, time ----
let maxScroll = 0;
const marks = new Set();
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  if (h <= 0) return;
  const pct = Math.min(100, Math.round((scrollY / h) * 100));
  maxScroll = Math.max(maxScroll, pct);
  for (const m of [25, 50, 75, 90]) if (pct >= m && !marks.has(m)) { marks.add(m); send("scroll_depth", { percent: m, page_type: info.type }); }
}
addEventListener("scroll", onScroll, { passive: true });

const seen = new Set();
if ("IntersectionObserver" in window) {
  const timers = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const id = en.target.id;
      if (!id || seen.has(id)) continue;
      if (en.isIntersecting) timers.set(id, setTimeout(() => { seen.add(id); send("section_view", { section: id, page_type: info.type }); io.unobserve(en.target); }, 1000));
      else { clearTimeout(timers.get(id)); timers.delete(id); }
    }
  }, { threshold: 0.4 });
  const watch = () => document.querySelectorAll("main section[id], .hero[id], section.block[id]").forEach((s) => { if (!s.hidden && !s.hasAttribute("data-off")) io.observe(s); });
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", watch); else watch();
}

let visibleMs = 0, since = document.visibilityState === "visible" ? performance.now() : 0;
const timeMarks = new Set();
const engaged = () => visibleMs + (since ? performance.now() - since : 0);
setInterval(() => {
  const s = Math.round(engaged() / 1000);
  for (const m of [15, 30, 60, 120, 300]) if (s >= m && !timeMarks.has(m)) { timeMarks.add(m); send("time_on_page", { seconds: m, page_type: info.type }); }
  if ((info.type === "gita_chapter" || info.type === "blog_post") && maxScroll >= 90 && s >= 30 && !timeMarks.has("done")) {
    timeMarks.add("done");
    send("read_complete", { page_type: info.type, content_id: info.id });
  }
}, 3000);

// ---- speed people feel ----
const vitals = {};
const rate = (m, v) => {
  const t = { LCP: [2500, 4000], FCP: [1800, 3000], INP: [200, 500], CLS: [0.1, 0.25], TTFB: [800, 1800] }[m];
  return v <= t[0] ? "good" : v <= t[1] ? "needs_improvement" : "poor";
};
try {
  new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) vitals.LCP = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) vitals.CLS = (vitals.CLS || 0) + e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") vitals.FCP = e.startTime; }).observe({ type: "paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) vitals.INP = Math.max(vitals.INP || 0, e.duration); }).observe({ type: "event", durationThreshold: 40, buffered: true });
} catch { /* older browsers */ }
let vitalsSent = false;

let exited = false;
function leaving() {
  if (exited) return;
  exited = true;
  if (visibleMs + (since ? performance.now() - since : 0) < 1000 && !maxScroll) return;
  if (!vitalsSent) {
    vitalsSent = true;
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav) vitals.TTFB = nav.responseStart;
    for (const [metric, v] of Object.entries(vitals)) {
      send("web_vitals", { metric, value: metric === "CLS" ? Math.round(v * 1000) / 1000 : Math.round(v), rating: rate(metric, v), page_type: info.type, transport_type: "beacon" });
    }
  }
  send("page_exit", { page_type: info.type, max_scroll: maxScroll, engaged_seconds: Math.round(engaged() / 1000), sections_seen: seen.size, transport_type: "beacon" });
  for (const id of started_forms) if (!submitted.has(id)) send("form_abandon", { form_id: id, last_field: touched[id], transport_type: "beacon" });
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { if (since) { visibleMs += performance.now() - since; since = 0; } leaving(); }
  else { since = performance.now(); exited = false; }
});
addEventListener("pagehide", leaving);

// ---- things that break ----
let errors = 0;
addEventListener("error", (e) => {
  if (errors++ > 5) return;
  send("js_error", { message: String(e.message || "error").slice(0, 90), file: String(e.filename || "").split("/").pop(), line: e.lineno, page_type: info.type });
});
addEventListener("unhandledrejection", (e) => {
  if (errors++ > 5) return;
  send("js_error", { message: String(e.reason?.message || e.reason || "rejection").slice(0, 90), kind: "promise", page_type: info.type });
});

// ---- Gita and blog: what people actually read ----
if (info.type === "gita_chapter" || info.type === "blog_post" || info.type === "rashifal_sign") {
  send("content_view", { content_type: info.type, content_id: info.id });
  if (info.type === "gita_chapter") send("gita_chapter_view", { chapter: info.id });
}
if (info.type === "gita_chapter") {
  document.addEventListener("click", (e) => {
    const ask = e.target.closest?.("[data-ask]");
    if (ask) send("gita_verse_ask", { chapter: info.id, verse: ask.closest(".gv")?.id?.replace("v", "") });
    const l = e.target.closest?.(".gita-tools [data-l]");
    if (l) send("gita_meaning_language", { mode: l.dataset.l });
  }, { capture: true, passive: true });
  if ("IntersectionObserver" in window) {
    const readVerses = new Set();
    const t = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const id = en.target.id;
        if (en.isIntersecting) t.set(id, setTimeout(() => {
          if (readVerses.has(id)) return;
          readVerses.add(id);
          if ([5, 10, 20, 40].includes(readVerses.size)) send("gita_reading_progress", { chapter: info.id, verses: readVerses.size });
        }, 3000));
        else clearTimeout(t.get(id));
      }
    }, { threshold: 0.6 });
    const watch = () => document.querySelectorAll(".gv").forEach((v) => io.observe(v));
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", watch); else watch();
  }
}
