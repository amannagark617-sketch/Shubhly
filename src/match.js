// Kundli Milan (Ashtakoot): the traditional 36-point match, worked out from the
// two Moon positions. Where the old tables look from "groom" to "bride", we look
// both ways and take the average, so the result is the same whoever goes first.

import { SIGNS } from "./astro-data.js";
import { KOOTAS, VERDICTS, SUMMARY, AREAS, MANGAL } from "./match-text.js";
import { SIGN_TEXT } from "./reading.js";

const textLang = (lang) => (lang === "hi" || lang === "hn" ? lang : "en");

// ---- Varna (1): Brahmin 4, Kshatriya 3, Vaishya 2, Shudra 1, by Moon sign
const VARNA = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];

// ---- Vashya (2)
const MANAV = 0, CHATUSHPAD = 1, JALACHARA = 2, VANACHARA = 3, KEETAKA = 4;
const VASHYA_GRID = [
  [2, 1, 1.5, 0, 1],
  [1, 2, 1, 0.5, 1],
  [1.5, 1, 2, 1, 1],
  [0, 0.5, 1, 2, 0],
  [1, 1, 1, 0, 2],
];
export function vashyaGroup(signIndex, deg) {
  if ([2, 5, 6, 10].includes(signIndex)) return MANAV;
  if (signIndex === 8) return deg < 15 ? MANAV : CHATUSHPAD;
  if (signIndex === 9) return deg < 15 ? CHATUSHPAD : JALACHARA;
  if ([0, 1].includes(signIndex)) return CHATUSHPAD;
  if ([3, 11].includes(signIndex)) return JALACHARA;
  if (signIndex === 4) return VANACHARA;
  return KEETAKA; // Scorpio
}

// ---- Yoni (4): animal of each nakshatra and the standard table
const ANIMALS = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"];
const YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
export const YONI_GRID = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// ---- Graha Maitri (5): friendship of the two Moon-sign lords
const FRIEND = {
  Sun: { f: ["Moon", "Mars", "Jupiter"], e: ["Venus", "Saturn"] },
  Moon: { f: ["Sun", "Mercury"], e: [] },
  Mars: { f: ["Sun", "Moon", "Jupiter"], e: ["Mercury"] },
  Mercury: { f: ["Sun", "Venus"], e: ["Moon"] },
  Jupiter: { f: ["Sun", "Moon", "Mars"], e: ["Mercury", "Venus"] },
  Venus: { f: ["Mercury", "Saturn"], e: ["Sun", "Moon"] },
  Saturn: { f: ["Mercury", "Venus"], e: ["Sun", "Moon", "Mars"] },
};
const rel = (a, b) => (FRIEND[a].f.includes(b) ? 2 : FRIEND[a].e.includes(b) ? 0 : 1); // 2 friend, 1 neutral, 0 enemy
export function maitri(la, lb) {
  if (la === lb) return 5;
  const k = [rel(la, lb), rel(lb, la)].sort().join("");
  return { "22": 5, "12": 4, "11": 3, "02": 1, "01": 0.5, "00": 0 }[k];
}

// ---- Gana (6): 0 Deva, 1 Manushya, 2 Rakshasa
const GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
const GANA_GRID = [[6, 5.5, 0.5], [5.5, 6, 0], [0.5, 0, 6]];

// ---- Nadi (8): 0 Aadi, 1 Madhya, 2 Antya
const NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];

const mod = (n, m) => ((n % m) + m) % m;

