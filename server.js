import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeKundli } from "./src/kundli.js";
import { searchPlaces } from "./src/geocode.js";
import { generateReport, aiConfigured, geminiKeyName, parseReport } from "./src/report.js";
import { DateTime } from "luxon";
import { computePanchang } from "./src/panchang.js";
import { buildDailyHoroscope } from "./src/horoscope.js";
import { quickInsights } from "./src/insights.js";
import { buildPdf } from "./src/pdf.js";
import { DATE_LOCALE } from "./public/names.js";
import {
  FreeChats, FREE_MESSAGES, guideReply, parseClientId, parseGuide, parseMessages,
} from "./src/chat.js";
import { isResting, backAt } from "./public/guides.js";
import { sadeSati, saturnWindow, jupiterWindow, slowPlanets } from "./src/transits.js";
import { buildReading } from "./src/reading.js";
import { buildAbout } from "./src/about.js";
import { aiProblem } from "./src/aierror.js";
import { buildMatch } from "./src/match.js";
import { skyRange, MEANING } from "./src/sky.js";
import { POSTS, POST_BY_SLUG, renderBlogIndex, renderPost } from "./src/blog.js";
import { renderGitaIndex, renderChapter, chapterOf, GITA_PATHS, krishnaReply } from "./src/gita.js";
import { signReply, verifyReply, speakKrishna, FREE_LISTENS } from "./src/voice.js";
import { PAGES, SLUGS, signPage, loadShell, renderPage, sitemap } from "./src/pages.js";
import {
  InputError,
  cleanName,
  parseBirthInput,
  parseLang,
  parseLanguage,
  parseMoonIndex,
  parseQueryDate,
  parseQueryPlace,
  parseTopic,
} from "./src/validate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set("trust proxy", true); // behind Cloud Run / a load balancer
app.disable("x-powered-by");
// When PUBLIC_URL is set, the old addresses (old domain, www, the Cloud Run link) send visitors
// to the real domain with a permanent redirect, so search engines and shared links follow.
const CANONICAL = (process.env.PUBLIC_URL || "").replace(/\/+$/, "");
const CANONICAL_HOST = CANONICAL ? new URL(CANONICAL).host : "";
const OLD_HOST = /(^|\.)shubhlyastro\.in$|\.run\.app$|^www\./i;
app.use((req, res, next) => {
  const host = (req.get("host") || "").toLowerCase();
  if (CANONICAL_HOST && host !== CANONICAL_HOST && OLD_HOST.test(host) && req.path !== "/api/health") {
    return res.redirect(301, CANONICAL + req.originalUrl);
  }
  next();
});
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "80kb" }));

// ---- very small in-memory rate limiter (per IP) -------------------------
function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [ip, arr] of hits) {
      const fresh = arr.filter((t) => t > cutoff);
      if (fresh.length) hits.set(ip, fresh);
      else hits.delete(ip);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const arr = (hits.get(req.ip) || []).filter((t) => t > now - windowMs);
    if (arr.length >= max) {
      return res.status(429).json({ error: message });
    }
    arr.push(now);
    hits.set(req.ip, arr);
    next();
  };
}

const placesLimit = rateLimit({
  windowMs: 60_000,
  max: 40,
  message: "Too many searches. Please wait a minute.",
});
const kundliLimit = rateLimit({
  windowMs: 3_600_000,
  max: 60,
  message: "Too many requests. Please try again in a while.",
});
const reportLimit = rateLimit({
  windowMs: 3_600_000,
  max: 8,
  message: "You have reached the hourly limit for reports. Please try later.",
});
const chatLimit = rateLimit({
  windowMs: 3_600_000,
  max: 60,
  message: "Too many messages. Please try again in a while.",
});
const dailyLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  message: "Too many requests. Please wait a minute.",
});

// Only genuine WhatsApp links are passed on to the page.
const WHATSAPP_RE = /^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//;
const whatsappUrl = WHATSAPP_RE.test(process.env.WHATSAPP_URL || "")
  ? process.env.WHATSAPP_URL
  : null;

