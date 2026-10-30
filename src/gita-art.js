// Original illustrations for the Gita section, drawn in code (no stock images).
// One scene per chapter, made from simple symbols: lotus, flute, peacock feather,
// chariot wheel, diya, conch. Light, calm and the same style throughout.

const C = { ink: "#1b1b3a", indigo: "#243a8c", blue: "#4a63c9", mist: "#dfe6fb", gold: "#f6b81c", gold2: "#ffd45e", teal: "#1f9d96", rose: "#e0679a", rose2: "#ffd3e4", leaf: "#2f9e6b", leaf2: "#8fd3a9" };
const r1 = (n) => Math.round(n * 10) / 10;

const DEFS = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eaff"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd45e" stop-opacity=".75"/><stop offset="1" stop-color="#ffd45e" stop-opacity="0"/></radialGradient>
<radialGradient id="pearl" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#c9d3f5"/></radialGradient>
<linearGradient id="petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd3e4"/><stop offset="1" stop-color="#e0679a"/></linearGradient>
<linearGradient id="goldv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd45e"/><stop offset="1" stop-color="#e0a000"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ff"/><stop offset="1" stop-color="#eaf1ff"/></linearGradient>
</defs>`;

// ---------- pieces ----------
const glow = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#glow)"/>`;
const sparkle = (x, y, r, o = 1) => `<path transform="translate(${x} ${y})" opacity="${o}" d="M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r}Z" fill="${C.gold}"/>`;
const sparkles = (list) => list.map(([x, y, r, o]) => sparkle(x, y, r, o ?? 0.9)).join("");

function sun(x, y, r, rays = 16, o = 1) {
  let s = glow(x, y, r * 2.6);
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    s += `<line x1="${r1(x + Math.cos(a) * r * 1.3)}" y1="${r1(y + Math.sin(a) * r * 1.3)}" x2="${r1(x + Math.cos(a) * r * (i % 2 ? 1.6 : 1.9))}" y2="${r1(y + Math.sin(a) * r * (i % 2 ? 1.6 : 1.9))}" stroke="${C.gold}" stroke-width="4" stroke-linecap="round" opacity="${o}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#goldv)" opacity="${o}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
}

function lotus(x, y, s = 1, fill = "url(#petal)") {
  const petal = (rot, sc = 1, o = 1) => `<path transform="rotate(${rot}) scale(${sc})" opacity="${o}" d="M0 0 C-26 -14 -32 -54 0 -82 C32 -54 26 -14 0 0Z" fill="${fill}" stroke="${C.indigo}" stroke-opacity=".35" stroke-width="1.4"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${petal(-76, 0.8)}${petal(76, 0.8)}${petal(-52, 0.92)}${petal(52, 0.92)}${petal(-28)}${petal(28)}${petal(0, 1.05)}<ellipse cx="0" cy="-4" rx="22" ry="7" fill="${C.gold}" opacity=".9"/><circle cx="-8" cy="-6" r="3" fill="#fff" opacity=".8"/><circle cx="8" cy="-6" r="3" fill="#fff" opacity=".8"/></g>`;
}

function wheel(x, y, r, spokes = 12, color = C.indigo) {
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".5" stroke="${color}" stroke-width="${r * 0.09}"/><circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="none" stroke="${C.gold}" stroke-width="${r * 0.045}"/>`;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    s += `<line x1="${r1(x + Math.cos(a) * r * 0.2)}" y1="${r1(y + Math.sin(a) * r * 0.2)}" x2="${r1(x + Math.cos(a) * r * 0.82)}" y2="${r1(y + Math.sin(a) * r * 0.82)}" stroke="${color}" stroke-width="${r * 0.05}" stroke-linecap="round"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.2}" fill="url(#goldv)" stroke="${color}" stroke-width="${r * 0.04}"/>`;
}

