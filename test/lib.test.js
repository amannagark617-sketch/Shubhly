import test from "node:test";
import assert from "node:assert/strict";
import { chartSvg, renderMarkdown } from "../public/lib.js";
import { computeKundli } from "../src/kundli.js";
import { cleanName, parseBirthInput, InputError } from "../src/validate.js";

const chart = computeKundli(
  { year: 1990, month: 5, day: 17, hour: 9, minute: 30, lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  new Date("2026-10-25T00:00:00Z")
);

test("chart svg shows all 12 rashi numbers and every planet once", () => {
  const svg = chartSvg(chart);
  for (let n = 1; n <= 12; n++) assert.ok(svg.includes(`>${n}</text>`), `missing ${n}`);
  for (const code of ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"]) {
    assert.equal(svg.split(code).length - 1, 1, `${code} should appear once`);
  }
});

test("markdown escapes html and builds headings and lists", () => {
  const out = renderMarkdown("## Title\n- <img src=x onerror=alert(1)>\n- two\n\n**bold** text");
  assert.ok(out.includes("<h2>Title</h2>"));
  assert.ok(out.includes("&lt;img"));
  assert.ok(!out.includes("<img"));
  assert.ok(out.includes("<strong>bold</strong>"));
  assert.equal(out.split("<li>").length - 1, 2);
});

test("names are cleaned of markup and capped", () => {
  assert.equal(cleanName("Aman <script>"), "Aman script");
  assert.equal(cleanName(""), "Friend");
  assert.ok(cleanName("a".repeat(100)).length <= 40);
  assert.equal(cleanName("आमन"), "आमन");
});

test("birth input validation rejects bad data", () => {
  const ok = { date: "1990-05-17", time: "09:30", place: { lat: 19, lon: 72, tz: "Asia/Kolkata" } };
  assert.equal(parseBirthInput(ok).year, 1990);
  assert.throws(() => parseBirthInput({ ...ok, date: "17-05-1990" }), InputError);
  assert.throws(() => parseBirthInput({ ...ok, time: "25:00" }), InputError);
  assert.throws(() => parseBirthInput({ ...ok, place: { lat: 999, lon: 72, tz: "Asia/Kolkata" } }), InputError);
  assert.throws(() => parseBirthInput({ ...ok, place: { lat: 19, lon: 72, tz: "Bad/Zone" } }), InputError);
  assert.throws(() => parseBirthInput({ ...ok, date: "1800-01-01" }), InputError);
});
