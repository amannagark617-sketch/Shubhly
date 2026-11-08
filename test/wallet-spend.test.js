import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createAccounts } from "../src/accounts.js";
import { memoryStore } from "../src/account-store.js";
import { pricesFromEnv, bonusFor, welcomePaise } from "../src/pricing.js";

async function setup({ welcome = 1000 } = {}) {
  const store = memoryStore();
  const people = {
    a: { uid: "a", name: "Asha", email: "a@x.in", phone: "+919800000001", provider: "phone" },
    b: { uid: "b", name: "Ben", email: "b@x.in", phone: "+919800000001", provider: "phone" }, // same phone number as a
    g: { uid: "g", name: "Gita", email: "g@x.in", phone: "", provider: "google.com" },
  };
  const acc = createAccounts({
    getDeps: async () => ({ store, verifyToken: async (t) => { if (!people[t]) throw new Error("bad"); return people[t]; } }),
    razorpay: null, limits: { min: 50, max: 10000 }, publicConfig: null, welcome,
  });
  const app = express();
  app.use(express.json());
  app.use("/api/account", acc.router);
  app.post("/job", async (req, res) => {
    const paid = await acc.charge(req, res, { kind: "chat", amountPaise: 300, label: "Meera" });
    if (!paid) return;
    if (req.body.fail) { const b = await paid.refund(); return res.status(500).json({ balancePaise: b }); }
    res.json({ balancePaise: paid.balancePaise });
  });
  const server = await new Promise((r) => { const s = app.listen(0, "127.0.0.1", () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, token, body) => {
    const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, json: await r.json().catch(() => null) };
  };
  return { call, store, close: () => server.close() };
}

test("prices have sensible defaults and can be overridden", () => {
  assert.deepEqual(pricesFromEnv({}), { chat: 300, krishna: 200, voice: 900, report: 9900 });
  assert.equal(pricesFromEnv({ PRICE_CHAT_RUPEES: "4" }).chat, 400);
  assert.equal(pricesFromEnv({ PRICE_CHAT_RUPEES: "abc" }).chat, 300);
  assert.equal(welcomePaise({}), 1000);
  assert.equal(welcomePaise({ WELCOME_CREDIT_RUPEES: "0" }), 0);
});

test("bonus only on ₹499 and above", () => {
  assert.equal(bonusFor(19900), 0);
  assert.equal(bonusFor(49900), 5000);
  assert.equal(bonusFor(99900), 15000);
});

test("a paid job needs a login", async () => {
  const h = await setup();
  assert.equal((await h.call("POST", "/job")).status, 401);
  assert.equal((await h.call("POST", "/job", "nobody")).status, 401);
  h.close();
});

test("welcome credit: once per phone number, only for phone logins", async () => {
  const h = await setup();
  const a = await h.call("GET", "/api/account/me", "a");
  assert.equal(a.json.user.balancePaise, 1000);
  assert.equal((await h.call("GET", "/api/account/me", "a")).json.user.balancePaise, 1000); // not twice
  assert.equal((await h.call("GET", "/api/account/me", "b")).json.user.balancePaise, 0); // same phone, other account
  assert.equal((await h.call("GET", "/api/account/me", "g")).json.user.balancePaise, 0); // Google login: no OTP, no credit
  h.close();
});

test("spending takes the price, stops at zero and never goes negative", async () => {
  const h = await setup();
  await h.call("GET", "/api/account/me", "a"); // ₹10
  for (const left of [700, 400, 100]) assert.equal((await h.call("POST", "/job", "a")).json.balancePaise, left);
  const no = await h.call("POST", "/job", "a");
  assert.equal(no.status, 402);
  assert.equal(no.json.code, "FUNDS");
  assert.equal(no.json.balancePaise, 100);
  assert.equal((await h.store.getUser("a")).balancePaise, 100);
  h.close();
});

test("a failed job is refunded once and shows in the history", async () => {
  const h = await setup();
  await h.call("GET", "/api/account/me", "a");
  const r = await h.call("POST", "/job", "a", { fail: true });
  assert.equal(r.json.balancePaise, 1000);
  const rows = (await h.call("GET", "/api/account/transactions", "a")).json.transactions;
  assert.deepEqual(rows.map((x) => x.type), ["refund", "spend", "welcome"]);
  assert.equal(await h.store.refund({ uid: "a", id: rows[1].id }).then((x) => x.refunded), false); // no second refund
  h.close();
});

test("many parallel spends cannot overspend", async () => {
  const h = await setup();
  await h.call("GET", "/api/account/me", "a"); // ₹10 = 3 jobs
  const rs = await Promise.all(Array.from({ length: 8 }, () => h.call("POST", "/job", "a")));
  assert.equal(rs.filter((x) => x.status === 200).length, 3);
  assert.equal((await h.store.getUser("a")).balancePaise, 100);
  h.close();
});

test("top-up bonus is added to the wallet", async () => {
  const store = memoryStore();
  await store.upsertUser("u", { name: "U" });
  await store.createOrder({ orderId: "o1", uid: "u", amountPaise: 49900 });
  const r = await store.creditOrder({ orderId: "o1", paymentId: "p1", amountPaise: 49900 });
  assert.equal(r.balancePaise, 54900);
  assert.equal((await store.creditOrder({ orderId: "o1", paymentId: "p1" })).credited, false);
});
