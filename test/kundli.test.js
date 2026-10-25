import test from "node:test";
import assert from "node:assert/strict";
import { computeKundli } from "../src/kundli.js";

// Well-known reference chart: India's independence, 15 Aug 1947, 00:00 IST, New Delhi.
const k = computeKundli(
  {
    year: 1947, month: 8, day: 15, hour: 0, minute: 0,
    lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata",
  },
  new Date("2026-10-25T00:00:00Z")
);

const planet = (n) => k.planets.find((p) => p.key === n);

test("lagna is Taurus", () => assert.equal(k.ascendant.sign, "Taurus"));
test("Sun in Cancer", () => assert.equal(planet("Sun").sign, "Cancer"));
test("Moon in Cancer, Pushya nakshatra", () => {
  assert.equal(planet("Moon").sign, "Cancer");
  assert.equal(k.nakshatra.name, "Pushya");
  assert.equal(k.nakshatra.lord, "Saturn");
});
test("Mars Gemini, Jupiter Libra, Venus Cancer, Saturn Cancer", () => {
  assert.equal(planet("Mars").sign, "Gemini");
  assert.equal(planet("Jupiter").sign, "Libra");
  assert.equal(planet("Venus").sign, "Cancer");
  assert.equal(planet("Saturn").sign, "Cancer");
});
test("Rahu in Taurus, Ketu opposite in Scorpio", () => {
  assert.equal(planet("Rahu").sign, "Taurus");
  assert.equal(planet("Ketu").sign, "Scorpio");
});
test("houses are whole-sign from lagna", () => {
  assert.equal(k.houses[0].sign, "Taurus");
  assert.equal(k.houses[11].sign, "Aries");
  assert.equal(planet("Moon").house, 3);
});
test("dasha starts with Saturn, balance ~18 years", () => {
  assert.equal(k.dasha.startLord, "Saturn");
  assert.ok(k.dasha.balanceYears > 17.8 && k.dasha.balanceYears < 18.3);
  assert.equal(k.dasha.mahadashas[1].lord, "Mercury");
});
test("current dasha found for a living date", () => {
  assert.ok(k.dasha.current);
  assert.ok(k.dasha.current.antardasha);
});
test("invalid date rejected", () => {
  assert.throws(() =>
    computeKundli({ year: 2000, month: 2, day: 31, hour: 1, minute: 0, lat: 28, lon: 77, tz: "Asia/Kolkata" })
  );
});
