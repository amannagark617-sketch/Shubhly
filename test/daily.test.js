import test from "node:test";
import assert from "node:assert/strict";
import { computePanchang } from "../src/panchang.js";
import { buildDailyHoroscope, houseFromMoon, tithiGroup } from "../src/horoscope.js";
import { sadeSati, saturnWindow, slowPlanets } from "../src/transits.js";
import { computeKundli } from "../src/kundli.js";
import * as content from "../src/content.js";
import { quickInsights } from "../src/insights.js";
import { InputError, parseMoonIndex, parseQueryDate, parseQueryPlace } from "../src/validate.js";

const DELHI = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };
const pan = (date, extra = {}) => computePanchang({ date, ...DELHI, ...extra });

// ---- panchang against well-known festival days ---------------------------
test("Holi 2024 morning: Shukla Purnima, ending near 12:30", () => {
  const p = pan("2024-03-25");
  assert.equal(p.tithi.number, 15);
  assert.equal(p.tithi.name, "Purnima");
  assert.equal(p.tithi.paksha.en, "Shukla");
  assert.equal(p.tithi.ends.time, "12:30");
  assert.deepEqual(p.highlights.map((h) => h.key), ["purnima"]);
});

test("Maha Shivratri 2024 (9 March): Krishna Chaturdashi", () => {
  const p = pan("2024-03-09");
  assert.equal(p.tithi.number, 29);
  assert.ok(p.highlights.some((h) => h.key === "shivratri"));
});

test("Ram Navami 2024: Shukla Navami, Wednesday has no Abhijit", () => {
  const p = pan("2024-04-17");
  assert.equal(p.tithi.name, "Navami");
  assert.equal(p.weekday.en, "Wednesday");
  assert.equal(p.abhijit, null);
});

test("Delhi sunrise and sunset on 25 Oct 2026 are about 06:30 and 17:40", () => {
  const p = pan("2026-10-25");
  const mins = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  assert.ok(Math.abs(mins(p.sunrise) - (6 * 60 + 30)) <= 5, p.sunrise);
  assert.ok(Math.abs(mins(p.sunset) - (17 * 60 + 40)) <= 5, p.sunset);
});

test("rahu kaal is the 8th part of the day on Sunday and the 2nd on Monday", () => {
  const sun = pan("2026-10-25");
  assert.equal(sun.kaal.rahu.to, sun.sunset);
  const mon = pan("2026-10-26");
  const mins = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const part = (mins(mon.sunset) - mins(mon.sunrise)) / 8;
  assert.ok(Math.abs(mins(mon.kaal.rahu.from) - (mins(mon.sunrise) + part)) <= 1);
});

test("Moon ingress time matches the end of the nakshatra when both fall on the sign edge", () => {
  const p = pan("2026-10-25"); // Moon leaves Revati and Pisces together
  assert.equal(p.nakshatra.name, "Revati");
  assert.equal(p.moonIngress.sign, "Aries");
  assert.equal(p.moonIngress.time, p.nakshatra.ends.time);
});

test("choghadiya follows the standard Sunday tables", () => {
  const p = pan("2026-10-25");
  assert.deepEqual(
    p.choghadiya.day.map((c) => c.name),
    ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"]
  );
  assert.deepEqual(
    p.choghadiya.night.map((c) => c.name),
    ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh"]
  );
  assert.equal(p.choghadiya.day[0].from, p.sunrise);
  assert.equal(p.choghadiya.day[7].to, p.sunset);
});

test("choghadiya on Monday starts with Amrit", () => {
  assert.equal(pan("2026-10-26").choghadiya.day[0].name, "Amrit");
});

test("nakshatra at sunrise agrees with the kundli engine for the same moment", () => {
  const p = pan("2026-10-25");
  const [h, m] = p.sunrise.split(":").map(Number);
  const k = computeKundli({ year: 2026, month: 10, day: 25, hour: h, minute: m, ...DELHI });
  assert.equal(k.nakshatra.name, p.nakshatra.name);
});

