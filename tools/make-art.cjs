// Draws the site's banners, illustrations and product art as vector scenes and
// saves them into public/img. Run: node tools/make-art.js
// (needs Playwright; replace any file with your own generated image any time)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "public", "img");
const FONT = path.join(__dirname, "..", "public", "fonts", "yatra-one-latin-400-normal.woff2");
const FONT_DEV = path.join(__dirname, "..", "public", "fonts", "yatra-one-devanagari-400-normal.woff2");

const C = {
  ink: "#1b1b3a", haldi: "#f6b81c", haldi2: "#ffd45e", cream: "#fff4dc", red: "#d8321a", paper: "#fffaf0", green: "#17803f", orange: "#f28c0f", pink: "#f4a9a0",
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dots = (w, h, col = C.ink, op = 0.16) =>
  `<defs><pattern id="dt" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.6" fill="${col}" opacity="${op}"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#dt)"/>`;

const SW = 6;
const mandala = (cx, cy, R, o = {}) => {
  const stroke = o.stroke || C.haldi, sw = o.sw || 3;
  let s = `<g fill="none" stroke="${stroke}" stroke-width="${sw}">`;
  [1, 0.8, 0.6, 0.4].forEach((k) => { s += `<circle cx="${cx}" cy="${cy}" r="${(R * k).toFixed(1)}"/>`; });
  [[16, 0.7, 0.09], [12, 0.5, 0.1], [8, 0.3, 0.11]].forEach(([n, k, w]) => {
    for (let i = 0; i < n; i++) {
      s += `<ellipse cx="${cx}" cy="${(cy - R * k).toFixed(1)}" rx="${(R * w).toFixed(1)}" ry="${(R * w * 2.4).toFixed(1)}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`;
    }
  });
  return s + "</g>";
};

const sun = (cx, cy, r, fill = C.haldi, rays = 16) => {
  let s = "";
  for (let i = 0; i < rays; i++) {
    s += `<path d="M${-r * 0.2} ${-r * 1.15} L0 ${-r * 1.7} L${r * 0.2} ${-r * 1.15}Z" fill="${C.red}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round" transform="translate(${cx} ${cy}) rotate(${(360 / rays) * i})"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="${SW}"/>`;
};

const moonF = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.cream}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${r * 0.45} ${r} 0 0 0 ${cx} ${cy - r}Z" fill="${C.red}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="${SW}"/>`;

const diya = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round">
    <path d="M-40 0 Q0 56 40 0 Z" fill="${C.red}"/>
    <path d="M0 -6 Q-17 -30 0 -62 Q17 -30 0 -6 Z" fill="${C.orange}"/>
    <path d="M0 -10 Q-7 -26 0 -42 Q7 -26 0 -10 Z" fill="${C.haldi2}" stroke="none"/>
  </g>`;

const lotus = (cx, cy, s = 1, fill = C.pink, fill2 = C.cream) => {
  let p = "";
  [-72, -44, -16, 16, 44, 72].forEach((a, i) => {
    p += `<ellipse cx="0" cy="-48" rx="17" ry="52" fill="${i % 2 ? fill2 : fill}" transform="rotate(${a})"/>`;
  });
  p += `<ellipse cx="0" cy="-52" rx="19" ry="58" fill="${fill}"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})" stroke="${C.ink}" stroke-width="${5 / s}">${p}</g>`;
};

const temple = (x, base, s, color = C.ink) => {
  const tier = (w, h, y) => `<path d="M${-w / 2} ${y} L${-w / 2 + 6} ${y - h} L${w / 2 - 6} ${y - h} L${w / 2} ${y} Z"/>`;
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${color}" stroke="${C.ink}" stroke-width="${4 / s}">
    <rect x="-330" y="-34" width="660" height="34"/><rect x="-250" y="-120" width="500" height="86"/>
    ${tier(260, 40, -120)}${tier(220, 40, -160)}${tier(180, 44, -200)}${tier(140, 44, -244)}${tier(100, 44, -288)}${tier(60, 40, -332)}
    <rect x="-3" y="-392" width="6" height="60"/><circle cx="0" cy="-398" r="8" fill="${C.red}"/>
    <path d="M-42 0 V-70 A42 42 0 0 1 42 -70 V0 Z" fill="${C.haldi}"/></g>`;
};

const bunting = (x1, x2, y, n) => {
  let s = `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 60} ${x2} ${y}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t, yy = y + 60 * 2 * t * (1 - t);
    s += `<path d="M${x - 16} ${yy} L${x + 16} ${yy} L${x} ${yy + 40}Z" fill="${i % 2 ? C.red : C.haldi}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  return s;
};

const flat = (w, h, fill) => `<rect width="${w}" height="${h}" fill="${fill}"/>`;

const scenes = {};

scenes["rashifal-banner.jpg"] = { w: 1600, h: 500, svg: () => {
  const glyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const cx = 1250, cy = 250, R = 190;
  let g = "";
  glyphs.forEach((s, i) => {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    g += `<text x="${(cx + Math.cos(a) * R).toFixed(1)}" y="${(cy + Math.sin(a) * R + 16).toFixed(1)}" text-anchor="middle" font-size="46" fill="${C.cream}" font-family="serif" font-weight="700">${s}&#xFE0E;</text>`;
  });
  return `${flat(1600, 500, C.ink)}${dots(1600, 500, C.haldi, 0.18)}${mandala(cx, cy, 330, { stroke: C.haldi, sw: 3 })}
    <circle cx="${cx}" cy="${cy}" r="245" fill="none" stroke="${C.red}" stroke-width="8"/>${g}${moonF(cx, cy, 90)}`; } };

