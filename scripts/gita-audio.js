// Makes every verse clip ahead of time into public/audio/gita, so listening is free and instant.
// Run once with your key set:   GEMINI_API_KEY=... node scripts/gita-audio.js [kinds] [chapter]
//   kinds   comma list of sa,en,hi (default sa)       chapter   one chapter number (default all)
// It skips clips that already exist, so it is safe to stop and start again.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadGita } from "../src/gita.js";
import { AUDIO_DIR, verseClip } from "../src/gita-audio.js";

const kinds = (process.argv[2] || "sa").split(",");
const only = Number(process.argv[3]) || 0;
fs.mkdirSync(AUDIO_DIR, { recursive: true });
let hasFfmpeg = true;
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch { hasFfmpeg = false; }

for (const c of loadGita()) {
  if (only && c.n !== only) continue;
  for (const v of c.verses) for (const k of kinds) {
    const base = `${c.n}-${v.n}-${k}`;
    if (fs.existsSync(path.join(AUDIO_DIR, base + ".mp3")) || fs.existsSync(path.join(AUDIO_DIR, base + ".wav"))) continue;
    try {
      const clip = await verseClip(c.n, v.n, k);
      if (hasFfmpeg) {
        const out = path.join(AUDIO_DIR, base + ".mp3");
        execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", clip.file, "-ac", "1", "-ar", "24000", "-b:a", "48k", out]);
      } else fs.copyFileSync(clip.file, path.join(AUDIO_DIR, base + ".wav"));
      console.log("made", base);
    } catch (e) { console.error("failed", base, e.message); await new Promise((r) => setTimeout(r, 4000)); }
  }
}
