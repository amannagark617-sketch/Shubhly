// Builds the downloadable PDF of a chart and, when there is one, its written report.
// Text is drawn with a font per script, so Hindi, Bengali, Tamil, Telugu and
// Gujarati print correctly next to English.

import { createRequire } from "node:module";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { STR } from "../public/i18n.js";
import { chartSvg, westernSvg, SHORT, elementBalance, timelineSvg, ELEMENT_COLOR, PLANET_COLOR } from "../public/lib.js";
import { buildAbout } from "./about.js";
import { luckyKit } from "./report-facts.js";
import { planetName, signName, nakName, DATE_LOCALE, SIGN_EN } from "../public/names.js";

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

const NAVY = "#5c1426"; // deep wine, used for dark panels and table heads
const INK = "#26212a";
const MAROON = "#8a2237";
const GOLD = "#a8832f";
const GOLDL = "#e3c981";
const MUTED = "#6c6571";

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
  const doc = new PDFDocument({ size: "A4", margin: 42, bufferPages: true, info: { Title: "Kundli Kaka kundli", Author: "Kundli Kaka" } });
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
function rich(doc, text, x, y, { size = 10, bold = false, color = INK, width, align = "left" } = {}) {
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
  const PW = doc.page.width, PH = doc.page.height;
  const L = 46, W = PW - 92, TOP = 60;
  const pn = (k) => planetName(lang, k);
  const sg = (en, hi) => signName(lang, en, hi);
  const skin = (svg) => svg.replace(/#1b1b3a/gi, "#4a2a33").replace(/#55537a/gi, "#6c6571").replace(/#fff6e2|#fffaf0/gi, "#ffffff");
  const SVGOPT = { assumePt: true, fontCallback: (_f, bold) => (bold ? "latin-b" : "latin") };
  const TAGC = { good: "#2b7a4b", steady: "#b27d12", careful: "#a8321e" };
  const asc = chart.ascendant;
  const mo = (iso) => new Date(iso).toLocaleDateString(DATE_LOCALE[lang] || "en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
  // Keep a paragraph short: cut at the end of a sentence.
  const shorten = (txt, max) => {
    const s = String(txt || "").replace(/\s+/g, " ").trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("। "), cut.lastIndexOf("? "));
    return end > max * 0.45 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
  };

  // ---- the summary facts shown on the cover
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

  // ================= COVER =================
  const grad = doc.linearGradient(0, 0, PW, PH); grad.stop(0, "#6e1a30").stop(1, "#2a0a14");
  doc.rect(0, 0, PW, PH).fill(grad);
  doc.rect(26, 26, PW - 52, PH - 52).lineWidth(0.8).stroke(GOLD);
  doc.rect(32, 32, PW - 64, PH - 64).lineWidth(0.3).stroke(GOLD);
  rich(doc, "KUNDLI KAKA", L, 78, { size: 13, bold: true, color: GOLDL, width: W, align: "center" });
  doc.moveTo(PW / 2 - 24, 102).lineTo(PW / 2 + 24, 102).lineWidth(1).stroke(GOLD);
  rich(doc, T(western ? "pdf_h_western" : "pdf_h_vedic"), L, 114, { size: 11, color: "#ead9dc", width: W, align: "center" });
  const nm = name || T("r_title_none");
  const nmSize = widthOf(doc, nm, 36, true) > W - 40 ? 26 : 36;
  const nmH = heightOf(doc, nm, nmSize, W - 40, true);
  rich(doc, nm, L + 20, 150, { size: nmSize, bold: true, color: "#ffffff", width: W - 40, align: "center" });
  const meta = [dateLabel, timeUnknown ? T("r_time_unknown") : timeLabel, placeLabel].filter(Boolean).join("   |   ");
  rich(doc, meta, L, 158 + nmH, { size: 10, color: "#ead9dc", width: W, align: "center" });
  {
    const S = 290, cx0 = (PW - S) / 2, cy0 = 238 + Math.max(0, nmH - 44);
    doc.rect(cx0, cy0, S, S).fill("#ffffff");
    doc.rect(cx0 + 5, cy0 + 5, S - 10, S - 10).lineWidth(0.5).stroke(GOLD);
    SVGtoPDF(doc, skin(western ? westernSvg(chart, { glyphs: false }) : chartSvg(chart)), cx0 + 16, cy0 + 16, { width: S - 32, height: S - 32, ...SVGOPT });
    // three key facts under the chart
    const ty0 = cy0 + S + 34, cw = W / chips.length;
    chips.forEach(([k, v], i) => {
      const x = L + i * cw;
      if (i) doc.moveTo(x, ty0 - 2).lineTo(x, ty0 + 42).lineWidth(0.5).stroke(GOLD);
      rich(doc, k, x + 6, ty0, { size: 8.5, bold: true, color: GOLDL, width: cw - 12, align: "center" });
      rich(doc, v, x + 6, ty0 + 16, { size: 12, bold: true, color: "#ffffff", width: cw - 12, align: "center" });
    });
  }
  rich(doc, "kundlikaka.in", L, PH - 78, { size: 9.5, bold: true, color: GOLDL, width: W, align: "center" });

  // ================= INNER PAGES =================
  doc.addPage(); // page 2 is the contents page, drawn at the end once the page numbers are known
  doc.addPage();
  let y = TOP;
  const toc = [];
  const bottomEdge = () => PH - 62;
  const ensure = (h) => { if (y + h > bottomEdge()) { doc.addPage(); y = TOP; } };
  const section = (title, color = GOLD, need = 130) => {
    ensure(need);
    toc.push({ title, page: doc.bufferedPageRange().count, color });
    y += 6;
    doc.rect(L, y + 2, 5, 17).fill(color);
    rich(doc, title, L + 14, y, { size: 15, bold: true, width: W - 14 });
    y += 28;
    doc.moveTo(L, y - 5).lineTo(L + W, y - 5).lineWidth(0.5).stroke("#e3dde0");
  };
  const half = (W - 14) / 2;
  // A short box: a coloured top edge, a heading, and a little text. Measured first so two can sit side by side.
  const tile = (x, w, head, txt, { accent = GOLD, fill = "#ffffff", hSize = 9.5, tSize = 9 } = {}) => {
    const inner = w - 20;
    const hh = heightOf(doc, head, hSize, inner, true), th = heightOf(doc, txt, tSize, inner);
    const h = 12 + hh + 4 + th + 10;
    return { h, draw(y0) {
      doc.rect(x, y0, w, h).fillAndStroke(fill, "#e3dde0");
      doc.rect(x, y0, w, 3).fill(accent);
      rich(doc, head, x + 10, y0 + 10, { size: hSize, bold: true, color: accent === GOLD ? MAROON : accent, width: inner });
      rich(doc, txt, x + 10, y0 + 14 + hh, { size: tSize, color: "#3a343f", width: inner });
    } };
  };
  const card = (x, w, title, items, accent = GOLD, fill = "#ffffff") => {
    const inner = w - 36;
    let h = 14 + heightOf(doc, title, 10.5, w - 20, true) + 8;
    for (const it of items) h += heightOf(doc, it, 9.5, inner) + 5;
    h += 6;
    return { h, draw(y0) {
      doc.rect(x, y0, w, h).fillAndStroke(fill, "#e3dde0");
      doc.rect(x, y0, w, 3).fill(accent);
      let cy = y0 + 13;
      rich(doc, title, x + 10, cy, { size: 10.5, bold: true, color: accent, width: w - 20 });
      cy += heightOf(doc, title, 10.5, w - 20, true) + 8;
      for (const it of items) {
        doc.rect(x + 12, cy + 4, 4.5, 4.5).fill(accent);
        rich(doc, it, x + 24, cy, { size: 9.5, color: "#3a343f", width: inner });
        cy += heightOf(doc, it, 9.5, inner) + 5;
      }
    } };
  };
  const row = (a, b) => {
    const h = Math.max(a?.h || 0, b?.h || 0);
    ensure(h + 8);
    a?.draw(y);
    if (b) b.draw(y);
    y += h + 12;
  };
  const callout = (head, txt, dark = true) => {
    const hh = head ? heightOf(doc, head, 9.5, W - 36, true) + 4 : 0, th = heightOf(doc, txt, 10, W - 36);
    const h = hh + th + 24;
    ensure(h + 8);
    doc.rect(L, y, W, h).fill(dark ? NAVY : "#f7f4f5");
    doc.rect(L, y, 4, h).fill(GOLD);
    if (head) rich(doc, head, L + 18, y + 11, { size: 9.5, bold: true, color: dark ? GOLDL : MAROON, width: W - 36 });
    rich(doc, txt, L + 18, y + 11 + hh, { size: 10, color: dark ? "#ffffff" : "#3a343f", width: W - 36 });
    y += h + 14;
  };

  // ---- at a glance: three short tiles
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
  if (items.length) {
    const n = items.length, tw = (W - 12 * (n - 1)) / n;
    const tiles = items.map(([h, t], i) => tile(L + i * (tw + 12), tw, h, shorten(t, 150), { accent: [MAROON, GOLD, NAVY][i % 3], tSize: 8.8 }));
    const h = Math.max(...tiles.map((t) => t.h));
    ensure(h + 10);
    tiles.forEach((t) => { t.h = h; t.draw(y); });
    y += h + 20;
  }

  // ---- planets: one clean table
  {
    section(T("t_graha"), NAVY);
    const cols = western ? [0.3, 0.3, 0.2, 0.2] : [0.22, 0.2, 0.12, 0.1, 0.36];
    const heads = western ? [T("t_graha"), T("t_rashi"), T("t_deg"), T("t_house")] : [T("t_graha"), T("t_rashi"), T("t_deg"), T("t_house"), T("t_nak")];
    const rowH = 19;
    ensure(rowH * (chart.planets.length + 1) + 30);
    doc.rect(L, y, W, rowH).fill(NAVY);
    let colX = L + 8;
    heads.forEach((h, i) => { rich(doc, h, colX, y + 5.5, { size: 8, bold: true, color: GOLDL, width: W * cols[i] - 6 }); colX += W * cols[i]; });
    y += rowH;
    const y0 = y - rowH;
    chart.planets.forEach((p, ri) => {
      if (ri % 2 === 0) doc.rect(L, y, W, rowH).fill("#f7f4f5");
      doc.rect(L + 8, y + 6.5, 6, 6).fill(PLANET_COLOR[p.key] || NAVY);
      const cells = [pn(p.key) + (p.retrograde ? " (R)" : ""), sg(p.sign, p.signHi), `${p.degInSign.toFixed(1)}°`, String(p.house)];
      if (!western) cells.push(`${nakName(lang, p.nakshatra, p.nakshatraHi)} ${p.pada}`);
      let x = L + 8;
      cells.forEach((c, i) => { rich(doc, c, x + (i === 0 ? 12 : 0), y + 5, { size: 8.5, bold: i === 0, width: W * cols[i] - (i === 0 ? 18 : 6) }); x += W * cols[i]; });
      y += rowH;
    });
    doc.rect(L, y0, W, y - y0).lineWidth(0.6).stroke("#e3dde0");
    y += 8;
    const legend = chart.planets.map((p) => `${SHORT[p.key]} ${pn(p.key)}`).join(", ");
    const lg = `${legend}. ${T(western ? "r_legend_w" : "r_legend")}`;
    const lh = heightOf(doc, lg, 7.5, W);
    rich(doc, lg, L, y, { size: 7.5, color: MUTED, width: W });
    y += lh + 14;
  }

  // ---- the current period (Vedic) or aspects (Western)
  if (western && chart.aspects?.length) {
    section(T("asp_h"), NAVY);
    const hf = W / 2;
    ensure(Math.ceil(chart.aspects.length / 2) * 14 + 10);
    chart.aspects.forEach((a, i) => {
      rich(doc, `${pn(a.a)}  ${T("asp_" + a.type)}  ${pn(a.b)}  (${a.orb}°)`, L + (i % 2) * hf, y + Math.floor(i / 2) * 14, { size: 8.8, width: hf - 8 });
    });
    y += Math.ceil(chart.aspects.length / 2) * 14 + 12;
  } else if (!western && chart.dasha?.current && !timeUnknown) {
    const cur = chart.dasha.current;
    const line = T("r_dasha", { md: pn(cur.mahadasha.lord), a: mo(cur.mahadasha.start), b: mo(cur.mahadasha.end) }) +
      (cur.antardasha ? T("r_dasha_ad", { ad: pn(cur.antardasha.lord), c: mo(cur.antardasha.end) }) : "");
    callout("", line, false);
  }

  const rep = report && typeof report === "object" && !report.markdown ? report : null;
  const ELNAMES = {
    en: ["Fire", "Earth", "Air", "Water"], hn: ["Agni", "Prithvi", "Vayu", "Jal"], hi: ["अग्नि", "पृथ्वी", "वायु", "जल"],
    mr: ["अग्नि", "पृथ्वी", "वायू", "जल"], bn: ["অগ্নি", "মাটি", "বায়ু", "জল"], ta: ["நெருப்பு", "நிலம்", "காற்று", "நீர்"],
    te: ["అగ్ని", "భూమి", "వాయువు", "నీరు"], gu: ["અગ્નિ", "પૃથ્વી", "વાયુ", "જળ"],
  };
  const elNames = rep?.labels?.fire ? ["fire", "earth", "air", "water"].map((k) => rep.labels[k] || "") : ELNAMES[lang] || ELNAMES.en;
  const lab = (k, def) => rep?.labels?.[k] || def;

  // ---- graphics: element balance and the life periods (drawn on the contents page at the end)
  const drawGraphics = (y0) => {
    const counts = elementBalance(chart, { timeUnknown });
    const showTimeline = !western && !timeUnknown && chart.dasha?.mahadashas?.length;
    let gy = y0;
    rich(doc, lab("elements", T("pdf_elements")), L, gy, { size: 11, bold: true, color: MAROON, width: half });
    if (showTimeline) rich(doc, lab("timeline", T("pdf_timeline")), L + half + 14, gy, { size: 11, bold: true, color: MAROON, width: half });
    gy += 24;
    const max = Math.max(1, ...counts);
    counts.forEach((n, i) => {
      const ry = gy + i * 25;
      rich(doc, elNames[i] || "", L, ry + 4, { size: 9, bold: true, width: 60 });
      const bw = Math.max(4, (n / max) * (half - 100));
      doc.rect(L + 62, ry, half - 100, 16).fill("#eee9ec");
      doc.rect(L + 62, ry, bw, 16).fill(ELEMENT_COLOR[i]);
      rich(doc, String(n), L + 62 + half - 94, ry + 4, { size: 9, bold: true });
    });
    if (showTimeline) SVGtoPDF(doc, skin(timelineSvg(chart)), L + half + 14, gy - 6, { width: half, height: half * 92 / 360, ...SVGOPT });
    return gy + Math.max(4 * 25, showTimeline ? half * 92 / 360 : 0) + 16;
  };

  // ---- about you (Vedic): short cards, two per row
  const about = western ? null : buildAbout(chart, { lang: lang === "hi" || lang === "hn" ? lang : "en", timeUnknown });
  if (about) {
    section(T("ab_h"), MAROON);
    const list = [];
    if (about.big3) {
      const b = about.big3;
      for (const k of ["sun", "moon", "rising"]) {
        if (!b[k]) continue;
        list.push([b.labels[k].split("{text}")[0].replace("{sign}", sg(SIGN_EN[b[k].signIndex], "")).trim(), b[k].text]);
      }
    }
    if (about.sub) list.push([T("ab_sub"), about.sub.text]);
    if (about.focus) list.push([T("ab_focus"), about.focus.text]);
    if (about.money) list.push([T("ab_money"), about.money.text]);
    if (about.love) list.push([T("ab_love"), about.love.text]);
    if (about.career) list.push([T("ab_career"), about.career.text]);
    const accents = [MAROON, GOLD, NAVY, "#2b7a4b", "#2e5e73", "#8a4b7a"];
    for (let i = 0; i < list.length; i += 2) {
      row(tile(L, half, list[i][0], shorten(list[i][1], 230), { accent: accents[i % 6] }), list[i + 1] ? tile(L + half + 14, half, list[i + 1][0], shorten(list[i + 1][1], 230), { accent: accents[(i + 1) % 6] }) : null);
    }
    const good = about.strong.map((x) => x.text);
    const care = [...about.tested.map((x) => x.text), ...(about.mars ? [about.mars.text] : [])];
    if (good.length || care.length) {
      row(good.length ? card(L, half, T("rd_shine"), good.map((x) => shorten(x, 150)), "#2b7a4b") : null, care.length ? card(L + half + 14, half, T("rd_grow"), care.map((x) => shorten(x, 150)), "#b27d12") : null);
    }
  }

  // ---- the written report
  const SEC_COLOR = { now: MAROON, periods: NAVY, months: "#2b7a4b", career: "#2e5e73", money: "#2b7a4b", love: "#9a3b5a", windows: NAVY, doshas: MAROON, remedies: "#b27d12", kit: GOLD };
  if (rep) {
    section(T("pdf_report"), MAROON);
    if (rep.headline) { const hh = heightOf(doc, rep.headline, 16, W, true); ensure(hh + 10); rich(doc, rep.headline, L, y, { size: 16, bold: true, width: W }); y += hh + 8; }
    if (rep.glance) { const hh = heightOf(doc, rep.glance, 10, W); ensure(hh + 10); rich(doc, rep.glance, L, y, { size: 10, color: MUTED, width: W }); y += hh + 14; }
    row(rep.strengths.length ? card(L, half, lab("strengths", T("rd_shine")), rep.strengths, "#2b7a4b") : null, rep.watch.length ? card(L + half + 14, half, lab("watch", T("rd_grow")), rep.watch, "#b27d12") : null);
    if (rep.focus.length) row(card(L, W, rep.focusTitle || T("rep_focus"), rep.focus, NAVY));
    if (rep.now) callout(lab("now", T("ab_sub")), rep.now);
    if (rep.tips.length) row(card(L, W, lab("tips", T("rd_ahead")), rep.tips, MAROON));

    for (const sec of rep.sections || []) {
      if (sec.id === "snap" || sec.id === "planets") continue; // already shown above
      section(sec.title, SEC_COLOR[sec.id] || GOLD, sec.id === "months" ? 300 : 140);
      let listNo = 0;
      for (const b of sec.blocks) {
        if (b.type === "p") {
          if (sec.id === "now") { callout("", b.text, false); continue; }
          const hh = heightOf(doc, b.text, 10, W); ensure(hh + 8);
          rich(doc, b.text, L, y, { size: 10, width: W, color: "#3a343f" }); y += hh + 10;
        } else if (b.type === "list") {
          const [head, ...rest] = b.items;
          const dos = listNo++ === 0, c = dos ? "#2b7a4b" : "#a8321e";
          if (/:$/.test(head)) { ensure(24); rich(doc, head.replace(/:$/, ""), L, y, { size: 10.5, bold: true, color: c, width: W }); y += 18; }
          for (const it of /:$/.test(head) ? rest : b.items) {
            const hh = heightOf(doc, it, 10, W - 26); ensure(hh + 8);
            doc.rect(L + 1, y + 2, 10, 10).lineWidth(1).stroke(c);
            if (dos) doc.moveTo(L + 3.5, y + 7.5).lineTo(L + 5.8, y + 10).lineTo(L + 9, y + 4).lineWidth(1.4).stroke(c);
            else doc.moveTo(L + 3.5, y + 4.5).lineTo(L + 8.5, y + 9.5).moveTo(L + 8.5, y + 4.5).lineTo(L + 3.5, y + 9.5).lineWidth(1.2).stroke(c);
            rich(doc, it, L + 20, y, { size: 10, width: W - 26, color: "#3a343f" }); y += hh + 7;
          }
          y += 6;
        } else if (b.type === "table" && sec.id === "kit") {
          const tiles = b.rows.map(([k, v]) => ({ k, v: String(v) }));
          const tw = (W - 8 * (tiles.length - 1)) / tiles.length;
          const kit = luckyKit(chart);
          const SW = { orange: "#d98a1b", gold: "#c9a227", white: "#ffffff", cream: "#efe6cf", red: "#b3261e", maroon: "#7a1f2b", green: "#2b7a4b", yellow: "#e6c11a", pink: "#eeb3c6", light: null, dark: null, blue: "#2e5e73", black: "#1f1b22" };
          const sw = String(kit.colour || "").toLowerCase().split(/\s+or\s+|\s+/).map((w) => SW[w]).filter(Boolean).slice(0, 2);
          const hs = tiles.map((t) => heightOf(doc, t.v, 10.5, tw - 14, true));
          const lhs = tiles.map((t) => heightOf(doc, t.k, 8, tw - 14, true)), lh = Math.max(...lhs);
          const h = Math.max(...hs) + 34 + lh;
          ensure(h + 10);
          tiles.forEach((t, i) => {
            const x = L + i * (tw + 8);
            doc.rect(x, y, tw, h).fillAndStroke("#ffffff", "#e3dde0");
            doc.rect(x, y, tw, 3).fill(GOLD);
            rich(doc, t.k, x + 7, y + 11, { size: 8, bold: true, color: MUTED, width: tw - 14 });
            const vy = y + 18 + lh;
            if (i === 1 && sw.length) {
              sw.forEach((c, j) => doc.rect(x + 7 + j * 24, vy, 20, 20).fillAndStroke(c, "#9a8f96"));
              rich(doc, t.v, x + 7, vy + 25, { size: 8.5, color: "#3a343f", width: tw - 14 });
            } else rich(doc, t.v, x + 7, vy, { size: 10.5, bold: true, width: tw - 14 });
          });
          y += h + 14 + (sw.length ? 16 : 0);
        } else if (b.type === "table") {
          const n = Math.max(b.head.length, ...b.rows.map((r) => r.length));
          const share = n === 2 ? 0.4 : n === 3 ? 0.34 : 0.28;
          const cw = [W * share, ...Array(n - 1).fill((W - W * share) / (n - 1))];
          const xs = cw.map((_, i) => L + cw.slice(0, i).reduce((a, c) => a + c, 0));
          if (b.head.length && b.head.some((h) => h.trim())) {
            ensure(24);
            doc.rect(L, y, W, 18).fill(NAVY);
            b.head.forEach((h, i) => rich(doc, h, xs[i] + 8, y + 5, { size: 8.5, bold: true, color: GOLDL, width: cw[i] - 10 }));
            y += 18;
          }
          b.rows.forEach((r, ri) => {
            const hh = Math.max(...r.map((c, i) => heightOf(doc, c, 9.5, cw[i] - 12, i === 0))) + 8;
            ensure(hh + 2);
            if (ri % 2 === 0) doc.rect(L, y, W, hh).fill("#f7f4f5");
            r.forEach((c, i) => rich(doc, c, xs[i] + 8, y + 4, { size: 9.5, bold: i === 0, width: cw[i] - 12 }));
            y += hh;
          });
          y += 12;
        } else if (b.type === "rows" && sec.id === "months") {
          // a bar for every month: tall and green is a good month, short and red needs care
          const rows = b.rows, bw = W / rows.length;
          const word = {};
          for (const r of rows) if (!word[r.tag]) word[r.tag] = String(r.text).split(/[.।]\s/)[0];
          // the year in three numbers
          {
            const tw3 = (W - 24) / 3;
            const tl = ["good", "steady", "careful"].map((tg) => ({ tg, ms: rows.filter((r) => r.tag === tg).map((r) => String(r.h).split(" ")[0].slice(0, 3)) }));
            const th3 = Math.max(...tl.map((o) => heightOf(doc, o.ms.join(", ") || "-", 8.5, tw3 - 20))) + 62;
            ensure(th3 + 170);
            tl.forEach((o, i) => {
              const x = L + i * (tw3 + 12);
              doc.rect(x, y, tw3, th3).fillAndStroke("#ffffff", "#e3dde0");
              doc.rect(x, y, tw3, 3).fill(TAGC[o.tg]);
              rich(doc, String(o.ms.length), x + 10, y + 10, { size: 24, bold: true, color: TAGC[o.tg] });
              rich(doc, word[o.tg] || "", x + 44, y + 22, { size: 9.5, bold: true, color: TAGC[o.tg], width: tw3 - 54 });
              rich(doc, o.ms.join(", ") || "-", x + 10, y + 48, { size: 8.5, color: MUTED, width: tw3 - 20 });
            });
            y += th3 + 16;
          }
          ensure(150);
          const base = y + 100;
          for (let g = 1; g <= 5; g++) doc.moveTo(L, base - g * 17).lineTo(L + W, base - g * 17).lineWidth(0.3).stroke("#e8e3e6");
          rows.forEach((r, i) => {
            const x = L + i * bw + 5, bh = (r.score || 1) * 17;
            doc.rect(x, base - bh, bw - 10, bh).fill(TAGC[r.tag] || NAVY);
            rich(doc, String(r.h).split(" ")[0].slice(0, 3), x - 4, base + 5, { size: 7.5, bold: true, width: bw - 2, align: "center", color: MUTED });
          });
          doc.moveTo(L, base).lineTo(L + W, base).lineWidth(0.8).stroke(NAVY);
          let lx = L;
          for (const tg of ["good", "steady", "careful"]) {
            if (!word[tg]) continue;
            doc.rect(lx, base + 22, 8, 8).fill(TAGC[tg]);
            rich(doc, word[tg], lx + 13, base + 21, { size: 8.5, color: MUTED });
            lx += widthOf(doc, word[tg], 8.5) + 34;
          }
          y = base + 44;
          const card12 = (x, w, r) => {
            const body = String(r.text).replace(/^[^.।]*[.।]\s*/, "");
            const inner = w - 22, th = heightOf(doc, body, 8.8, inner);
            const h = 12 + 14 + th + 10;
            return { h, draw(y0) {
              doc.rect(x, y0, w, h).fillAndStroke("#ffffff", "#e3dde0");
              doc.rect(x, y0, 4, h).fill(TAGC[r.tag] || NAVY);
              rich(doc, r.h, x + 14, y0 + 9, { size: 9.5, bold: true, color: TAGC[r.tag] || NAVY, width: inner - 60 });
              for (let s = 0; s < 5; s++) doc.rect(x + w - 12 - (5 - s) * 9, y0 + 12, 6, 6).fill(s < (r.score || 0) ? TAGC[r.tag] || NAVY : "#e6e1e4");
              rich(doc, body, x + 14, y0 + 26, { size: 8.8, color: "#3a343f", width: inner });
            } };
          };
          for (let i = 0; i < rows.length; i += 2) row(card12(L, half, rows[i]), rows[i + 1] ? card12(L + half + 14, half, rows[i + 1]) : null);
        } else if (b.type === "rows" && sec.id === "periods") {
          for (let i = 0; i < b.rows.length; i += 2) row(tile(L, half, b.rows[i].h, b.rows[i].text || "", { accent: i % 4 ? GOLD : NAVY, tSize: 8.8 }), b.rows[i + 1] ? tile(L + half + 14, half, b.rows[i + 1].h, b.rows[i + 1].text || "", { accent: GOLD, tSize: 8.8 }) : null);
        } else if (b.type === "rows" && sec.id === "doshas") {
          for (const r of b.rows) {
            const [dn, ds] = String(r.h).split(/:\s*/);
            const hh = heightOf(doc, r.text || " ", 9.5, W - 28), bh = 18;
            ensure(hh + bh + 26);
            doc.rect(L, y, W, hh + bh + 18).fillAndStroke("#ffffff", "#e3dde0");
            doc.rect(L, y, 4, hh + bh + 18).fill(MAROON);
            rich(doc, dn, L + 16, y + 9, { size: 10.5, bold: true, width: W - 140 });
            if (ds) { const bw2 = widthOf(doc, ds, 8.5, true) + 18; doc.rect(L + W - bw2 - 10, y + 8, bw2, 17).fill(NAVY); rich(doc, ds, L + W - bw2 - 1, y + 12.5, { size: 8.5, bold: true, color: "#ffffff" }); }
            rich(doc, r.text || "", L + 16, y + 32, { size: 9.5, color: "#3a343f", width: W - 28 });
            y += hh + bh + 28;
          }
        } else if (b.type === "rows") {
          // best periods for work, money and love: the dates stand out on the left, the advice sits next to them
          const col = SEC_COLOR[sec.id] || GOLD, lw = 118;
          for (const r of b.rows) {
            const hh = Math.max(heightOf(doc, r.text || " ", 9.5, W - lw - 24), heightOf(doc, r.h, 10, lw - 18, true)) + 18;
            ensure(hh + 6);
            doc.rect(L, y, W, hh).fillAndStroke("#ffffff", "#e3dde0");
            doc.rect(L, y, lw, hh).fill(col);
            rich(doc, r.h, L + 9, y + 9, { size: 10, bold: true, color: "#ffffff", width: lw - 18 });
            rich(doc, r.text || "", L + lw + 12, y + 9, { size: 9.5, color: "#3a343f", width: W - lw - 24 });
            y += hh + 7;
          }
          y += 4;
        }
      }
    }
    if (rep.closing) {
      const hh = heightOf(doc, rep.closing, 11, W - 60, true);
      ensure(hh + 40);
      y += 6;
      doc.moveTo(PW / 2 - 20, y).lineTo(PW / 2 + 20, y).lineWidth(1).stroke(GOLD);
      rich(doc, rep.closing, L + 30, y + 14, { size: 11, bold: true, color: MAROON, width: W - 60, align: "center" });
      y += hh + 28;
    }
  } else {
    const blocks = plainMarkdown(typeof report === "string" ? report : report?.markdown);
    if (blocks.length) {
      section(T("pdf_report"), MAROON);
      for (const b of blocks) {
        const size = b.type === "h" ? 12 : 10;
        const indent = b.type === "li" ? 14 : 0;
        const hh = heightOf(doc, b.text, size, W - indent, b.type === "h");
        ensure(hh + 8);
        if (b.type === "h") { y += 6; rich(doc, b.text, L, y, { size, bold: true, color: MAROON, width: W }); }
        else if (b.type === "li") { doc.rect(L, y + 4, 4.5, 4.5).fill(GOLD); rich(doc, b.text, L + indent, y, { size, width: W - indent }); }
        else rich(doc, b.text, L, y, { size, width: W });
        y += hh + (b.type === "h" ? 8 : 7);
      }
    } else {
      // The free chart PDF: show what the full report adds.
      const bullets = [1, 2, 3, 4, 5].map((i) => T("next_rep_" + i));
      const h = 24 + heightOf(doc, T("next_rep_t"), 13, W - 40, true) + bullets.reduce((n, b2) => n + heightOf(doc, b2, 10, W - 60) + 6, 0) + 36;
      ensure(h + 10);
      doc.rect(L, y, W, h).fill(NAVY);
      doc.rect(L, y, W, 3).fill(GOLD);
      rich(doc, T("next_rep_t"), L + 20, y + 18, { size: 13, bold: true, color: "#ffffff", width: W - 40 });
      let cy = y + 18 + heightOf(doc, T("next_rep_t"), 13, W - 40, true) + 10;
      for (const b2 of bullets) { doc.rect(L + 22, cy + 4, 5, 5).fill(GOLD); rich(doc, b2, L + 36, cy, { size: 10, color: "#f0e6e8", width: W - 60 }); cy += heightOf(doc, b2, 10, W - 60) + 6; }
      rich(doc, "kundlikaka.in", L + 20, cy + 6, { size: 10, bold: true, color: GOLDL, width: W - 40 });
      y += h + 10;
    }
  }

  // ---- a closing thought from the Gita
  {
    const meaning = lang === "hi" || lang === "hn" ? "कर्म करने में ही तुम्हारा अधिकार है, फल में कभी नहीं।" : "You have the right to do your work, but never to its fruits.";
    const h = 128;
    ensure(h + 12);
    y += 8;
    const gr = doc.linearGradient(L, y, L + W, y + h); gr.stop(0, "#6e1a30").stop(1, "#2a0a14");
    doc.rect(L, y, W, h).fill(gr);
    doc.rect(L + 6, y + 6, W - 12, h - 12).lineWidth(0.5).stroke(GOLD);
    rich(doc, "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", L + 20, y + 26, { size: 15, bold: true, color: GOLDL, width: W - 40, align: "center" });
    rich(doc, meaning, L + 30, y + 58, { size: 10.5, color: "#ffffff", width: W - 60, align: "center" });
    rich(doc, "Bhagavad Gita 2.47", L + 20, y + 88, { size: 8.5, bold: true, color: GOLDL, width: W - 40, align: "center" });
    rich(doc, "kundlikaka.in", L + 20, y + 104, { size: 8.5, color: "#ead9dc", width: W - 40, align: "center" });
    y += h + 10;
  }

  // ---- the contents page (page 2), now that every page number is known
  {
    doc.switchToPage(1);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const title = lang === "hi" || lang === "hn" ? "इस रिपोर्ट में" : "Inside your report";
    rich(doc, title, L, TOP + 4, { size: 24, bold: true, color: NAVY, width: W });
    doc.moveTo(L, TOP + 40).lineTo(L + 44, TOP + 40).lineWidth(2).stroke(GOLD);
    let cy = TOP + 62;
    toc.forEach((t, i) => {
      doc.rect(L, cy - 3, 4, 20).fill(t.color);
      rich(doc, String(i + 1).padStart(2, "0"), L + 14, cy, { size: 10, bold: true, color: GOLD });
      rich(doc, t.title, L + 42, cy, { size: 11.5, bold: true, width: W - 100 });
      const tw = widthOf(doc, t.title, 11.5, true);
      doc.moveTo(L + 48 + tw, cy + 12).lineTo(L + W - 34, cy + 12).dash(1, { space: 3 }).lineWidth(0.4).stroke("#bdb4b9").undash();
      rich(doc, String(t.page), L + W - 28, cy, { size: 11.5, bold: true, color: MAROON, width: 28, align: "right" });
      cy += 28;
    });
    cy += 18;
    drawGraphics(Math.min(cy, bottomEdge() - 150));
    doc.page.margins.bottom = bottom;
  }

  // ---- running header and footer on every inner page
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    rich(doc, "KUNDLI KAKA", L, 28, { size: 7.5, bold: true, color: GOLD });
    rich(doc, nm, L, 28, { size: 7.5, color: MUTED, width: W, align: "right" });
    doc.moveTo(L, 42).lineTo(L + W, 42).lineWidth(0.5).stroke("#e3dde0");
    doc.moveTo(L, PH - 50).lineTo(L + W, PH - 50).lineWidth(0.5).stroke("#e3dde0");
    rich(doc, T("rep_fine"), L, PH - 42, { size: 6.8, color: MUTED, width: W - 60 });
    rich(doc, `${i + 1} / ${range.count}`, L, PH - 42, { size: 7.5, bold: true, color: GOLD, width: W, align: "right" });
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return done;
}
