// The facts behind the full report. Everything here is computed by the chart engine, never by the AI:
// dasha dates, month-by-month ratings, favourable windows, dosha checks. The AI only explains these.

import { SIGNS, DASHA_ORDER, DASHA_YEARS } from "./astro-data.js";
import { slowPlanets, saturnWindow, sadeSati } from "./transits.js";

const DAY = 86_400_000;
const YEAR_MS = 365.25 * DAY;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const iso = (d) => d.toISOString().slice(0, 10);
const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const houseFrom = (signIdx, baseIdx) => ((signIdx - baseIdx + 12) % 12) + 1;

const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
export function dignity(p) {
  if (p.key === "Rahu" || p.key === "Ketu") return "";
  if (EXALT[p.key] === p.signIndex) return "exalted";
  if ((EXALT[p.key] + 6) % 12 === p.signIndex) return "debilitated";
  if (SIGNS[p.signIndex].lord === p.key) return "own sign";
  return "";
}

/** The antardashas (sub-periods) inside one mahadasha, with dates. */
export function subPeriods(md) {
  const start0 = new Date(md.start).getTime();
  const years = md.years;
  const idx = DASHA_ORDER.indexOf(md.lord);
  let t = start0;
  return Array.from({ length: 9 }, (_, j) => {
    const lord = DASHA_ORDER[(idx + j) % 9];
    const start = new Date(t);
    t += ((years * DASHA_YEARS[lord]) / 120) * YEAR_MS;
    return { lord, start, end: new Date(t), mahadasha: md.lord };
  });
}

/** Sub-periods from `from` for about `years` years ahead. */
function periodsAhead(chart, from, years) {
  const to = new Date(from.getTime() + years * YEAR_MS);
  const out = [];
  for (const md of chart.dasha.mahadashas) {
    if (new Date(md.end) <= from || new Date(md.start) >= to) continue;
    for (const sp of subPeriods(md)) {
      if (sp.end > from && sp.start < to) out.push({ ...sp, start: sp.start < from ? from : sp.start, end: sp.end > to ? to : sp.end });
    }
  }
  return out;
}

const planetOf = (chart, key) => chart.planets.find((p) => p.key === key);
const lordOfHouse = (chart, h) => chart.houses[h - 1].lord;

// Houses and friends each topic cares about.
const TOPICS = {
  career: { houses: [10, 6], karakas: ["Sun", "Saturn"] },
  money: { houses: [2, 11], karakas: ["Jupiter"] },
  love: { houses: [7, 5], karakas: ["Venus", "Jupiter"] },
};

function relevance(chart, lord, topic) {
  const t = TOPICS[topic];
  const reasons = [];
  let score = 0;
  for (const h of t.houses) {
    if (lordOfHouse(chart, h) === lord) { score += 2; reasons.push(`${lord} rules house ${h}`); }
    if (planetOf(chart, lord)?.house === h) { score += 1; reasons.push(`${lord} sits in house ${h}`); }
  }
  if (t.karakas.includes(lord)) { score += 1; reasons.push(`${lord} is a natural significator`); }
  return { score, reasons };
}

/** Gochar (transit from the Moon) points for a date: Jupiter and Saturn in helpful or testing places. */
function transitMood(chart, date, tz) {
  const moonIdx = planetOf(chart, "Moon").signIndex;
  const s = slowPlanets(iso(date), tz);
  const jup = houseFrom(s.Jupiter.index, moonIdx), sat = houseFrom(s.Saturn.index, moonIdx), rahu = houseFrom(s.Rahu.index, moonIdx);
  let pts = 0;
  if ([2, 5, 7, 9, 11].includes(jup)) pts += 1;
  if ([3, 6, 11].includes(sat)) pts += 1;
  if ([12, 1, 2, 8, 4].includes(sat)) pts -= 1; // Sade Sati, Ashtama and Kantaka Shani
  if ([3, 6, 11].includes(rahu)) pts += 0.5;
  return { pts, jup, sat, rahu, jupSign: s.Jupiter.sign, satSign: s.Saturn.sign };
}

const tagOf = (score) => (score >= 4 ? "good" : score <= 2 ? "careful" : "steady");