function feather(x, y, s = 1, rot = 0) {
  let barbs = "";
  for (let i = -5; i <= 5; i++) {
    const yy = i * 9;
    barbs += `<path d="M0 ${yy} q-18 ${-8} -${22 - Math.abs(i)} ${-18}" stroke="${C.leaf}" stroke-width="1.6" fill="none" opacity=".75"/><path d="M0 ${yy} q18 ${-8} ${22 - Math.abs(i)} ${-18}" stroke="${C.leaf}" stroke-width="1.6" fill="none" opacity=".75"/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 76 C5 30 5 -20 0 -58" stroke="${C.leaf}" stroke-width="3.5" fill="none" stroke-linecap="round"/>${barbs}<ellipse cx="0" cy="-48" rx="20" ry="28" fill="${C.teal}" opacity=".9"/><ellipse cx="0" cy="-48" rx="14" ry="21" fill="${C.indigo}"/><ellipse cx="0" cy="-48" rx="9" ry="14" fill="${C.teal}"/><ellipse cx="0" cy="-48" rx="5" ry="8" fill="${C.gold}"/><ellipse cx="0" cy="-48" rx="2.2" ry="4" fill="${C.indigo}"/></g>`;
}

function flute(x, y, len, rot) {
  const holes = [0.3, 0.4, 0.5, 0.6, 0.7].map((t) => `<circle cx="${r1(-len / 2 + len * t)}" cy="0" r="3" fill="${C.indigo}"/>`).join("");
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-len / 2}" y="-8" width="${len}" height="16" rx="8" fill="url(#goldv)" stroke="${C.indigo}" stroke-width="2.5"/><rect x="${-len / 2 + 14}" y="-8" width="6" height="16" fill="${C.indigo}" opacity=".7"/><rect x="${len / 2 - 20}" y="-8" width="6" height="16" fill="${C.indigo}" opacity=".7"/>${holes}</g>`;
}

function diya(x, y, s = 1, flame = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${glow(0, -40, 90 * flame)}<path d="M-46 0 C-42 38 42 38 46 0Z" fill="url(#goldv)" stroke="${C.indigo}" stroke-width="3"/><path d="M-46 0 Q0 -14 46 0" fill="#ffe9a8" stroke="${C.indigo}" stroke-width="3"/><path d="M0 -6 C-18 -28 -6 -48 0 -${r1(70 * flame)} C6 -48 18 -28 0 -6Z" fill="${C.gold}" stroke="#e08a00" stroke-width="2"/><path d="M0 -10 C-8 -24 -2 -36 0 -${r1(48 * flame)} C2 -36 8 -24 0 -10Z" fill="#fff6c9"/></g>`;
}

function mountains(y, color = "#c9d3f5", color2 = "#b3c0ee", w = 800) {
  return `<path d="M0 ${y} L110 ${y - 90} L190 ${y - 40} L300 ${y - 130} L420 ${y - 30} L540 ${y - 100} L650 ${y - 40} L740 ${y - 80} L${w} ${y - 30} L${w} ${y} Z" fill="${color}"/><path d="M0 ${y} L80 ${y - 40} L180 ${y - 10} L280 ${y - 60} L400 ${y} L520 ${y - 50} L640 ${y - 5} L760 ${y - 45} L${w} ${y} Z" fill="${color2}"/>`;
}
function waves(y0, rows = 4, color = C.blue) {
  let s = "";
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * 16;
    let d = `M-20 ${y}`;
    for (let x = -20; x < 840; x += 60) d += ` q15 -9 30 0 t30 0`;
    s += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${0.5 - r * 0.08}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return s;
}
const bird = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-18 4 Q-9 -10 0 2 Q9 -10 18 4" fill="none" stroke="${C.indigo}" stroke-width="3" stroke-linecap="round"/>`;
const ground = (y) => `<rect x="0" y="${y}" width="800" height="${340 - y}" fill="#eef2ff"/><line x1="0" y1="${y}" x2="800" y2="${y}" stroke="${C.indigo}" stroke-opacity=".25" stroke-width="2"/>`;

function pennant(x, y, h, color, dir = 1) {
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - h}" stroke="${C.ink}" stroke-width="3"/><path d="M${x} ${y - h} l${42 * dir} 12 l${-42 * dir} 12Z" fill="${color}"/>`;
}

// ---------- the 18 scenes ----------
const SCENES = {
  1: () => `${sun(400, 232, 56, 0, 0.55)}${ground(250)}
    ${[70, 110, 150].map((x, i) => pennant(x, 250, 80 + i * 14, C.indigo)).join("")}${[650, 690, 730].map((x, i) => pennant(x, 250, 96 - i * 12, "#8a6a1f", -1)).join("")}
    ${wheel(400, 214, 70)}
    <path d="M470 270 C520 210 560 210 600 270" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity=".7"/><line x1="470" y1="270" x2="600" y2="270" stroke="${C.ink}" stroke-width="2" opacity=".5"/>
    <path d="M60 60 q20 -14 40 0 M120 40 q16 -12 32 0" stroke="${C.indigo}" fill="none" stroke-width="3" opacity=".4"/>`,
  2: () => `${sun(400, 140, 54, 20)}<rect x="0" y="236" width="800" height="104" fill="url(#water)"/>${waves(250, 5)}${lotus(400, 276, 1.7)}${sparkles([[160, 90, 12], [660, 70, 14], [250, 190, 9], [570, 180, 10], [90, 200, 8], [720, 190, 9]])}`,
  3: () => `${glow(400, 170, 230)}${wheel(400, 172, 108, 16)}
    ${[0, 120, 240].map((a) => `<g transform="rotate(${a} 400 172)"><path d="M400 40 A132 132 0 0 1 512 104" fill="none" stroke="${C.gold}" stroke-width="7" stroke-linecap="round"/><path d="M516 90 l6 22 l-24 -6Z" fill="${C.gold}"/></g>`).join("")}
    ${lotus(130, 300, 0.9)}${lotus(670, 300, 0.9)}${sparkles([[210, 80, 11], [600, 70, 12], [700, 160, 8], [100, 140, 8]])}`,
  4: () => `${glow(400, 120, 190)}${diya(400, 170, 1.7)}
    <path d="M250 292 L400 262 L400 322 L250 322Z" fill="#fff" stroke="${C.indigo}" stroke-width="3"/><path d="M550 292 L400 262 L400 322 L550 322Z" fill="#fff" stroke="${C.indigo}" stroke-width="3"/>
    ${[276, 290, 304].map((y) => `<line x1="268" y1="${y}" x2="388" y2="${y - 20 + 8}" stroke="${C.blue}" stroke-opacity=".5" stroke-width="2"/>`).join("")}${[276, 290, 304].map((y) => `<line x1="532" y1="${y}" x2="412" y2="${y - 20 + 8}" stroke="${C.blue}" stroke-opacity=".5" stroke-width="2"/>`).join("")}
    ${sparkles([[180, 100, 12], [640, 90, 13], [120, 220, 8], [700, 210, 9], [300, 60, 8], [520, 50, 9]])}`,
  5: () => `<rect x="0" y="230" width="800" height="110" fill="url(#water)"/>${waves(246, 5)}
    <g transform="rotate(-8 400 200)"><ellipse cx="400" cy="200" rx="230" ry="82" fill="${C.leaf2}" stroke="${C.leaf}" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="400" y1="200" x2="${r1(400 + Math.cos(a) * 205)}" y2="${r1(200 + Math.sin(a) * 70)}" stroke="${C.leaf}" stroke-width="2" opacity=".6"/>`; }).join("")}</g>
    <g><ellipse cx="400" cy="196" rx="34" ry="30" fill="#f1f6ff" stroke="${C.blue}" stroke-width="3"/><ellipse cx="390" cy="186" rx="10" ry="8" fill="#fff"/></g>
    <circle cx="520" cy="212" r="12" fill="#f1f6ff" stroke="${C.blue}" stroke-width="2.5"/><circle cx="300" cy="196" r="9" fill="#f1f6ff" stroke="${C.blue}" stroke-width="2.5"/>
    ${lotus(690, 280, 0.8)}${sparkles([[130, 70, 12], [650, 60, 12], [400, 70, 9]])}`,
  6: () => `${mountains(220)}<rect x="0" y="220" width="800" height="120" fill="url(#water)"/>
    <path d="M520 70 a46 46 0 1 0 38 74 a36 36 0 1 1 -38 -74Z" fill="url(#goldv)"/>${glow(540, 100, 110)}
    <path d="M540 236 a46 46 0 0 0 0 0" /><g opacity=".35"><path d="M520 236 a46 46 0 1 0 38 74 a36 36 0 1 1 -38 -74Z" fill="${C.gold}"/></g>
    ${[0, 1, 2, 3].map((i) => `<ellipse cx="260" cy="300" rx="${30 + i * 26}" ry="${7 + i * 5}" fill="none" stroke="${C.blue}" stroke-opacity="${0.5 - i * 0.1}" stroke-width="2.4"/>`).join("")}${lotus(260, 296, 0.8)}
    ${sparkles([[110, 70, 9], [300, 56, 11], [660, 150, 8], [740, 70, 9], [200, 130, 7]])}`,
  7: () => `${glow(400, 170, 240)}${Array.from({ length: 17 }, (_, i) => { const t = i / 16; const x = 90 + t * 620; const y = 120 + Math.sin(t * Math.PI) * 120; const r = 14 + Math.sin(t * Math.PI) * 10; return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="url(#pearl)" stroke="${C.indigo}" stroke-opacity=".35" stroke-width="1.6"/>`; }).join("")}
    <path d="M90 120 Q400 360 710 120" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".7"/>
    ${sun(400, 256, 22, 12)}${sparkles([[160, 70, 12], [640, 70, 12], [400, 40, 9], [90, 260, 8], [720, 260, 8]])}`,
  8: () => `${glow(400, 170, 230)}${[150, 118, 86].map((r, i) => `<circle cx="400" cy="170" r="${r}" fill="none" stroke="${i === 1 ? C.gold : C.indigo}" stroke-opacity="${i === 1 ? 0.9 : 0.35}" stroke-width="${i === 1 ? 5 : 2.5}" ${i === 0 ? 'stroke-dasharray="4 10"' : ""}/>`).join("")}
    <text x="400" y="222" text-anchor="middle" font-size="150" font-family="'Noto Serif Devanagari','Hind','Nirmala UI',Mangal,serif" font-weight="700" fill="${C.indigo}">ॐ</text>
    ${Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return `<circle cx="${r1(400 + Math.cos(a) * 150)}" cy="${r1(170 + Math.sin(a) * 150)}" r="4" fill="${C.gold}"/>`; }).join("")}
    ${lotus(130, 300, 0.8)}${lotus(670, 300, 0.8)}`,
  9: () => `${glow(400, 100, 200)}${[-60, -30, 0, 30, 60].map((a) => `<line x1="400" y1="20" x2="${r1(400 + Math.sin((a * Math.PI) / 180) * 260)}" y2="${r1(20 + Math.cos((a * Math.PI) / 180) * 260)}" stroke="${C.gold}" stroke-opacity=".28" stroke-width="10"/>`).join("")}
    <ellipse cx="400" cy="262" rx="250" ry="52" fill="#fff" stroke="${C.indigo}" stroke-width="4"/><ellipse cx="400" cy="256" rx="214" ry="40" fill="#eef2ff" stroke="${C.gold}" stroke-width="3"/>
    ${lotus(300, 258, 0.62)}
    <path d="M400 258 C430 200 480 200 510 240 C480 270 430 270 400 258Z" fill="${C.leaf2}" stroke="${C.leaf}" stroke-width="3"/><path d="M405 256 C440 238 480 236 505 242" stroke="${C.leaf}" stroke-width="2" fill="none"/>
    <circle cx="560" cy="236" r="26" fill="url(#goldv)" stroke="${C.indigo}" stroke-width="3"/><path d="M560 210 q8 -16 22 -14" stroke="${C.leaf}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="578" cy="198" rx="12" ry="6" fill="${C.leaf}"/>
    <path d="M628 252 C628 226 652 226 652 252Z" fill="#fff" stroke="${C.blue}" stroke-width="3"/><path d="M640 232 c-6 8 -6 12 0 12 s6 -4 0 -12Z" fill="${C.blue}"/>
    ${sparkles([[170, 120, 13], [640, 110, 12], [110, 220, 8], [720, 200, 9]])}`,
  10: () => `${sun(190, 120, 44, 16)}<circle cx="610" cy="116" r="40" fill="#fff" stroke="${C.indigo}" stroke-width="3"/><circle cx="624" cy="104" r="34" fill="#e3eaff"/>${glow(610, 116, 90)}
    ${mountains(250)}<path d="M-10 300 C150 250 250 330 400 292 S660 256 820 300 L820 340 L-10 340Z" fill="url(#water)" stroke="${C.blue}" stroke-opacity=".35" stroke-width="2"/>
    <g transform="translate(400 150)"><path d="M0 100 L0 20" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/>${[[-26, 0, 30], [26, -4, 32], [0, -26, 36], [-14, -14, 24], [16, -16, 24]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.leaf}" opacity=".92"/>`).join("")}</g>
    ${bird(280, 70, 1.1)}${bird(330, 96, 0.8)}${bird(500, 60, 1)}${sparkles([[90, 250, 8], [730, 240, 9], [450, 40, 9], [60, 60, 9], [740, 62, 9]])}`,
  11: () => `${glow(400, 170, 260)}${[0, 1, 2].map((ring) => Array.from({ length: 12 + ring * 4 }, (_, i) => { const n = 12 + ring * 4; const a = (i / n) * 360 + ring * 9; return `<path transform="translate(400 170) rotate(${r1(a)}) translate(0 ${-(40 + ring * 34)}) scale(${1 - ring * 0.18})" d="M0 0 C-12 -10 -14 -36 0 -56 C14 -36 12 -10 0 0Z" fill="${ring === 1 ? C.rose2 : ring === 0 ? "#ffe9a8" : "#dfe6fb"}" stroke="${ring === 1 ? C.rose : C.indigo}" stroke-opacity=".5" stroke-width="1.5"/>`; }).join("")).join("")}
    ${sun(400, 170, 30, 24)}${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + 0.4; return `<circle cx="${r1(400 + Math.cos(a) * 190)}" cy="${r1(170 + Math.sin(a) * 140)}" r="14" fill="url(#goldv)" opacity=".9"/>`; }).join("")}`,
  12: () => `${glow(400, 160, 220)}${flute(400, 170, 330, -18)}${feather(560, 110, 1.15, 28)}${feather(250, 110, 0.9, -24)}${lotus(130, 296, 0.85)}${lotus(670, 296, 0.85)}
    <path d="M400 266 c-26 -22 -42 -40 -22 -58 c12 -10 22 -2 22 8 c0 -10 10 -18 22 -8 c20 18 4 36 -22 58Z" fill="${C.rose}" opacity=".85"/>${sparkles([[180, 60, 12], [640, 70, 13], [120, 190, 8], [720, 200, 9], [400, 50, 9]])}`,
  13: () => `${sun(400, 100, 36, 18)}<path d="M0 160 L800 160 L800 340 L0 340Z" fill="#eaf7ef"/>${Array.from({ length: 9 }, (_, i) => { const t = i / 8; const y = 170 + t * t * 168; const xs = 400 - (60 + t * 420); const xe = 400 + (60 + t * 420); return `<line x1="${r1(xs)}" y1="${r1(y)}" x2="${r1(xe)}" y2="${r1(y)}" stroke="${C.leaf}" stroke-opacity="${0.35 + t * 0.4}" stroke-width="${2 + t * 5}"/>`; }).join("")}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="400" y1="160" x2="${r1(40 + i * 120)}" y2="340" stroke="${C.leaf}" stroke-opacity=".25" stroke-width="2"/>`).join("")}
    <g transform="translate(400 250)"><line x1="0" y1="60" x2="0" y2="-34" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>${glow(0, -52, 70)}<rect x="-18" y="-72" width="36" height="42" rx="6" fill="#fff6c9" stroke="${C.indigo}" stroke-width="3.5"/><path d="M0 -42 c-8 -8 -2 -16 0 -22 c2 6 8 14 0 22Z" fill="${C.gold}"/></g>
    ${sparkles([[150, 90, 10], [660, 80, 11], [250, 60, 8]])}`,
  14: () => `${glow(400, 170, 240)}<circle cx="338" cy="140" r="96" fill="#fff6c9" stroke="${C.gold}" stroke-width="4" opacity=".92"/><circle cx="462" cy="140" r="96" fill="${C.rose2}" stroke="${C.rose}" stroke-width="4" opacity=".7"/><circle cx="400" cy="226" r="96" fill="${C.indigo}" stroke="${C.indigo}" stroke-width="4" opacity=".55"/>
    ${sun(400, 172, 22, 12)}
    ${sparkles([[110, 80, 11], [690, 90, 12], [120, 250, 8], [690, 250, 8]])}`,
  15: () => `<g transform="translate(400 20)">${Array.from({ length: 13 }, (_, i) => { const t = (i - 6) / 6; return `<path d="M0 0 C${r1(t * 60)} 28 ${r1(t * 150)} 40 ${r1(t * 260)} 66" stroke="#8a5a2b" stroke-opacity=".6" stroke-width="2" fill="none"/>`; }).join("")}
    <path d="M0 0 L0 120" stroke="#8a5a2b" stroke-width="14" stroke-linecap="round"/>${[-1, 1].map((d) => `<path d="M0 100 C${40 * d} 120 ${90 * d} 140 ${150 * d} 190" stroke="#8a5a2b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M0 110 C${22 * d} 150 ${46 * d} 190 ${60 * d} 240" stroke="#8a5a2b" stroke-width="6" fill="none" stroke-linecap="round"/>`).join("")}
    ${[[-150, 196], [-120, 210], [-90, 170], [-60, 244], [-30, 230], [0, 150], [30, 236], [60, 246], [90, 170], [120, 212], [150, 198]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="${C.leaf}" opacity=".9"/><circle cx="${x - 7}" cy="${y - 6}" r="9" fill="${C.leaf2}" opacity=".7"/>`).join("")}</g>
    ${glow(400, 50, 90)}${sparkles([[110, 90, 11], [690, 100, 12], [130, 250, 8], [680, 260, 9]])}`,
  16: () => `<path d="M0 0 H400 V340 H0Z" fill="#e8e9f4"/><path d="M400 0 H800 V340 H400Z" fill="#f3f7ff"/>
    <g opacity=".85"><circle cx="130" cy="70" r="40" fill="#b9bdd6"/><circle cx="180" cy="86" r="34" fill="#b9bdd6"/><circle cx="90" cy="92" r="30" fill="#b9bdd6"/></g>
    ${[110, 150, 190].map((x) => `<path d="M${x} 190 l-10 -40 l16 24 l6 -34 l8 34 l16 -24 l-10 40Z" fill="#6a6a82" opacity=".55"/>`).join("")}
    ${sun(620, 90, 38, 16)}${lotus(640, 262, 0.9)}${lotus(560, 276, 0.6)}
    <path d="M330 340 L400 200 L470 340Z" fill="#cdd3ec" opacity="0"/><path d="M365 340 C380 280 392 240 400 200 C408 240 420 280 435 340Z" fill="#fff" stroke="${C.indigo}" stroke-opacity=".3" stroke-width="2"/>
    <path d="M400 210 C360 250 290 290 170 340 L260 340 C320 300 380 270 400 240Z" fill="#9aa0c2" opacity=".7"/><path d="M400 210 C440 250 520 290 700 340 L600 340 C500 300 420 270 400 240Z" fill="#fff6c9" stroke="${C.gold}" stroke-width="2.5"/>
    <line x1="400" y1="0" x2="400" y2="340" stroke="${C.indigo}" stroke-opacity=".15" stroke-width="2"/>`,
  17: () => `${glow(400, 150, 250)}${diya(210, 262, 0.95, 0.65)}${diya(400, 262, 1.45, 1)}${diya(590, 262, 1.15, 0.85)}${sparkles([[120, 90, 10], [280, 70, 9], [530, 60, 11], [690, 100, 11], [400, 30, 9]])}`,
  18: () => `${sun(400, 250, 76, 24, 0.95)}<path d="M0 252 H800 V340 H0Z" fill="#eef2ff"/><line x1="0" y1="252" x2="800" y2="252" stroke="${C.indigo}" stroke-opacity=".25" stroke-width="2"/>
    <g transform="translate(400 190) rotate(-10)"><path d="M-62 28 C-86 -26 -22 -76 36 -52 C82 -34 70 20 30 34 C4 44 -38 42 -62 28Z" fill="#fff8e6" stroke="${C.indigo}" stroke-width="4"/><path d="M-30 18 C-30 -14 10 -30 36 -14 C50 -4 40 18 20 22 C6 26 -14 24 -30 18Z" fill="none" stroke="${C.gold}" stroke-width="4"/><path d="M-20 10 C-14 -4 6 -10 20 -2" fill="none" stroke="${C.gold}" stroke-width="3"/><path d="M-62 28 L-84 52 L-60 46Z" fill="${C.gold}" stroke="${C.indigo}" stroke-width="3"/></g>
    ${bird(150, 90, 1.5)}${bird(210, 130, 1)}${bird(640, 80, 1.4)}${bird(690, 126, 1)}${bird(580, 54, 0.9)}${bird(100, 160, 0.8)}
    ${lotus(130, 316, 0.7)}${lotus(670, 316, 0.7)}${sparkles([[300, 60, 11], [510, 44, 12], [740, 170, 8]])}`,
};

export function chapterArt(n) {
  const scene = SCENES[n];
  if (!scene) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" width="800" height="340">${DEFS}<rect width="800" height="340" fill="url(#sky)"/>${scene()}</svg>`;
}

// The cover picture for the Gita home page.
export function gitaCover() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" width="800" height="340">${DEFS}<rect width="800" height="340" fill="url(#sky)"/>
${glow(400, 150, 260)}${wheel(170, 190, 100, 16)}${wheel(630, 190, 100, 16)}${sun(400, 128, 52, 22)}${flute(400, 196, 320, -14)}${feather(400, 96, 1.1, 0)}${lotus(400, 318, 1.3)}
${sparkles([[300, 60, 12], [500, 56, 12], [60, 80, 9], [740, 80, 9], [90, 300, 8], [710, 300, 8]])}</svg>`;
}
