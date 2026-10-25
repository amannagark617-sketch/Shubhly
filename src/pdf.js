// Builds the downloadable PDF of a chart and, when there is one, its written report.
// Text is drawn with a font per script, so Hindi, Bengali, Tamil, Telugu and
// Gujarati print correctly next to English.

import { createRequire } from "node:module";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { STR } from "../public/i18n.js";
import { chartSvg, westernSvg, SHORT } from "../public/lib.js";
import { planetName, signName, nakName, DATE_LOCALE } from "../public/names.js";

const require = createRequire(import.meta.url);
const FONTSOURCE = require.resolve("@fontsource/noto-sans/package.json").replace(/noto-sans[\\/]package\.json$/, "");

const font = (pkg, subset, weight) => `${FONTSOURCE}${pkg}/files/${pkg}-${subset}-${weight}-normal.woff`;
const FONTS = {
  latin: [font("noto-sans", "latin", 400), font("noto-sans", "latin", 700)],
  deva: [font("noto-sans-devanagari", "devanagari", 400), font("noto-sans-devanagari", "devanagari", 700)],
  beng: [font("noto-sans-bengali", "bengali", 400), font("noto-sans-bengali", "bengali", 700)],
  // Noto's Gujarati font breaks on some marks in the PDF writer; Hind Vadodara does not.
  gujr: [font("hind-vadodara", "gujarati", 400), font("hind-vadodara", "gujarati", 700)],
  taml: [font("noto-sans-tamil", "tamil", 400), font("noto-sans-tamil", "tamil", 700)],
  // Noto's Telugu font breaks some conjuncts in the PDF writer; Hind Guntur does not.
  telu: [font("hind-guntur", "telugu", 400), font("hind-guntur", "telugu", 700)],
};

const NAVY = "#1b1b3a";
const RED = "#d8321a";
const GOLD = "#f6b81c";
const CREAM = "#fff6e2";
const MUTED = "#55537a";

// Which font a character needs. Spaces, digits and punctuation always use Latin,
// because the Indian-script fonts leave them out.
function scriptOf(ch, prev) {
  const c = ch.codePointAt(0);
  if (c >= 0x900 && c <= 0x97f) return "deva";
  if (c >= 0x980 && c <= 0x9ff) return "beng";
  if (c >= 0xa80 && c <= 0xaff) return "gujr";
  if (c >= 0xb80 && c <= 0xbff) return "taml";
  if (c >= 0xc00 && c <= 0xc7f) return "telu";
  if (c === 0x200c || c === 0x200d) return prev;
  return "latin";
}

export function runs(text, bold) {
  const out = [];
  let prev = "latin";
  for (const ch of String(text)) {
    const s = scriptOf(ch, prev);
    prev = s;
    const last = out[out.length - 1];
    if (last && last.script === s) last.text += ch;
    else out.push({ script: s, text: ch });
  }
  return out.map((r) => ({ ...r, font: `${r.script}${bold ? "-b" : ""}` }));
}

function newDoc() {
  const doc = new PDFDocument({ size: "A4", margin: 42, bufferPages: true, info: { Title: "Shubhly kundli", Author: "Shubhly" } });
  for (const [k, [reg, bold]] of Object.entries(FONTS)) {
    doc.registerFont(k, reg);
    doc.registerFont(`${k}-b`, bold);
  }
  return doc;
}

// ---- text layout --------------------------------------------------------------
// Lines are laid out by hand so that runs in different fonts share one baseline
// and long text wraps at word boundaries.

const SPACE_RE = /(\s+)/;

