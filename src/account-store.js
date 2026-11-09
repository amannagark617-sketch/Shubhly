// Where accounts, orders and wallet history are saved.
//   users/{uid}                     name, email, phone, balancePaise, createdAt, lastLoginAt
//   users/{uid}/transactions/{id}   one row per top-up (the id is the Razorpay payment id, so a repeat can never double-count)
//   welcomes/{phone}                 marks a phone number that already got the welcome credit
//   orders/{orderId}                the payment order we created: who, how much, created | paid
// Amounts are whole paise. Only this server touches the database (see firestore.rules).

import { bonusFor } from "./pricing.js";

const nowIso = () => new Date().toISOString();

/** Fields a profile starts with, filled from the sign-in token. */
function newUser(uid, p) {
  const t = nowIso();
  return {
    uid, name: p.name || "", email: p.email || "", phone: p.phone || "", photoURL: p.picture || "",
    provider: p.provider || "", balancePaise: 0, createdAt: t, lastLoginAt: t,
  };
}

/** What an existing profile gains on a later login: nothing is overwritten, blanks are filled. */
function refreshed(u, p) {
  return {
    ...u,
    name: u.name || p.name || "",
    email: u.email || p.email || "",
    phone: u.phone || p.phone || "",
    photoURL: u.photoURL || p.picture || "",
    lastLoginAt: nowIso(),
  };
}

function txRow({ orderId, paymentId, amountPaise, bonusPaise = 0, balanceAfterPaise }) {
  return {
    id: paymentId || orderId, type: "topup", status: "success", amountPaise, bonusPaise, balanceAfterPaise,
    orderId, paymentId: paymentId || "", createdAt: nowIso(),
  };
}

let seq = 0;
const newId = (p) => `${p}_${Date.now().toString(36)}${(seq++ % 1296).toString(36)}${Math.random().toString(36).slice(2, 7)}`;
/** A wallet movement that is not a top-up: type is "spend", "refund" or "welcome". amountPaise is signed (spend is negative). */
function moveRow(type, { amountPaise, balanceAfterPaise, kind = "", label = "", ref = "" }) {
  return { id: newId(type[0]), type, status: "success", amountPaise, bonusPaise: 0, balanceAfterPaise, kind, label, ref, createdAt: nowIso() };
}


/** A bought report, kept so it can be opened again on any device. type is "kundli" or "milan". */
function reportRow({ type, title = "", lang = "en", inputs = {}, report = null, chart = null, paidPaise = 0 }) {
  return { id: newId("r"), type, title: String(title).slice(0, 120), lang, inputs, report, chart, paidPaise, createdAt: nowIso() };
}
const reportMeta = ({ id, type, title, lang, paidPaise, createdAt }) => ({ id, type, title, lang, paidPaise, createdAt });

function checkCredit(order, amountPaise) {
  if (!order) throw new Error("unknown order");
  if (amountPaise != null && amountPaise !== order.amountPaise) throw new Error("amount mismatch");
}

/** What Krishna remembers about one person, only when they agreed: a few short notes they shared. */
export function cleanMemory(m) {
  const notes = Array.isArray(m?.notes) ? m.notes.map((x) => String(x).replace(/\s+/g, " ").trim().slice(0, 160)).filter(Boolean) : [];
  return { on: m?.on === true, notes: [...new Set(notes)].slice(-12) };
}

