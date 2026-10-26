import test from "node:test";
import assert from "node:assert/strict";
import { buildAbout, dignity } from "../src/about.js";

const chart = (over = {}) => ({
  tradition: "vedic",
  ascendant: { signIndex: 5 },
  planets: [
    { key: "Moon", signIndex: 11, house: 7, nakshatraIndex: 25, retrograde: false },
    { key: "Sun", signIndex: 0, house: 8, retrograde: false },
    { key: "Mars", signIndex: 3, house: 11, retrograde: false },
    { key: "Mercury", signIndex: 11, house: 7, retrograde: true },
  ],
  ...over,
});

test("dignity follows the classical signs", () => {
  assert.equal(dignity("Sun", 0), "exalted");
  assert.equal(dignity("Sun", 6), "debilitated");
  assert.equal(dignity("Mars", 7), "own");
  assert.equal(dignity("Sun", 2), null);
  assert.equal(dignity("Rahu", 2), null);
});

test("reading is built from real positions in every language", () => {
  for (const lang of ["en", "hi", "hn", "mr"]) {
    const a = buildAbout(chart(), { lang });
    assert.ok(a.rising.good && a.rising.grow);
    assert.equal(a.rising.signIndex, 5);
    assert.equal(a.love.signIndex, 11); // 7th from Virgo is Pisces
    assert.equal(a.career.signIndex, 2); // 10th from Virgo is Gemini
    assert.equal(a.star.lord, "Saturn"); // nakshatra 25 -> 25 % 9 = 7
    assert.equal(a.strong[0].planet, "Sun");
    assert.deepEqual(a.retro.planets, ["Mercury"]);
  }
});

test("without birth time nothing depends on the rising sign", () => {
  const a = buildAbout(chart(), { timeUnknown: true });
  assert.equal(a.rising, null);
  assert.equal(a.love, null);
  assert.equal(a.career, null);
  assert.ok(a.star);
});

test("every sign, star ruler and Mars house has text in all three languages", () => {
  for (let i = 0; i < 12; i++)
    for (const lang of ["en", "hi", "hn"]) {
      const a = buildAbout(chart({ ascendant: { signIndex: i } }), { lang });
      assert.ok(a.rising.good && a.love.text && a.career.text);
    }
  for (const h of [1, 2, 4, 7, 8, 12])
    for (const lang of ["en", "hi", "hn"]) {
      const a = buildAbout(chart({ planets: [{ key: "Moon", signIndex: 0, house: 1, nakshatraIndex: 0 }, { key: "Mars", signIndex: 0, house: h }] }), { lang });
      assert.ok(a.mars.text);
    }
  for (let n = 0; n < 27; n++) assert.ok(buildAbout(chart({ planets: [{ key: "Moon", signIndex: 0, house: 1, nakshatraIndex: n }, { key: "Mars", signIndex: 0, house: 3 }] })).star.text);
  assert.equal(buildAbout(chart({ tradition: "western" })), null);
});

test("big three, money, focus and the current sub-period are filled from the chart", () => {
  const c = chart({
    ascendant: { signIndex: 5 },
    planets: [
      { key: "Sun", signIndex: 3, house: 11, nakshatraIndex: 8 },
      { key: "Moon", signIndex: 11, house: 7, nakshatraIndex: 25 },
      { key: "Mars", signIndex: 5, house: 1 },
      { key: "Mercury", signIndex: 5, house: 1 },
      { key: "Venus", signIndex: 5, house: 1 },
    ],
    dasha: { current: { mahadasha: { lord: "Venus" }, antardasha: { lord: "Mercury", end: "2029-09-15" } } },
  });
  for (const lang of ["en", "hi", "hn"]) {
    const a = buildAbout(c, { lang });
    assert.equal(a.big3.sun.signIndex, 3);
    assert.equal(a.big3.moon.signIndex, 11);
    assert.equal(a.big3.rising.signIndex, 5);
    assert.equal(a.money.signIndex, 6); // 2nd from Virgo is Libra
    assert.equal(a.focus.house, 1);
    assert.equal(a.focus.n, 3);
    assert.ok(a.sub.text.includes("2029") && a.sub.bring);
  }
});
