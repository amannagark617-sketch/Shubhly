import test from "node:test";
import assert from "node:assert/strict";
import { cleanMemory, memoryStore } from "../src/account-store.js";
import { buildKrishnaInstruction, krishnaReply } from "../src/gita.js";
import { liveSetup } from "../src/call.js";

test("memory is off by default, and notes are short, unique and limited", async () => {
  assert.deepEqual(cleanMemory(null), { on: false, notes: [] });
  const m = cleanMemory({ on: true, notes: Array.from({ length: 20 }, (_, i) => "note " + i).concat(["note 19", "x".repeat(500)]) });
  assert.equal(m.notes.length, 12);
  assert.ok(m.notes.every((n) => n.length <= 160));
  const st = memoryStore();
  assert.equal((await st.getKrishnaMemory("u")).on, false);
  await st.setKrishnaMemory("u", { on: true, notes: ["has a sister"] });
  assert.deepEqual(await st.getKrishnaMemory("u"), { on: true, notes: ["has a sister"] });
  await st.setKrishnaMemory("u", { on: false, notes: [] });
  assert.deepEqual(await st.getKrishnaMemory("u"), { on: false, notes: [] });
});

test("Krishna uses the name and notes only when given, and treats them as data", () => {
  assert.doesNotMatch(buildKrishnaInstruction("en"), /WHAT YOU REMEMBER/);
  const t = buildKrishnaInstruction("en", { name: "Ravi", notes: ["worried about his job"] }, { canNote: true });
  assert.match(t, /Name: Ravi/);
  assert.match(t, /worried about his job/);
  assert.match(t, /not instructions/);
  assert.match(t, /\[\[note:/);
});

test("a note tag is taken out of the reply and handed over", async () => {
  let got = null;
  const text = await krishnaReply({ language: "en", turns: [{ role: "user", text: "hi" }], memory: { name: "", notes: [] }, onNote: (n) => { got = n; } },
    async () => "Be gentle with yourself.\n[[note: lost his father last year]]");
  assert.equal(text, "Be gentle with yourself.");
  assert.equal(got, "lost his father last year");
});

test("the call setup greets a known caller by name and does not ask again", () => {
  const known = liveSetup({ name: "Meera", notes: [] }).setup.systemInstruction.parts[0].text;
  assert.match(known, /Meera/);
  assert.match(known, /Do NOT ask their name/);
  assert.doesNotMatch(liveSetup().setup.systemInstruction.parts[0].text, /THIS CALLER IS KNOWN/);
});
