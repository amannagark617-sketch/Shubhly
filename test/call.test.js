import { test } from "node:test";
import assert from "node:assert/strict";
import { callBook, makeCallToken, costFor } from "../src/call.js";

test("the first minute of the day is free, once", () => {
  const b = callBook();
  assert.equal(b.freeAvailable("u1"), true);
  b.useFree("u1");
  assert.equal(b.freeAvailable("u1"), false);
  assert.equal(b.freeAvailable("u2"), true);
  b.giveBackFree("u1");
  assert.equal(b.freeAvailable("u1"), true);
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

test("the free call minute is kept in the store, once per person per day", async () => {
  const { memoryStore } = await import("../src/account-store.js");
  const st = memoryStore();
  assert.equal(await st.takeFreeCall("u", "2026-11-09"), true);
  assert.equal(await st.takeFreeCall("u", "2026-11-09"), false);
  assert.equal(await st.takeFreeCall("u", "2026-11-10"), true);
  await st.giveBackFreeCall("u", "2026-11-10");
  assert.equal(await st.takeFreeCall("u", "2026-11-10"), true);
});

// A pretend wallet: take/give/undo like the real one, with a balance in paise.
const wallet = (start) => {
  const w = { balance: start, undone: 0, log: [] };
  w.money = {
    async take(d) { if (w.balance < d) return { ok: false, balancePaise: w.balance }; w.balance -= d; return { ok: true, balancePaise: w.balance }; },
    async give(d) { w.balance += d; return w.balance; },
    async undo() { w.undone += 1; },
  };
  return w;
};
const PER_MIN = 1000; // Rs 10 a minute

test("seconds are priced exactly: 30 seconds of a Rs 10 minute is Rs 5", () => {
  assert.equal(costFor(30, PER_MIN), 500);
  assert.equal(costFor(60, PER_MIN), 1000);
  assert.equal(costFor(0, PER_MIN), 0);
  assert.equal(costFor(1, PER_MIN), 17);
});

test("Rs 10 in the wallet, 30 seconds of talk: Rs 5 is left", async () => {
  let t = 1_000_000;
  const b = callBook({ now: () => t });
  const w = wallet(1000);
  await w.money.take(costFor(10, PER_MIN)); // taken when the call starts
  const id = b.open("u1", w.money, { charged: costFor(10, PER_MIN) });
  b.markConnected(id);
  for (let s = 0; s < 30; s += 3) { t += 3000; await b.settle(id, PER_MIN); } // the server checks every 3 seconds
  const r = await b.end(id, "u1", PER_MIN);
  assert.equal(r.seconds, 30);
  assert.equal(r.chargedPaise, 500);
  assert.equal(w.balance, 500);
});

test("every second counts: 45 seconds costs Rs 7.50, and the wallet is settled to the exact second", async () => {
  let t = 2_000_000;
  const b = callBook({ now: () => t });
  const w = wallet(2000);
  await w.money.take(costFor(10, PER_MIN));
  const id = b.open("u1", w.money, { charged: costFor(10, PER_MIN) });
  b.markConnected(id);
  t += 45_000;
  const r = await b.end(id, "u1", PER_MIN);
  assert.equal(r.chargedPaise, costFor(45, PER_MIN));
  assert.equal(w.balance, 2000 - costFor(45, PER_MIN));
});

test("the first minute of the day is free by the second, then the clock starts", async () => {
  let t = 3_000_000;
  const b = callBook({ now: () => t });
  const w = wallet(1000);
  const id = b.open("u1", w.money, { free: true });
  b.markConnected(id);
  t += 45_000;
  assert.equal((await b.settle(id, PER_MIN)).ok, true);
  assert.equal(w.balance, 1000); // still inside the free minute
  t += 45_000; // 90 seconds in: 30 are paid
  const r = await b.end(id, "u1", PER_MIN);
  assert.equal(r.chargedPaise, 500);
  assert.equal(w.balance, 500);
  // a caller who stays inside the free minute pays nothing
  const w2 = wallet(0), id2 = b.open("u2", w2.money, { free: true });
  b.markConnected(id2); t += 50_000;
  assert.equal((await b.end(id2, "u2", PER_MIN)).chargedPaise, 0);
  assert.equal(w2.balance, 0);
});

test("when the wallet cannot cover the next seconds the call is told to end, and the balance never goes below zero", async () => {
  let t = 4_000_000;
  const b = callBook({ now: () => t });
  const w = wallet(400);
  await w.money.take(costFor(10, PER_MIN));
  const id = b.open("u1", w.money, { charged: costFor(10, PER_MIN) });
  b.markConnected(id);
  let cut = false;
  for (let s = 0; s < 60 && !cut; s += 3) { t += 3000; cut = !(await b.settle(id, PER_MIN)).ok; }
  assert.equal(cut, true);
  assert.ok(w.balance >= 0);
  assert.ok(w.balance < costFor(3, PER_MIN)); // what is left could not pay for another beat
  const r = await b.end(id, "u1", PER_MIN);
  assert.ok(r.chargedPaise <= 400 && w.balance >= 0);
});

test("a call that never connected is put back once; one that connected cannot be refunded, whatever the page says", async () => {
  const b = callBook();
  const w = wallet(1000);
  const id = b.open("u1", w.money);
  assert.equal(await b.end(id, "u2", PER_MIN), null); // not their call
  const r = await b.end(id, "u1", PER_MIN);
  assert.equal(r.refunded, true);
  assert.deepEqual(await b.end(id, "u1", PER_MIN), r); // asking again changes nothing
  assert.equal(w.undone, 1);
  const w2 = wallet(1000), id2 = b.open("u1", w2.money);
  b.markConnected(id2);
  assert.equal((await b.end(id2, "u1", PER_MIN)).refunded, false);
  assert.equal(w2.undone, 0);
});

test("ending twice at the same moment settles once", async () => {
  let t = 5_000_000;
  const b = callBook({ now: () => t });
  const w = wallet(1000);
  await w.money.take(costFor(10, PER_MIN));
  const id = b.open("u1", w.money, { charged: costFor(10, PER_MIN) });
  b.markConnected(id); t += 30_000;
  const [a, c] = await Promise.all([b.end(id, "u1", PER_MIN), b.end(id, "u1", PER_MIN)]);
  assert.deepEqual(a, c);
  assert.equal(w.balance, 500);
});

test("a call is paid in one wallet entry that grows and shrinks with the seconds", async () => {
  const { memoryStore } = await import("../src/account-store.js");
  const st = memoryStore();
  await st.upsertUser("u", { uid: "u" });
  await st.grantWelcome({ uid: "u", phone: "+911234567890", amountPaise: 1000 });
  const first = await st.spend({ uid: "u", amountPaise: 167, kind: "call", label: "Krishna call" });
  const more = await st.adjustSpend({ uid: "u", id: first.id, deltaPaise: 333, label: "Krishna call, 0:30" });
  assert.deepEqual([more.ok, more.balancePaise], [true, 500]);
  const back = await st.adjustSpend({ uid: "u", id: first.id, deltaPaise: -100 });
  assert.equal(back.balancePaise, 600);
  const tooMuch = await st.adjustSpend({ uid: "u", id: first.id, deltaPaise: 5000 });
  assert.equal(tooMuch.ok, false);
  const rows = (await st.listTransactions("u")).filter((r) => r.type === "spend");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].amountPaise, -400);
  assert.equal(rows[0].label, "Krishna call, 0:30");
});