export function ashtakoot(a, b) {
  // a, b: { signIndex, deg, nakshatraIndex }
  const lordA = SIGNS[a.signIndex].lord, lordB = SIGNS[b.signIndex].lord;

  const varna = VARNA[a.signIndex] === VARNA[b.signIndex] ? 1 : 0.5;

  const ga = vashyaGroup(a.signIndex, a.deg), gb = vashyaGroup(b.signIndex, b.deg);
  const vashya = (VASHYA_GRID[ga][gb] + VASHYA_GRID[gb][ga]) / 2;

  const tara1 = mod(b.nakshatraIndex - a.nakshatraIndex, 27) % 9 + 1; // star count from a to b
  const tara2 = mod(a.nakshatraIndex - b.nakshatraIndex, 27) % 9 + 1;
  const bad = (n) => [3, 5, 7].includes(n);
  const tara = (bad(tara1) ? 0 : 1.5) + (bad(tara2) ? 0 : 1.5);

  const yoni = YONI_GRID[YONI_OF[a.nakshatraIndex]][YONI_OF[b.nakshatraIndex]];

  const grahaMaitri = maitri(lordA, lordB);

  const gana = GANA_GRID[GANA[a.nakshatraIndex]][GANA[b.nakshatraIndex]];

  const dist = mod(b.signIndex - a.signIndex, 12) + 1;
  const flagged = [2, 12, 5, 9, 6, 8].includes(dist);
  const cancelled = flagged && (lordA === lordB || (rel(lordA, lordB) === 2 && rel(lordB, lordA) === 2));
  const bhakoot = !flagged || cancelled ? 7 : 0;

  const nadi = NADI[a.nakshatraIndex] === NADI[b.nakshatraIndex] ? 0 : 8;

  return [
    ["varna", varna, 1], ["vashya", vashya, 2], ["tara", tara, 3], ["yoni", yoni, 4],
    ["maitri", grahaMaitri, 5], ["gana", gana, 6], ["bhakoot", bhakoot, 7], ["nadi", nadi, 8],
  ].map(([key, score, max]) => ({ key, score, max, extra: key === "bhakoot" && cancelled ? "cancelled" : null }));
}

export function buildMatch(chartA, chartB, opts = {}) {
  const { lang = "en" } = opts;
  const L = textLang(lang);
  const pos = (c) => {
    const m = c.planets.find((p) => p.key === "Moon");
    return { signIndex: m.signIndex, deg: m.degInSign, nakshatraIndex: m.nakshatraIndex };
  };
  const pa = pos(chartA), pb = pos(chartB);
  const rows = ashtakoot(pa, pb);
  const total = rows.reduce((s, r) => s + r.score, 0);
  const band = total >= 33 ? 3 : total >= 25 ? 2 : total >= 18 ? 1 : 0;

  const items = rows.map((r) => {
    const k = KOOTAS[L][r.key];
    const level = r.score >= r.max * 0.75 ? "good" : r.score > 0 ? "ok" : "low";
    return {
      key: r.key, name: k.name, measures: k.measures, score: r.score, max: r.max, level,
      text: r.extra === "cancelled" ? k.cancelled : k[level],
    };
  });
  // Four plain areas, each made from the points that belong to it.
  const by = Object.fromEntries(rows.map((r) => [r.key, r]));
  const share = (keys) => keys.reduce((s, k) => s + by[k].score, 0) / keys.reduce((s, k) => s + by[k].max, 0);
  const areaData = [
    ["mind", share(["maitri", "varna", "vashya"])],
    ["chemistry", share(["yoni", "gana"])],
    ["family", share(["bhakoot"])],
    ["health", share(["nadi", "tara"])],
  ].map(([key, pct]) => {
    const level = pct >= 0.75 ? "good" : pct >= 0.45 ? "ok" : "low";
    return { key, name: AREAS[L][key].name, pct: Math.round(pct * 100), level, text: AREAS[L][key][level] };
  });

  const rank = [...items].sort((x, y) => y.score / y.max - x.score / x.max);
  const person = (pp) => ({ signIndex: pp.signIndex, nakshatraIndex: pp.nakshatraIndex, strength: SIGN_TEXT[L][pp.signIndex].s[0], grow: SIGN_TEXT[L][pp.signIndex].g });

  let mangal = null;
  if (chartA.manglikFromLagna !== undefined && chartB.manglikFromLagna !== undefined && !opts.timeUnknown?.some(Boolean)) {
    const n = Number(Boolean(chartA.manglikFromLagna)) + Number(Boolean(chartB.manglikFromLagna));
    mangal = MANGAL[L][n === 2 ? "both" : n === 0 ? "none" : "one"];
  }

  return {
    areas: areaData,
    best: rank[0].key,
    care: rank[rank.length - 1].score / rank[rank.length - 1].max < 0.75 ? rank[rank.length - 1].key : null,
    people: [person(pa), person(pb)],
    mangal,
    total,
    outOf: 36,
    verdict: VERDICTS[L][band],
    band,
    items,
    summary: SUMMARY[L],
    moons: [{ signIndex: pa.signIndex, nakshatraIndex: pa.nakshatraIndex }, { signIndex: pb.signIndex, nakshatraIndex: pb.nakshatraIndex }],
  };
}