test("upcoming vrat days are in date order and inside 35 days", () => {
  const p = pan("2026-10-25", { includeUpcoming: true });
  assert.ok(p.upcoming.length >= 5);
  const dates = p.upcoming.map((u) => u.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(p.upcoming[0].key, "purnima"); // full moon on 26 Oct 2026
});

test("no sunrise in polar summer is reported clearly", () => {
  assert.throws(
    () => computePanchang({ date: "2026-06-21", lat: 80, lon: 10, tz: "Europe/Oslo" }),
    /does not rise/
  );
});

test("an invalid date is rejected", () => {
  assert.throws(() => pan("2026-02-31"));
});

// ---- daily horoscope ---------------------------------------------------------
test("horoscope has all twelve rashis with valid ratings", () => {
  const h = buildDailyHoroscope({ date: "2026-10-25", ...DELHI });
  assert.equal(h.rashis.length, 12);
  for (const r of h.rashis) {
    assert.ok(r.text.length > 40 && r.trait.length > 10);
    for (const v of Object.values(r.stars)) assert.ok(v >= 1 && v <= 5);
    assert.ok(Number.isInteger(r.lucky.number));
  }
});

test("Moon house is counted from each rashi (own sign is house 1)", () => {
  const h = buildDailyHoroscope({ date: "2026-10-25", ...DELHI }); // Moon in Pisces
  assert.equal(h.moonSign.sign, "Pisces");
  assert.equal(h.rashis[11].house, 1);
  assert.equal(h.rashis[0].house, 12); // Pisces is the 12th sign from Aries
  assert.equal(h.rashis[10].house, 2); // and the 2nd from Aquarius
  assert.equal(houseFromMoon(3, 11), 9);
});

test("tithi groups follow Nanda, Bhadra, Jaya, Rikta, Purna", () => {
  assert.equal(tithiGroup(1), "Nanda");
  assert.equal(tithiGroup(4), "Rikta");
  assert.equal(tithiGroup(15), "Purna");
  assert.equal(tithiGroup(30), "Purna");
  assert.equal(tithiGroup(19), "Rikta"); // Krishna Chaturthi
});

test("horoscope text stays calm: no fear words anywhere in the content tables", () => {
  const banned = /\b(death|maut|mrityu|marna|accident|durghatna|bimari|bimaar|cancer|curse|shraap|barbaad|tabah|tabaahi|dhokha|jail|divorce|talaak|nuksaan hoga|guarantee)\b/i;
  const everything = JSON.stringify([
    content.HOUSE_READING, content.TITHI_TONE, content.RASHI_TRAIT,
    content.DASHA_THEME, content.SADE_SATI, content.HIGHLIGHTS, content.WEEKDAY_INFO,
  ]);
  assert.ok(!banned.test(everything), everything.match(banned)?.[0]);
});

// ---- transits ------------------------------------------------------------------------
test("Saturn is in Pisces on 25 Oct 2026, from late Mar 2025 to early Jun 2027", () => {
  const slow = slowPlanets("2026-10-25", "Asia/Kolkata");
  assert.equal(slow.Saturn.sign, "Pisces");
  assert.equal(slow.Rahu.sign, "Aquarius");
  assert.equal(slow.Ketu.sign, "Leo");
  const w = saturnWindow("2026-10-25", "Asia/Kolkata");
  assert.equal(w.entered, "2025-03-29");
  assert.ok(w.leaves >= "2027-05-30" && w.leaves <= "2027-06-05", w.leaves);
});

test("Sade Sati and Dhaiya are matched to the right Moon signs for Saturn in Pisces", () => {
  const pisces = 11;
  assert.equal(sadeSati(0, pisces).key, "rising"); // Aries
  assert.equal(sadeSati(11, pisces).key, "peak"); // Pisces
  assert.equal(sadeSati(10, pisces).key, "setting"); // Aquarius
  assert.equal(sadeSati(8, pisces).key, "kantak"); // Sagittarius
  assert.equal(sadeSati(4, pisces).key, "ashtam"); // Leo
  assert.equal(sadeSati(2, pisces).key, "none");
  assert.equal(sadeSati(11, pisces).active, true);
  assert.equal(sadeSati(2, pisces).active, false);
});

// ---- insights and inputs ----------------------------------------------------------------
test("quick insights hide lagna and dasha when the birth time is unknown", () => {
  const chart = computeKundli(
    { year: 2001, month: 7, day: 26, hour: 12, minute: 0, ...DELHI },
    new Date("2026-10-25T00:00:00Z")
  );
  const known = quickInsights(chart);
  assert.ok(known.lagna && known.rashi && known.dasha.text);
  const unknown = quickInsights(chart, { timeUnknown: true });
  assert.equal(unknown.lagna, null);
  assert.equal(unknown.dasha, null);
  assert.ok(unknown.rashi);
});

test("query parsing: defaults, bounds and bad input", () => {
  assert.equal(parseQueryPlace({}).tz, "Asia/Kolkata");
  assert.throws(() => parseQueryPlace({ lat: "99", lon: "10", tz: "Asia/Kolkata" }), InputError);
  assert.throws(() => parseQueryPlace({ lat: "10", lon: "10", tz: "Nope/Zone" }), InputError);
  assert.equal(parseQueryDate({ date: "2026-10-25" }, "Asia/Kolkata"), "2026-10-25");
  assert.throws(() => parseQueryDate({ date: "25-10-2026" }, "Asia/Kolkata"), InputError);
  assert.throws(() => parseQueryDate({ date: "1800-01-01" }, "Asia/Kolkata"), InputError);
  assert.equal(parseMoonIndex(undefined), null);
  assert.equal(parseMoonIndex("5"), 5);
  assert.throws(() => parseMoonIndex("12"), InputError);
  assert.throws(() => parseMoonIndex("abc"), InputError);
});

// ---- languages -----------------------------------------------------------------------
import { getContent } from "../src/content.js";

test("English and Hindi tables cover every key the Hinglish tables have", () => {
  const base = getContent("hn");
  for (const lang of ["en", "hi"]) {
    const c = getContent(lang);
    assert.equal(c.RASHI_TRAIT.length, 12);
    assert.equal(c.LAGNA.length, 12);
    assert.equal(c.RASHI.length, 12);
    for (const k of Object.keys(base.HOUSE_READING)) {
      assert.ok(c.HOUSE_READING[k].text.length > 30 && c.HOUSE_READING[k].theme, `${lang} house ${k}`);
    }
    for (const k of Object.keys(base.HIGHLIGHTS)) assert.ok(c.HIGHLIGHTS[k].note, `${lang} ${k}`);
    for (const k of Object.keys(base.DASHA_THEME)) assert.ok(c.DASHA_THEME[k], `${lang} ${k}`);
    for (const k of Object.keys(base.SADE_SATI.states)) assert.ok(c.SADE_SATI.states[k].title, `${lang} ${k}`);
    assert.deepEqual(Object.keys(c.TITHI_TONE).sort(), Object.keys(base.TITHI_TONE).sort());
  }
});

test("the horoscope and panchang switch language", () => {
  const en = buildDailyHoroscope({ date: "2026-10-25", ...DELHI, lang: "en" });
  const hi = buildDailyHoroscope({ date: "2026-10-25", ...DELHI, lang: "hi" });
  assert.match(en.rashis[0].text, /^[\x00-\x7F’]+$/);
  assert.match(hi.rashis[0].text, /[ऀ-ॿ]/);
  assert.equal(en.rashis[0].stars.love, hi.rashis[0].stars.love);
  assert.equal(pan("2026-10-25", { lang: "en" }).weekday.note.includes("Sunday"), true);
});

test("English wording stays calm", () => {
  const banned = /\b(death|die|accident|illness|curse|ruin|doom|divorce|guarantee)\b/i;
  const text = JSON.stringify(getContent("en")).replace(/Cancer/g, "Karka");
  assert.ok(!banned.test(text), text.match(banned)?.[0]);
});
