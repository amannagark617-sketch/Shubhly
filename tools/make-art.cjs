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
  night: "#1b0a33", wine: "#4b1a73", deep: "#0c0516", saffron: "#ff9f1c", burnt: "#c2561c",
  gold: "#ffd166", cream: "#ffe8b0", ivory: "#fff8ee", rose: "#e0527a",
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

const stars = (w, h, n, seed, maxY = h) => {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * maxY, rad = 0.6 + r() * 1.8, o = 0.25 + r() * 0.7;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${r() > 0.7 ? C.gold : C.cream}" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
};

const mandala = (cx, cy, R, o = {}) => {
  const stroke = o.stroke || C.cream, op = o.op ?? 0.3, sw = o.sw || 1.6;
  let s = `<g fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${sw}">`;
  [1, 0.93, 0.78, 0.6, 0.42, 0.26].forEach((k) => { s += `<circle cx="${cx}" cy="${cy}" r="${(R * k).toFixed(1)}"/>`; });
  [[24, 0.86, 0.07], [16, 0.69, 0.1], [12, 0.51, 0.1], [8, 0.34, 0.1]].forEach(([n, k, w]) => {
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      s += `<ellipse cx="${cx}" cy="${(cy - R * k).toFixed(1)}" rx="${(R * w).toFixed(1)}" ry="${(R * w * 2.6).toFixed(1)}" transform="rotate(${a} ${cx} ${cy})"/>`;
    }
  });
  for (let i = 0; i < 48; i++) {
    const a = (Math.PI * 2 * i) / 48;
    s += `<line x1="${(cx + Math.cos(a) * R * 0.94).toFixed(1)}" y1="${(cy + Math.sin(a) * R * 0.94).toFixed(1)}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}"/>`;
  }
  return s + "</g>";
};

const moon = (cx, cy, r, id = "m") => `
  <defs><radialGradient id="${id}g" cx="50%" cy="50%" r="50%">
    <stop offset="55%" stop-color="${C.cream}" stop-opacity="0.45"/><stop offset="100%" stop-color="${C.cream}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}f" cx="40%" cy="38%" r="70%"><stop offset="0%" stop-color="#fffaf0"/><stop offset="100%" stop-color="${C.cream}"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r * 2.1}" fill="url(#${id}g)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}f)"/>
  <g fill="#e8c98a" opacity="0.35"><circle cx="${cx - r * 0.3}" cy="${cy - r * 0.2}" r="${r * 0.14}"/><circle cx="${cx + r * 0.25}" cy="${cy + r * 0.25}" r="${r * 0.2}"/><circle cx="${cx + r * 0.1}" cy="${cy - r * 0.45}" r="${r * 0.09}"/></g>`;

const diya = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-26" r="46" fill="${C.saffron}" opacity="0.28"/>
    <path d="M-34 0 Q0 46 34 0 Q0 10 -34 0 Z" fill="#c2561c"/>
    <path d="M-34 0 Q0 10 34 0 Q0 -6 -34 0 Z" fill="#ff8a1f"/>
    <path d="M0 -6 Q-13 -26 0 -54 Q13 -26 0 -6 Z" fill="${C.gold}"/>
    <path d="M0 -8 Q-6 -22 0 -38 Q6 -22 0 -8 Z" fill="#fff4cf"/>
  </g>`;

const lotus = (cx, cy, s = 1, fill = C.rose, fill2 = "#f6a5be") => {
  let p = "";
  [-70, -42, -14, 14, 42, 70].forEach((a, i) => {
    p += `<ellipse cx="0" cy="-48" rx="16" ry="50" fill="${i % 2 ? fill2 : fill}" transform="rotate(${a})"/>`;
  });
  p += `<ellipse cx="0" cy="-52" rx="18" ry="56" fill="${fill}"/><ellipse cx="0" cy="-44" rx="10" ry="40" fill="${fill2}"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${p}</g>`;
};

const temple = (x, base, s, color = C.deep, op = 0.95) => {
  const tier = (w, h, y) => `<path d="M${-w / 2} ${y} L${-w / 2 + 6} ${y - h} L${w / 2 - 6} ${y - h} L${w / 2} ${y} Z"/>`;
  const dome = (cx, r) => `<path d="M${cx - r} 0 A${r} ${r} 0 0 1 ${cx + r} 0 Z"/><rect x="${cx - 2}" y="${-r - 22}" width="4" height="22"/><circle cx="${cx}" cy="${-r - 26}" r="5"/>`;
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${color}" opacity="${op}">
    <rect x="-330" y="-34" width="660" height="34"/>
    <rect x="-250" y="-120" width="500" height="86"/>
    ${tier(260, 40, -120)}${tier(220, 40, -160)}${tier(180, 44, -200)}${tier(140, 44, -244)}${tier(100, 44, -288)}${tier(60, 40, -332)}
    <rect x="-3" y="-392" width="6" height="60"/><circle cx="0" cy="-398" r="8"/>
    <g transform="translate(0 -120)">${dome(-190, 46)}${dome(190, 46)}</g>
    <g transform="translate(0 -34)">${dome(-290, 34)}${dome(290, 34)}</g>
    <path d="M-42 0 V-70 A42 42 0 0 1 42 -70 V0 Z" fill="${C.wine}" opacity="0.9"/>
  </g>`;
};

