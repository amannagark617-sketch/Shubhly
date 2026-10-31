// "Your day": a personal daily guide for one person, from their own chart.
// Today's Moon is counted from their birth Moon, then weekday, dasha and rising
// sign shape what to do, what to avoid, what to wear and when to start things.
// Wording lives in data/myday-text.json (English and Hindi). Tendencies only.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SIGNS } from "./astro-data.js";
import { computeKundli } from "./kundli.js";
import { computePanchang } from "./panchang.js";
import { slowPlanets, sadeSati } from "./transits.js";
import { getContent } from "./content.js";

const TXT = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "myday-text.json"), "utf8"));

const mins = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const overlaps = (a, b) => mins(a.from) < mins(b.to) && mins(b.from) < mins(a.to);

export function buildMyDay({ name, birth, date, place, lang = "en" }) {
  const L = lang === "hi" ? "hi" : "en";
  const pick = (o) => o[L];
  const chart = computeKundli({ ...birth, tradition: "vedic" });
  const moon = chart.planets.find((p) => p.key === "Moon");
  const moonIdx = moon.signIndex;
  const lagnaIdx = birth.timeUnknown ? null : chart.ascendant.signIndex;
  const pan = computePanchang({ date, lat: place.lat, lon: place.lon, tz: place.tz, natalMoonSignIndex: moonIdx, lang: L === "hi" ? "hi" : "en" });
  const g = pan.gochar;
  const house = g.houseFromMoon;
  const wd = pan.weekday.no;
  const C = getContent(L);
  const mood = g.mood;
  const lord = SIGNS[moonIdx].lord;
  const dashaLord = !birth.timeUnknown ? chart.dasha?.current?.mahadasha?.lord : null;

  const h = TXT.house[house];
  const w = TXT.weekday[wd];
  const rahu = pan.kaal.rahu;
  const goodTimes = pan.choghadiya.day.filter((s) => s.quality === "good" && !overlaps(s, rahu)).slice(0, 3)
    .map((s) => ({ from: s.from, to: s.to, name: L === "hi" ? s.nameHi : s.name }));

  const slow = slowPlanets(date, place.tz);
  const sati = sadeSati(moonIdx, slow.Saturn.index, L === "hi" ? "hi" : "en");

  const area = (k) => pick(TXT.area[k][String(Math.min(5, Math.max(1, Math.round(g.stars[k]))))]);
  const colourOf = (planet) => ({ name: pick(TXT.colour[planet]), hex: TXT.colour[planet].hex });
  const weekdayLord = pan.weekday.lord;

  return {
    name,
    date,
    place: place.label || "",
    rashi: { index: moonIdx, sign: SIGNS[moonIdx].en, signHi: SIGNS[moonIdx].hi, lord },
    lagna: lagnaIdx == null ? null : { index: lagnaIdx, sign: SIGNS[lagnaIdx].en, signHi: SIGNS[lagnaIdx].hi },
    nakshatra: { name: moon.nakshatra, nameHi: moon.nakshatraHi },
    dasha: dashaLord ? { lord: dashaLord, text: pick(TXT.dasha[dashaLord]) } : null,
    weekday: { no: wd, name: pan.weekday.en || pan.weekday.name, hi: pan.weekday.hi || pan.weekday.nameHi },
    tithi: { name: L === "hi" ? pan.tithi.nameHi : pan.tithi.name, paksha: L === "hi" ? pan.tithi.paksha.hi : pan.tithi.paksha.en },
    moonToday: { sign: pan.moonSign.sign, signHi: pan.moonSign.signHi, house },
    mood,
    moodLabel: C.MOOD_LABEL[mood],
    theme: C.HOUSE_READING[house].theme,
    summary: C.HOUSE_READING[house].text,
    do: [...h.do[L], pick(w.do)],
    avoid: [...h.avoid[L], pick(w.avoid)],
    wear: {
      note: pick(TXT.wear[mood]),
      colours: [colourOf(weekdayLord), colourOf(lord)].filter((c, i, a) => a.findIndex((x) => x.hex === c.hex) === i),
    },
    food: pick(w.food),
    daan: pick(w.daan),
    areas: ["love", "career", "money", "health"].map((k) => ({ key: k, level: Math.round(g.stars[k]), text: area(k) })),
    best: goodTimes,
    abhijit: pan.abhijit,
    rahu,
    mantra: { text: pan.weekday.mantra, deity: L === "hi" ? pan.weekday.deityHi : pan.weekday.deity },
    lagnaNote: lagnaIdx == null ? null : pick(TXT.lagna[lagnaIdx]),
    sadeSati: sati && (sati.active || sati.dhaiya) ? { title: sati.title, text: sati.text, tip: sati.tip } : null,
    sunrise: pan.sunrise,
    sunset: pan.sunset,
  };
}
