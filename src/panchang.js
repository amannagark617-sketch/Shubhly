// Daily panchang for a place and date, computed with the Swiss Ephemeris
// (Lahiri, Hindu-style sunrise). Tithi, nakshatra, yoga and karana are taken
// at sunrise, as in the traditional panchang, and their end times are found
// by bisection.

import sweph from "sweph";
import { DateTime } from "luxon";
import { SIGNS, NAKSHATRAS } from "./astro-data.js";
import { HIGHLIGHTS, HOUSE_READING, MOOD_LABEL, WEEKDAY_INFO } from "./content.js";

const C = sweph.constants;
sweph.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);

const LON_FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SIDEREAL;
const NAK_SPAN = 360 / 27;
const norm360 = (x) => ((x % 360) + 360) % 360;

const TITHI_NAMES = [
  ["Pratipada", "प्रतिपदा"], ["Dwitiya", "द्वितीया"], ["Tritiya", "तृतीया"],
  ["Chaturthi", "चतुर्थी"], ["Panchami", "पंचमी"], ["Shashthi", "षष्ठी"],
  ["Saptami", "सप्तमी"], ["Ashtami", "अष्टमी"], ["Navami", "नवमी"],
  ["Dashami", "दशमी"], ["Ekadashi", "एकादशी"], ["Dwadashi", "द्वादशी"],
  ["Trayodashi", "त्रयोदशी"], ["Chaturdashi", "चतुर्दशी"],
];

const YOGA_NAMES = [
  ["Vishkambha", "विष्कम्भ"], ["Priti", "प्रीति"], ["Ayushman", "आयुष्मान"],
  ["Saubhagya", "सौभाग्य"], ["Shobhana", "शोभन"], ["Atiganda", "अतिगण्ड"],
  ["Sukarma", "सुकर्मा"], ["Dhriti", "धृति"], ["Shula", "शूल"],
  ["Ganda", "गण्ड"], ["Vriddhi", "वृद्धि"], ["Dhruva", "ध्रुव"],
  ["Vyaghata", "व्याघात"], ["Harshana", "हर्षण"], ["Vajra", "वज्र"],
  ["Siddhi", "सिद्धि"], ["Vyatipata", "व्यतीपात"], ["Variyana", "वरीयान"],
  ["Parigha", "परिघ"], ["Shiva", "शिव"], ["Siddha", "सिद्ध"],
  ["Sadhya", "साध्य"], ["Shubha", "शुभ"], ["Shukla", "शुक्ल"],
  ["Brahma", "ब्रह्म"], ["Indra", "इन्द्र"], ["Vaidhriti", "वैधृति"],
];

const KARANA_MOVABLE = [
  ["Bava", "बव"], ["Balava", "बालव"], ["Kaulava", "कौलव"], ["Taitila", "तैतिल"],
  ["Gara", "गर"], ["Vanija", "वणिज"], ["Vishti", "विष्टि"],
];
const KARANA_FIXED = {
  0: ["Kimstughna", "किंस्तुघ्न"],
  57: ["Shakuni", "शकुनि"],
  58: ["Chatushpada", "चतुष्पद"],
  59: ["Naga", "नाग"],
};

const WEEKDAY_NAMES = {
  1: { en: "Monday", hi: "सोमवार" },
  2: { en: "Tuesday", hi: "मंगलवार" },
  3: { en: "Wednesday", hi: "बुधवार" },
  4: { en: "Thursday", hi: "गुरुवार" },
  5: { en: "Friday", hi: "शुक्रवार" },
  6: { en: "Saturday", hi: "शनिवार" },
  7: { en: "Sunday", hi: "रविवार" },
};

// Which eighth of the daylight (1 = first) is rahu kaal, yamaganda and gulika
// kaal, by weekday (Monday = 1).
const RAHU_PART = { 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3, 7: 8 };
const YAMA_PART = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6, 7: 5 };
const GULIKA_PART = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 7 };

