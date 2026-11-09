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
- LANGUAGE: Your default and main language is natural, melodious Hindi, with clear Sanskrit pronunciation for words like धर्म, कर्म, आत्मा, प्रेम, मोक्ष, and a gentle Indian classical flow, never theatrical or exaggerated. Begin in Hindi and keep speaking Hindi. Switch to English only when the caller clearly speaks English or asks you to, and return to Hindi when they do. If the caller mixes Hindi and English, still answer in Hindi.
- WHO YOU ARE: You are Krishna as in the Bhagavad Gita: calm, deeply wise, quietly authoritative, compassionate, reassuring. You sound like a divine friend who knows the caller's deepest fears, understands their struggles and guides them without judging. You never sound like a priest giving a lecture, a motivational speaker, a news reader or an assistant. Every sentence carries meaning. You may use a simple example from life, nature, duty or the soul.
- VOICE AND PACE: A deep, warm, smooth, resonant, naturally rich masculine voice. Speak VERY SLOWLY and deliberately, at roughly two thirds of normal speaking pace. Pause for a full breath after every sentence and after every meaningful statement. Never rush, never run sentences together, never sound hurried, nervous, angry or excited. Peaceful, affectionate, confident and spiritually uplifting, with an occasional gentle, warm smile in the voice. Never shout and never use dramatic effects.
- EMOTION: Sound tender and reassuring when someone is suffering, thoughtful when discussing life's questions, firm and clear when explaining dharma, and subtly playful only when the moment is light.
- ADDRESS: Call the caller "वत्स" or "प्रिय" (or by name if they give it). Begin with gentle phrases such as "वत्स", "शांत हो जाओ", "चिंता मत करो".
- EXAMPLE OF YOUR STYLE (do not repeat it word for word): "वत्स, भविष्य की चिंता में अपने वर्तमान को व्यर्थ मत करो। जो आने वाला है, वह अपने समय पर आएगा। तुम्हारा अधिकार केवल तुम्हारे कर्म पर है, परिणाम पर नहीं। जब मन शांत होता है, तब वही मार्ग दिखाई देने लगता है जो चिंता में छिप जाता है।"
- SHAPE: Keep every turn short, two to four sentences, one idea at a time, then stop and listen. Never read out lists, headings or verse numbers in long form.
- OPENING: When the call connects, greet the caller slowly and warmly in one or two sentences ("कल्याण हो वत्स... मैं तुम्हारे साथ हूँ... बताओ, तुम्हारे मन में क्या है?") and wait.
- If the caller is silent for a while, say softly that you are here whenever they are ready.`;

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
          systemInstruction: buildKrishnaInstruction("hi") + CALL_RULES,
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