const garland = (x1, x2, y, n, sag) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), x = x1 + (x2 - x1) * t, yy = y + Math.sin(t * Math.PI) * sag;
    s += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="11" fill="${i % 3 === 0 ? C.saffron : C.gold}"/><circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="5" fill="#ffbf4a" opacity="0.8"/>`;
  }
  return s;
};

const skyGrad = (id, w, h, stops) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;

// ---------- scenes ----------
const scenes = {};

scenes["hero-banner.jpg"] = { w: 1920, h: 1080, svg: () => `
  ${skyGrad("sky", 1920, 1080, [[0, "#0c0516"], [0.45, "#2a0b4a"], [0.78, "#c2306a"], [1, "#ff8a1f"]])}
  ${stars(1920, 1080, 220, 11, 640)}
  ${mandala(1400, 430, 520, { op: 0.22 })}
  <ellipse cx="960" cy="1010" rx="1100" ry="120" fill="#ff9f1c" opacity="0.18"/>
  ${temple(1500, 1010, 1.25, "#14072a", 0.55)}
  ${temple(430, 1030, 0.8, "#0c0516", 0.6)}
  <rect y="990" width="1920" height="90" fill="#0c0516"/>
  ${[120, 330, 560, 790, 1020, 1250, 1480, 1710].map((x, i) => diya(x, 1010 + (i % 2) * 10, 0.9)).join("")}`};

scenes["hero-banner-mobile.jpg"] = { w: 900, h: 1200, svg: () => `
  ${skyGrad("sky", 900, 1200, [[0, "#0c0516"], [0.5, "#2a0b4a"], [0.82, "#c2306a"], [1, "#ff8a1f"]])}
  ${stars(900, 1200, 160, 21, 700)}
  ${mandala(450, 330, 380, { op: 0.22 })}
  ${temple(450, 1130, 1.1, "#14072a", 0.6)}
  <rect y="1110" width="900" height="90" fill="#0c0516"/>
  ${[90, 270, 450, 630, 810].map((x) => diya(x, 1135, 0.85)).join("")}`};

scenes["rashifal-banner.jpg"] = { w: 1600, h: 500, svg: () => {
  const glyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const cx = 1250, cy = 250, R = 210;
  let g = "";
  glyphs.forEach((s, i) => {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    g += `<text x="${(cx + Math.cos(a) * R).toFixed(1)}" y="${(cy + Math.sin(a) * R + 14).toFixed(1)}" text-anchor="middle" font-size="40" fill="${C.cream}" opacity="0.85" font-family="serif">${s}&#xFE0E;</text>`;
  });
  return `${skyGrad("sky", 1600, 500, [[0, "#14072a"], [1, "#4b1a73"]])}${stars(1600, 500, 110, 5)}
    ${mandala(cx, cy, 300, { op: 0.2 })}<circle cx="${cx}" cy="${cy}" r="250" fill="none" stroke="${C.gold}" stroke-opacity="0.45"/>
    <circle cx="${cx}" cy="${cy}" r="170" fill="none" stroke="${C.gold}" stroke-opacity="0.3"/>${g}${moon(cx, cy, 70, "rm")}`; } };

scenes["kundli-banner.jpg"] = { w: 1600, h: 500, svg: () => {
  const cx = 1230, cy = 250, s = 190;
  const planets = [[0, -1.0, C.gold], [0.95, 0.05, C.rose], [0.3, 0.75, C.cream], [-0.8, -0.3, C.saffron], [-0.4, 0.8, C.gold]];
  return `${skyGrad("sky", 1600, 500, [[0, "#1b0a33"], [1, "#7a2a8f"]])}${stars(1600, 500, 100, 8)}
    ${mandala(cx, cy, 300, { op: 0.15 })}
    <g fill="none" stroke="${C.gold}" stroke-opacity="0.8" stroke-width="2.5">
      <rect x="${cx - s}" y="${cy - s}" width="${s * 2}" height="${s * 2}"/>
      <path d="M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}"/>
      <path d="M${cx} ${cy - s}L${cx + s} ${cy}L${cx} ${cy + s}L${cx - s} ${cy}Z"/></g>
    <circle cx="${cx}" cy="${cy}" r="260" fill="none" stroke="${C.cream}" stroke-opacity="0.25" stroke-dasharray="4 10"/>
    ${planets.map(([x, y, c]) => `<circle cx="${cx + x * s * 0.7}" cy="${cy + y * s * 0.7}" r="14" fill="${c}"/><circle cx="${cx + x * s * 0.7}" cy="${cy + y * s * 0.7}" r="26" fill="${c}" opacity="0.18"/>`).join("")}`; } };

