// Kundli engine: sidereal (Lahiri) planetary positions, lagna, whole-sign houses,
// nakshatra and Vimshottari dasha, computed with the Swiss Ephemeris (Moshier mode,
// no data files needed).

import sweph from "sweph";
import { DateTime } from "luxon";
import {
  SIGNS,
  PLANET_NAMES,
  NAKSHATRAS,
  DASHA_ORDER,
  DASHA_YEARS,
} from "./astro-data.js";

const C = sweph.constants;
sweph.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);

const CALC_FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SIDEREAL | C.SEFLG_SPEED;
const NAK_SPAN = 360 / 27; // 13.3333 degrees
const PADA_SPAN = NAK_SPAN / 4;
const DAYS_PER_YEAR = 365.25;
const MS_PER_DAY = 86400000;

const PLANET_IDS = [
  ["Sun", C.SE_SUN],
  ["Moon", C.SE_MOON],
  ["Mars", C.SE_MARS],
  ["Mercury", C.SE_MERCURY],
  ["Jupiter", C.SE_JUPITER],
  ["Venus", C.SE_VENUS],
  ["Saturn", C.SE_SATURN],
  ["Rahu", C.SE_MEAN_NODE],
];

const norm360 = (x) => ((x % 360) + 360) % 360;

function describeLongitude(lon) {
  const l = norm360(lon);
  const signIndex = Math.floor(l / 30);
  const degInSign = l - signIndex * 30;
  const nakIndex = Math.floor(l / NAK_SPAN);
  const withinNak = l - nakIndex * NAK_SPAN;
  const pada = Math.floor(withinNak / PADA_SPAN) + 1;
  return {
    lon: l,
    signIndex,
    sign: SIGNS[signIndex].en,
    signHi: SIGNS[signIndex].hi,
    degInSign,
    nakshatraIndex: nakIndex,
    nakshatra: NAKSHATRAS[nakIndex].en,
    nakshatraHi: NAKSHATRAS[nakIndex].hi,
    pada,
    nakshatraFraction: withinNak / NAK_SPAN,
  };
}

function addYears(date, years) {
  return new Date(date.getTime() + years * DAYS_PER_YEAR * MS_PER_DAY);
}

// Build the Vimshottari timeline from the Moon's position.
function buildDasha(moonLon, birthUtc, now) {
  const m = describeLongitude(moonLon);
  const startLord = DASHA_ORDER[m.nakshatraIndex % 9];
  const startIdx = DASHA_ORDER.indexOf(startLord);
  const firstYears = DASHA_YEARS[startLord];
  const elapsedYears = m.nakshatraFraction * firstYears;
  const balanceYears = firstYears - elapsedYears;

  // The first mahadasha began before birth by the elapsed portion.
  let cursor = addYears(birthUtc, -elapsedYears);
  const mahadashas = [];
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const start = cursor;
    const end = addYears(start, years);
    mahadashas.push({ lord, years, start, end });
    cursor = end;
  }

  function antardashas(md) {
    const lordIdx = DASHA_ORDER.indexOf(md.lord);
    let t = md.start;
    const list = [];
    for (let j = 0; j < 9; j++) {
      const aLord = DASHA_ORDER[(lordIdx + j) % 9];
      const aYears = (md.years * DASHA_YEARS[aLord]) / 120;
      const start = t;
      const end = addYears(start, aYears);
      list.push({ lord: aLord, start, end });
      t = end;
    }
    return list;
  }

  let current = null;
  for (const md of mahadashas) {
    if (now >= md.start && now < md.end) {
      const ad = antardashas(md).find((a) => now >= a.start && now < a.end);
      current = { mahadasha: md, antardasha: ad || null };
      break;
    }
  }

  return { startLord, balanceYears, mahadashas, current };
}

const iso = (d) => d.toISOString().slice(0, 10);

/**
 * input: { year, month, day, hour, minute, lat, lon, tz }
 * tz is an IANA zone like "Asia/Kolkata"; hour is 0-23 local time.
 */
