// Pure helpers shared by the page and the tests (no DOM access here).

export const SHORT = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
  Uranus: "Ur", Neptune: "Ne", Pluto: "Pl", NorthNode: "NN",
};

export const HI = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
  Uranus: "यूरेनस", Neptune: "नेप्च्यून", Pluto: "प्लूटो", NorthNode: "उत्तर नोड",
};

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---- time and date ---------------------------------------------------------

// "06:28" -> "6:28 AM"
export function fmt12(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// { time: "11:57", nextDay: false } -> "11:57 AM tak"
export function fmtEnds(e) {
  if (!e) return "";
  return `${fmt12(e.time)} tak${e.nextDay ? " (agle din)" : ""}`;
}

export function fmtRange(r) {
  return r ? `${fmt12(r.from)} se ${fmt12(r.to)}` : "";
}

// Today's date (YYYY-MM-DD) in a given timezone.
export function todayIn(tz, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
}

// Current clock time (HH:MM) in a given timezone.
export function nowIn(tz, now = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

let dateLocale = "en-IN";
export function setDateLocale(l) { dateLocale = l; }

export function dateLabel(iso, opts = { weekday: "short", day: "numeric", month: "short" }) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(dateLocale, { ...opts, timeZone: "UTC" });
}

export function monthYear(iso) {
  return dateLabel(iso, { month: "short", year: "numeric" });
}

// Is clock time `t` (HH:MM) inside a slot { from, to }? Handles slots that
// run past midnight.
export function inSlot(t, slot) {
  const m = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const x = m(t), a = m(slot.from), b = m(slot.to);
  return a <= b ? x >= a && x < b : x >= a || x < b;
}

// ---- small visuals -----------------------------------------------------------

// Five dots, `n` of them filled.
export function dots(n) {
  return Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
}

// The Moon as seen today. `elong` is the Moon's angle ahead of the Sun
// (0 new, 90 half, 180 full, 270 waning half).
export function moonSvg(elong, label = "Chandrama aaj") {
  const R = 80;
  const c = 100;
  const e = ((elong % 360) + 360) % 360;
  const waxing = e <= 180;
  const k = Math.cos(((waxing ? e : 360 - e) * Math.PI) / 180); // 1 new .. -1 full
  const rx = (Math.abs(k) * R).toFixed(2);
  const sweep = k > 0 ? 0 : 1;
  const lit = `M ${c} ${c - R} A ${R} ${R} 0 0 1 ${c} ${c + R} A ${rx} ${R} 0 0 ${sweep} ${c} ${c - R} Z`;
  const flip = waxing ? "" : ' transform="translate(200 0) scale(-1 1)"';
  return `<svg class="moon" viewBox="0 0 200 200" role="img" aria-label="${esc(label)}">
  <circle cx="100" cy="100" r="${R}" fill="#1b1b3a"/>
  <path d="${lit}" fill="#f6b81c"${flip}/>
  <circle cx="100" cy="100" r="${R}" fill="none" stroke="#1b1b3a" stroke-width="5"/>
</svg>`;
}

// ---- kundli chart --------------------------------------------------------------

// Centre point of each house in the North Indian chart (house 1 at the top,
// then counter-clockwise).
const HOUSE_CENTERS = [
  [200, 112], [105, 44], [40, 105], [105, 200], [40, 295], [105, 356],
  [200, 288], [295, 356], [360, 295], [295, 200], [360, 105], [295, 44],
];

export function chartSvg(chart) {
  let parts = "";
  parts += '<rect x="10" y="10" width="380" height="380" fill="#fffaf0" stroke="#1b1b3a" stroke-width="2.5"/>';
  parts += '<g stroke="#1b1b3a" stroke-width="1.6" fill="none">';
  parts += '<path d="M10 10L390 390M390 10L10 390"/>';
  parts += '<path d="M200 10L390 200L200 390L10 200Z"/>';
  parts += "</g>";

  chart.houses.forEach((h, i) => {
    const [cx, cy] = HOUSE_CENTERS[i];
    const signNo = h.signIndex + 1;
    const pls = h.planets.map((k) => SHORT[k]);
    const lines = [];
    for (let j = 0; j < pls.length; j += 2) lines.push(pls.slice(j, j + 2).join(" "));
    const total = 1 + lines.length;
    const startY = cy - ((total - 1) * 15) / 2;
    parts += `<text x="${cx}" y="${startY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#d8321a" font-weight="700">${signNo}</text>`;
    lines.forEach((ln, k) => {
      parts += `<text x="${cx}" y="${startY + 15 * (k + 1)}" text-anchor="middle" dominant-baseline="middle" font-size="13.5" fill="#1b1b3a" font-weight="700">${esc(ln)}</text>`;
    });
  });
  parts += '<text x="200" y="62" text-anchor="middle" font-size="10" fill="#4a4870">Lagna</text>';

  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kundli chart, North Indian style">${parts}</svg>`;
}

// ---- western chart wheel ---------------------------------------------------------

const SIGN_ABBR = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

// The classic wheel: Rising sign on the left, signs counter-clockwise, house
// cusps as spokes, planets on the ring, aspect lines in the middle.
export function westernSvg(chart, { glyphs = true } = {}) {
  const cx = 200, cy = 200, R1 = 192, R2 = 158, R3 = 74, RP = 128;
  const asc = chart.ascendant.lon;
  const ang = (lon) => ((((lon - asc) % 360) + 360) % 360) * Math.PI / 180;
  const pt = (lon, r) => { const a = ang(lon); return [cx - r * Math.cos(a), cy + r * Math.sin(a)]; };
  const f = (n) => n.toFixed(1);
  const line = (l1, r1, l2, r2, extra = "") => {
    const [x1, y1] = pt(l1, r1), [x2, y2] = pt(l2, r2);
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${extra}/>`;
  };
  let o = `<circle cx="${cx}" cy="${cy}" r="${R1}" fill="#fffaf0" stroke="#1b1b3a" stroke-width="2.5"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${R2}" fill="none" stroke="#1b1b3a" stroke-width="1.6"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${R3}" fill="#fff" stroke="#1b1b3a" stroke-width="1.6"/>`;

  o += '<g stroke="#1b1b3a" stroke-width="1.2">';
  for (let k = 0; k < 12; k++) o += line(k * 30, R2, k * 30, R1);
  o += "</g>";
  for (let k = 0; k < 12; k++) {
    const [x, y] = pt(k * 30 + 15, (R1 + R2) / 2);
    o += glyphs
      ? `<text x="${f(x)}" y="${f(y + 6)}" text-anchor="middle" font-size="17" fill="#1b1b3a">${ZODIAC[k]}&#xFE0E;</text>`
      : `<text x="${f(x)}" y="${f(y + 4)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1b1b3a">${SIGN_ABBR[k]}</text>`;
  }

  chart.houses.forEach((h, i) => {
    const major = i === 0 || i === 9 || i === 6 || i === 3;
    o += line(h.lon, R3, h.lon, R2, `stroke="${major ? "#d8321a" : "#1b1b3a"}" stroke-width="${major ? 2.2 : 1}"`);
    const next = chart.houses[(i + 1) % 12].lon;
    const span = ((next - h.lon) % 360 + 360) % 360;
    const [x, y] = pt(h.lon + span / 2, R3 + 15);
    o += `<text x="${f(x)}" y="${f(y + 4)}" text-anchor="middle" font-size="11" fill="#d8321a" font-weight="700">${i + 1}</text>`;
  });

  const byKey = Object.fromEntries(chart.planets.map((p) => [p.key, p]));
  for (const a of chart.aspects || []) {
    if (a.type === "conjunction") continue;
    const A = byKey[a.a], B = byKey[a.b];
    if (!A || !B) continue;
    const colour = a.type === "trine" || a.type === "sextile" ? "#e0a100" : "#d8321a";
    o += line(A.lon, R3 - 1, B.lon, R3 - 1, `stroke="${colour}" stroke-width="1.4"${a.type === "sextile" ? ' stroke-dasharray="4 3"' : ""}`);
  }

  // Spread labels that would overlap, keeping a small tick at the true position.
  const sorted = [...chart.planets].sort((a, b) => a.lon - b.lon);
  let prev = -999;
  const shown = sorted.map((p) => {
    let d = ((p.lon - asc) % 360 + 360) % 360;
    if (d < prev + 11) d = prev + 11;
    prev = d;
    return { p, lon: asc + d };
  });
  for (const { p, lon } of shown) {
    o += line(p.lon, R2, p.lon, R2 - 7, 'stroke="#1b1b3a" stroke-width="1.6"');
    const [x, y] = pt(lon, RP);
    o += `<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="#f6b81c" stroke="#1b1b3a" stroke-width="1.8"/>`;
    o += `<text x="${f(x)}" y="${f(y + 3.6)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1b1b3a">${SHORT[p.key]}</text>`;
  }
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Birth chart wheel, Western style">${o}</svg>`;
}

// ---- report text -----------------------------------------------------------------

// Safe, minimal markdown: escapes everything first, then adds headings,
// bullet lists, bold and paragraphs.
export function renderMarkdown(md) {
  const lines = esc(md).split(/\r?\n/);
  const out = [];
  let list = false;
  const inline = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\s)\*(.+?)\*(?=\s|$|[.,!?])/g, "$1<em>$2</em>");
  const closeList = () => {
    if (list) { out.push("</ul>"); list = false; }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    let m;
    if ((m = /^#{1,3}\s+(.*)$/.exec(line))) {
      closeList();
      out.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = /^[-*•]\s+(.*)$/.exec(line))) {
      if (!list) { out.push("<ul>"); list = true; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

// ---- report graphics (the same drawings are used on the page and in the PDF) ----

export const ELEMENT_COLOR = ["#d8321a", "#5f8a3a", "#4a9bd0", "#2f4fb0"]; // fire, earth, air, water
const ELEMENT_KEYS = ["fire", "earth", "air", "water"];
const BALANCE_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const PLANET_COLOR = {
  Sun: "#f08a1c", Moon: "#8da2c9", Mars: "#d8321a", Mercury: "#4f9d6b", Jupiter: "#f6b81c",
  Venus: "#d96aa7", Saturn: "#5b5b7a", Rahu: "#6d4c9f", Ketu: "#a07a4f",
};

// How many of the seven main planets (and the ascendant, when the time is known)
// sit in a fire, earth, air or water sign.
export function elementBalance(chart, { timeUnknown = false } = {}) {
  const counts = [0, 0, 0, 0];
  for (const p of chart.planets) if (BALANCE_PLANETS.includes(p.key)) counts[p.signIndex % 4]++;
  if (!timeUnknown && chart.ascendant) counts[chart.ascendant.signIndex % 4]++;
  return counts;
}

const xmlEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Four bars. `names` are the element names in the reader's language.
export function elementsSvg(counts, names) {
  const max = Math.max(1, ...counts);
  const W = 360, rowH = 34;
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${rowH * 4 + 6}" role="img" aria-label="${xmlEsc(names.join(", "))}">`;
  counts.forEach((n, i) => {
    const y = i * rowH + 4, w = Math.round((n / max) * 190);
    o += `<rect x="96" y="${y}" width="${w || 3}" height="22" rx="6" fill="${ELEMENT_COLOR[i]}" stroke="#1b1b3a" stroke-width="1.6"/>`;
    o += `<text x="88" y="${y + 16}" text-anchor="end" font-size="13" font-weight="700" fill="#1b1b3a">${xmlEsc(names[i])}</text>`;
    o += `<text x="${96 + (w || 3) + 8}" y="${y + 16}" font-size="13" font-weight="700" fill="#1b1b3a">${n}</text>`;
  });
  return o + "</svg>";
}

// The nine dasha periods as one bar from birth, with a marker for today.
export function timelineSvg(chart, nowMs = Date.now()) {
  const list = chart.dasha?.mahadashas || [];
  if (!list.length) return "";
  const t0 = new Date(list[0].start).getTime(), t1 = new Date(list[list.length - 1].end).getTime();
  const W = 360, x0 = 6, span = W - 12;
  const px = (ms) => x0 + ((ms - t0) / (t1 - t0)) * span;
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 92" role="img" aria-label="Dasha timeline">`;
  for (const m of list) {
    const a = px(new Date(m.start).getTime()), b = px(new Date(m.end).getTime());
    o += `<rect x="${a.toFixed(1)}" y="30" width="${(b - a).toFixed(1)}" height="30" fill="${PLANET_COLOR[m.lord] || "#999"}" stroke="#1b1b3a" stroke-width="1.4"/>`;
    if (b - a > 22) o += `<text x="${((a + b) / 2).toFixed(1)}" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" stroke="#1b1b3a" stroke-width="0.4" paint-order="stroke">${SHORT[m.lord] || ""}</text>`;
  }
  const first = new Date(list[0].start).getUTCFullYear();
  for (let y = Math.ceil(first / 20) * 20; y < new Date(t1).getUTCFullYear(); y += 20) {
    const x = px(Date.UTC(y, 0, 1));
    if (x > 20 && x < W - 20) o += `<text x="${x.toFixed(1)}" y="78" text-anchor="middle" font-size="10" fill="#55537a">${y}</text><path d="M${x.toFixed(1)} 62v5" stroke="#55537a" stroke-width="1"/>`;
  }
  if (nowMs >= t0 && nowMs <= t1) {
    const x = px(nowMs);
    o += `<path d="M${x.toFixed(1)} 16V64" stroke="#d8321a" stroke-width="3"/><circle cx="${x.toFixed(1)}" cy="14" r="5" fill="#d8321a" stroke="#1b1b3a" stroke-width="1.4"/>`;
  }
  return o + "</svg>";
}
