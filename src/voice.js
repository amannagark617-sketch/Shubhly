// Krishna's voice: a calm spoken version of a reply he wrote, at most one minute long.
//
// Only replies this server wrote can be spoken (each one is signed), so the voice
// cannot be used as a free text-to-speech service.

import crypto from "node:crypto";
import { getClient } from "./chat.js";
import { geminiKey } from "./report.js";

const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const VOICE = process.env.GEMINI_TTS_VOICE || "Charon"; // smooth and unhurried; try "Umbriel" or "Enceladus" for softer
const RATE = 24000; // Gemini speech comes back as 24 kHz, 16-bit, mono
export const MAX_SECONDS = 60;
const MAX_WORDS = 120; // about a minute at a slow, calm pace

export const FREE_LISTENS = Number(process.env.FREE_LISTENS) >= 0 && process.env.FREE_LISTENS !== undefined && process.env.FREE_LISTENS !== "" ? Number(process.env.FREE_LISTENS) : 3;

const secret = () => crypto.createHash("sha256").update("krishna-voice:" + (geminiKey() || "none")).digest();
export const signReply = (text) => crypto.createHmac("sha256", secret()).update(String(text)).digest("hex").slice(0, 32);
export function verifyReply(text, sig) {
  const a = Buffer.from(signReply(text)), b = Buffer.from(String(sig || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Keep to about a minute: cut at the end of a sentence.
export function trimForSpeech(text, maxWords = MAX_WORDS) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  if (words.length <= maxWords) return clean;
  const cut = words.slice(0, maxWords).join(" ");
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "), cut.lastIndexOf("। "));
  return end > cut.length * 0.5 ? cut.slice(0, end + 1) : cut;
}

export function pcmToWav(pcm, rate = RATE) {
  const max = rate * 2 * MAX_SECONDS;
  const data = pcm.length > max ? pcm.subarray(0, max) : pcm;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

export async function defaultSpeak(prompt) {
  const ai = getClient();
  if (!ai) { const e = new Error("AI is not configured yet"); e.code = "AI_NOT_CONFIGURED"; throw e; }
  const r = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
  });
  const b64 = r.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!b64) throw new Error("No audio came back");
  return Buffer.from(b64, "base64");
}

export async function speakKrishna(text, speak = defaultSpeak) {
  const say = trimForSpeech(text);
  const prompt = `Speak the text below as Lord Krishna himself would: a deep, resonant, majestic and serene voice, full of divine authority and boundless compassion, like the Supreme speaking to a beloved devotee. Unhurried and measured, with long, graceful pauses between sentences. Never rushed, never theatrical, never cheerful. Elegant, timeless, and deeply reassuring. Say only the text, nothing else.\n\n${say}`;
  return pcmToWav(await speak(prompt));
}