export function buildFacts(chart, { now = new Date(), timeUnknown = false } = {}) {
  const tz = chart.birth.tz || "Asia/Kolkata";
  const moon = planetOf(chart, "Moon");
  const useHouses = !timeUnknown;

  // ---- 12 months ahead
  const months = [];
  for (let i = 0; i < 12; i++) {
    const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const mid = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 15));
    const sub = periodsAhead(chart, mid, 0.01)[0];
    const mood = transitMood(chart, mid, tz);
    let score = 2.6 + mood.pts; // a little below the middle, so good months stand out
    let dashaNote = "";
    if (sub && useHouses) {
      const lordHouse = planetOf(chart, sub.lord)?.house;
      if ([1, 5, 9, 10, 11].includes(lordHouse)) score += 1;
      if ([6, 8, 12].includes(lordHouse)) score -= 1;
      dashaNote = `${sub.mahadasha}-${sub.lord} period`;
    } else if (sub) dashaNote = `${sub.mahadasha}-${sub.lord} period`;
    score = Math.max(1, Math.min(5, Math.round(score)));
    months.push({
      key: ym(first), label: label(first), score, tag: tagOf(score), period: dashaNote,
      jupiterFromMoon: mood.jup, saturnFromMoon: mood.sat, saturnSign: mood.satSign, jupiterSign: mood.jupSign,
    });
  }

  // ---- dasha table: the current mahadasha and the ones after it (about 12 years)
  const current = chart.dasha.current;
  const horizon = new Date(now.getTime() + 12 * YEAR_MS);
  const mahadashas = chart.dasha.mahadashas.filter((m) => new Date(m.end) > now && new Date(m.start) < horizon).map((m) => ({
    lord: m.lord, years: m.years, start: m.start, end: m.end, startLabel: label(new Date(m.start)), endLabel: label(new Date(m.end)),
    current: new Date(m.start) <= now && now < new Date(m.end),
  }));
  const curMd = chart.dasha.mahadashas.find((m) => new Date(m.start) <= now && now < new Date(m.end));
  const currentSubs = curMd ? subPeriods(curMd).filter((s) => s.end > now).slice(0, 4).map((s) => ({ lord: s.lord, startLabel: label(s.start), endLabel: label(s.end) })) : [];

  // ---- favourable windows: sub-periods whose lord matters for the topic, with a helpful transit
  const windows = {};
  if (useHouses) {
    const near = periodsAhead(chart, now, 4).filter((s) => s.end - s.start > 45 * DAY);
    const far = periodsAhead(chart, now, 10).filter((s) => s.end - s.start > 45 * DAY);
    for (const topic of Object.keys(TOPICS)) {
      const pick = (subs) => subs.map((s) => {
        const rel = relevance(chart, s.lord, topic);
        const mid = new Date((s.start.getTime() + s.end.getTime()) / 2);
        const mood = transitMood(chart, mid, tz);
        return { s, rel, mood, score: rel.score * 2 + mood.pts };
      }).filter((x) => x.rel.score >= 1).sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.s.start - b.s.start);
      const ranked = pick(near).length ? pick(near) : pick(far); // nothing close by: look further ahead
      windows[topic] = ranked.map((x) => ({
        startMs: x.s.start.getTime(), endMs: x.s.end.getTime(), startLabel: label(x.s.start), endLabel: label(x.s.end), range: `${label(x.s.start)} to ${label(x.s.end)}`,
        period: `${x.s.mahadasha}-${x.s.lord}`, why: [...x.rel.reasons, ...(x.mood.pts > 0 ? [`Jupiter/Saturn transits are supportive (Jupiter in house ${x.mood.jup} from the Moon)`] : [])],
      }));
    }
  }

  // ---- doshas
  const mars = planetOf(chart, "Mars");
  const marsFromMoon = houseFrom(mars.signIndex, moon.signIndex);
  const manglikMoon = [1, 2, 4, 7, 8, 12].includes(marsFromMoon);
  const mangal = useHouses && chart.manglikFromLagna ? "present" : manglikMoon ? "mild" : "not present";
  const rahu = planetOf(chart, "Rahu");
  const seven = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map((k) => (planetOf(chart, k).lon - rahu.lon + 360) % 360);
  const kaalSarp = seven.every((d) => d < 180) || seven.every((d) => d > 180) ? "present" : "not present";
  const today = iso(now);
  const sat = slowPlanets(today, tz).Saturn;
  const ss = sadeSati(moon.signIndex, sat.index, "en");
  const win = saturnWindow(today, tz);
  const sadeSatiStatus = ss.active ? "active" : ss.dhaiya ? "small phase (dhaiya)" : "not active";
  const doshas = {
    mangal: { status: mangal, fromLagna: useHouses ? chart.manglikFromLagna : null, fromMoon: manglikMoon },
    kaalSarp: { status: kaalSarp },
    sadeSati: { status: sadeSatiStatus, saturnSign: sat.sign, saturnEnteredSign: win.entered, saturnLeavesSign: win.leaves, stage: ss.key },
  };

  const lagna = chart.ascendant;
  const years = new Set([now.getUTCFullYear() - 1, now.getUTCFullYear(), now.getUTCFullYear() + 1, now.getUTCFullYear() + 2, now.getUTCFullYear() + 3, now.getUTCFullYear() + 4, now.getUTCFullYear() + 5]);
  for (const m of mahadashas) { years.add(Number(m.start.slice(0, 4))); years.add(Number(m.end.slice(0, 4))); }
  for (const w of [...(win.entered ? [win.entered] : []), ...(win.leaves ? [win.leaves] : [])]) years.add(Number(w.slice(0, 4)));
  years.add(Number(chart.birth.local.slice(0, 4)));
  for (let y = now.getUTCFullYear() + 6; y <= now.getUTCFullYear() + 10; y++) years.add(y);

  return {
    timeKnown: !timeUnknown, today,
    snapshot: {
      lagna: useHouses ? lagna.sign : null, moonSign: moon.sign, sunSign: chart.sunSign.sign,
      nakshatra: chart.nakshatra.name, pada: chart.nakshatra.pada, nakshatraLord: chart.nakshatra.lord, ayanamsa: chart.ayanamsa,
    },
    planets: chart.planets.map((p) => ({ planet: p.key, sign: p.sign, house: useHouses ? p.house : null, degree: Number(p.degInSign.toFixed(1)), retrograde: p.retrograde, dignity: dignity(p) })),
    currentPeriod: current ? { mahadasha: current.mahadasha.lord, mahadashaEnds: label(new Date(current.mahadasha.end)), antardasha: current.antardasha?.lord || null, antardashaStarts: current.antardasha ? label(new Date(current.antardasha.start)) : null, antardashaEnds: current.antardasha ? label(new Date(current.antardasha.end)) : null } : null,
    mahadashas, currentSubs, months, windows, doshas,
    allowedYears: [...years],
  };
}

