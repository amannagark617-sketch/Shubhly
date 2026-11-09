import { test } from "node:test";
import assert from "node:assert/strict";
import { callBook, makeCallToken } from "../src/call.js";

test("the first minute of the day is free, once", () => {
  const b = callBook();
  assert.equal(b.freeAvailable("u1"), true);
  b.useFree("u1");
  assert.equal(b.freeAvailable("u1"), false);
  assert.equal(b.freeAvailable("u2"), true);
  b.giveBackFree("u1");
  assert.equal(b.freeAvailable("u1"), true);
});

test("a minute is charged only for the caller's own call, once it has begun, up to the longest call", async () => {
  let t = 1_000_000;
  const b = callBook({ now: () => t, maxMinutes: 3 });
  const id = b.open("u1");
  assert.deepEqual(b.nextMinute(id, "u2"), { ok: false, reason: "unknown" });
  assert.deepEqual(b.nextMinute("nope", "u1"), { ok: false, reason: "unknown" });
  assert.equal(b.nextMinute(id, "u1").reason, "early");
  t += 60_000;
  assert.deepEqual(b.nextMinute(id, "u1"), { ok: true, minute: 2 });
  b.commit(id);
  assert.equal(b.nextMinute(id, "u1").reason, "early");
  t += 60_000; b.commit(id);
  assert.equal(b.nextMinute(id, "u1").reason, "max");
  await b.end(id, "u1");
  assert.equal(b.nextMinute(id, "u1").reason, "unknown");
});

test("the call token is locked to Krishna and good for one call", async () => {
  let seen;
  const ai = { authTokens: { create: async (a) => { seen = a; return { name: "auth_tokens/abc" }; } } };
  const r = await makeCallToken({ language: "en", ai });
  assert.equal(r.token, "auth_tokens/abc");
  const c = seen.config;
  assert.equal(c.uses, 3);
  assert.match(c.liveConnectConstraints.config.systemInstruction, /LIVE VOICE CALL/);
  assert.deepEqual(c.liveConnectConstraints.config.responseModalities, ["AUDIO"]);
  assert.ok(new Date(c.expireTime) > new Date());
});

test("a call that never connected gives the first minute back, once", async () => {
  const b = callBook();
  let gave = 0;
  const id = b.open("u1", async () => { gave += 1; });
  assert.equal(await b.end(id, "u2", true), false);
  assert.equal(await b.end(id, "u1", true), true);
  assert.equal(await b.end(id, "u1", true), false);
  assert.equal(gave, 1);
  const id2 = b.open("u1", async () => { gave += 1; });
  assert.equal(await b.end(id2, "u1", false), false);
  assert.equal(gave, 1);
});
