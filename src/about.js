// "What your chart says about you": real positions in your chart turned into
// plain sentences, good and not so good. Nothing here is guessed or random.

import { SIGNS } from "./astro-data.js";
import { RISING, PARTNER, CAREER, STAR_LORD, STRONG, TESTED, MARS_HOUSE, RETRO } from "./about-text.js";

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
  const out = { rising: null, star: null, love: null, career: null, strong: [], tested: [], mars: null, retro: null };

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
