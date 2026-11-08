import test from "node:test";
import assert from "node:assert/strict";
import { computeKundli } from "../src/kundli.js";
import { generateMatchReport, cleanMatchReport, marriageTiming, ai } from "../src/match-report.js";
import { pricesFromEnv } from "../src/pricing.js";

const a = computeKundli({ year: 1995, month: 3, day: 14, hour: 9, minute: 30, lat: 28.6, lon: 77.2, tz: "Asia/Kolkata" });
const b = computeKundli({ year: 1996, month: 8, day: 2, hour: 17, minute: 10, lat: 19.07, lon: 72.87, tz: "Asia/Kolkata" });

test("the Milan report costs 169 rupees unless PRICE_MILAN_RUPEES says otherwise", () => {
  assert.equal(pricesFromEnv({}).milan, 16900);
  assert.equal(pricesFromEnv({ PRICE_MILAN_RUPEES: "149" }).milan, 14900);
});

test("couple's report: fixed text when the AI fails, remedies only for weak points", async () => {
  const keep = ai.generateJson;
  ai.generateJson = async () => { throw Object.assign(new Error("boom"), { status: 500 }); };
  try {
    const r = await generateMatchReport({ names: ["Asha", "Rahul"], chartA: a, chartB: b, language: "en" });
    assert.ok(r.headline && r.glance && r.talk.length >= 3 && r.family.length >= 2);
    assert.equal(r.needs.length, 2);
    assert.equal(r.needs[0].name, "Asha");
    assert.ok(r.remedies.length > 0 && r.remedies.every((x) => x.text));
    assert.ok(r.timing.known && r.timing.note);
  } finally { ai.generateJson = keep; }
});

test("couple's report: AI text that names a year is thrown away", async () => {
  const keep = ai.generateJson;
  ai.generateJson = async () => ({ headline: "In 2031 you will marry", glance: "x", needs: [], talk: ["a", "b"], family: ["c", "d"], first: "f", closing: "c" });
  try {
    const r = await generateMatchReport({ names: ["A", "B"], chartA: a, chartB: b });
    assert.ok(!/2031/.test(r.headline));
  } finally { ai.generateJson = keep; }
});

test("without a birth time for one person, marriage timing is left out", () => {
  const t = marriageTiming(a, b, { timeUnknown: [false, true] });
  assert.equal(t.known, false);
  assert.deepEqual(t.shared, []);
});

test("cleanMatchReport keeps only the expected shape and lengths", () => {
  const c = cleanMatchReport({ headline: "x".repeat(900), needs: [1, 2, 3], talk: "no", extra: "drop", remedies: [{ name: "n", text: "t" }, { name: "n" }] });
  assert.equal(c.headline.length, 200);
  assert.equal(c.needs.length, 2);
  assert.deepEqual(c.talk, []);
  assert.equal(c.remedies.length, 1);
  assert.equal("extra" in c, false);
});