scenes["store-banner.jpg"] = { w: 1600, h: 600, svg: () => `
  ${skyGrad("sky", 1600, 600, [[0, "#14072a"], [1, "#b3265f"]])}${stars(1600, 600, 60, 3, 300)}
  ${mandala(1230, 330, 330, { op: 0.16 })}
  <ellipse cx="1230" cy="520" rx="330" ry="38" fill="#c2561c"/><ellipse cx="1230" cy="510" rx="330" ry="34" fill="#e8a53a"/><ellipse cx="1230" cy="506" rx="270" ry="26" fill="#f3c15c"/>
  ${lotus(1230, 500, 1.35)}
  ${diya(1010, 480, 1.3)}${diya(1450, 480, 1.3)}${diya(1115, 490, 1)}${diya(1345, 490, 1)}
  <g opacity="0.5" fill="${C.gold}">${Array.from({ length: 14 }, (_, i) => `<circle cx="${900 + i * 60}" cy="${560 + (i % 2) * 8}" r="9"/>`).join("")}</g>`};

scenes["cta-banner.jpg"] = { w: 1600, h: 600, svg: () => `
  ${skyGrad("sky", 1600, 600, [[0, "#1b0a33"], [0.45, "#c2306a"], [0.62, "#ffb347"], [0.621, "#3a1450"], [1, "#0c0516"]])}
  <circle cx="1180" cy="372" r="150" fill="${C.gold}" opacity="0.28"/><circle cx="1180" cy="372" r="95" fill="${C.cream}"/>
  ${temple(1400, 372, 0.55, "#14072a", 0.8)}
  <g stroke="${C.gold}" stroke-opacity="0.35" stroke-width="3" fill="none">${Array.from({ length: 9 }, (_, i) => `<path d="M${700 + i * 60} ${390 + i * 20} h${400 - i * 22}"/>`).join("")}</g>
  ${[860, 1010, 1180, 1330].map((x, i) => diya(x, 470 + (i % 2) * 50, 0.7)).join("")}
  ${lotus(1100, 560, 0.5)}${lotus(1300, 580, 0.42)}`};

scenes["og-image.jpg"] = { w: 1200, h: 630, svg: () => `
  ${skyGrad("sky", 1200, 630, [[0, "#0c0516"], [0.6, "#4b1a73"], [1, "#c2561c"]])}${stars(1200, 630, 120, 4, 400)}
  ${mandala(930, 300, 330, { op: 0.2 })}${moon(930, 300, 100, "om")}
  <text x="80" y="300" font-family="Yatra One" font-size="150" fill="${C.cream}">Shubhly</text>
  <text x="84" y="375" font-family="Yatra One" font-size="42" fill="${C.gold}">Your kundli, your puja, your vibe.</text>
  ${temple(600, 640, 0.6, "#0c0516", 0.7)}`};

const goldBg = (id) => `${skyGrad(id, 640, 640, [[0, "#8b5cf6"], [1, "#ff2e7e"]])}<circle cx="320" cy="320" r="270" fill="#ffffff" opacity="0.14"/>`;

