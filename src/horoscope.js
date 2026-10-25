// Daily horoscope for all twelve rashis, built from the Moon's transit
// (gochar) on the day: the Moon's house counted from each rashi, the tithi
// group, the weekday, and each rashi's own nature. Nothing here is random.

import { SIGNS } from "./astro-data.js";
import { computePanchang } from "./panchang.js";
import { PLANET_NUMBER, getContent } from "./content.js";

const SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map(
  (s) => s + "︎"
);

export function tithiGroup(tithiNo) {
  const inPaksha = tithiNo <= 15 ? tithiNo : tithiNo - 15;
  return ["Purna", "Nanda", "Bhadra", "Jaya", "Rikta"][inPaksha % 5];
}

export function houseFromMoon(natalRashiIndex, moonSignIndex) {
  return ((moonSignIndex - natalRashiIndex + 12) % 12) + 1;
}

function readingFor(C, rashiIndex, moonSignIndex, weekdayNo) {
  const { HOUSE_READING, MOOD_LABEL, RASHI_TRAIT, WEEKDAY_INFO } = C;
  const house = houseFromMoon(rashiIndex, moonSignIndex);
  const r = HOUSE_READING[house];
  const week = WEEKDAY_INFO[weekdayNo];
  const sign = SIGNS[rashiIndex];
  return {
    index: rashiIndex,
    sign: sign.en,
    signHi: sign.hi,
    symbol: SYMBOLS[rashiIndex],
    lord: sign.lord,
    house,
    mood: r.mood,
    moodLabel: MOOD_LABEL[r.mood],
    theme: r.theme,
    text: r.text,
    trait: RASHI_TRAIT[rashiIndex],
    stars: r.stars,
    lucky: {
      colour: week.colour,
      number: PLANET_NUMBER[sign.lord],
    },
  };
}

export function buildDailyHoroscope({ date, lat, lon, tz, lang = "hn" }) {
  const C = getContent(lang);
  const p = computePanchang({ date, lat, lon, tz, lang });
  const moonIdx = p.moonSign.index;
  return {
    date,
    weekday: p.weekday,
    tithi: p.tithi,
    nakshatra: p.nakshatra,
    moonSign: p.moonSign,
    moonIngress: p.moonIngress,
    tithiTone: C.TITHI_TONE[tithiGroup(p.tithi.number)],
    rashis: SIGNS.map((_, i) => readingFor(C, i, moonIdx, p.weekday.no)),
  };
}