// Google Analytics measurement ID (GA4), set as the GA_ID setting. Only a well-formed ID is passed on.
const gaId = /^G-[A-Z0-9]{4,20}$/.test(process.env.GA_ID || "") ? process.env.GA_ID : null;

const STARTED = new Date().toISOString();
// Added to the "AI is off" message so it is clear which server answered and what it can see.
const noKeyNote = (req) => ` [server ${req.get("host")}, started ${STARTED.slice(0, 16)}Z, key not found]`;

// ---- API -----------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  // Only setting names are shown, never values.
  const out = { ok: true, ai: aiConfigured(), model: process.env.GEMINI_MODEL || "gemini-2.5-flash" };
  if (out.ai) out.keyFrom = geminiKeyName();
  else out.settingsSeen = Object.keys(process.env).filter((n) => /key|gemini|google|secret|api|genai/i.test(n) && !/^npm_|^PATH$/i.test(n)).sort();
  // Which Cloud Run revision answered, and the names (never values) of its settings.
  if (process.env.K_REVISION) out.revision = process.env.K_REVISION;
  if (!out.ai) out.allNames = Object.keys(process.env).filter((n) => !/^npm_/i.test(n)).sort();
  res.json(out);
});

app.get("/api/config", (_req, res) => {
  res.json({ built: STARTED, whatsappUrl, gaId });
});

// Today's panchang, plus a personal Moon-transit note when `moon` is given.
app.get("/api/today", dailyLimit, (req, res, next) => {
  try {
    const place = parseQueryPlace(req.query);
    const date = parseQueryDate(req.query, place.tz);
    const moon = parseMoonIndex(req.query.moon);
    const lang = parseLang(req.query.lang);
    const panchang = computePanchang({
      date, lat: place.lat, lon: place.lon, tz: place.tz,
      natalMoonSignIndex: moon, includeUpcoming: true, lang,
    });
    const slow = slowPlanets(date, place.tz);
    const personal =
      moon === null
        ? null
        : {
            sadeSati: sadeSati(moon, slow.Saturn.index, lang),
            saturn: saturnWindow(date, place.tz),
          };
    res.json({ place, panchang, slow, personal });
  } catch (e) {
    next(e);
  }
});

