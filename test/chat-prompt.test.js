import test from "node:test";
import assert from "node:assert/strict";
import { buildChatInstruction } from "../src/chat.js";
import { buildKrishnaInstruction, kundliBlock } from "../src/gita.js";
import { GUIDE_BY_ID } from "../public/guides.js";

test("the last free reply is asked to leave an honest, specific opening for more", () => {
  const g = GUIDE_BY_ID.arjun;
  assert.ok(!buildChatInstruction(g, "hn", true, 1).includes("LAST FREE REPLY"));
  const last = buildChatInstruction(g, "hn", true, 1, { lastFree: true });
  assert.match(last, /LAST FREE REPLY/);
  assert.match(last, /do not create fear/i);
  assert.match(buildChatInstruction(g, "hn", true, 1), /nazar/);
});

test("Krishna shows a path from the visitor's kundli only when one is given", () => {
  assert.ok(!buildKrishnaInstruction("hn").includes("THIS PERSON'S KUNDLI"));
  const withChart = buildKrishnaInstruction("hn", null, { kundli: { name: "Yogesh", engineFacts: { currentPeriod: "Saturn" } } });
  assert.match(withChart, /THIS PERSON'S KUNDLI/);
  assert.match(withChart, /Saturn/);
  assert.match(kundliBlock({ a: 1 }), /never exact dates/);
});
