// Spoken verses. Each verse can be heard three ways: the Sanskrit recited slowly,
// or the simple meaning read in English or Hindi.
//
// Every clip is made once and kept. If a finished file is in public/audio/gita
// (made ahead with scripts/gita-audio.js) it is used and costs nothing. Otherwise
// the clip is made on the first listen, saved, and reused by everyone after.
// There are only 3 clips per verse, so the cost has a fixed ceiling.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGita } from "./gita.js";
import { pcmToWav, defaultSpeak } from "./voice.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const AUDIO_DIR = path.join(root, "public", "audio", "gita");
const cacheDir = () => process.env.GITA_AUDIO_CACHE || path.join(os.tmpdir(), "kk-gita-audio");
export const KINDS = ["sa", "en", "hi"];

export function verseOf(n, v) {
  const c = loadGita()[Number(n) - 1];
  return c?.verses.find((x) => x.n === Number(v)) ? { c, v: c.verses.find((x) => x.n === Number(v)) } : null;
}

export function promptFor(kind, c, v) {
  if (kind === "sa") return `Recite this Bhagavad Gita verse slowly and clearly in a calm, deep, devotional voice, with correct Sanskrit pronunciation and natural pauses. Say only the verse:\n\n${v.sa.replace(/\s+/g, " ")}`;
  if (kind === "hi") return `Read this slowly in a warm, calm, kind voice, in simple Hindi, like a gentle teacher:\n\n${v.hi}${v.ex_hi ? " । श्रीकृष्ण के कहने का मतलब यह है। " + v.ex_hi : ""}`;
  return `Read this slowly in a warm, calm, kind voice, like a gentle teacher:\n\n${v.en}${v.ex_en ? " What Krishna meant by this is: " + v.ex_en : ""}`;
}

const inflight = new Map();

// Returns { file, type } for a clip, making it if needed.
export async function verseClip(n, v, kind, speak = defaultSpeak) {
  if (!KINDS.includes(kind)) return null;
  const hit = verseOf(n, v);
  if (!hit) return null;
  const base = `${Number(n)}-${Number(v)}-${kind}`;
  for (const [dir, ext, type] of [[AUDIO_DIR, "mp3", "audio/mpeg"], [AUDIO_DIR, "wav", "audio/wav"], [cacheDir(), "wav", "audio/wav"]]) {
    const f = path.join(dir, `${base}.${ext}`);
    if (fs.existsSync(f)) return { file: f, type };
  }
  const f = path.join(cacheDir(), `${base}.wav`);
  if (!inflight.has(base)) {
    inflight.set(base, (async () => {
      const pcm = await speak(promptFor(kind, hit.c, hit.v));
      fs.mkdirSync(cacheDir(), { recursive: true });
      const tmp = f + "." + process.pid + ".tmp";
      fs.writeFileSync(tmp, pcmToWav(pcm));
      fs.renameSync(tmp, f);
    })().finally(() => inflight.delete(base)));
  }
  await inflight.get(base);
  return { file: f, type: "audio/wav" };
}