// Where the planets are, day by day, for the live sky on the home page.
// The sky right now over a place: planets and the rising sign at this moment.
app.get("/api/sky/now", dailyLimit, (req, res, next) => {
  try {
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    const tz = String(req.query.tz || "");
    if (!(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180) || !tz || !DateTime.now().setZone(tz).isValid) throw new InputError("Please choose a place.");
    const now = DateTime.now().setZone(tz);
    const chart = computeKundli({ year: now.year, month: now.month, day: now.day, hour: now.hour, minute: now.minute, lat, lon, tz, tradition: "vedic" });
    res.setHeader("Cache-Control", "no-store");
    res.json({
      at: now.toISO(),
      ascLon: chart.ascendant.lon,
      planets: chart.planets.map((p) => ({ key: p.key, lon: p.lon, house: p.house })),
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/sky", dailyLimit, (req, res, next) => {
  try {
    const today = DateTime.now().setZone("Asia/Kolkata").toISODate();
    const from = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.from || "")) ? String(req.query.from) : today;
    const days = Math.min(181, Math.max(1, Number(req.query.days) || 1));
    const lang = req.query.lang === "hn" ? "hn" : parseLang(req.query.lang);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({ ...skyRange(from, days), today, meaning: MEANING[lang] || MEANING.en });
  } catch (e) {
    next(e);
  }
});

// Daily horoscope for all twelve rashis.
app.get("/api/horoscope", dailyLimit, (req, res, next) => {
  try {
    const place = parseQueryPlace(req.query);
    const date = parseQueryDate(req.query, place.tz);
    res.json(
      buildDailyHoroscope({ date, lat: place.lat, lon: place.lon, tz: place.tz, lang: parseLang(req.query.lang) })
    );
  } catch (e) {
    next(e);
  }
});

app.get("/api/places", placesLimit, async (req, res, next) => {
  try {
    res.json({ places: await searchPlaces(req.query.q) });
  } catch (e) {
    console.error("Place search failed:", e.message);
    res.status(502).json({
      error: "Place search is not available right now. Please try again in a moment.",
    });
  }
});

app.post("/api/match", kundliLimit, (req, res, next) => {
  try {
    const person = (x) => {
      const birth = parseBirthInput({ ...x, tradition: "vedic" });
      return { name: cleanName(x?.name), chart: computeKundli(birth), timeUnknown: birth.timeUnknown };
    };
    const a = person(req.body?.a);
    const b = person(req.body?.b);
    const lang = req.body?.lang === "hn" ? "hn" : parseLang(req.body?.lang);
    res.json({ names: [a.name, b.name], ...buildMatch(a.chart, b.chart, { lang, timeUnknown: [a.timeUnknown, b.timeUnknown] }) });
  } catch (e) {
    next(e);
  }
});

app.post("/api/kundli", kundliLimit, (req, res, next) => {
  try {
    const birth = parseBirthInput(req.body);
    const lang = parseLang(req.body?.lang);
    const chart = computeKundli(birth);
    const out = {
      name: cleanName(req.body?.name),
      chart,
      insights: quickInsights(chart, { timeUnknown: birth.timeUnknown, lang }),
    };
    const today = DateTime.now().setZone("Asia/Kolkata").toISODate();
    let jupiter = null;
    if (chart.tradition !== "western") {
      const moon = chart.planets.find((p) => p.key === "Moon");
      const saturn = slowPlanets(today, "Asia/Kolkata").Saturn;
      out.sadeSati = {
        ...sadeSati(moon.signIndex, saturn.index, lang),
        saturn: saturnWindow(today, "Asia/Kolkata"),
      };
      jupiter = jupiterWindow(today, "Asia/Kolkata");
    }
    out.about = buildAbout(chart, { lang: req.body?.lang === "hn" ? "hn" : lang, timeUnknown: birth.timeUnknown });
  out.reading = buildReading(chart, { lang: req.body?.lang === "hn" ? "hn" : lang, timeUnknown: birth.timeUnknown, jupiter, today });
    res.json(out);
  } catch (e) {
    next(e);
  }
});

app.post("/api/pdf", kundliLimit, async (req, res, next) => {
  try {
    const birth = parseBirthInput(req.body);
    const language = parseLanguage(req.body?.lang);
    const chart = computeKundli(birth);
    const rb = req.body?.report;
    const report = typeof rb === "string" ? rb.slice(0, 14000) : rb && typeof rb === "object" ? parseReport(JSON.stringify(rb)) : "";
    const locale = DATE_LOCALE[language] || "en-IN";
    const when = DateTime.fromObject({ year: birth.year, month: birth.month, day: birth.day }, { zone: "utc" });
    const h12 = birth.hour % 12 || 12;
    const pdf = await buildPdf({
      name: cleanName(req.body?.name),
      chart,
      insights: quickInsights(chart, { timeUnknown: birth.timeUnknown, lang: parseLang(language) }),
      lang: language,
      report,
      timeUnknown: birth.timeUnknown,
      placeLabel: birth.placeLabel,
      dateLabel: when.setLocale(locale).toLocaleString({ day: "numeric", month: "long", year: "numeric" }),
      timeLabel: `${h12}:${String(birth.minute).padStart(2, "0")} ${birth.hour < 12 ? "AM" : "PM"}`,
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="kundlikaka-kundli.pdf"',
      "Cache-Control": "no-store",
    });
    res.send(pdf);
  } catch (e) {
    next(e);
  }
});

app.post("/api/report", reportLimit, async (req, res, next) => {
  try {
    if (!aiConfigured()) {
      return res.status(503).json({
        error:
          "The astrologer is not switched on yet. Your kundli chart is ready, the written report will be available soon." + noKeyNote(req),
      });
    }
    const birth = parseBirthInput(req.body);
    const name = cleanName(req.body?.name);
    const topic = parseTopic(req.body?.topic);
    const language = parseLanguage(req.body?.language);
    const chart = computeKundli(birth);
    const report = await generateReport({
      name,
      topic,
      language,
      tradition: birth.tradition,
      chart,
      timeUnknown: birth.timeUnknown,
    });
    res.json({ name, topic, language, chart, report });
  } catch (e) {
    const m = aiProblem(e);
    if (m) return res.status(m[0]).json({ error: m[1] });
    next(e);
  }
});

// ---- AI astrologers ------------------------------------------------------------
const freeChats = new FreeChats();
const guidesAlwaysOn = process.env.GUIDES_ALWAYS_ON === "1";

app.get("/api/chat/status", dailyLimit, (req, res, next) => {
  try {
    const cid = parseClientId(req.query.cid);
    res.json({ left: Number.isFinite(FREE_MESSAGES) ? freeChats.left(cid) : null, free: Number.isFinite(FREE_MESSAGES) ? FREE_MESSAGES : null });
  } catch (e) {
    next(e);
  }
});

app.post("/api/chat", chatLimit, async (req, res, next) => {
  try {
    const guide = parseGuide(req.body?.guide);
    const cid = parseClientId(req.body?.cid);
    const turns = parseMessages(req.body?.messages);
    const language = parseLanguage(req.body?.language);

    if (!guidesAlwaysOn && isResting(guide)) {
      return res.status(409).json({
        code: "REST",
        error: `${guide.name} is resting right now and is back at ${backAt(guide)} (India time). Another guide is available.`,
      });
    }
    if (freeChats.left(cid) <= 0) {
      return res.status(402).json({
        code: "LIMIT",
        left: 0,
        error: "You have used your free messages.",
      });
    }
    if (!aiConfigured()) {
      return res.status(503).json({
        error: "The astrologers are not switched on yet. Please try again soon." + noKeyNote(req),
      });
    }

    const raw = Array.isArray(req.body?.people) ? req.body.people : req.body?.birth ? [req.body.birth] : [];
    const people = raw.slice(0, 3).map((x) => {
      const birth = parseBirthInput(x);
      return { name: cleanName(x?.name), chart: computeKundli(birth), timeUnknown: birth.timeUnknown === true, tradition: birth.tradition || "vedic" };
    });
    const reply = await guideReply({
      guide,
      language,
      turns,
      people,
      today: new Date().toISOString().slice(0, 10),
    });
    const left = freeChats.use(cid);
    res.json({ reply, left: Number.isFinite(left) ? left : null, free: Number.isFinite(FREE_MESSAGES) ? FREE_MESSAGES : null });
  } catch (e) {
    const m = aiProblem(e);
    if (m) return res.status(m[0]).json({ error: m[1] });
    next(e);
  }
});

// Krishna: a calm voice that speaks only from the Gita. Shares the same free messages as the astrologers.
app.post("/api/krishna", chatLimit, async (req, res, next) => {
  try {
    const cid = parseClientId(req.body?.cid);
    const turns = parseMessages(req.body?.messages);
    const language = parseLanguage(req.body?.language);
    if (freeChats.left(cid) <= 0) {
      return res.status(402).json({ code: "LIMIT", left: 0, error: "You have used your free messages." });
    }
    if (!aiConfigured()) {
      return res.status(503).json({ error: "Krishna is not switched on yet. Please try again soon." + noKeyNote(req) });
    }
    const reply = await krishnaReply({ language, turns });
    const left = freeChats.use(cid);
    res.json({ reply, sig: signReply(reply), left: Number.isFinite(left) ? left : null, free: Number.isFinite(FREE_MESSAGES) ? FREE_MESSAGES : null });
  } catch (e) {
    const m = aiProblem(e);
    if (m) return res.status(m[0]).json({ error: m[1] });
    next(e);
  }
});

// Krishna's voice: a calm spoken version (up to one minute) of a reply he wrote. A few free listens per device.
const listens = new FreeChats(FREE_LISTENS);
app.post("/api/krishna/speak", chatLimit, async (req, res, next) => {
  try {
    const cid = parseClientId(req.body?.cid);
    const text = String(req.body?.text ?? "").slice(0, 2400);
    if (!text || !verifyReply(text, req.body?.sig)) return res.status(400).json({ error: "That reply cannot be spoken." });
    if (listens.left(cid) <= 0) return res.status(402).json({ code: "LIMIT", error: "You have used your free listens." });
    if (!aiConfigured()) return res.status(503).json({ error: "The voice is not switched on yet." });
    const wav = await speakKrishna(text);
    listens.use(cid);
    res.set({ "Content-Type": "audio/wav", "Cache-Control": "private, max-age=3600", "X-Listens-Left": String(listens.left(cid)) }).send(wav);
  } catch (e) {
    const m = aiProblem(e);
    if (m) return res.status(m[0]).json({ error: m[1] });
    next(e);
  }
});

// ---- pages ---------------------------------------------------------------
const originOf = (req) => (process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
const SHELL = path.join(__dirname, "public", "index.html");
function sendPage(req, res, page, extra = {}) {
  res.setHeader("Cache-Control", "no-cache");
  res.type("html").send(renderPage(loadShell(SHELL), page, { origin: originOf(req), ...extra }));
}
for (const page of Object.values(PAGES)) app.get(page.path, (req, res) => sendPage(req, res, page));
app.get("/blog", (req, res) => res.type("html").send(renderBlogIndex(originOf(req))));
app.get("/blog/:slug", (req, res, next) => {
  const post = Object.hasOwn(POST_BY_SLUG, req.params.slug) ? POST_BY_SLUG[req.params.slug] : null;
  if (!post) return next();
  res.type("html").send(renderPost(post, originOf(req)));
});
app.get("/gita", (req, res) => { res.setHeader("Cache-Control", "no-cache"); res.type("html").send(renderGitaIndex(originOf(req))); });
app.get("/gita/:n", (req, res, next) => {
  const c = chapterOf(req.params.n);
  if (!c) return next();
  res.setHeader("Cache-Control", "no-cache");
  res.type("html").send(renderChapter(c, originOf(req)));
});
app.get("/index.html", (_req, res) => res.redirect(301, "/"));

// Each sign has its own address, with today's reading in the page itself.
app.get("/rashifal/:sign", (req, res, next) => {
  const slug = String(req.params.sign).toLowerCase();
  const page = signPage(slug);
  if (!page) return next();
  let reading = "";
  try {
    const today = DateTime.now().setZone("Asia/Kolkata").toISODate();
    const h = buildDailyHoroscope({ date: today, lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", lang: "en" });
    const r = h.rashis[page.sign];
    const e = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    reading = `<article class="reading"><h2>${e(r.sign)} ${e(r.theme || "")}</h2><p>${e(r.text)}</p></article>`;
  } catch { /* the page still works without it */ }
  sendPage(req, res, page, { reading });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${originOf(req)}/sitemap.xml\n`);
});
app.get("/sitemap.xml", (req, res) => res.type("application/xml").send(sitemap(originOf(req), POSTS, GITA_PATHS())));

// ---- static site ---------------------------------------------------------
app.use(
  express.static(path.join(__dirname, "public"), {
    index: false,
    setHeaders(res, file) {
      // Code and pages are always revalidated so updates show up at once;
      // images too, so a replaced picture shows up at once (304 when unchanged);
      // only fonts are kept for a day.
      if (/\.(html|css|js|jpg|jpeg|png|svg|webp|webmanifest)$/.test(file)) res.setHeader("Cache-Control", "no-cache");
      else res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

// Anything else: a friendly home page with a 404 status, kept out of search.
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/") || /\.\w+$/.test(req.path)) return next();
  res.status(404);
  sendPage(req, res, { ...PAGES.home, path: "/" }, { noindex: true });
});

// ---- errors --------------------------------------------------------------
app.use((err, _req, res, _next) => {
  if (err instanceof InputError) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.message === "Invalid birth date, time or timezone") {
    return res.status(400).json({ error: "That birth date or time is not valid." });
  }
  if (err?.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: "That request was not understood." });
  }
  console.error(err);
  res.status(500).json({
    error: "Something went wrong on our side. Please try again in a moment.",
  });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Kundli Kaka is running on http://0.0.0.0:${port}`);
});