export function computeKundli(input, now = new Date()) {
  if (input.tradition === "western") return computeWestern(input);
  const { year, month, day, hour, minute, lat, lon, tz } = input;

  const local = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: tz }
  );
  if (!local.isValid) {
    throw new Error("Invalid birth date, time or timezone");
  }
  const utc = local.toUTC();
  const ut = utc.hour + utc.minute / 60 + utc.second / 3600;
  const jd = sweph.julday(utc.year, utc.month, utc.day, ut, C.SE_GREG_CAL);

  // Lagna (ascendant), sidereal.
  const h = sweph.houses_ex(jd, C.SEFLG_SIDEREAL, lat, lon, "W");
  if (h.error) throw new Error("House calculation failed: " + h.error);
  const ascLon = norm360(h.data.points[0]);
  const asc = describeLongitude(ascLon);

  // Planets.
  const planets = [];
  for (const [name, id] of PLANET_IDS) {
    const r = sweph.calc_ut(jd, id, CALC_FLAGS);
    if (r.error) throw new Error(`${name} calculation failed: ${r.error}`);
    const d = describeLongitude(r.data[0]);
    planets.push({
      key: name,
      hi: PLANET_NAMES[name].hi,
      short: PLANET_NAMES[name].short,
      ...d,
      // Rahu and Ketu are shown as retrograde by convention (mean node).
      retrograde: name === "Rahu" ? true : r.data[3] < 0,
    });
  }
  const rahu = planets.find((p) => p.key === "Rahu");
  const ketuLon = norm360(rahu.lon + 180);
  planets.push({
    key: "Ketu",
    hi: PLANET_NAMES.Ketu.hi,
    short: PLANET_NAMES.Ketu.short,
    ...describeLongitude(ketuLon),
    retrograde: true,
  });

  // Whole-sign houses: house 1 is the ascendant sign.
  for (const p of planets) {
    p.house = ((p.signIndex - asc.signIndex + 12) % 12) + 1;
  }
  const houses = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (asc.signIndex + i) % 12;
    return {
      house: i + 1,
      signIndex,
      sign: SIGNS[signIndex].en,
      signHi: SIGNS[signIndex].hi,
      lord: SIGNS[signIndex].lord,
      planets: planets.filter((p) => p.house === i + 1).map((p) => p.key),
    };
  });

  const moon = planets.find((p) => p.key === "Moon");
  const sun = planets.find((p) => p.key === "Sun");
  const mars = planets.find((p) => p.key === "Mars");

  const dasha = buildDasha(moon.lon, utc.toJSDate(), now);

  return {
    birth: {
      local: local.toFormat("yyyy-LL-dd HH:mm"),
      utc: utc.toFormat("yyyy-LL-dd HH:mm"),
      tz,
      lat,
      lon,
    },
    tradition: "vedic",
    ayanamsa: "Lahiri",
    ayanamsaValue: sweph.get_ayanamsa_ut(jd),
    ascendant: asc,
    moonSign: { sign: moon.sign, signHi: moon.signHi },
    sunSign: { sign: sun.sign, signHi: sun.signHi },
    nakshatra: {
      name: moon.nakshatra,
      hi: moon.nakshatraHi,
      pada: moon.pada,
      lord: DASHA_ORDER[moon.nakshatraIndex % 9],
    },
    planets,
    houses,
    // Common rule of thumb: Mars in houses 1, 2, 4, 7, 8, 12 from the lagna.
    manglikFromLagna: [1, 2, 4, 7, 8, 12].includes(mars.house),
    dasha: {
      startLord: dasha.startLord,
      balanceYears: Number(dasha.balanceYears.toFixed(2)),
      mahadashas: dasha.mahadashas.map((m) => ({
        lord: m.lord,
        years: m.years,
        start: iso(m.start),
        end: iso(m.end),
      })),
      current: dasha.current
        ? {
            mahadasha: {
              lord: dasha.current.mahadasha.lord,
              start: iso(dasha.current.mahadasha.start),
              end: iso(dasha.current.mahadasha.end),
            },
            antardasha: dasha.current.antardasha
              ? {
                  lord: dasha.current.antardasha.lord,
                  start: iso(dasha.current.antardasha.start),
                  end: iso(dasha.current.antardasha.end),
                }
              : null,
          }
        : null,
    },
  };
}

// ---------------------------------------------------------------------------
// Western (tropical) chart: Sun to Pluto and the North Node, Placidus houses
// (whole-sign near the poles, where Placidus cannot be drawn), major aspects.
// ---------------------------------------------------------------------------

