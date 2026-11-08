import test from "node:test";
import assert from "node:assert/strict";
import { computeKundli } from "../src/kundli.js";
import { buildFacts, proseOk, subPeriods } from "../src/report-facts.js";
import { generateFullReport, ai } from "../src/report-full.js";
import { cleanSections, parseReport } from "../src/report.js";

const birth = { year: 1995, month: 3, day: 14, hour: 9, minute: 30, lat: 28.6, lon: 77.2, tz: "Asia/Kolkata" };
const chart = computeKundli(birth);
const cards = { headline: "h", glance: "g", strengths: ["a"], watch: ["b"], focusTitle: "f", focus: ["x"], now: "n", tips: ["t"], closing: "c", labels: {} };

test("facts: 12 months with scores, windows, dosha checks, all from the engine", () => {
  const f = buildFacts(chart);
  assert.equal(f.months.length, 12);
  for (const m of f.months) { assert.ok(m.score >= 1 && m.score <= 5); assert.ok(["good", "steady", "careful"].includes(m.tag)); }
  assert.ok(["present", "mild", "not present"].includes(f.doshas.mangal.status));
  assert.ok(["present", "not present"].includes(f.doshas.kaalSarp.status));
  assert.ok(f.mahadashas.some((m) => m.current));
  assert.ok(f.windows.career.length > 0);
});

test("sub-periods add up to the mahadasha", () => {
  const md = chart.dasha.mahadashas[3];
  const sp = subPeriods(md);
  assert.equal(sp.length, 9);
  assert.ok(Math.abs(sp[8].end - new Date(md.end)) < 3 * 86400000);
});

test("without birth time, house-based windows are left out", () => {
  const f = buildFacts(chart, { timeUnknown: true });
  assert.deepEqual(f.windows, {});
  assert.equal(f.snapshot.lagna, null);
});

test("prose check refuses banned words and invented years", () => {
  const years = [2026, 2027];
  assert.equal(proseOk({ a: "A calm month in 2027." }, years), true);
  assert.equal(proseOk({ a: "Expect a big change in 2041." }, years), false);
  assert.equal(proseOk(["risk of death"], years), false);
  assert.equal(proseOk(["a divorce is likely"], years), false);
  assert.equal(proseOk(["मृत्यु का डर"], years), false);
});

test("full report: sections are complete, with AI text where valid and fixed text where not", async () => {
  const keep = { ...ai };
  ai.generateReport = async () => cards;
  let calls = 0;
  ai.generateJson = async ({ user }) => {
    calls++;
    if (user.includes('"months"') && user.includes("month-by-month") === false && user.includes("key")) { /* months step */ }
    if (user.includes("JSON shape") && user.includes('"months":[')) return { months: [{ key: "2026-11", text: "Good month for focus." }, { key: "2026-12", text: "Steady month." }] };
    if (user.includes('"windows":{')) return { windows: { career: ["Career text."], money: [], love: [] }, doshas: { mangal: "Mangal text.", kaalSarp: "Kaal text.", sadeSati: "Sade text." }, remedies: "Be kind.", dos: ["Walk"], donts: ["Rush"] };
    return { now: "You are in a good period.", periods: [{ lord: "Venus", text: "Venus text." }] };
  };
  try {
    const r = await generateFullReport({ name: "Asha", topic: "general", language: "en", chart, timeUnknown: false });
    const ids = r.sections.map((s) => s.id);
    assert.deepEqual(ids.slice(0, 4), ["snap", "now", "periods", "months"]); assert.equal(ids.at(-1), "planets");
    for (const id of ["career", "money", "love", "doshas", "remedies", "kit"]) assert.ok(ids.includes(id), id);
    const months = r.sections.find((s) => s.id === "months").blocks[0].rows;
    assert.equal(months.length, 12);
    assert.match(months[0].text, /Good month for focus/);
    assert.ok(r.sections.find((s) => s.id === "doshas").blocks[0].rows[0].text.includes("Mangal text"));
    assert.ok(calls >= 3);
    assert.equal(r.headline, "h"); // the summary cards are kept
    const again = parseReport(JSON.stringify(r)); // survives the round trip used by the PDF
    assert.equal(again.sections.length, r.sections.length);
  } finally { Object.assign(ai, keep); }
});

test("a step that writes an invented year is replaced by fixed text", async () => {
  const keep = { ...ai };
  ai.generateReport = async () => cards;
  ai.generateJson = async () => ({ months: [{ key: "2026-11", text: "Big change in 2041." }], now: "x in 2041", periods: [], windows: {}, doshas: {}, remedies: "r" });
  try {
    const r = await generateFullReport({ name: "A", topic: "general", language: "en", chart });
    const all = JSON.stringify(r.sections);
    assert.ok(!all.includes("2041"));
    assert.equal(r.sections.find((s) => s.id === "months").blocks[0].rows.length, 12);
  } finally { Object.assign(ai, keep); }
});

test("western charts keep the short report", async () => {
  const keep = { ...ai };
  ai.generateReport = async () => cards;
  try {
    const r = await generateFullReport({ name: "A", topic: "general", language: "en", tradition: "western", chart: { tradition: "western" } });
    assert.equal(r.sections, undefined);
  } finally { Object.assign(ai, keep); }
});

test("section cleaner drops unknown shapes", () => {
  const s = cleanSections([{ id: "x", title: "T", blocks: [{ type: "script", text: "x" }, { type: "p", text: "ok" }] }, { title: "", blocks: [] }]);
  assert.equal(s.length, 1);
  assert.equal(s[0].blocks.length, 1);
});
