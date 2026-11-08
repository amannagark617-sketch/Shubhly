// Where accounts, orders and wallet history are saved.
//   users/{uid}                     name, email, phone, balancePaise, createdAt, lastLoginAt
//   users/{uid}/transactions/{id}   one row per top-up (the id is the Razorpay payment id, so a repeat can never double-count)
//   orders/{orderId}                the payment order we created: who, how much, created | paid
// Amounts are whole paise. Only this server touches the database (see firestore.rules).

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

function txRow({ orderId, paymentId, amountPaise, balanceAfterPaise }) {
  return {
    id: paymentId || orderId, type: "topup", status: "success", amountPaise, balanceAfterPaise,
    orderId, paymentId: paymentId || "", createdAt: nowIso(),
  };
}

function checkCredit(order, amountPaise) {
  if (!order) throw new Error("unknown order");
  if (amountPaise != null && amountPaise !== order.amountPaise) throw new Error("amount mismatch");
}

// ---- in memory (tests, and local work with no database) ----------------------------------------
export function memoryStore() {
  const users = new Map(), orders = new Map(), txs = new Map();
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
      u.balancePaise += o.amountPaise;
      o.status = "paid"; o.paymentId = paymentId || ""; o.paidAt = nowIso();
      const row = txRow({ orderId, paymentId, amountPaise: o.amountPaise, balanceAfterPaise: u.balancePaise });
      txs.set(o.uid, [row, ...(txs.get(o.uid) || [])]);
      return { credited: true, uid: o.uid, balancePaise: u.balancePaise };
    },
    async listTransactions(uid, limit = 50) { return (txs.get(uid) || []).slice(0, limit); },
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
        const next = balance + o.amountPaise;
        const row = txRow({ orderId, paymentId, amountPaise: o.amountPaise, balanceAfterPaise: next });
        tx.update(user(o.uid), { balancePaise: next });
        tx.update(order(orderId), { status: "paid", paymentId: paymentId || "", paidAt: nowIso() });
        tx.set(user(o.uid).collection("transactions").doc(row.id), row);
        return { credited: true, uid: o.uid, balancePaise: next };
      });
    },
    async listTransactions(uid, limit = 50) {
      const s = await user(uid).collection("transactions").orderBy("createdAt", "desc").limit(limit).get();
      return s.docs.map((d) => d.data());
    },
  };
}