// ---- in memory (tests, and local work with no database) ----------------------------------------
export function memoryStore() {
  const users = new Map(), orders = new Map(), txs = new Map(), welcomes = new Set(), reports = new Map(), kmem = new Map();
  return {
    kind: "memory",
    async upsertUser(uid, p) {
      const u = users.has(uid) ? refreshed(users.get(uid), p) : newUser(uid, p);
      users.set(uid, u);
      return { ...u };
    },
    async getUser(uid) { return users.has(uid) ? { ...users.get(uid) } : null; },
    async setName(uid, name) {
      const u = users.get(uid);
      if (!u) throw new Error("unknown user");
      u.name = name;
      return { ...u };
    },
    async createOrder({ orderId, uid, amountPaise }) {
      orders.set(orderId, { orderId, uid, amountPaise, status: "created", createdAt: nowIso() });
    },
    async getOrder(orderId) { return orders.has(orderId) ? { ...orders.get(orderId) } : null; },
    /** Add a paid order to the wallet exactly once, however many times this is called. */
    async creditOrder({ orderId, paymentId, amountPaise }) {
      const o = orders.get(orderId);
      checkCredit(o, amountPaise);
      const u = users.get(o.uid);
      if (o.status === "paid") return { credited: false, uid: o.uid, balancePaise: u?.balancePaise || 0 };
      if (!u) throw new Error("unknown user");
      const bonusPaise = bonusFor(o.amountPaise);
      u.balancePaise += o.amountPaise + bonusPaise;
      o.status = "paid"; o.paymentId = paymentId || ""; o.paidAt = nowIso();
      const row = txRow({ orderId, paymentId, amountPaise: o.amountPaise, bonusPaise, balanceAfterPaise: u.balancePaise });
      txs.set(o.uid, [row, ...(txs.get(o.uid) || [])]);
      return { credited: true, uid: o.uid, balancePaise: u.balancePaise };
    },
    async getKrishnaMemory(uid) { return cleanMemory(kmem.get(uid)); },
    async setKrishnaMemory(uid, m) { const v = cleanMemory(m); kmem.set(uid, v); return v; },
    async saveReport(uid, rec) {
      const row = reportRow(rec);
      reports.set(uid, [row, ...(reports.get(uid) || [])].slice(0, 100));
      return row.id;
    },
    async listReports(uid, limit = 50) { return (reports.get(uid) || []).slice(0, limit).map(reportMeta); },
    async getReport(uid, id) { return (reports.get(uid) || []).find((r) => r.id === id) || null; },
    async listTransactions(uid, limit = 50) { return (txs.get(uid) || []).slice(0, limit); },
    /** Take money for one use. Never goes below zero. Returns { ok, balancePaise, id }. */
    async spend({ uid, amountPaise, kind, label }) {
      const u = users.get(uid);
      if (!u) throw new Error("unknown user");
      if (u.balancePaise < amountPaise) return { ok: false, balancePaise: u.balancePaise };
      u.balancePaise -= amountPaise;
      const row = moveRow("spend", { amountPaise: -amountPaise, balanceAfterPaise: u.balancePaise, kind, label });
      txs.set(uid, [row, ...(txs.get(uid) || [])]);
      return { ok: true, balancePaise: u.balancePaise, id: row.id };
    },
    /** Give back a spend (the reply failed). Works once per spend. */
    async refund({ uid, id }) {
      const u = users.get(uid), list = txs.get(uid) || [];
      const row = list.find((r) => r.id === id && r.type === "spend");
      if (!u || !row || row.refunded) return { refunded: false, balancePaise: u?.balancePaise || 0 };
      row.refunded = true;
      u.balancePaise -= row.amountPaise; // amountPaise is negative
      txs.set(uid, [moveRow("refund", { amountPaise: -row.amountPaise, balanceAfterPaise: u.balancePaise, kind: row.kind, label: row.label, ref: id }), ...list]);
      return { refunded: true, balancePaise: u.balancePaise };
    },
    /** Welcome credit: once per phone number, however many accounts use it. */
    async grantWelcome({ uid, phone, amountPaise }) {
      const u = users.get(uid);
      if (!u || !phone || !amountPaise) return { granted: false, balancePaise: u?.balancePaise || 0 };
      if (u.welcomed || welcomes.has(phone)) { u.welcomed = true; return { granted: false, balancePaise: u.balancePaise }; }
      welcomes.add(phone); u.welcomed = true; u.balancePaise += amountPaise;
      txs.set(uid, [moveRow("welcome", { amountPaise, balanceAfterPaise: u.balancePaise, label: "Welcome credit" }), ...(txs.get(uid) || [])]);
      return { granted: true, balancePaise: u.balancePaise };
    },
  };
}

