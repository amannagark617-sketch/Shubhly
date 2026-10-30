// Turns a computed chart into a written report using the Gemini API.

import { GoogleGenAI } from "@google/genai";
import { buildSystemInstruction, buildUserContent } from "./prompt.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client = null;
function getClient() {
  const key = geminiKey();
  if (!key) return null;
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

// AI Studio and Google Cloud name the key differently; accept the usual names.
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENAI_API_KEY", "GENAI_API_KEY", "API_KEY"];
const looksLikeKey = (v) => /^AIza[\w-]{30,}$/.test(String(v || "").trim());

// Which setting holds the key: the usual names first, then any setting whose
// value looks like a Google API key, whatever it was called.
export function geminiKeyName() {
  for (const n of KEY_NAMES) if (String(process.env[n] || "").trim()) return n;
  return Object.keys(process.env).find((n) => looksLikeKey(process.env[n])) || "";
}

export function geminiKey() {
  const n = geminiKeyName();
  return n ? String(process.env[n]).trim() : "";
}

export function aiConfigured() {
  return Boolean(geminiKey());
}

export async function generateReport({
  name,
  topic,
  language,
  tradition = "vedic",
  chart,
  timeUnknown = false,
}) {
  const ai = getClient();
  if (!ai) {
    const err = new Error("AI is not configured yet");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const today = new Date().toISOString().slice(0, 10);
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserContent({ name, topic, chart, today, timeUnknown }),
    config: {
      systemInstruction: buildSystemInstruction(language, tradition),
      temperature: 0.7,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
    },
  });

  const text = (response.text || "").trim();
  if (!text) throw new Error("The AI returned an empty report");
  return parseReport(text);
}

// The report comes back as short pieces so it can be shown as cards and in the PDF.
// Anything the AI sends outside that shape is dropped; plain text still works as a fallback.
const LABELS = ["strengths", "watch", "now", "tips", "elements", "timeline", "fire", "earth", "air", "water"];
const str = (v, n) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");
const list = (v, n, each) => (Array.isArray(v) ? v.map((x) => str(x, each)).filter(Boolean).slice(0, n) : []);

export function parseReport(raw) {
  const cleaned = String(raw).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let o = null;
  try { o = JSON.parse(cleaned); } catch { /* fall through */ }
  if (!o || typeof o !== "object" || Array.isArray(o)) return { markdown: String(raw).slice(0, 6000) };
  const labels = {};
  for (const k of LABELS) labels[k] = str(o.labels?.[k], 40);
  const out = {
    headline: str(o.headline, 140),
    glance: str(o.glance, 300),
    strengths: list(o.strengths, 4, 140),
    watch: list(o.watch, 4, 140),
    focusTitle: str(o.focusTitle, 60),
    focus: list(o.focus, 5, 220),
    now: str(o.now, 320),
    tips: list(o.tips, 5, 140),
    closing: str(o.closing, 160),
    labels,
  };
  if (!out.glance && !out.strengths.length && !out.focus.length) return { markdown: String(raw).slice(0, 6000) };
  return out;
}
