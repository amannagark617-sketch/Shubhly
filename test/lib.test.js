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
  assert.ok(out.includes("<h3>Title</h3>"));
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

import { fmt12, inSlot, addDays, moonSvg, dots } from "../public/lib.js";

test("fmt12 formats clock times", () => {
  assert.equal(fmt12("00:05"), "12:05 AM");
  assert.equal(fmt12("06:32"), "6:32 AM");
  assert.equal(fmt12("12:00"), "12:00 PM");
  assert.equal(fmt12("17:38"), "5:38 PM");
});

test("inSlot handles slots that cross midnight", () => {
  assert.ok(inSlot("07:00", { from: "06:00", to: "07:30" }));
  assert.ok(!inSlot("07:30", { from: "06:00", to: "07:30" }));
  assert.ok(inSlot("00:30", { from: "23:00", to: "01:00" }));
  assert.ok(!inSlot("12:00", { from: "23:00", to: "01:00" }));
});

test("addDays crosses month and year ends", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("moonSvg draws new, half and full moons and mirrors the waning side", () => {
  assert.ok(moonSvg(180).includes("<svg"));
  assert.ok(moonSvg(90).includes("<path"));
  assert.ok(!moonSvg(90).includes("scale(-1 1)"));
  assert.ok(moonSvg(270).includes("scale(-1 1)"));
});

test("dots fills n of 5", () => {
  assert.equal((dots(3).match(/class="on"/g) || []).length, 3);
  assert.equal((dots(3).match(/<i /g) || []).length, 5);
});
