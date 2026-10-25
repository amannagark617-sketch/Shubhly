import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeKundli } from "./src/kundli.js";
import { searchPlaces } from "./src/geocode.js";
import { generateReport, aiConfigured } from "./src/report.js";
import {
  InputError,
  cleanName,
  parseBirthInput,
  parseTopic,
  parseLanguage,
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

// ---- API -----------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: aiConfigured() });
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
    res.json({ name: cleanName(req.body?.name), chart });
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
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

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