// ---- words the AI must never write, and years it may not invent -------------------------------------
const BANNED = /\b(death|die|dies|dying|dead|cancer|tumou?r|accident|surgery|disease|illness|divorce|court|lawsuit|jail|prison|pregnan\w*|miscarriage|suicide|maut|talaak|bimari)\b|मृत्यु|मौत|कैंसर|दुर्घटना|तलाक|कोर्ट|बीमारी|आत्महत्या/i;

/** True when the text is safe: no banned words and no year the engine did not give. */
export function proseOk(value, allowedYears) {
  const allowed = new Set(allowedYears);
  const bad = (s) => {
    if (BANNED.test(s)) return true;
    for (const y of s.match(/\b(?:19|20)\d{2}\b/g) || []) if (!allowed.has(Number(y))) return true;
    return false;
  };
  const walk = (v) => (typeof v === "string" ? !bad(v) : Array.isArray(v) ? v.every(walk) : v && typeof v === "object" ? Object.values(v).every(walk) : true);
  return walk(value);
}

// ---- small fixed tables: lucky kit and remedies, from the Moon sign's ruling planet ------------------
const KIT = {
  Sun: { day: "Sunday", colour: "Orange or gold", number: "1", mantra: "Om Suryaya Namah", gift: "wheat or jaggery", dayHi: "रविवार", colourHi: "नारंगी या सुनहरा" },
  Moon: { day: "Monday", colour: "White or cream", number: "2", mantra: "Om Chandraya Namah", gift: "rice or milk", dayHi: "सोमवार", colourHi: "सफ़ेद या क्रीम" },
  Mars: { day: "Tuesday", colour: "Red or maroon", number: "9", mantra: "Om Mangalaya Namah", gift: "red lentils (masoor)", dayHi: "मंगलवार", colourHi: "लाल या मैरून" },
  Mercury: { day: "Wednesday", colour: "Green", number: "5", mantra: "Om Budhaya Namah", gift: "green moong", dayHi: "बुधवार", colourHi: "हरा" },
  Jupiter: { day: "Thursday", colour: "Yellow", number: "3", mantra: "Om Gurave Namah", gift: "chana dal or bananas", dayHi: "गुरुवार", colourHi: "पीला" },
  Venus: { day: "Friday", colour: "White or light pink", number: "6", mantra: "Om Shukraya Namah", gift: "sweets or white clothes", dayHi: "शुक्रवार", colourHi: "सफ़ेद या हल्का गुलाबी" },
  Saturn: { day: "Saturday", colour: "Dark blue or black", number: "8", mantra: "Om Shanaishcharaya Namah", gift: "mustard oil or help for workers", dayHi: "शनिवार", colourHi: "गहरा नीला या काला" },
};
export function luckyKit(chart) {
  const lord = SIGNS[planetOf(chart, "Moon").signIndex].lord;
  return { lord, ...KIT[lord] };
}