function layout(doc, text, size, bold, width) {
  const words = String(text).split(SPACE_RE).filter((w) => w !== "");
  const lines = [];
  let cur = { items: [], w: 0, indic: false };
  const push = () => { lines.push(cur); cur = { items: [], w: 0, indic: false }; };
  for (const word of words) {
    const isSpace = /^\s+$/.test(word);
    const rs = runs(word, bold).map((r) => {
      try {
        return { ...r, w: doc.font(r.font).fontSize(size).widthOfString(r.text) };
      } catch {
        return { ...r, bad: true, w: r.text.length * size * 0.5 }; // a glyph the font cannot lay out: leave a gap
      }
    });
    const ww = rs.reduce((n, r) => n + r.w, 0);
    if (isSpace) {
      if (cur.items.length) { cur.items.push(...rs); cur.w += ww; }
      continue;
    }
    if (width && cur.w + ww > width && cur.items.length) {
      while (cur.items.length && /^\s+$/.test(cur.items[cur.items.length - 1].text)) {
        cur.w -= cur.items.pop().w;
      }
      push();
    }
    cur.items.push(...rs);
    cur.w += ww;
    if (rs.some((r) => r.script !== "latin")) cur.indic = true;
  }
  if (cur.items.length) push();
  return lines;
}

const leading = (line, size) => size * (line.indic ? 1.8 : 1.5);

// Draws text and returns the height it used.
function rich(doc, text, x, y, { size = 10, bold = false, color = NAVY, width, align = "left" } = {}) {
  const lines = layout(doc, text, size, bold, width);
  doc.fillColor(color);
  const latinAsc = doc.font("latin")._font.ascender;
  let cy = y;
  for (const line of lines) {
    let cx = x;
    if (width && align === "right") cx = x + width - line.w;
    else if (width && align === "center") cx = x + (width - line.w) / 2;
    const lh = leading(line, size);
    for (const r of line.items) {
      if (r.bad) { cx += r.w; continue; }
      const off = ((latinAsc - doc.font(r.font)._font.ascender) * size) / 1000;
      doc.fontSize(size).text(r.text, cx, cy + (lh - size * 1.2) / 2 + off, { lineBreak: false });
      cx += r.w;
    }
    cy += lh;
  }
  return cy - y;
}

function widthOf(doc, text, size, bold = false) {
  return layout(doc, text, size, bold, 0).reduce((n, l) => Math.max(n, l.w), 0);
}

function heightOf(doc, text, size, width, bold = false) {
  return layout(doc, text, size, bold, width).reduce((n, l) => n + leading(l, size), 0);
}

