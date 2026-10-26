import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeKundli } from "./src/kundli.js";
import { searchPlaces } from "./src/geocode.js";
import { generateReport, aiConfigured } from "./src/report.js";
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

// ---- API -----------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: aiConfigured() });
});

app.get("/api/config", (_req, res) => {
  res.json({ whatsappUrl });
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
    const report = typeof req.body?.report === "string" ? req.body.report.slice(0, 14000) : "";
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
      "Content-Disposition": 'attachment; filename="shubhly-kundli.pdf"',
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
          "The AI guide is not switched on yet. Your kundli chart is ready, the written report will be available soon.",
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
    next(e);
  }
});

// ---- AI guides ------------------------------------------------------------
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
        error: "The AI guides are not switched on yet. Please try again soon.",
      });
    }

    let chart = null;
    let birth = null;
    if (req.body?.birth) {
      birth = parseBirthInput(req.body.birth);
      chart = computeKundli(birth);
    }
    const reply = await guideReply({
      guide,
      language,
      turns,
      chart,
      name: cleanName(req.body?.birth?.name),
      timeUnknown: birth?.timeUnknown === true,
      tradition: birth?.tradition || "vedic",
      today: new Date().toISOString().slice(0, 10),
    });
    const left = freeChats.use(cid);
    res.json({ reply, left: Number.isFinite(left) ? left : null, free: Number.isFinite(FREE_MESSAGES) ? FREE_MESSAGES : null });
  } catch (e) {
    next(e);
  }
});

// ---- static site ---------------------------------------------------------
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, file) {
      // Code and pages are always revalidated so updates show up at once;
      // images too, so a replaced picture shows up at once (304 when unchanged);
      // only fonts are kept for a day.
      if (/\.(html|css|js|jpg|jpeg|png|svg|webp)$/.test(file)) res.setHeader("Cache-Control", "no-cache");
      else res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

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

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Shubhly is running on port ${port}`);
});
