// "What your chart says about you": real positions in your chart turned into
// plain sentences, good and not so good. Nothing here is guessed or random.

import { SIGNS } from "./astro-data.js";
import { RISING, PARTNER, CAREER, STAR_LORD, STRONG, TESTED, MARS_HOUSE, RETRO, MONEY, HOUSE_FOCUS, FOCUS_LINE, BIG3, SUBPERIOD, ORD } from "./about-text.js";
import { SIGN_TEXT, PERIOD_TEXT } from "./reading.js";
import { planetName } from "../public/names.js";

const monthYear = (iso, L) => new Date(iso + "T00:00:00Z").toLocaleDateString(L === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

const textLang = (lang) => (lang === "hi" || lang === "hn" ? lang : "en");
const LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

// sign indexes: 0 Aries ... 11 Pisces
const EXALTED = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };

export function dignity(key, signIndex) {
  if (EXALTED[key] === undefined) return null;
  if (EXALTED[key] === signIndex) return "exalted";
  if ((EXALTED[key] + 6) % 12 === signIndex) return "debilitated";
  if (OWN[key].includes(signIndex)) return "own";
  return null;
}

export function buildAbout(chart, { lang = "en", timeUnknown = false } = {}) {
  if (chart.tradition === "western") return null;
  const L = textLang(lang);
  const moon = chart.planets.find((p) => p.key === "Moon");
  const out = { big3: null, money: null, focus: null, sub: null, rising: null, star: null, love: null, career: null, strong: [], tested: [], mars: null, retro: null };

  out.star = {
    nakshatraIndex: moon.nakshatraIndex,
    lord: LORDS[moon.nakshatraIndex % 9],
    text: STAR_LORD[L][LORDS[moon.nakshatraIndex % 9]],
  };

  for (const p of chart.planets) {
    const d = dignity(p.key, p.signIndex);
    if (d === "exalted" || d === "own") out.strong.push({ planet: p.key, state: d, text: STRONG[L][p.key] });
    else if (d === "debilitated") out.tested.push({ planet: p.key, text: TESTED[L][p.key] });
  }

  const back = chart.planets.filter((p) => p.retrograde && !["Rahu", "Ketu"].includes(p.key)).map((p) => p.key);
  if (back.length) out.retro = { planets: back, text: RETRO[L] };

  const sun = chart.planets.find((p) => p.key === "Sun");
  out.big3 = {
    sun: sun ? { signIndex: sun.signIndex, text: SIGN_TEXT[L][sun.signIndex].s[0] } : null,
    moon: { signIndex: moon.signIndex, text: SIGN_TEXT[L][moon.signIndex].s[0] },
    rising: null,
  };
  out.big3.labels = { sun: BIG3[L].sun, moon: BIG3[L].moon, rising: BIG3[L].rising };

  const cur = chart.dasha?.current;
  if (!timeUnknown && cur?.mahadasha && cur?.antardasha) {
    const sub = cur.antardasha;
    out.sub = {
      main: cur.mahadasha.lord, sub: sub.lord, until: sub.end,
      text: SUBPERIOD[L].replace("{sub}", planetName(L, sub.lord)).replace("{main}", planetName(L, cur.mahadasha.lord)).replace("{until}", monthYear(sub.end, L)),
      bring: PERIOD_TEXT[L][sub.lord].bring, watch: PERIOD_TEXT[L][sub.lord].watch,
    };
  }

  if (!timeUnknown && chart.ascendant) {
    out.big3.rising = { signIndex: chart.ascendant.signIndex, text: RISING[L][chart.ascendant.signIndex][0] };
    out.money = { signIndex: (chart.ascendant.signIndex + 1) % 12, text: MONEY[L][(chart.ascendant.signIndex + 1) % 12] };
    const counts = new Map();
    for (const p of chart.planets) counts.set(p.house, (counts.get(p.house) || 0) + 1);
    const [house, n] = [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0] || [];
    if (n >= 3) out.focus = { house, n, text: FOCUS_LINE[L].replace("{n}", n).replace("{house}", ORD[L][house - 1]).replace("{theme}", HOUSE_FOCUS[L][house - 1]) };
  }

  if (!timeUnknown && chart.ascendant) {
    const a = chart.ascendant.signIndex;
    out.rising = { signIndex: a, good: RISING[L][a][0], grow: RISING[L][a][1] };
    out.love = { signIndex: (a + 6) % 12, text: PARTNER[L][(a + 6) % 12] };
    out.career = { signIndex: (a + 9) % 12, text: CAREER[L][(a + 9) % 12] };
    const mars = chart.planets.find((p) => p.key === "Mars");
    if (MARS_HOUSE[L][mars.house]) out.mars = { house: mars.house, text: MARS_HOUSE[L][mars.house] };
  }
  return out;
}
