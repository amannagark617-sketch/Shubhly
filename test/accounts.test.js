import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import express from "express";
import { createAccounts, accountsFromEnv } from "../src/accounts.js";
import { memoryStore } from "../src/account-store.js";
import { parseTopup, topupLimits, signCheckout, verifyCheckout, verifyWebhook, cleanProfileName, inr } from "../src/wallet.js";
import { razorpayFromEnv } from "../src/razorpay.js";
import { firebasePublicConfig } from "../src/firebase.js";
import { InputError } from "../src/validate.js";

const LIMITS = { min: 50, max: 10000 };
const SECRET = "test_key_secret", HOOK = "test_webhook_secret";

// A tiny running copy of the account routes, with a pretend login check and a pretend Razorpay.
async function harness() {
  const store = memoryStore();
  let n = 0;
  const razorpay = {
    keyId: "rzp_test_abc", keySecret: SECRET, webhookSecret: HOOK, live: false,
    async createOrder({ amountPaise }) { return { id: `order_${++n}`, amountPaise, currency: "INR" }; },
  };
  const people = {
    "tok-asha": { uid: "asha", name: "Asha Verma", email: "asha@example.com", phone: "", picture: "", provider: "google.com" },
    "tok-ravi": { uid: "ravi", name: "", email: "", phone: "+919800000000", picture: "", provider: "phone" },
  };
  const acc = createAccounts({
    getDeps: async () => ({ store, verifyToken: async (t) => { if (!people[t]) throw new Error("bad token"); return people[t]; } }),
    razorpay, limits: LIMITS, publicConfig: null, welcome: 0,
  });
  const app = express();
  app.post("/api/account/razorpay-webhook", express.raw({ type: "*/*" }), acc.webhook);
  app.use(express.json());
  app.use("/api/account", acc.router);
  const server = await new Promise((r) => { const s = app.listen(0, "127.0.0.1", () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api/account`;
  const call = async (method, path, { token, body, raw, headers } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { ...(raw ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: raw ?? (body ? JSON.stringify(body) : undefined),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  };
  return { call, store, close: () => server.close() };
}

const payProof = (orderId, paymentId = "pay_" + orderId) => ({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signCheckout(orderId, paymentId, SECRET) });
const hook = (event, orderId, paymentId, amount) => {
  const raw = JSON.stringify({ event, payload: { payment: { entity: { id: paymentId, order_id: orderId, amount } } } });
  return { raw, headers: { "Content-Type": "application/json", "X-Razorpay-Signature": crypto.createHmac("sha256", HOOK).update(raw).digest("hex") } };
};

test("top-up amounts must be whole rupees inside the limits and are returned in paise", () => {
  assert.equal(parseTopup("100", LIMITS), 10000);
  assert.equal(parseTopup(500, LIMITS), 50000);
  assert.equal(parseTopup("50", LIMITS), 5000);
  for (const bad of ["49", 49, "10001", "12.5", "abc", "", null, undefined, "-100", "1e3", {}]) {
    assert.throws(() => parseTopup(bad, LIMITS), InputError, String(bad));
  }
  assert.deepEqual(topupLimits({ TOPUP_MIN_RUPEES: "100", TOPUP_MAX_RUPEES: "5000" }), { min: 100, max: 5000 });
  assert.deepEqual(topupLimits({}), { min: 50, max: 10000 });
  assert.equal(inr(50000), "₹500");
  assert.equal(inr(12550), "₹125.50");
});

test("payment proofs: the right signature passes, anything else fails", () => {
  const good = signCheckout("order_1", "pay_1", SECRET);
  assert.equal(verifyCheckout({ orderId: "order_1", paymentId: "pay_1", signature: good }, SECRET), true);
  assert.equal(verifyCheckout({ orderId: "order_1", paymentId: "pay_2", signature: good }, SECRET), false);
  assert.equal(verifyCheckout({ orderId: "order_1", paymentId: "pay_1", signature: good }, "other_secret"), false);
  assert.equal(verifyCheckout({ orderId: "order_1", paymentId: "pay_1", signature: "" }, SECRET), false);
  assert.equal(verifyCheckout({ orderId: "", paymentId: "", signature: "" }, SECRET), false);
  const raw = Buffer.from('{"a":1}');
  const sig = crypto.createHmac("sha256", HOOK).update(raw).digest("hex");
  assert.equal(verifyWebhook(raw, sig, HOOK), true);
  assert.equal(verifyWebhook(Buffer.from('{"a":2}'), sig, HOOK), false);
  assert.equal(verifyWebhook(raw, sig, ""), false);
});

test("names: letters only, at least two", () => {
  assert.equal(cleanProfileName("  Asha   Verma <b>"), "Asha Verma b");
  assert.equal(cleanProfileName("1"), "");
  assert.equal(cleanProfileName(""), "");
  assert.equal(cleanProfileName("आशा"), "आशा");
});

test("accounts stay off until the Firebase settings exist, and Razorpay keys are checked", async () => {
  assert.equal(firebasePublicConfig({}), null);
  assert.equal(firebasePublicConfig({ FIREBASE_PROJECT_ID: "p", FIREBASE_WEB_API_KEY: "k" }), null);
  assert.deepEqual(firebasePublicConfig({ FIREBASE_PROJECT_ID: "p", FIREBASE_WEB_API_KEY: "k", FIREBASE_APP_ID: "a" }),
    { apiKey: "k", appId: "a", projectId: "p", authDomain: "p.firebaseapp.com" });
  assert.equal(razorpayFromEnv({}), null);
  assert.equal(razorpayFromEnv({ RAZORPAY_KEY_ID: "not-a-key", RAZORPAY_KEY_SECRET: "s" }), null);
  assert.equal(razorpayFromEnv({ RAZORPAY_KEY_ID: "rzp_test_Abc123", RAZORPAY_KEY_SECRET: "s" }).live, false);
  assert.equal(razorpayFromEnv({ RAZORPAY_KEY_ID: "rzp_live_Abc123", RAZORPAY_KEY_SECRET: "s" }).live, true);
  const off = accountsFromEnv({});
  assert.equal(off.enabled, false);
  assert.equal(off.publicConfig, null);
});

test("login is required, and a bad token is refused", async () => {
  const h = await harness();
  try {
    assert.equal((await h.call("GET", "/me")).status, 401);
    assert.equal((await h.call("GET", "/me", { token: "nope" })).status, 401);
    assert.equal((await h.call("POST", "/topup", { body: { amount: 100 } })).status, 401);
    assert.equal((await h.call("GET", "/transactions")).status, 401);
  } finally { h.close(); }
});

test("sign-up: a Google user has a name already; a phone user is asked for one and can save it", async () => {
  const h = await harness();
  try {
    const a = await h.call("GET", "/me", { token: "tok-asha" });
    assert.equal(a.json.user.name, "Asha Verma");
    assert.equal(a.json.needsName, false);
    assert.equal(a.json.user.balancePaise, 0);

    const r = await h.call("GET", "/me", { token: "tok-ravi" });
    assert.equal(r.json.needsName, true);
    assert.equal((await h.call("PUT", "/me", { token: "tok-ravi", body: { name: "1" } })).status, 400);
    const saved = await h.call("PUT", "/me", { token: "tok-ravi", body: { name: "Ravi Kumar" } });
    assert.equal(saved.json.user.name, "Ravi Kumar");
    assert.equal((await h.call("GET", "/me", { token: "tok-ravi" })).json.needsName, false);
    // a later login never overwrites the saved name
    assert.equal((await h.call("GET", "/me", { token: "tok-ravi" })).json.user.name, "Ravi Kumar");
  } finally { h.close(); }
});

test("top-up: the order amount is set by the server; the wallet is credited once however often it is confirmed", async () => {
  const h = await harness();
  try {
    await h.call("GET", "/me", { token: "tok-asha" });
    assert.equal((await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 10 } })).status, 400);
    assert.equal((await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 99999 } })).status, 400);

    const o = await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 200 } });
    assert.equal(o.status, 200);
    assert.equal(o.json.amountPaise, 20000);
    assert.equal(o.json.keyId, "rzp_test_abc");

    // a wrong proof adds nothing
    const bad = await h.call("POST", "/topup/verify", { token: "tok-asha", body: { ...payProof(o.json.orderId), razorpay_signature: "0".repeat(64) } });
    assert.equal(bad.status, 400);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 0);

    // the real proof credits the wallet
    const ok = await h.call("POST", "/topup/verify", { token: "tok-asha", body: payProof(o.json.orderId) });
    assert.equal(ok.json.credited, true);
    assert.equal(ok.json.balancePaise, 20000);

    // confirming again, by the browser or by the webhook, changes nothing
    const again = await h.call("POST", "/topup/verify", { token: "tok-asha", body: payProof(o.json.orderId) });
    assert.equal(again.json.credited, false);
    assert.equal(again.json.balancePaise, 20000);
    const w = hook("payment.captured", o.json.orderId, "pay_" + o.json.orderId, 20000);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: w.raw, headers: w.headers })).status, 200);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 20000);

    const tx = (await h.call("GET", "/transactions", { token: "tok-asha" })).json.transactions;
    assert.equal(tx.length, 1);
    assert.equal(tx[0].amountPaise, 20000);
    assert.equal(tx[0].balanceAfterPaise, 20000);
  } finally { h.close(); }
});

test("one person cannot confirm (or credit) another person's order", async () => {
  const h = await harness();
  try {
    await h.call("GET", "/me", { token: "tok-asha" });
    await h.call("GET", "/me", { token: "tok-ravi" });
    const o = await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 200 } });
    const steal = await h.call("POST", "/topup/verify", { token: "tok-ravi", body: payProof(o.json.orderId) });
    assert.equal(steal.status, 404);
    assert.equal((await h.call("GET", "/me", { token: "tok-ravi" })).json.user.balancePaise, 0);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 0);
  } finally { h.close(); }
});

test("webhook: covers a closed browser tab, is idempotent, and refuses a bad signature or a mismatched amount", async () => {
  const h = await harness();
  try {
    await h.call("GET", "/me", { token: "tok-asha" });
    const o = await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 300 } });
    const id = o.json.orderId;

    const forged = hook("payment.captured", id, "pay_x", 30000);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: forged.raw, headers: { ...forged.headers, "X-Razorpay-Signature": "f".repeat(64) } })).status, 400);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: forged.raw, headers: { "Content-Type": "application/json" } })).status, 400);

    const wrong = hook("payment.captured", id, "pay_x", 99999);
    const wr = await h.call("POST", "/razorpay-webhook", { raw: wrong.raw, headers: wrong.headers });
    assert.equal(wr.status, 200);
    assert.equal(wr.json.ignored, true);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 0);

    const good = hook("payment.captured", id, "pay_good", 30000);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: good.raw, headers: good.headers })).status, 200);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: good.raw, headers: good.headers })).status, 200);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 30000);

    // the browser's own confirmation arriving late does not add it a second time
    const late = await h.call("POST", "/topup/verify", { token: "tok-asha", body: payProof(id, "pay_good") });
    assert.equal(late.json.credited, false);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 30000);

    const ignoredOrder = hook("payment.captured", "order_unknown", "pay_z", 100);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: ignoredOrder.raw, headers: ignoredOrder.headers })).json.ignored, true);
    const other = hook("refund.created", id, "pay_good", 30000);
    assert.equal((await h.call("POST", "/razorpay-webhook", { raw: other.raw, headers: other.headers })).status, 200);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 30000);
  } finally { h.close(); }
});

test("wallet history keeps every top-up, newest first, and the balance is their sum", async () => {
  const h = await harness();
  try {
    await h.call("GET", "/me", { token: "tok-asha" });
    for (const amount of [100, 250, 75]) {
      const o = await h.call("POST", "/topup", { token: "tok-asha", body: { amount } });
      await h.call("POST", "/topup/verify", { token: "tok-asha", body: payProof(o.json.orderId) });
    }
    const tx = (await h.call("GET", "/transactions", { token: "tok-asha" })).json.transactions;
    assert.deepEqual(tx.map((t) => t.amountPaise), [7500, 25000, 10000]);
    assert.deepEqual(tx.map((t) => t.balanceAfterPaise), [42500, 35000, 10000]);
    assert.equal((await h.call("GET", "/me", { token: "tok-asha" })).json.user.balancePaise, 42500);
  } finally { h.close(); }
});

test("too many top-up attempts in an hour are refused", async () => {
  const h = await harness();
  try {
    await h.call("GET", "/me", { token: "tok-asha" });
    let last;
    for (let i = 0; i < 13; i++) last = await h.call("POST", "/topup", { token: "tok-asha", body: { amount: 100 } });
    assert.equal(last.status, 429);
  } finally { h.close(); }
});
