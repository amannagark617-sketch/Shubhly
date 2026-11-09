import test from "node:test";
import assert from "node:assert/strict";
import { teaseKundli, teaseMatch } from "../src/teaser.js";

test("free kundli keeps the signs and today's chapter, drops later chapters and the details", () => {
  const out = teaseKundli({
    about: { big3: {}, star: { text: "s" }, money: { text: "m" }, love: { text: "l" }, career: { text: "c" }, focus: { text: "f" }, sub: { text: "x", bring: "b", watch: "w" }, strong: [1], tested: [1, 2], mars: null, retro: null },
    reading: { basis: "moon", strengths: ["a", "b", "c"], growth: "g", lucky: {}, jupiter: { text: "j" }, periods: [{ lord: "Jupiter", current: true, from: "2011", to: "2027", bring: "b", watch: "w" }, { lord: "Saturn", current: false }] },
  }, "en", "");
  assert.deepEqual(Object.keys(out.about).sort(), ["big3", "caution", "star"]);
  assert.equal(out.reading.periods.length, 1);
  assert.equal(out.reading.jupiter, null);
  assert.equal(out.reading.strengths.length, 2);
});

test("free kundli keeps only the answer for the problem the visitor picked", () => {
  const out = teaseKundli({ about: { big3: {}, star: {}, love: { text: "l" }, money: { text: "m" }, sub: { text: "x", bring: "b", watch: "w" }, tested: [] }, reading: null }, "en", "marriage");
  assert.equal(out.about.love.text, "l");
  assert.equal(out.about.money, undefined);
  assert.equal(out.about.sub.bring, "");
});

test("free Milan keeps the scores and hides the reasons", () => {
  const r = teaseMatch({ areas: [{ name: "a", pct: 50, text: "t" }], items: [{ key: "x", name: "X", text: "t1" }, { key: "y", name: "Y", text: "t2" }, { key: "z", name: "Z", text: "t3" }], best: "x", care: "y", people: [{ strength: "s", grow: "g" }], mangal: "m", total: 19 }, "en");
  assert.equal(r.total, 19);
  assert.equal(r.areas[0].text, "");
  assert.equal(r.items.find((i) => i.key === "z").text, "");
  assert.equal(r.items.find((i) => i.key === "x").text, "t1");
  assert.match(r.items.find((i) => i.key === "y").text, /couple's report/);
  assert.equal(r.people[0].grow, "");
});
