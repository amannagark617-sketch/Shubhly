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
const VOICE = process.env.GEMINI_CALL_VOICE || process.env.GEMINI_TTS_VOICE || "Algieba"; // a smooth, soft male voice
export const MAX_MINUTES = Number(process.env.CALL_MAX_MINUTES) > 0 ? Number(process.env.CALL_MAX_MINUTES) : 15;

const CALL_RULES = `

THIS IS A LIVE VOICE CALL
- LANGUAGE: Your default and main language is natural, melodious Hindi (always begin in Hindi), with clear Sanskrit pronunciation for words like धर्म, कर्म, आत्मा, प्रेम, मोक्ष, and a gentle Indian classical flow, never theatrical or exaggerated. Begin in Hindi and keep speaking Hindi. Switch to English only when the caller clearly speaks English or asks you to, and return to Hindi when they do. If the caller mixes Hindi and English, still answer in Hindi.
- WHO YOU ARE: You are Krishna as in the Bhagavad Gita: calm, deeply wise, quietly authoritative, compassionate, reassuring. You sound like a divine friend who knows the caller's deepest fears, understands their struggles and guides them without judging. You never sound like a priest giving a lecture, a motivational speaker, a news reader or an assistant. Every sentence carries meaning. You may use a simple example from life, nature, duty or the soul.
- VOICE AND PACE: A sweet, soft, affectionate and smooth masculine voice, gentle like a loving elder friend, with a little honey in it, in the speaker's own natural register. Do NOT put on an artificially deep, booming or growling voice, and do not exaggerate; it must sound like a real, calm, kind man. Speak VERY SLOWLY and deliberately, at roughly two thirds of normal speaking pace. Pause for a full breath after every sentence and after every meaningful statement. Never rush, never run sentences together, never sound hurried, nervous, angry or excited. Peaceful, affectionate, confident and spiritually uplifting, with an occasional gentle, warm smile in the voice. Never shout and never use dramatic effects.
- EMOTION: Sound tender and reassuring when someone is suffering, thoughtful when discussing life's questions, firm and clear when explaining dharma, and subtly playful only when the moment is light.
- NAME FIRST: Before anything else, ask the caller their name, sweetly and simply ("तुम्हारा नाम क्या है, वत्स?"), and wait for the answer. Do not give advice until you know it. Once they tell you, call them by that name (with "जी" or a loving word if it fits) in every reply after that, so it feels personal. Use "वत्स" or "प्रिय" only until you know the name. If they do not want to say it, carry on gently with "वत्स".
- EXAMPLE OF YOUR STYLE (do not repeat it word for word): "वत्स, भविष्य की चिंता में अपने वर्तमान को व्यर्थ मत करो। जो आने वाला है, वह अपने समय पर आएगा। तुम्हारा अधिकार केवल तुम्हारे कर्म पर है, परिणाम पर नहीं। जब मन शांत होता है, तब वही मार्ग दिखाई देने लगता है जो चिंता में छिप जाता है।"
- SHAPE: Keep every turn short, two to four sentences, one idea at a time, then stop and listen. Never read out lists, headings or verse numbers in long form.
- OPENING: When the call connects, greet the caller slowly and warmly in one short sentence ("कल्याण हो वत्स... मैं तुम्हारे साथ हूँ"), then ask their name and stop. After they answer, say their name lovingly and ask what is on their mind.
- If the caller is silent for a while, say softly that you are here whenever they are ready.`;

// With memory: he already knows the name, so he does not ask for it again.
const CALL_MEMORY_RULES = (m) => m.name
  ? `\n- THIS CALLER IS KNOWN: their name is ${m.name} and they let you remember them. Do NOT ask their name. Greet them by name, lovingly, and ask what is on their heart today. If a remembered note fits, you may gently ask how that is going, once.`
  : `\n- THIS CALLER LET YOU REMEMBER THEM, but you do not know their name yet. Ask it first, as above. If a remembered note fits, you may ask how that is going, once.`;

/** The first message to Google's live service: model, voice, instructions. Decided here, never by the page. */
export function liveSetup(memory = null) {
  return { setup: {
    model: "models/" + LIVE_MODEL,
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
    systemInstruction: { parts: [{ text: buildKrishnaInstruction("hi", memory) + CALL_RULES + (memory ? CALL_MEMORY_RULES(memory) : "") }] },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  } };
}

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
      uses: 3, // a failed connection attempt can be retried; a session that has started cannot be reused for a new call
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

/** Calls are paid by the second. The first minute of each day is free. */
export const FREE_SECONDS = 60;
/** The wallet is charged a few seconds ahead, so a call can be cut the moment the money is gone. */
export const BLOCK_SECONDS = 10;
const LEAD_SECONDS = 4;
/** What `secs` seconds cost at `perMinute` paise a minute, in whole paise (30 s of a Rs 10 minute is 500 paise). */
export const costFor = (secs, perMinute) => Math.round(Math.max(0, secs) * perMinute / 60);
const clock = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