const tr = (lang, key, vars) => {
  let s = STR[lang]?.[key] ?? STR.en[key] ?? STR.hn[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  return s;
};

function plainMarkdown(md) {
  const blocks = [];
  for (const raw of String(md || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const clean = (s) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(^|\s)\*(.+?)\*(?=\s|$|[.,!?])/g, "$1$2").replace(/`/g, "");
    let m;
    if ((m = /^#{1,3}\s+(.*)$/.exec(line))) blocks.push({ type: "h", text: clean(m[1]) });
    else if ((m = /^[-*•]\s+(.*)$/.exec(line))) blocks.push({ type: "li", text: clean(m[1]) });
    else blocks.push({ type: "p", text: clean(line) });
  }
  return blocks;
}

export function buildPdf({ name, chart, insights = {}, lang = "en", report = "", timeUnknown = false, placeLabel = "", dateLabel = "", timeLabel = "" }) {
  const doc = newDoc();
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const T = (k, v) => tr(lang, k, v);
  const western = chart.tradition === "western";
  const L = 42, W = doc.page.width - 84;
  const pn = (k) => planetName(lang, k);
  const sg = (en, hi) => signName(lang, en, hi);

  // ---- header band
  doc.rect(0, 0, doc.page.width, 62).fill(NAVY);
  rich(doc, "Shubhly", L, 18, { size: 22, bold: true, color: GOLD, });
  rich(doc, T(western ? "pdf_h_western" : "pdf_h_vedic"), L, 24, { size: 10, color: CREAM, width: W, align: "right", });

  // ---- name and birth details
  let y = 80;
  rich(doc, name || T("r_title_none"), L, y, { size: 24, bold: true, width: W, });
  y += 32;
  const meta = [dateLabel, timeUnknown ? T("r_time_unknown") : timeLabel, placeLabel].filter(Boolean).join("  |  ");
  rich(doc, meta, L, y, { size: 10, color: MUTED, width: W, });
  y += 24;

  // ---- chips
  const asc = chart.ascendant;
  const chips = [];
  if (western) {
    chips.push([T("r_sun"), sg(chart.sunSign.sign, chart.sunSign.signHi)]);
    chips.push([T("r_moon"), sg(chart.moonSign.sign, chart.moonSign.signHi)]);
    if (!timeUnknown) chips.push([T("r_rising"), `${sg(asc.sign, asc.signHi)} ${asc.degInSign.toFixed(1)}°`]);
  } else {
    if (!timeUnknown) chips.push([T("r_lagna"), `${sg(asc.sign, asc.signHi)} ${asc.degInSign.toFixed(1)}°`]);
    chips.push([T("r_rashi"), sg(chart.moonSign.sign, chart.moonSign.signHi)]);
    const moon = chart.planets.find((p) => p.key === "Moon");
    chips.push([T("r_nak"), `${nakName(lang, chart.nakshatra.name, moon?.nakshatraHi)}, ${T("r_pada", { n: chart.nakshatra.pada })}`]);
  }
  let cx = L;
  const chipH = 24;
  for (const [k, v] of chips) {
    const label = `${k}: `;
    const w = widthOf(doc, label, 9, true) + widthOf(doc, v, 9) + 18;
    if (cx + w > L + W) { cx = L; y += chipH + 6; }
    doc.roundedRect(cx, y, w, chipH, 6).fillAndStroke(CREAM, NAVY);
    rich(doc, label, cx + 9, y + 7, { size: 9, bold: true, });
    rich(doc, v, cx + 9 + widthOf(doc, label, 9, true), y + 7, { size: 9, });
    cx += w + 8;
  }
  y += chipH + 16;

  // ---- at a glance
  const items = [];
  if (western) {
    if (insights.sun) items.push([T("r_ins_sun"), insights.sun]);
    if (insights.rashi) items.push([T("r_ins_moon"), insights.rashi]);
    if (insights.lagna) items.push([T("r_ins_rising"), insights.lagna]);
  } else {
    if (insights.lagna) items.push([T("r_ins_lagna"), insights.lagna]);
    if (insights.rashi) items.push([T("r_ins_rashi"), insights.rashi]);
    if (insights.dasha) items.push([T("r_ins_dasha", { lord: pn(insights.dasha.lord) }), insights.dasha.text]);
  }
  for (const [h, txt] of items) {
    const hh = heightOf(doc, txt, 9.5, W - 14);
    doc.rect(L, y, 3, hh + 14).fill(GOLD);
    rich(doc, h, L + 12, y, { size: 9.5, bold: true, color: RED, width: W - 14, });
    rich(doc, txt, L + 12, y + 13, { size: 9.5, width: W - 14 });
    y += hh + 22;
  }
  y += 4;

  // ---- chart and planets
  const chartW = 236;
  if (y + chartW + 20 > doc.page.height - 70) { doc.addPage(); y = 50; }
  const svg = western ? westernSvg(chart, { glyphs: false }) : chartSvg(chart);
  SVGtoPDF(doc, svg, L, y, {
    width: chartW, height: chartW, assumePt: true,
    fontCallback: (_family, bold) => (bold ? "latin-b" : "latin"),
  });

  const tx = L + chartW + 18, tw = W - chartW - 18;
  const cols = western ? [0.34, 0.34, 0.14, 0.18] : [0.24, 0.26, 0.12, 0.1, 0.28];
  const heads = western
    ? [T("t_graha"), T("t_rashi"), T("t_deg"), T("t_house")]
    : [T("t_graha"), T("t_rashi"), T("t_deg"), T("t_house"), T("t_nak")];
  let ty = y;
  doc.rect(tx, ty, tw, 18).fill(NAVY);
  let colX = tx + 5;
  heads.forEach((h, i) => {
    rich(doc, h, colX, ty + 5, { size: 8, bold: true, color: GOLD, width: tw * cols[i] - 4, });
    colX += tw * cols[i];
  });
  ty += 18;
  const rowH = western ? 17 : 17;
  chart.planets.forEach((p, ri) => {
    if (ri % 2 === 0) doc.rect(tx, ty, tw, rowH).fill(CREAM);
    const cells = [
      pn(p.key) + (p.retrograde ? " (R)" : ""),
      sg(p.sign, p.signHi),
      `${p.degInSign.toFixed(1)}°`,
      String(p.house),
    ];
    if (!western) cells.push(`${nakName(lang, p.nakshatra, p.nakshatraHi)} ${p.pada}`);
    let x = tx + 5;
    cells.forEach((c, i) => {
      rich(doc, c, x, ty + 4.5, { size: 8, bold: i === 0, width: tw * cols[i] - 4, });
      x += tw * cols[i];
    });
    ty += rowH;
  });
  doc.rect(tx, y, tw, ty - y).lineWidth(1).stroke(NAVY);

  const legend = chart.planets.map((p) => `${SHORT[p.key]} ${pn(p.key)}`).join(", ");
  rich(doc, `${legend}. ${T(western ? "r_legend_w" : "r_legend")}`, tx, ty + 8, { size: 7.5, color: MUTED, width: tw });
  y = Math.max(y + chartW, ty + 8 + heightOf(doc, legend, 7.5, tw) + 10) + 14;

  // ---- dasha line (Vedic) or aspects (Western)
  if (western && chart.aspects?.length) {
    const need = 30 + Math.ceil(chart.aspects.length / 2) * 13;
    if (y + need > doc.page.height - 70) { doc.addPage(); y = 50; }
    rich(doc, T("asp_h"), L, y, { size: 11, bold: true, color: RED, });
    y += 18;
    const half = W / 2;
    chart.aspects.forEach((a, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      rich(doc, `${pn(a.a)}  ${T("asp_" + a.type)}  ${pn(a.b)}  (${a.orb}°)`, L + col * half, y + row * 13, { size: 8.5, width: half - 8, });
    });
    y += Math.ceil(chart.aspects.length / 2) * 13 + 10;
  } else if (!western && chart.dasha?.current && !timeUnknown) {
    const cur = chart.dasha.current;
    const mo = (iso) => new Date(iso).toLocaleDateString(DATE_LOCALE[lang] || "en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
    const line = T("r_dasha", { md: pn(cur.mahadasha.lord), a: mo(cur.mahadasha.start), b: mo(cur.mahadasha.end) }) +
      (cur.antardasha ? T("r_dasha_ad", { ad: pn(cur.antardasha.lord), c: mo(cur.antardasha.end) }) : "");
    const hh = heightOf(doc, line, 9.5, W - 20);
    if (y + hh + 20 > doc.page.height - 70) { doc.addPage(); y = 50; }
    doc.roundedRect(L, y, W, hh + 14, 6).fillAndStroke(CREAM, NAVY);
    rich(doc, line, L + 10, y + 7, { size: 9.5, width: W - 20 });
    y += hh + 26;
  }

  // ---- written report
  const blocks = plainMarkdown(report);
  if (blocks.length) {
    if (y > doc.page.height - 200) { doc.addPage(); y = 50; }
    else y += 6;
    rich(doc, T("pdf_report"), L, y, { size: 16, bold: true, width: W, });
    y += 30;
    for (const b of blocks) {
      const size = b.type === "h" ? 12 : 10;
      const indent = b.type === "li" ? 14 : 0;
      const hh = heightOf(doc, b.text, size, W - indent, b.type === "h");
      if (y + hh > doc.page.height - 64) { doc.addPage(); y = 50; }
      if (b.type === "h") {
        y += 6;
        rich(doc, b.text, L, y, { size, bold: true, color: RED, width: W });
      } else if (b.type === "li") {
        doc.circle(L + 4, y + 6, 2).fill(GOLD);
        rich(doc, b.text, L + indent, y, { size, width: W - indent });
      } else {
        rich(doc, b.text, L, y, { size, width: W });
      }
      y += hh + (b.type === "h" ? 8 : 7);
    }
  }

  // ---- footer on every page
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.moveTo(L, doc.page.height - 50).lineTo(L + W, doc.page.height - 50).lineWidth(0.6).stroke(GOLD);
    rich(doc, T("rep_fine"), L, doc.page.height - 44, { size: 7, color: MUTED, width: W - 60 });
    rich(doc, `Shubhly  ${i + 1}/${range.count}`, L, doc.page.height - 44, { size: 7, color: MUTED, width: W, align: "right" });
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return done;
}