scenes["kundli-banner.jpg"] = { w: 1600, h: 500, svg: () => {
  const cx = 1240, cy = 250, s = 180;
  const planets = [[0, -1.0, C.haldi], [0.95, 0.05, C.red], [0.3, 0.75, C.cream], [-0.8, -0.3, C.orange], [-0.4, 0.8, C.haldi]];
  return `${flat(1600, 500, C.ink)}${dots(1600, 500, C.haldi, 0.18)}${mandala(cx, cy, 330, { stroke: C.haldi, sw: 2.5 })}
    <rect x="${cx - s}" y="${cy - s}" width="${s * 2}" height="${s * 2}" fill="${C.cream}" stroke="${C.haldi}" stroke-width="8"/>
    <g fill="none" stroke="${C.ink}" stroke-width="5"><path d="M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}"/><path d="M${cx} ${cy - s}L${cx + s} ${cy}L${cx} ${cy + s}L${cx - s} ${cy}Z"/></g>
    ${planets.map(([x, y, c]) => `<circle cx="${cx + x * s * 0.7}" cy="${cy + y * s * 0.7}" r="20" fill="${c}" stroke="${C.ink}" stroke-width="5"/>`).join("")}`; } };

scenes["store-banner.jpg"] = { w: 1600, h: 600, svg: () => `
  ${flat(1600, 600, C.red)}${dots(1600, 600, C.ink, 0.2)}${mandala(1230, 320, 340, { stroke: C.haldi, sw: 3 })}
  <ellipse cx="1230" cy="530" rx="330" ry="40" fill="${C.haldi}" stroke="${C.ink}" stroke-width="6"/>
  ${lotus(1230, 520, 1.35)}
  ${diya(1010, 490, 1.3)}${diya(1450, 490, 1.3)}${diya(1115, 505, 1)}${diya(1345, 505, 1)}`};

scenes["cta-banner.jpg"] = { w: 1600, h: 600, svg: () => `
  ${flat(1600, 600, C.red)}${dots(1600, 600, C.ink, 0.2)}${sun(1200, 270, 110, C.haldi)}
  ${temple(1380, 600, 0.6, C.ink)}${bunting(760, 1600, 20, 12)}
  ${[820, 960, 1100].map((x, i) => diya(x, 540 + (i % 2) * 20, 0.8)).join("")}${lotus(1000, 590, 0.5)}`};

scenes["og-image.jpg"] = { w: 1200, h: 630, svg: () => `
  ${flat(1200, 630, C.haldi)}${dots(1200, 630)}${mandala(930, 310, 330, { stroke: C.ink, sw: 2.5 })}${moonF(930, 310, 120)}
  <rect x="14" y="14" width="1172" height="602" fill="none" stroke="${C.ink}" stroke-width="10"/>
  <text x="70" y="300" font-family="Yatra One" font-size="160" fill="${C.ink}">Shubhly</text>
  <text x="74" y="385" font-family="Yatra One" font-size="44" fill="${C.red}">Your kundli, your puja, your vibe.</text>`};

const tile = (bg) => `${flat(640, 640, bg)}${dots(640, 640)}`;

