import test from "node:test";
import assert from "node:assert/strict";
import { skyRange, MEANING } from "../src/sky.js";

test("planets are placed on the zodiac and the nodes sit opposite each other", () => {
  const r = skyRange("2026-10-26", 5);
  assert.equal(r.planets.length, 9);
  for (const p of r.planets) {
    assert.equal(p.lon.length, 5);
    assert.ok(p.lon.every((x) => x >= 0 && x < 360));
  }
  const rahu = r.planets.find((p) => p.key === "Rahu").lon[0];
  const ketu = r.planets.find((p) => p.key === "Ketu").lon[0];
  assert.ok(Math.abs(((rahu - ketu + 540) % 360) - 180) < 0.02);
});

test("known positions: Moon in Aries on 26 Oct 2026 and Saturn in Pisces going backward", () => {
  const r = skyRange("2026-10-26", 1);
  const get = (k) => r.planets.find((p) => p.key === k);
  assert.equal(Math.floor(get("Moon").lon[0] / 30), 0);
  assert.equal(Math.floor(get("Saturn").lon[0] / 30), 11);
  assert.equal(get("Saturn").retro[0], true);
});

test("every planet has a meaning in each language", () => {
  for (const L of ["en", "hi", "hn"]) for (const k of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]) assert.ok(MEANING[L][k]);
});
