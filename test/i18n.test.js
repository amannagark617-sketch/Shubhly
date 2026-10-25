import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { STR, LANGS } from "../public/i18n.js";

const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");

test("every page key exists in every language", () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i(?:-ph|-aria)?="([\w]+)"/g)) keys.add(m[1]);
  for (const m of app.matchAll(/\bt\("(\w+)"[,)]/g)) keys.add(m[1]);
  for (const l of LANGS) {
    for (const k of keys) assert.ok(STR[l][k], `${l} is missing "${k}"`);
  }
  for (const k of ["Amrit", "Shubh", "Labh", "Chal", "Udveg", "Rog", "Kaal"]) {
    for (const l of LANGS) assert.ok(STR[l]["chog_" + k], `${l} chog_${k}`);
  }
});

test("every language has exactly the same keys", () => {
  const hn = Object.keys(STR.hn).sort();
  for (const l of LANGS) assert.deepEqual(Object.keys(STR[l]).sort(), hn, l);
});

test("placeholders match the English text in every language", () => {
  const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const l of LANGS) for (const k of Object.keys(STR.en)) assert.equal(vars(STR[l][k]), vars(STR.en[k]), `${l} ${k}`);
});

test("Hindi strings are written in Devanagari and English ones have none", () => {
  for (const k of Object.keys(STR.hn)) {
    if (["hero_h", "card_footer"].includes(k)) continue;
    assert.ok(!/[ऀ-ॿ]/.test(STR.en[k]), `en ${k}`);
  }
});