const WEST_FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SPEED;
const WEST_IDS = [
  ["Sun", C.SE_SUN, "Su"],
  ["Moon", C.SE_MOON, "Mo"],
  ["Mercury", C.SE_MERCURY, "Me"],
  ["Venus", C.SE_VENUS, "Ve"],
  ["Mars", C.SE_MARS, "Ma"],
  ["Jupiter", C.SE_JUPITER, "Ju"],
  ["Saturn", C.SE_SATURN, "Sa"],
  ["Uranus", C.SE_URANUS, "Ur"],
  ["Neptune", C.SE_NEPTUNE, "Ne"],
  ["Pluto", C.SE_PLUTO, "Pl"],
  ["NorthNode", C.SE_TRUE_NODE, "NN"],
];

const ASPECTS = [
  { key: "conjunction", angle: 0, orb: 8 },
  { key: "sextile", angle: 60, orb: 4 },
  { key: "square", angle: 90, orb: 6 },
  { key: "trine", angle: 120, orb: 6 },
  { key: "opposition", angle: 180, orb: 8 },
];

function westPoint(lon) {
  const l = norm360(lon);
  const signIndex = Math.floor(l / 30);
  return {
    lon: l,
    signIndex,
    sign: SIGNS[signIndex].en,
    signHi: SIGNS[signIndex].hi,
    degInSign: l - signIndex * 30,
  };
}

function computeWestern(input) {
  const { year, month, day, hour, minute, lat, lon, tz } = input;
  const local = DateTime.fromObject({ year, month, day, hour, minute }, { zone: tz });
  if (!local.isValid) throw new Error("Invalid birth date, time or timezone");
  const utc = local.toUTC();
  const ut = utc.hour + utc.minute / 60 + utc.second / 3600;
  const jd = sweph.julday(utc.year, utc.month, utc.day, ut, C.SE_GREG_CAL);

  let h = sweph.houses_ex(jd, 0, lat, lon, "P");
  let system = "Placidus";
  if (h.error || h.flag < 0 || !h.data?.houses || h.data.houses.some((x) => !Number.isFinite(x))) {
    h = sweph.houses_ex(jd, 0, lat, lon, "W");
    system = "Whole sign";
  }
  if (h.error) throw new Error("House calculation failed: " + h.error);
  const ascLon = norm360(h.data.points[0]);
  const mcLon = norm360(h.data.points[1]);
  const asc = westPoint(ascLon);
  const cusps = h.data.houses.map(norm360);

  const houseOf = (l) => {
    for (let i = 0; i < 12; i++) {
      const a = cusps[i], b = cusps[(i + 1) % 12];
      const span = norm360(b - a);
      if (norm360(l - a) < span) return i + 1;
    }
    return 1;
  };

  const planets = [];
  for (const [key, id, short] of WEST_IDS) {
    const r = sweph.calc_ut(jd, id, WEST_FLAGS);
    if (r.error) throw new Error(`${key} calculation failed: ${r.error}`);
    planets.push({
      key,
      short,
      ...westPoint(r.data[0]),
      house: houseOf(r.data[0]),
      retrograde: key === "NorthNode" ? true : r.data[3] < 0,
    });
  }

  const houses = cusps.map((c, i) => ({ house: i + 1, ...westPoint(c) }));

  const aspects = [];
  const bodies = planets.filter((p) => p.key !== "NorthNode");
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      let d = Math.abs(bodies[i].lon - bodies[j].lon);
      if (d > 180) d = 360 - d;
      for (const a of ASPECTS) {
        const off = Math.abs(d - a.angle);
        if (off <= a.orb) {
          aspects.push({ a: bodies[i].key, b: bodies[j].key, type: a.key, orb: Number(off.toFixed(1)) });
          break;
        }
      }
    }
  }

  const moon = planets.find((p) => p.key === "Moon");
  const sun = planets.find((p) => p.key === "Sun");

  return {
    tradition: "western",
    birth: {
      local: local.toFormat("yyyy-LL-dd HH:mm"),
      utc: utc.toFormat("yyyy-LL-dd HH:mm"),
      tz,
      lat,
      lon,
    },
    zodiac: "Tropical",
    houseSystem: system,
    ascendant: asc,
    midheaven: westPoint(mcLon),
    moonSign: { sign: moon.sign, signHi: moon.signHi, signIndex: moon.signIndex },
    sunSign: { sign: sun.sign, signHi: sun.signHi, signIndex: sun.signIndex },
    planets,
    houses,
    aspects,
  };
}
