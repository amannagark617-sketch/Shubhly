import test from "node:test";
import assert from "node:assert/strict";
import { ashtakoot, buildMatch, YONI_GRID, maitri, vashyaGroup } from "../src/match.js";

const total = (a, b) => ashtakoot(a, b).reduce((s, r) => s + r.score, 0);
const m = (signIndex, nakshatraIndex, deg = 10) => ({ signIndex, nakshatraIndex, deg });

test("the eight points add up to 36", () => {
  assert.equal(ashtakoot(m(0, 0), m(1, 3)).reduce((s, r) => s + r.max, 0), 36);
});

test("the score is the same whoever goes first", () => {
  for (let n1 = 0; n1 < 27; n1 += 2)
    for (let n2 = 1; n2 < 27; n2 += 3) {
      const a = m(Math.floor(n1 / 2.25), n1), b = m(Math.floor(n2 / 2.25), n2);
      assert.equal(total(a, b), total(b, a), `${n1} ${n2}`);
    }
});

test("the same Moon twice scores everything except Nadi", () => {
  assert.equal(total(m(4, 9), m(4, 9)), 28);
});

test("Nadi is zero for the same type and eight otherwise", () => {
  assert.equal(ashtakoot(m(0, 0), m(5, 5)).find((r) => r.key === "nadi").score, 0);
  assert.equal(ashtakoot(m(0, 0), m(1, 1)).find((r) => r.key === "nadi").score, 8);
});

test("Bhakoot: 6/8 is flagged, and cancels when the lords are the same", () => {
  assert.equal(ashtakoot(m(0, 0), m(5, 5)).find((r) => r.key === "bhakoot").score, 0); // Aries-Virgo = 6/8, Mars-Mercury
  assert.equal(ashtakoot(m(1, 3), m(6, 14)).find((r) => r.key === "bhakoot").score, 0 + 7 * 0 + 7); // Taurus-Libra, both Venus
});

test("yoni table is symmetric and a pair of the same animal is 4", () => {
  for (let i = 0; i < 14; i++) {
    assert.equal(YONI_GRID[i][i], 4);
    for (let j = 0; j < 14; j++) assert.equal(YONI_GRID[i][j], YONI_GRID[j][i]);
  }
});

test("graha maitri and vashya", () => {
  assert.equal(maitri("Sun", "Moon"), 5);
  assert.equal(maitri("Sun", "Sun"), 5);
  assert.equal(maitri("Sun", "Venus"), 0);
  assert.equal(vashyaGroup(8, 5), 0);
  assert.equal(vashyaGroup(8, 20), 1);
});

test("a full match has text in every language", () => {
  const chart = (sign, nak) => ({ planets: [{ key: "Moon", signIndex: sign, degInSign: 8, nakshatraIndex: nak }] });
  for (const lang of ["en", "hi", "hn", "mr"]) {
    const r = buildMatch(chart(0, 0), chart(6, 15), { lang });
    assert.equal(r.items.length, 8);
    assert.ok(r.verdict && r.summary && r.items.every((i) => i.name && i.text && i.measures));
  }
});

test("areas, people and Mars check are filled", () => {
  const chart = (sign, nak, mars) => ({ manglikFromLagna: mars, planets: [{ key: "Moon", signIndex: sign, degInSign: 8, nakshatraIndex: nak }] });
  for (const lang of ["en", "hi", "hn"]) {
    const r = buildMatch(chart(0, 0, true), chart(6, 15, false), { lang });
    assert.equal(r.areas.length, 4);
    assert.ok(r.areas.every((a) => a.pct >= 0 && a.pct <= 100 && a.text));
    assert.equal(r.people.length, 2);
    assert.ok(r.mangal && r.best);
    assert.equal(buildMatch(chart(0, 0, true), chart(6, 15, false), { lang, timeUnknown: [true, false] }).mangal, null);
  }
});
