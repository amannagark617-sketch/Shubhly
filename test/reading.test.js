import test from "node:test";
import assert from "node:assert/strict";
import { buildReading } from "../src/reading.js";

const mk = (signIndex, tradition = "vedic") => ({
  tradition,
  planets: [{ key: "Moon", signIndex }],
  sunSign: { signIndex },
  dasha: {
    current: { mahadasha: { start: "2020-01-01" } },
    mahadashas: [
      { lord: "Venus", start: "2020-01-01", end: "2040-01-01" },
      { lord: "Sun", start: "2040-01-01", end: "2046-01-01" },
    ],
  },
});

test("every sign and language has a reading", () => {
  for (const lang of ["en", "hi", "hn", "mr"])
    for (let i = 0; i < 12; i++) {
      const r = buildReading(mk(i), { lang, today: "2026-01-01" });
      assert.ok(r.strengths.length >= 1 && r.growth);
      assert.ok(r.lucky.mantra);
    }
});

test("Jupiter text exists for all 12 houses", () => {
  for (let h = 0; h < 12; h++) {
    const r = buildReading(mk(0), { jupiter: { index: h, leaves: "2027-01-01" }, today: "2026-01-01" });
    assert.ok(r.jupiter.text);
  }
});

test("periods skip finished ones and flag the current", () => {
  const r = buildReading(mk(3), { today: "2041-01-01" });
  assert.equal(r.periods.length, 1);
  assert.equal(r.periods[0].lord, "Sun");
  assert.equal(buildReading(mk(3), { today: "2026-01-01" }).periods[0].current, true);
});

test("no periods without birth time; western has no periods", () => {
  assert.equal(buildReading(mk(3), { timeUnknown: true, today: "2026-01-01" }).periods.length, 0);
  const w = buildReading(mk(3, "western"), { today: "2026-01-01" });
  assert.equal(w.periods.length, 0);
  assert.ok(w.strengths.length);
});
