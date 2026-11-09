// Krishna on a call: a live, two-way voice conversation, spoken in a calm voice from the Gita.
//
// The browser talks to Gemini Live directly, using a short-lived token made here. The token is locked to
// Krishna's instructions and voice, can be used once, and stops working after the longest call, so the
// public cannot use it for anything else. Money is taken here, minute by minute.

import crypto from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { geminiKey } from "./report.js";
import { buildKrishnaInstruction } from "./gita.js";

export const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
const VOICE = process.env.GEMINI_CALL_VOICE || process.env.GEMINI_TTS_VOICE || "Charon";
export const MAX_MINUTES = Number(process.env.CALL_MAX_MINUTES) > 0 ? Number(process.env.CALL_MAX_MINUTES) : 15;

const CALL_RULES = `

THIS IS A LIVE VOICE CALL
- You are speaking aloud on a phone-like call. Speak in a deep, resonant, majestic and serene voice, with divine calm and compassion, never rushed and never cheerful.
- Keep every turn short: two to four spoken sentences. One idea at a time, then stop and listen. Never read out lists, headings, chapter numbers in long form, or anything that sounds like text.
- When the call connects, greet the caller warmly in one or two sentences and ask gently what is on their mind.
- If the caller is silent for a while, say softly that you are here whenever they are ready.
- Reply in the language the caller speaks (English, Hindi or Hinglish).`;

let client = null;
function liveClient() {
  const key = geminiKey();
  if (!key) return null;
  client ||= new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: "v1alpha" } });
  return client;
}

/** A one-use token for the browser, good for one call of at most MAX_MINUTES. */
export async function makeCallToken({ language = "en", ai = liveClient() } = {}) {
  if (!ai) { const e = new Error("AI is not configured yet"); e.code = "AI_NOT_CONFIGURED"; throw e; }
  const now = Date.now();
  const t = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(now + (MAX_MINUTES * 60 + 45) * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 90 * 1000).toISOString(),
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: {
          responseModalities: ["AUDIO"],
          systemInstruction: buildKrishnaInstruction(language) + CALL_RULES,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      },
    },
  });
  return { token: t.name, model: LIVE_MODEL };
}

/**
 * Keeps track of calls in progress, so a minute can only be charged for a real call, once,
 * and only when that minute has actually begun. The first minute of the day is free.
 */
export function callBook({ now = () => Date.now(), maxMinutes = MAX_MINUTES } = {}) {
  const calls = new Map(); // id -> { uid, startedAt, minutes }
  const freeDay = new Map(); // uid -> "YYYY-MM-DD"
  const today = () => new Date(now()).toISOString().slice(0, 10);
  return {
    freeAvailable: (uid) => freeDay.get(uid) !== today(),
    useFree(uid) { freeDay.set(uid, today()); if (freeDay.size > 50000) freeDay.clear(); },
    giveBackFree(uid) { if (freeDay.get(uid) === today()) freeDay.delete(uid); },
    open(uid) {
      const id = crypto.randomBytes(12).toString("hex");
      calls.set(id, { uid, startedAt: now(), minutes: 1 });
      if (calls.size > 20000) calls.clear();
      return id;
    },
    /** The next minute of a call: { ok, minute } when it has begun, else a reason. */
    nextMinute(id, uid) {
      const c = calls.get(id);
      if (!c || c.uid !== uid) return { ok: false, reason: "unknown" };
      if (c.minutes >= maxMinutes) return { ok: false, reason: "max" };
      if (now() - c.startedAt < c.minutes * 60000 - 8000) return { ok: false, reason: "early" };
      return { ok: true, minute: c.minutes + 1 };
    },
    commit(id) { const c = calls.get(id); if (c) c.minutes += 1; },
    end(id) { calls.delete(id); },
  };
}
