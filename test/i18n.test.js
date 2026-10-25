import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { STR } from "../public/i18n.js";

const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");

test("every page key exists in English, Hindi and Hinglish", () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i(?:-ph|-aria)?="([\w]+)"/g)) keys.add(m[1]);
  for (const m of app.matchAll(/\bt\("(\w+)"[,)]/g)) keys.add(m[1]);
  for (const l of ["en", "hi", "hn"]) {
    for (const k of keys) assert.ok(STR[l][k], `${l} is missing "${k}"`);
  }
  for (const k of ["Amrit", "Shubh", "Labh", "Chal", "Udveg", "Rog", "Kaal"]) {
    for (const l of ["en", "hi", "hn"]) assert.ok(STR[l]["chog_" + k], `${l} chog_${k}`);
  }
});

test("English and Hindi have no keys the Hinglish set lacks, and vice versa", () => {
  const hn = Object.keys(STR.hn).sort();
  assert.deepEqual(Object.keys(STR.en).sort(), hn);
  assert.deepEqual(Object.keys(STR.hi).sort(), hn);
});

test("Hindi strings are written in Devanagari and English ones have none", () => {
  for (const k of Object.keys(STR.hn)) {
    if (["hero_h", "card_footer"].includes(k)) continue;
    assert.ok(!/[ऀ-ॿ]/.test(STR.en[k]), `en ${k}`);
  }
});
