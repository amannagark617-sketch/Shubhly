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
import { sadeSati, saturnWindow, slowPlanets } from "./src/transits.js";
import {
  InputError,
  cleanName,
  parseBirthInput,
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
app.use(express.json({ limit: "20kb" }));

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
    const panchang = computePanchang({
      date, lat: place.lat, lon: place.lon, tz: place.tz,
      natalMoonSignIndex: moon, includeUpcoming: true,
    });
    const slow = slowPlanets(date, place.tz);
    const personal =
      moon === null
        ? null
        : {
            sadeSati: sadeSati(moon, slow.Saturn.index),
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
    res.json(buildDailyHoroscope({ date, lat: place.lat, lon: place.lon, tz: place.tz }));
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
    const chart = computeKundli(birth);
    const moon = chart.planets.find((p) => p.key === "Moon");
    const today = DateTime.now().setZone("Asia/Kolkata").toISODate();
    const saturn = slowPlanets(today, "Asia/Kolkata").Saturn;
    res.json({
      name: cleanName(req.body?.name),
      chart,
      insights: quickInsights(chart, { timeUnknown: birth.timeUnknown }),
      sadeSati: {
        ...sadeSati(moon.signIndex, saturn.index),
        saturn: saturnWindow(today, "Asia/Kolkata"),
      },
    });
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
      chart,
      timeUnknown: birth.timeUnknown,
    });
    res.json({ name, topic, language, chart, report });
  } catch (e) {
    next(e);
  }
});

// ---- static site ---------------------------------------------------------
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, file) {
      // Code and pages are always revalidated so updates show up at once;
      // fonts and images can be kept longer.
      if (/\.(html|css|js)$/.test(file)) res.setHeader("Cache-Control", "no-cache");
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