// ---- Firestore (production) --------------------------------------------------------------------
export function firestoreStore(db) {
  const user = (uid) => db.doc(`users/${uid}`);
  const order = (id) => db.doc(`orders/${id}`);
  return {
    kind: "firestore",
    async upsertUser(uid, p) {
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(user(uid));
        const u = snap.exists ? refreshed(snap.data(), p) : newUser(uid, p);
        tx.set(user(uid), u);
        return u;
      });
    },
    async getUser(uid) {
      const s = await user(uid).get();
      return s.exists ? s.data() : null;
    },
    async setName(uid, name) {
      await user(uid).update({ name });
      return (await user(uid).get()).data();
    },
    async getKrishnaMemory(uid) { const s = await db.doc(`krishnaMemory/${uid}`).get(); return cleanMemory(s.exists ? s.data() : null); },
    async setKrishnaMemory(uid, m) { const v = cleanMemory(m); await db.doc(`krishnaMemory/${uid}`).set(v); return v; },
    async createOrder({ orderId, uid, amountPaise }) {
      await order(orderId).create({ orderId, uid, amountPaise, status: "created", createdAt: nowIso() });
    },
    async getOrder(orderId) {
      const s = await order(orderId).get();
      return s.exists ? s.data() : null;
    },
    async creditOrder({ orderId, paymentId, amountPaise }) {
      return db.runTransaction(async (tx) => {
        const oSnap = await tx.get(order(orderId));
        const o = oSnap.exists ? oSnap.data() : null;
        checkCredit(o, amountPaise);
        const uSnap = await tx.get(user(o.uid));
        const balance = uSnap.exists ? uSnap.data().balancePaise || 0 : 0;
        if (o.status === "paid") return { credited: false, uid: o.uid, balancePaise: balance };
        if (!uSnap.exists) throw new Error("unknown user");
        const bonusPaise = bonusFor(o.amountPaise);
        const next = balance + o.amountPaise + bonusPaise;
        const row = txRow({ orderId, paymentId, amountPaise: o.amountPaise, bonusPaise, balanceAfterPaise: next });
        tx.update(user(o.uid), { balancePaise: next });
        tx.update(order(orderId), { status: "paid", paymentId: paymentId || "", paidAt: nowIso() });
        tx.set(user(o.uid).collection("transactions").doc(row.id), row);
        return { credited: true, uid: o.uid, balancePaise: next };
      });
    },
    async saveReport(uid, rec) {
      const row = reportRow(rec);
      await user(uid).collection("reports").doc(row.id).set(row);
      return row.id;
    },
    async listReports(uid, limit = 50) {
      const snap = await user(uid).collection("reports").orderBy("createdAt", "desc").limit(limit).get();
      return snap.docs.map((d) => reportMeta(d.data()));
    },
    async getReport(uid, id) {
      if (!/^[\w-]{6,60}$/.test(String(id))) return null;
      const s2 = await user(uid).collection("reports").doc(id).get();
      return s2.exists ? s2.data() : null;
    },
    async listTransactions(uid, limit = 50) {
      const s = await user(uid).collection("transactions").orderBy("createdAt", "desc").limit(limit).get();
      return s.docs.map((d) => d.data());
    },
    async spend({ uid, amountPaise, kind, label }) {
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(user(uid));
        if (!snap.exists) throw new Error("unknown user");
        const balance = snap.data().balancePaise || 0;
        if (balance < amountPaise) return { ok: false, balancePaise: balance };
        const next = balance - amountPaise;
        const row = moveRow("spend", { amountPaise: -amountPaise, balanceAfterPaise: next, kind, label });
        tx.update(user(uid), { balancePaise: next });
        tx.set(user(uid).collection("transactions").doc(row.id), row);
        return { ok: true, balancePaise: next, id: row.id };
      });
    },
    async refund({ uid, id }) {
      return db.runTransaction(async (tx) => {
        const rowRef = user(uid).collection("transactions").doc(id);
        const [uSnap, rSnap] = await Promise.all([tx.get(user(uid)), tx.get(rowRef)]);
        const row = rSnap.exists ? rSnap.data() : null;
        const balance = uSnap.exists ? uSnap.data().balancePaise || 0 : 0;
        if (!row || row.type !== "spend" || row.refunded) return { refunded: false, balancePaise: balance };
        const next = balance - row.amountPaise;
        const back = moveRow("refund", { amountPaise: -row.amountPaise, balanceAfterPaise: next, kind: row.kind, label: row.label, ref: id });
        tx.update(user(uid), { balancePaise: next });
        tx.update(rowRef, { refunded: true });
        tx.set(user(uid).collection("transactions").doc(back.id), back);
        return { refunded: true, balancePaise: next };
      });
    },
    async grantWelcome({ uid, phone, amountPaise }) {
      if (!phone || !amountPaise) return { granted: false, balancePaise: 0 };
      const key = String(phone).replace(/[^\d+]/g, "");
      return db.runTransaction(async (tx) => {
        const [uSnap, wSnap] = await Promise.all([tx.get(user(uid)), tx.get(db.doc(`welcomes/${key}`))]);
        if (!uSnap.exists) throw new Error("unknown user");
        const u = uSnap.data(), balance = u.balancePaise || 0;
        if (u.welcomed || wSnap.exists) {
          if (!u.welcomed) tx.update(user(uid), { welcomed: true });
          return { granted: false, balancePaise: balance };
        }
        const next = balance + amountPaise;
        const row = moveRow("welcome", { amountPaise, balanceAfterPaise: next, label: "Welcome credit" });
        tx.set(db.doc(`welcomes/${key}`), { uid, createdAt: nowIso() });
        tx.update(user(uid), { balancePaise: next, welcomed: true });
        tx.set(user(uid).collection("transactions").doc(row.id), row);
        return { granted: true, balancePaise: next };
      });
    },
  };
}
