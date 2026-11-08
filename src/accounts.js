// Accounts and wallet top-up: the server side.
//
//   GET  /api/account/me                 who is logged in (created on first visit), with the wallet balance
//   PUT  /api/account/me                 save the name
//   POST /api/account/topup              start a top-up: returns a Razorpay order to pay
//   POST /api/account/topup/verify       the browser says "paid": check Razorpay's proof, then credit the wallet
//   GET  /api/account/transactions       wallet history
//   POST /api/account/razorpay-webhook   Razorpay tells us a payment succeeded (covers a closed browser tab)
//
// Safety rules: the amount is always the one stored when the order was created, never what the browser claims;
// a payment is credited once only, whichever of "verify" or the webhook arrives first (or both).
import express from "express";
import { InputError } from "./validate.js";
import { parseTopup, topupLimits, verifyCheckout, verifyWebhook, cleanProfileName } from "./wallet.js";
import { razorpayFromEnv } from "./razorpay.js";
import { firebasePublicConfig, firebaseServices } from "./firebase.js";
import { firestoreStore } from "./account-store.js";

const memo = (fn) => { let p; return () => (p ||= fn().catch((e) => { p = undefined; throw e; })); };
const publicUser = (u) => ({ uid: u.uid, name: u.name || "", email: u.email || "", phone: u.phone || "", balancePaise: u.balancePaise || 0 });

export function createAccounts({ getDeps, razorpay, publicConfig, limits = topupLimits() }) {
  const router = express.Router();
  const orderHits = new Map(); // uid -> times of recent top-up attempts

  router.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });

  const handle = (fn) => async (req, res) => {
    try { await fn(req, res); } catch (e) {
      if (e instanceof InputError) return res.status(400).json({ error: e.message });
      console.error("account error:", e?.message || e); // never the secrets, only the message
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  };

  async function auth(req, res, next) {
    const m = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
    if (!m) return res.status(401).json({ code: "AUTH", error: "Please log in." });
    let deps;
    try { deps = await getDeps(); } catch (e) {
      console.error("account setup error:", e?.message || e);
      return res.status(503).json({ error: "Accounts are not available right now." });
    }
    try { req.user = await deps.verifyToken(m[1]); } catch { return res.status(401).json({ code: "AUTH", error: "Your login has expired. Please log in again." }); }
    req.store = deps.store;
    next();
  }

  router.get("/me", auth, handle(async (req, res) => {
    const u = await req.store.upsertUser(req.user.uid, req.user);
    res.json({ user: publicUser(u), needsName: !u.name });
  }));

  router.put("/me", auth, handle(async (req, res) => {
    const name = cleanProfileName(req.body?.name);
    if (!name) throw new InputError("Please enter your name (letters only, at least 2).");
    await req.store.upsertUser(req.user.uid, req.user);
    const u = await req.store.setName(req.user.uid, name);
    res.json({ user: publicUser(u), needsName: false });
  }));

  router.post("/topup", auth, handle(async (req, res) => {
    if (!razorpay) return res.status(503).json({ error: "Adding money is not switched on yet." });
    const now = Date.now(), recent = (orderHits.get(req.user.uid) || []).filter((t) => t > now - 3_600_000);
    if (recent.length >= 12) return res.status(429).json({ error: "Too many top-up attempts. Please try again in a while." });
    orderHits.set(req.user.uid, [...recent, now]);
    if (orderHits.size > 5000) orderHits.clear();

    const amountPaise = parseTopup(req.body?.amount, limits);
    await req.store.upsertUser(req.user.uid, req.user);
    const receipt = `kk_${req.user.uid.slice(0, 16)}_${now.toString(36)}`;
    const order = await razorpay.createOrder({ amountPaise, receipt, notes: { uid: req.user.uid } });
    await req.store.createOrder({ orderId: order.id, uid: req.user.uid, amountPaise });
    res.json({ orderId: order.id, amountPaise, currency: "INR", keyId: razorpay.keyId });
  }));

  router.post("/topup/verify", auth, handle(async (req, res) => {
    if (!razorpay) return res.status(503).json({ error: "Adding money is not switched on yet." });
    const b = req.body || {};
    const orderId = String(b.razorpay_order_id || ""), paymentId = String(b.razorpay_payment_id || ""), signature = String(b.razorpay_signature || "");
    if (!verifyCheckout({ orderId, paymentId, signature }, razorpay.keySecret)) {
      return res.status(400).json({ error: "We could not verify this payment. If money was deducted, it will be added shortly or refunded." });
    }
    const order = await req.store.getOrder(orderId);
    if (!order || order.uid !== req.user.uid) return res.status(404).json({ error: "Order not found." });
    const r = await req.store.creditOrder({ orderId, paymentId });
    res.json({ credited: r.credited, balancePaise: r.balancePaise });
  }));

  router.get("/transactions", auth, handle(async (req, res) => {
    res.json({ transactions: await req.store.listTransactions(req.user.uid, 50) });
  }));

  // Razorpay -> us. Needs the body exactly as sent, so it is mounted with a raw body parser (see server.js).
  async function webhook(req, res) {
    if (!razorpay?.webhookSecret) return res.status(503).json({ error: "Webhook is not set up." });
    const raw = req.body;
    if (!Buffer.isBuffer(raw) || !verifyWebhook(raw, req.get("x-razorpay-signature"), razorpay.webhookSecret)) {
      return res.status(400).json({ error: "Bad signature." });
    }
    let event;
    try { event = JSON.parse(raw.toString("utf8")); } catch { return res.status(400).json({ error: "Bad body." }); }
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const pay = event.payload?.payment?.entity;
      const orderId = pay?.order_id || event.payload?.order?.entity?.id;
      if (!orderId || !pay?.id) return res.json({ ok: true, ignored: true });
      try {
        const { store } = await getDeps();
        await store.creditOrder({ orderId, paymentId: pay.id, amountPaise: pay.amount });
      } catch (e) {
        if (/unknown order|amount mismatch|unknown user/.test(e?.message || "")) {
          console.error("webhook ignored:", e.message, orderId);
          return res.json({ ok: true, ignored: true }); // not ours, or not matching: retrying would never help
        }
        console.error("webhook error:", e?.message || e);
        return res.status(500).json({ error: "Try again." }); // a real failure: Razorpay will retry
      }
    }
    res.json({ ok: true });
  }

  return { enabled: true, router, webhook, publicConfig };
}

/** Everything is off (and the site is unchanged) until the Firebase settings exist. */
export function accountsFromEnv(env = process.env) {
  const firebase = firebasePublicConfig(env);
  if (!firebase) {
    const off = (_req, res) => res.status(503).json({ error: "Accounts are not set up yet." });
    const router = express.Router();
    router.use(off);
    return { enabled: false, router, webhook: off, publicConfig: null };
  }
  const razorpay = razorpayFromEnv(env);
  const limits = topupLimits(env);
  const getDeps = memo(async () => {
    const { db, verifyToken } = await firebaseServices(env);
    return { store: firestoreStore(db), verifyToken };
  });
  return createAccounts({
    getDeps, razorpay, limits,
    publicConfig: { firebase, topup: razorpay ? { keyId: razorpay.keyId, live: razorpay.live, min: limits.min, max: limits.max } : null },
  });
}
