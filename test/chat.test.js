import test from "node:test";
import assert from "node:assert/strict";
import { FreeChats, parseMessages, parseClientId, parseGuide, drawCards, guideReply, buildChatInstruction } from "../src/chat.js";
import { GUIDES, isResting, backAt, avatarSvg, istHour } from "../public/guides.js";
import { InputError } from "../src/validate.js";
import { computeKundli } from "../src/kundli.js";

test("free messages run out after the limit and are counted per device", () => {
  const f = new FreeChats(5);
  for (let i = 0; i < 5; i++) { assert.equal(f.left("aaaaaaaa"), 5 - i); f.use("aaaaaaaa"); }
  assert.equal(f.left("aaaaaaaa"), 0);
  assert.equal(f.left("bbbbbbbb"), 5);
});

test("the free-message table does not grow without limit", () => {
  const f = new FreeChats(5, 3);
  for (const id of ["a", "b", "c", "d"]) f.use(id);
  assert.equal(f.used.size, 3);
  assert.equal(f.left("a"), 5);
});

test("messages are cleaned and must end with the person's question", () => {
  const m = parseMessages([{ role: "model", text: "hi" }, { role: "user", text: "  hello   there " }]);
  assert.deepEqual(m, [{ role: "user", text: "hello there" }]);
  assert.throws(() => parseMessages([]), InputError);
  assert.throws(() => parseMessages([{ role: "user", text: "a" }, { role: "model", text: "b" }]), InputError);
  assert.equal(parseMessages([{ role: "user", text: "x".repeat(5000) }])[0].text.length, 600);
  assert.equal(parseMessages(Array.from({ length: 40 }, () => ({ role: "user", text: "q" }))).length, 12);
});

test("guide and device ids are checked", () => {
  assert.throws(() => parseGuide("nobody"), InputError);
  assert.throws(() => parseGuide("__proto__"), InputError);
  assert.equal(parseGuide("meera").name, "Meera");
  assert.throws(() => parseClientId("short"), InputError);
  assert.throws(() => parseClientId("has spaces and <b>"), InputError);
  assert.equal(parseClientId("abcd1234-ef"), "abcd1234-ef");
});

test("there are ten guides, each with all texts and a drawn avatar", () => {
  assert.equal(GUIDES.length, 10);
  assert.equal(new Set(GUIDES.map((g) => g.id)).size, 10);
  for (const g of GUIDES) {
    for (const l of ["en", "hi", "hn"]) {
      assert.ok(g.role[l] && g.blurb[l], `${g.id} ${l}`);
      assert.equal(g.starters[l].length, 2, `${g.id} starters ${l}`);
    }
    assert.match(avatarSvg(g.look), /^<svg/);
  }
});

test("rest windows follow India time, including overnight ones", () => {
  const meera = GUIDES.find((g) => g.id === "meera"); // 23 to 3
  const at = (h) => new Date(Date.UTC(2026, 9, 26, h - 6, 30 - 0)); // IST = UTC+5:30
  assert.equal(istHour(new Date("2026-10-26T18:00:00Z")), 23);
  assert.equal(isResting(meera, new Date("2026-10-26T18:00:00Z")), true);
  assert.equal(isResting(meera, new Date("2026-10-26T00:30:00Z")), false); // 06:00 IST
  assert.equal(isResting(meera, new Date("2026-10-26T06:30:00Z")), false); // noon
  assert.equal(backAt(meera), "3 am");
  assert.ok(at);
  for (let h = 0; h < 24; h++) {
    const now = new Date(Date.UTC(2026, 9, 26, 0, 0) + (h * 60 - 330) * 60000);
    assert.ok(GUIDES.filter((g) => !isResting(g, now)).length >= 6, `at ${h}:00 IST at least six guides are available`);
  }
});

test("the instructions keep the safety rules", () => {
  for (const g of GUIDES) {
    const s = buildChatInstruction(g, "en", true);
    assert.match(s, /real astrologer/);
    assert.match(s, /Never predict death/);
    assert.match(s, /14416/);
    assert.match(s, /gemstones/);
  }
  assert.match(buildChatInstruction(GUIDES[0], "en", false), /do NOT have this person's chart/);
});

test("tarot draws distinct real cards", () => {
  for (let i = 0; i < 50; i++) {
    const c = drawCards(3);
    assert.equal(new Set(c.map((x) => x.card)).size, 3);
  }
});

test("a reply is built from the chart and the conversation, and tarot gets cards", async () => {
  const chart = computeKundli({ year: 1995, month: 8, day: 15, hour: 10, minute: 30, lat: 28.6, lon: 77.2, tz: "Asia/Kolkata", tradition: "vedic" });
  let seen;
  const generate = async (req) => { seen = req; return "  Hello there.  "; };
  const base = { language: "en", turns: [{ role: "user", text: "Hi" }], chart, name: "Asha", timeUnknown: false, tradition: "vedic", today: "2026-10-26" };
  const out = await guideReply({ ...base, guide: GUIDES.find((g) => g.id === "arjun") }, generate);
  assert.equal(out, "Hello there.");
  assert.match(seen.contents[0].parts[0].text, /Sidereal/);
  assert.equal(seen.contents.at(-1).parts[0].text, "Hi");
  await guideReply({ ...base, guide: GUIDES.find((g) => g.id === "anaya") }, generate);
  assert.match(seen.contents.at(-1).parts[0].text, /Cards drawn by the system/);
  await guideReply({ ...base, chart: null, guide: GUIDES[0] }, generate);
  assert.equal(seen.contents.length, 1);
  await assert.rejects(guideReply({ ...base, guide: GUIDES[0] }, async () => "  "));
});

test("two people are read together, with their matching points", async () => {
  const mk = (day, hour) => computeKundli({ year: 1995, month: 8, day, hour, minute: 30, lat: 28.6, lon: 77.2, tz: "Asia/Kolkata", tradition: "vedic" });
  let seen;
  const generate = async (req) => { seen = req; return "Short reply."; };
  const people = [
    { name: "Aman", chart: mk(15, 10), timeUnknown: false, tradition: "vedic" },
    { name: "Geetika", chart: mk(3, 14), timeUnknown: false, tradition: "vedic" },
  ];
  await guideReply({ guide: GUIDES[0], language: "en", turns: [{ role: "user", text: "How do we fit?" }], people, today: "2026-10-26" }, generate);
  const first = seen.contents[0].parts[0].text;
  assert.match(first, /2 people/);
  assert.match(first, /Aman/);
  assert.match(first, /Geetika/);
  assert.match(first, /"together"/);
  assert.match(first, /guna_points/);
  assert.match(seen.systemInstruction, /holds 2 people/);
  assert.match(seen.systemInstruction, /one to three sentences/);
});
