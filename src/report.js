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
    },
  });

  const text = (response.text || "").trim();
  if (!text) throw new Error("The AI returned an empty report");
  return text;
}