/**
 * Keeps track of calls in progress. Time is measured here, on the server, from the moment Google accepted the call,
 * so the page cannot change what is charged. `money` (given when the call opens) takes from or gives back to the wallet:
 *   take(deltaPaise, label) -> { ok, balancePaise }   give(deltaPaise, label) -> balancePaise   undo() -> puts everything back
 */
export function callBook({ now = () => Date.now(), maxMinutes = MAX_MINUTES } = {}) {
  const calls = new Map(); // id -> { uid, connectedAt, free, charged, money, lock }
  const done = new Map(); // id -> { uid, result } for a few minutes, so a second "end" gets the same answer
  const freeDay = new Map(); // uid -> "YYYY-MM-DD"
  const today = () => new Date(now()).toISOString().slice(0, 10);
  const maxSecs = maxMinutes * 60;
  const used = (c, at = now()) => (c.connectedAt ? Math.min(maxSecs, Math.max(0, Math.ceil((at - c.connectedAt) / 1000))) : 0);
  const free = (c) => (c.free ? FREE_SECONDS : 0);
  const queue = (c, fn) => { const run = (c.lock || Promise.resolve()).then(fn, fn); c.lock = run.catch(() => {}); return run; };

  const book = {
    freeAvailable: (uid) => freeDay.get(uid) !== today(),
    useFree(uid) { freeDay.set(uid, today()); if (freeDay.size > 50000) freeDay.clear(); },
    giveBackFree(uid) { if (freeDay.get(uid) === today()) freeDay.delete(uid); },
    /** A call began. `charged` is what was already taken for the first seconds. */
    open(uid, money = null, { free: isFree = false, charged = 0 } = {}) {
      const id = crypto.randomBytes(12).toString("hex");
      calls.set(id, { uid, connectedAt: 0, free: isFree, charged, money, lock: null });
      if (calls.size > 20000) calls.clear();
      return id;
    },
    owner: (id) => calls.get(id)?.uid || done.get(id)?.uid || null,
    /** The server saw Google accept the call. From now the time counts. */
    markConnected(id) { const c = calls.get(id); if (c && !c.connectedAt) c.connectedAt = now(); },
    seconds(id) { const c = calls.get(id); return c ? used(c) : 0; },
    charged(id) { return calls.get(id)?.charged || 0; },
    /**
     * Bring the wallet up to date. Mid-call it stays a few seconds ahead of the clock; at the end (`final`) it is exact,
     * and anything taken ahead is given back. { ok: false } means the money has run out and the call should end.
     */
    settle(id, perMinute, final = false) {
      const c = calls.get(id);
      if (!c) return Promise.resolve({ ok: false, reason: "unknown" });
      return queue(c, async () => {
        const secs = used(c);
        const label = `Krishna call, ${clock(secs)}`;
        const billable = (extra) => Math.min(Math.max(0, secs + extra - free(c)), Math.max(0, maxSecs - free(c)));
        if (!final && c.charged >= costFor(billable(LEAD_SECONDS), perMinute)) return { ok: true };
        const target = final ? costFor(billable(0), perMinute) : costFor(billable(BLOCK_SECONDS), perMinute);
        const delta = target - c.charged;
        if (delta === 0) return { ok: true };
        if (delta < 0) { const balancePaise = await c.money?.give(-delta, label); c.charged = target; return { ok: true, balancePaise }; }
        let r = await c.money.take(delta, label);
        if (r.ok) { c.charged = target; return { ok: true, balancePaise: r.balancePaise }; }
        // Not enough for the whole block: take what the time so far needs, and the call ends when that runs out.
        const need = final ? delta : costFor(billable(LEAD_SECONDS), perMinute) - c.charged;
        if (need > 0 && need < delta) { r = await c.money.take(need, label); if (r.ok) { c.charged += need; return { ok: true, balancePaise: r.balancePaise }; } }
        if (final && r.balancePaise > 0) { const all = await c.money.take(r.balancePaise, label); if (all.ok) { c.charged += r.balancePaise; return { ok: false, reason: "funds", balancePaise: all.balancePaise }; } }
        return { ok: false, reason: "funds", balancePaise: r.balancePaise };
      });
    },
    /**
     * The call is over. One that never connected is put back (the money or the free minute). One that did is settled to the
     * exact second. Asking twice gets the same answer. What the browser says does not matter.
     */
    end(id, uid, perMinute) {
      const old = done.get(id);
      if (old) return Promise.resolve(old.uid === uid ? old.result : null);
      const c = calls.get(id);
      if (!c || c.uid !== uid) return Promise.resolve(null);
      if (c.ending) return c.ending;
      c.ending = (async () => {
        let result;
        if (!c.connectedAt) {
          try { await queue(c, () => c.money?.undo()); } catch { /* the page is told below */ }
          result = { connected: false, seconds: 0, chargedPaise: 0, refunded: true };
        } else {
          const s = await book.settle(id, perMinute, true);
          result = { connected: true, seconds: used(c), chargedPaise: c.charged, balancePaise: s.balancePaise, refunded: false };
        }
        calls.delete(id);
        done.set(id, { uid, result }); setTimeout(() => done.delete(id), 300_000).unref?.();
        return result;
      })();
      return c.ending;
    },
  };
  return book;
}