scenes["step-1.png"] = { w: 640, h: 640, svg: () => `${tile(C.haldi)}
  <rect x="140" y="140" width="320" height="330" rx="26" fill="${C.cream}" stroke="${C.ink}" stroke-width="8"/>
  <rect x="140" y="140" width="320" height="80" rx="26" fill="${C.red}" stroke="${C.ink}" stroke-width="8"/><rect x="148" y="190" width="304" height="30" fill="${C.red}"/>
  <rect x="200" y="106" width="18" height="56" rx="9" fill="${C.ink}"/><rect x="382" y="106" width="18" height="56" rx="9" fill="${C.ink}"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${170 + (i % 4) * 68}" y="${248 + Math.floor(i / 4) * 66}" width="48" height="42" rx="9" fill="${i === 6 ? C.red : C.haldi2}" stroke="${C.ink}" stroke-width="4"/>`).join("")}
  <circle cx="450" cy="450" r="88" fill="${C.ink}"/><circle cx="450" cy="450" r="70" fill="${C.cream}"/>
  <path d="M450 398V450L486 470" stroke="${C.red}" stroke-width="12" fill="none" stroke-linecap="round"/>`};

scenes["step-2.png"] = { w: 640, h: 640, svg: () => `${tile(C.cream)}
  <rect x="120" y="120" width="400" height="400" fill="${C.haldi2}" stroke="${C.ink}" stroke-width="9"/>
  <g fill="none" stroke="${C.ink}" stroke-width="6"><path d="M120 120L520 520M520 120L120 520"/><path d="M320 120L520 320L320 520L120 320Z"/></g>
  ${[[320, 220, C.red], [220, 170, C.ink], [420, 170, C.orange], [320, 420, C.red], [220, 320, C.green], [420, 320, C.ink], [270, 470, C.orange]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="24" fill="${c}" stroke="${C.ink}" stroke-width="5"/>`).join("")}
  ${moonF(520, 130, 50)}`};

scenes["step-3.png"] = { w: 640, h: 640, svg: () => `${tile(C.pink)}
  <rect x="190" y="80" width="260" height="480" rx="42" fill="${C.ink}"/>
  <rect x="206" y="110" width="228" height="420" rx="26" fill="${C.cream}"/>
  ${moonF(320, 190, 42)}
  ${[250, 285, 320, 355, 390].map((y, i) => `<rect x="236" y="${y + 20}" width="${i === 4 ? 100 : 168}" height="14" rx="7" fill="${i === 0 ? C.red : C.ink}" opacity="${i === 0 ? 1 : 0.7}"/>`).join("")}
  <rect x="236" y="466" width="168" height="44" rx="22" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>
  ${lotus(520, 520, 0.6, C.haldi, C.cream)}`};

const prod = (bg) => `${flat(800, 800, bg)}${dots(800, 800)}`;

scenes["product-ganesha.jpg"] = { w: 800, h: 800, svg: () => `${prod(C.haldi)}
  <circle cx="400" cy="400" r="260" fill="${C.red}" stroke="${C.ink}" stroke-width="10"/><circle cx="400" cy="400" r="226" fill="none" stroke="${C.haldi}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>
  <text x="400" y="495" text-anchor="middle" font-family="Yatra One" font-size="320" fill="${C.haldi}" stroke="${C.ink}" stroke-width="6">ॐ</text>`};

scenes["product-lakshmi.jpg"] = { w: 800, h: 800, svg: () => `${prod(C.pink)}
  <circle cx="400" cy="340" r="190" fill="${C.haldi}" stroke="${C.ink}" stroke-width="10"/>
  ${lotus(400, 560, 2.3, C.red, C.cream)}
  <circle cx="400" cy="320" r="52" fill="${C.cream}" stroke="${C.ink}" stroke-width="8"/>
  ${[150, 650].map((x) => diya(x, 700, 1.1)).join("")}`};

scenes["product-puja-kit.jpg"] = { w: 800, h: 800, svg: () => {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    d += diya(400 + Math.cos(a) * 230, 440 + Math.sin(a) * 230 + 20, 0.62);
  }
  return `${prod(C.cream)}<circle cx="400" cy="430" r="330" fill="${C.haldi}" stroke="${C.ink}" stroke-width="10"/><circle cx="400" cy="430" r="296" fill="none" stroke="${C.ink}" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/>${d}${lotus(400, 490, 0.95)}`; } };

scenes["product-rudraksha.jpg"] = { w: 800, h: 800, svg: () => {
  let b = "";
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const x = 400 + Math.cos(a) * 250, y = 370 + Math.sin(a) * 250;
    b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="32" fill="#8a4a24" stroke="${C.ink}" stroke-width="6"/><circle cx="${(x - 8).toFixed(1)}" cy="${(y - 9).toFixed(1)}" r="9" fill="#c27a45"/>`;
  }
  return `${prod(C.red)}${b}<path d="M400 622 L400 680" stroke="${C.ink}" stroke-width="10"/>
    <circle cx="400" cy="715" r="40" fill="#8a4a24" stroke="${C.ink}" stroke-width="6"/><circle cx="390" cy="704" r="11" fill="#c27a45"/>
    <path d="M365 628 h70 l-8 -34 h-54z" fill="${C.haldi}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`; } };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, sc] of Object.entries(scenes)) {
    const page = await browser.newPage({ viewport: { width: sc.w, height: sc.h } });
    const html = `<!doctype html><meta charset="utf-8"><style>
      @font-face{font-family:"Yatra One";src:url("file://${FONT}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
      @font-face{font-family:"Yatra One";src:url("file://${FONT_DEV}") format("woff2");unicode-range:U+0900-097F}
      html,body{margin:0}svg{display:block}</style>
      <svg xmlns="http://www.w3.org/2000/svg" width="${sc.w}" height="${sc.h}" viewBox="0 0 ${sc.w} ${sc.h}">${sc.svg()}</svg>`;
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const isJpg = name.endsWith(".jpg");
    await page.screenshot({ path: path.join(OUT, name), type: isJpg ? "jpeg" : "png", ...(isJpg ? { quality: 84 } : {}) });
    await page.close();
    console.log("made", name);
  }
  await browser.close();
})();