scenes["step-1.png"] = { w: 640, h: 640, svg: () => `${goldBg("g")}
  <rect x="150" y="140" width="300" height="320" rx="26" fill="#fff8ee" stroke="${C.night}" stroke-width="8"/>
  <rect x="150" y="140" width="300" height="76" rx="26" fill="${C.wine}"/><rect x="150" y="190" width="300" height="26" fill="${C.wine}"/>
  <rect x="200" y="112" width="16" height="50" rx="8" fill="${C.night}"/><rect x="384" y="112" width="16" height="50" rx="8" fill="${C.night}"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${176 + (i % 4) * 66}" y="${244 + Math.floor(i / 4) * 62}" width="46" height="40" rx="9" fill="${i === 6 ? C.saffron : "#f3dcc0"}"/>`).join("")}
  <circle cx="440" cy="440" r="86" fill="${C.night}"/><circle cx="440" cy="440" r="70" fill="#fff8ee"/>
  <path d="M440 390V440L474 460" stroke="${C.wine}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M130 500 q34 -64 68 0 a34 34 0 1 1 -68 0Z" fill="${C.rose}"/><circle cx="164" cy="496" r="12" fill="#fff8ee"/>`};

scenes["step-2.png"] = { w: 640, h: 640, svg: () => `${goldBg("g")}
  <g fill="#fff8ee" stroke="${C.night}" stroke-width="8"><rect x="130" y="130" width="380" height="380"/></g>
  <g fill="none" stroke="${C.night}" stroke-width="6"><path d="M130 130L510 510M510 130L130 510"/><path d="M320 130L510 320L320 510L130 320Z"/></g>
  ${[[320, 220, C.saffron], [225, 175, C.rose], [415, 175, C.wine], [320, 420, C.saffron], [225, 320, C.wine], [415, 320, C.rose], [270, 470, C.night]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/><circle cx="${x}" cy="${y}" r="8" fill="#fff8ee" opacity="0.8"/>`).join("")}
  <circle cx="510" cy="130" r="54" fill="${C.night}"/>${moon(510, 130, 34, "s2")}`};

scenes["step-3.png"] = { w: 640, h: 640, svg: () => `${goldBg("g")}
  <rect x="190" y="90" width="260" height="470" rx="40" fill="${C.night}"/>
  <rect x="206" y="116" width="228" height="418" rx="26" fill="#fff8ee"/>
  <circle cx="320" cy="190" r="46" fill="${C.wine}"/>${moon(320, 190, 28, "s3")}
  ${[250, 285, 320, 355, 390].map((y, i) => `<rect x="${236}" y="${y + 20}" width="${i === 4 ? 100 : 168}" height="14" rx="7" fill="${i === 0 ? C.saffron : "#e8cfae"}"/>`).join("")}
  <rect x="236" y="470" width="168" height="40" rx="20" fill="${C.saffron}"/>
  ${lotus(500, 520, 0.6)}`};

const prodBg = (id) => `${skyGrad(id, 800, 800, [[0, "#4b1a73"], [1, "#0c0516"]])}${mandala(400, 400, 360, { op: 0.16 })}`;

scenes["product-ganesha.jpg"] = { w: 800, h: 800, svg: () => `${prodBg("p")}
  <circle cx="400" cy="400" r="230" fill="none" stroke="${C.gold}" stroke-width="5"/><circle cx="400" cy="400" r="214" fill="${C.deep}" opacity="0.6"/>
  <text x="400" y="480" text-anchor="middle" font-family="Yatra One" font-size="300" fill="${C.gold}">ॐ</text>
  ${lotus(400, 690, 0.7, C.rose, "#f6a5be")}`};

scenes["product-lakshmi.jpg"] = { w: 800, h: 800, svg: () => `${prodBg("p")}
  <circle cx="400" cy="380" r="210" fill="${C.gold}" opacity="0.25"/><circle cx="400" cy="380" r="170" fill="none" stroke="${C.gold}" stroke-width="6"/>
  ${lotus(400, 520, 2.2, C.rose, "#f6a5be")}
  <circle cx="400" cy="330" r="46" fill="${C.gold}"/><circle cx="400" cy="330" r="30" fill="#ffb347"/>
  ${[180, 620].map((x) => diya(x, 640, 1.1)).join("")}`};

scenes["product-puja-kit.jpg"] = { w: 800, h: 800, svg: () => {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    d += `<g transform="translate(${400 + Math.cos(a) * 220} ${420 + Math.sin(a) * 220})"><circle r="40" fill="#c2561c"/><circle r="30" fill="#ff8a1f"/><path d="M0 -4 Q-9 -22 0 -42 Q9 -22 0 -4Z" fill="${C.gold}"/></g>`;
  }
  return `${prodBg("p")}<circle cx="400" cy="420" r="320" fill="#e8a53a"/><circle cx="400" cy="420" r="300" fill="#f3c15c"/><circle cx="400" cy="420" r="280" fill="none" stroke="#b86e00" stroke-width="4"/>${d}
    ${lotus(400, 470, 0.9)}<circle cx="400" cy="420" r="16" fill="#b4531c"/>`; } };

scenes["product-rudraksha.jpg"] = { w: 800, h: 800, svg: () => {
  let b = "";
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const x = 400 + Math.cos(a) * 250, y = 380 + Math.sin(a) * 250;
    b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="#7a3b1c"/><circle cx="${(x - 6).toFixed(1)}" cy="${(y - 7).toFixed(1)}" r="12" fill="#a9582b" opacity="0.7"/>`;
  }
  return `${prodBg("p")}${b}
    <path d="M400 630 L400 690" stroke="#7a3b1c" stroke-width="10"/>
    <circle cx="400" cy="700" r="34" fill="#7a3b1c"/><circle cx="392" cy="692" r="14" fill="#a9582b" opacity="0.7"/>
    <path d="M370 630 h60 l-8 -30 h-44z" fill="${C.gold}"/>`; } };

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
