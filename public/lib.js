// Pure helpers shared by the page and the tests (no DOM access here).

export const SHORT = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

export const HI = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
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