// Choghadiya: seven names in the traditional day order. The day's first slot
// depends on the weekday; night slots start five names later and then step
// five names each time.
const CHOG = [
  ["Udveg", "उद्वेग", "avoid"],
  ["Chal", "चल", "neutral"],
  ["Labh", "लाभ", "good"],
  ["Amrit", "अमृत", "good"],
  ["Kaal", "काल", "avoid"],
  ["Shubh", "शुभ", "good"],
  ["Rog", "रोग", "avoid"],
];
const CHOG_DAY_START = { 7: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };

function lonAt(jd, body) {
  const r = sweph.calc_ut(jd, body, LON_FLAGS);
  if (r.error) throw new Error("Sky calculation failed");
  return r.data[0];
}
const sunAt = (jd) => lonAt(jd, C.SE_SUN);
const moonAt = (jd) => lonAt(jd, C.SE_MOON);
const elongationAt = (jd) => norm360(moonAt(jd) - sunAt(jd));
const yogaSumAt = (jd) => norm360(sunAt(jd) + moonAt(jd));

// When has a steadily increasing angle advanced by `remaining` degrees?
function findAdvance(fn, jdStart, remaining, maxDays = 2) {
  const base = fn(jdStart);
  const delta = (jd) => norm360(fn(jd) - base);
  let lo = jdStart;
  let hi = jdStart + maxDays;
  if (delta(hi) < remaining) return null;
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    if (delta(mid) >= remaining) hi = mid;
    else lo = mid;
  }
  return hi;
}

function jdToLocal(jd, tz) {
  const u = sweph.jdut1_to_utc(jd, C.SE_GREG_CAL);
  return DateTime.fromObject(
    {
      year: u.year, month: u.month, day: u.day,
      hour: u.hour, minute: u.minute, second: Math.floor(u.second),
    },
    { zone: "utc" }
  ).setZone(tz);
}

function sunEvent(jdFrom, lat, lon, kind) {
  const r = sweph.rise_trans(
    jdFrom, C.SE_SUN, "", C.SEFLG_MOSEPH,
    kind | C.SE_BIT_HINDU_RISING, [lon, lat, 0], 0, 0
  );
  if (r.flag < 0 || !r.data) return null;
  return r.data;
}

const hhmm = (dt) => dt.plus({ seconds: 30 }).toFormat("HH:mm");
const range = (a, b) => ({ from: hhmm(a), to: hhmm(b) });

// The parts of a day that only need sunrise and the sky at sunrise.
function dayCore(date, lat, lon, tz) {
  const dayStart = DateTime.fromISO(date, { zone: tz }).startOf("day");
  if (!dayStart.isValid) throw new Error("Invalid date or timezone");
  const u = dayStart.toUTC();
  const jd0 = sweph.julday(
    u.year, u.month, u.day, u.hour + u.minute / 60 + u.second / 3600, C.SE_GREG_CAL
  );
  const riseJd = sunEvent(jd0, lat, lon, C.SE_CALC_RISE);
  const setJd = sunEvent(jd0, lat, lon, C.SE_CALC_SET);
  if (!riseJd || !setJd) {
    throw new Error("The Sun does not rise and set here on this date");
  }
  const e = elongationAt(riseJd);
  return { dayStart, jd0, riseJd, setJd, e, tithiNo: Math.floor(e / 12) + 1 };
}

export function tithiHighlightKeys(tithiNo) {
  const inPaksha = tithiNo <= 15 ? tithiNo : tithiNo - 15;
  const shukla = tithiNo <= 15;
  const keys = [];
  if (tithiNo === 15) keys.push("purnima");
  if (tithiNo === 30) keys.push("amavasya");
  if (inPaksha === 11) keys.push("ekadashi");
  if (inPaksha === 13) keys.push("pradosh");
  if (tithiNo === 29) keys.push("shivratri");
  if (inPaksha === 4) keys.push(shukla ? "vinayaka" : "sankashti");
  return keys;
}

