// Gives big photos a phone-sized copy: adds srcset and sizes to <img> tags whose
// 640 wide copy exists (made by scripts/optimize-images.py).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "img");
const has = new Map();
const small = (src) => {
  const m = src.match(/^\/img\/(.+)\.jpg$/);
  if (!m || m[1].endsWith("-640")) return null;
  if (!has.has(m[1])) has.set(m[1], fs.existsSync(path.join(IMG, `${m[1]}-640.jpg`)));
  return has.get(m[1]) ? `/img/${m[1]}-640.jpg` : null;
};

export function srcsetify(html) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\bsrcset=/.test(tag)) return tag;
    const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1];
    const s = src && small(src);
    if (!s) return tag;
    return tag.replace(/\bsrc="[^"]+"/, `src="${src}" srcset="${s} 640w, ${src} 1280w" sizes="(max-width: 700px) 100vw, 1100px"`);
  });
}