function buildChoghadiya(weekdayNo, sunrise, sunset, nextSunrise) {
  const start = CHOG_DAY_START[weekdayNo];
  const slot = (c, from, to) => ({
    name: c[0], nameHi: c[1], quality: c[2], from: hhmm(from), to: hhmm(to),
  });
  const dayMs = (sunset.toMillis() - sunrise.toMillis()) / 8;
  const day = Array.from({ length: 8 }, (_, i) =>
    slot(
      CHOG[(start + i) % 7],
      sunrise.plus({ milliseconds: dayMs * i }),
      sunrise.plus({ milliseconds: dayMs * (i + 1) })
    )
  );
  const nightStart = (start + 5) % 7;
  const nightMs = (nextSunrise.toMillis() - sunset.toMillis()) / 8;
  const night = Array.from({ length: 8 }, (_, i) =>
    slot(
      CHOG[(nightStart + 5 * i) % 7],
      sunset.plus({ milliseconds: nightMs * i }),
      sunset.plus({ milliseconds: nightMs * (i + 1) })
    )
  );
  return { day, night };
}

export function computePanchang({
  date, lat, lon, tz, natalMoonSignIndex = null, includeUpcoming = false,
}) {
  const core = dayCore(date, lat, lon, tz);
  const { dayStart, riseJd, setJd, e, tithiNo } = core;

  const sunrise = jdToLocal(riseJd, tz);
  const sunset = jdToLocal(setJd, tz);
  const nextRiseJd = sunEvent(setJd + 0.01, lat, lon, C.SE_CALC_RISE);
  const nextSunrise = nextRiseJd ? jdToLocal(nextRiseJd, tz) : sunrise.plus({ days: 1 });
  const dayMs = sunset.toMillis() - sunrise.toMillis();
  const weekdayNo = dayStart.weekday;

  const endInfo = (jd) => {
    if (!jd) return null;
    const dt = jdToLocal(jd, tz);
    return { time: hhmm(dt), nextDay: dt.toISODate() !== date };
  };

  // Tithi
  const inPaksha = tithiNo <= 15 ? tithiNo : tithiNo - 15;
  const shukla = tithiNo <= 15;
  const tithiName =
    inPaksha === 15
      ? shukla ? ["Purnima", "पूर्णिमा"] : ["Amavasya", "अमावस्या"]
      : TITHI_NAMES[inPaksha - 1];
  const tithiEndJd = findAdvance(elongationAt, riseJd, tithiNo * 12 - e);

  // Nakshatra
  const moonLon = moonAt(riseJd);
  const nakIdx = Math.floor(moonLon / NAK_SPAN);
  const pada = Math.floor((moonLon - nakIdx * NAK_SPAN) / (NAK_SPAN / 4)) + 1;
  const nakEndJd = findAdvance(moonAt, riseJd, (nakIdx + 1) * NAK_SPAN - moonLon);

  // Yoga
  const ySum = yogaSumAt(riseJd);
  const yogaIdx = Math.floor(ySum / NAK_SPAN);
  const yogaEndJd = findAdvance(yogaSumAt, riseJd, (yogaIdx + 1) * NAK_SPAN - ySum);

  // Karana (half a tithi)
  const karanaNo = Math.floor(e / 6);
  const karana =
    KARANA_FIXED[karanaNo] || KARANA_MOVABLE[(karanaNo - 1) % 7];
  const karanaEndJd = findAdvance(elongationAt, riseJd, (karanaNo + 1) * 6 - e);

  // Signs
  const moonSignIdx = Math.floor(moonLon / 30);
  const sunSignIdx = Math.floor(sunAt(riseJd) / 30);
  let moonIngress = null;
  const ingJd = findAdvance(moonAt, riseJd, (moonSignIdx + 1) * 30 - moonLon, 3);
  if (ingJd) {
    const dt = jdToLocal(ingJd, tz);
    if (dt.toISODate() === date) {
      const next = (moonSignIdx + 1) % 12;
      moonIngress = {
        time: hhmm(dt),
        sign: SIGNS[next].en,
        signHi: SIGNS[next].hi,
        signIndex: next,
      };
    }
  }

  // Inauspicious and auspicious windows
  const part = dayMs / 8;
  const eighth = (n) => range(
    sunrise.plus({ milliseconds: part * (n - 1) }),
    sunrise.plus({ milliseconds: part * n })
  );
  const mid = sunrise.plus({ milliseconds: dayMs / 2 });
  const abhijit =
    weekdayNo === 3
      ? null // traditionally not counted on Wednesdays
      : range(
          mid.minus({ milliseconds: dayMs / 30 }),
          mid.plus({ milliseconds: dayMs / 30 })
        );
  const brahma = range(
    sunrise.minus({ minutes: 96 }),
    sunrise.minus({ minutes: 48 })
  );

  const highlights = tithiHighlightKeys(tithiNo).map((k) => ({ key: k, ...HIGHLIGHTS[k] }));

  let upcoming;
  if (includeUpcoming) {
    upcoming = [];
    let lastKey = null;
    let lastDay = -10;
    for (let i = 1; i <= 35 && upcoming.length < 10; i++) {
      const d = dayStart.plus({ days: i });
      let t;
      try {
        t = dayCore(d.toISODate(), lat, lon, tz).tithiNo;
      } catch {
        continue;
      }
      for (const k of tithiHighlightKeys(t)) {
        // the same tithi can touch two sunrises in a row; list it once
        if (k === lastKey && i - lastDay <= 2) continue;
        lastKey = k;
        lastDay = i;
        upcoming.push({
          date: d.toISODate(),
          weekday: WEEKDAY_NAMES[d.weekday],
          key: k,
          ...HIGHLIGHTS[k],
        });
      }
    }
  }

  let gochar = null;
  if (Number.isInteger(natalMoonSignIndex) && natalMoonSignIndex >= 0 && natalMoonSignIndex < 12) {
    const house = ((moonSignIdx - natalMoonSignIndex + 12) % 12) + 1;
    const r = HOUSE_READING[house];
    gochar = {
      houseFromMoon: house, mood: r.mood, label: MOOD_LABEL[r.mood],
      theme: r.theme, text: r.text, stars: r.stars,
    };
  }

  return {
    date,
    weekday: { no: weekdayNo, ...WEEKDAY_NAMES[weekdayNo], ...WEEKDAY_INFO[weekdayNo] },
    sunrise: hhmm(sunrise),
    sunset: hhmm(sunset),
    tithi: {
      number: tithiNo,
      name: tithiName[0],
      nameHi: tithiName[1],
      paksha: shukla ? { en: "Shukla", hi: "शुक्ल" } : { en: "Krishna", hi: "कृष्ण" },
      ends: endInfo(tithiEndJd),
    },
    nakshatra: {
      name: NAKSHATRAS[nakIdx].en,
      nameHi: NAKSHATRAS[nakIdx].hi,
      pada,
      ends: endInfo(nakEndJd),
    },
    yoga: {
      name: YOGA_NAMES[yogaIdx][0],
      nameHi: YOGA_NAMES[yogaIdx][1],
      ends: endInfo(yogaEndJd),
    },
    karana: {
      name: karana[0],
      nameHi: karana[1],
      ends: endInfo(karanaEndJd),
    },
    sunSign: { sign: SIGNS[sunSignIdx].en, signHi: SIGNS[sunSignIdx].hi },
    moonSign: {
      index: moonSignIdx,
      sign: SIGNS[moonSignIdx].en,
      signHi: SIGNS[moonSignIdx].hi,
    },
    moonIngress,
    moonElongation: Number(e.toFixed(1)),
    kaal: {
      rahu: eighth(RAHU_PART[weekdayNo]),
      yamaganda: eighth(YAMA_PART[weekdayNo]),
      gulika: eighth(GULIKA_PART[weekdayNo]),
    },
    abhijit,
    brahma,
    choghadiya: buildChoghadiya(weekdayNo, sunrise, sunset, nextSunrise),
    highlights,
    ...(includeUpcoming ? { upcoming } : {}),
    gochar,
  };
}
