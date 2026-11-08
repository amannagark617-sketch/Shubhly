// Login and wallet panel. Firebase (login) and Razorpay (payment) are loaded only when someone needs them,
// so a visitor who never logs in downloads nothing extra. Switched on by the server (config.accounts).
import { esc } from "/lib.js";
import { getLang } from "/i18n.js";

const FB = "https://www.gstatic.com/firebasejs/11.0.2";
const RZP = "https://checkout.razorpay.com/v1/checkout.js";

const D = {
  en: {
    login_btn: "Login", close: "Close",
    login_title: "Log in or sign up", login_sub: "Save your details and add money to your Kundli Kaka wallet.",
    google: "Continue with Google", or: "or", mobile: "Mobile number", send_otp: "Send OTP", sending: "Sending…",
    otp_title: "Enter the code", otp_sub: "We sent a 6-digit code to {n}.", verify: "Verify", verifying: "Checking…",
    change: "Change number", resend: "Resend code", resend_in: "Resend in {s}s",
    name_title: "What should we call you?", name_ph: "Your name", name_save: "Save and continue", saving: "Saving…",
    hello: "Namaste, {n}", bal: "Wallet balance", add_title: "Add money", other: "Other amount", range: "₹{min} to ₹{max}",
    add_btn: "Add {a}", opening: "Opening payment…", pay_note: "Paid securely through Razorpay: UPI, cards and netbanking.",
    test_note: "Test mode: no real money is charged.", soon: "Adding money will be available soon.",
    hist: "History", hist_empty: "No top-ups yet.", added: "Added to wallet", balance_after: "Balance {a}",
    logout: "Log out", edit_name: "Edit name",
    added_toast: "{a} added to your wallet", pending: "Payment received. Your wallet will update in a moment.",
    failed: "The payment did not go through. Please try again.",
    e_phone: "Enter a valid 10-digit mobile number.", e_code: "That code is not right. Please try again.",
    e_many: "Too many attempts. Please try again later.", e_popup: "Please allow pop-ups to log in with Google.",
    e_domain: "Login is not enabled for this website yet.", e_generic: "Something went wrong. Please try again.",
    e_amount: "Enter an amount between ₹{min} and ₹{max}.", e_net: "Could not connect. Check your internet and try again.",
  },
  hi: {
    login_btn: "लॉग इन", close: "बंद करें",
    login_title: "लॉग इन या साइन अप करें",
    login_sub: "अपनी जानकारी सुरक्षित रखें और कुंडली काका वॉलेट में पैसे जोड़ें।",
    google: "Google से जारी रखें", or: "या", mobile: "मोबाइल नंबर",
    send_otp: "OTP भेजें", sending: "भेज रहे हैं…",
    otp_title: "कोड डालें", otp_sub: "हमने {n} पर 6 अंकों का कोड भेजा है।",
    verify: "जाँचें", verifying: "जाँच रहे हैं…",
    change: "नंबर बदलें", resend: "कोड दोबारा भेजें", resend_in: "{s} सेकंड में दोबारा भेजें",
    name_title: "हम आपको क्या कहकर बुलाएँ?", name_ph: "आपका नाम",
    name_save: "सेव करें और आगे बढ़ें", saving: "सेव हो रहा है…",
    hello: "नमस्ते, {n}", bal: "वॉलेट बैलेंस", add_title: "पैसे जोड़ें",
    other: "दूसरी राशि", range: "₹{min} से ₹{max}", add_btn: "{a} जोड़ें",
    opening: "भुगतान खोल रहे हैं…",
    pay_note: "Razorpay के ज़रिए सुरक्षित भुगतान: UPI, कार्ड और नेटबैंकिंग।",
    test_note: "टेस्ट मोड: असली पैसे नहीं कटते।",
    soon: "पैसे जोड़ने की सुविधा जल्द आ रही है।",
    hist: "इतिहास", hist_empty: "अभी कोई टॉप-अप नहीं।",
    added: "वॉलेट में जोड़े गए", balance_after: "बैलेंस {a}",
    logout: "लॉग आउट", edit_name: "नाम बदलें",
    added_toast: "{a} आपके वॉलेट में जुड़ गए",
    pending: "भुगतान मिल गया। वॉलेट कुछ ही देर में अपडेट होगा।",
    failed: "भुगतान पूरा नहीं हुआ। कृपया फिर से कोशिश करें।",
    e_phone: "10 अंकों का सही मोबाइल नंबर डालें।",
    e_code: "यह कोड सही नहीं है। फिर से कोशिश करें।",
    e_many: "बहुत अधिक कोशिशें। कृपया थोड़ी देर बाद कोशिश करें।",
    e_popup: "Google से लॉग इन के लिए पॉप-अप की अनुमति दें।",
    e_domain: "इस वेबसाइट के लिए लॉग इन अभी चालू नहीं है।",
    e_generic: "कुछ गलत हो गया। कृपया फिर से कोशिश करें।",
    e_amount: "₹{min} से ₹{max} के बीच की राशि डालें।",
    e_net: "कनेक्ट नहीं हो सका। इंटरनेट जाँचें और फिर कोशिश करें।",
  },
};
const tr = (k, v = {}) => (D[getLang()]?.[k] ?? D.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? "");
const inr = (p) => "₹" + (p / 100).toLocaleString("en-IN", { minimumFractionDigits: p % 100 ? 2 : 0 });
const HINT = "kk.acct";
const QUICK = [100, 250, 500, 1000];

const loaded = new Map();
function loadScript(src) {
  if (!loaded.has(src)) {
    loaded.set(src, new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = () => { loaded.delete(src); no(new Error("script")); };
      document.head.appendChild(s);
    }));
  }
  return loaded.get(src);
}

export function initAccount({ toast, config }) {
  const cfg = config?.accounts;
  if (!cfg?.firebase) return; // accounts are not switched on: nothing is added to the page

  const state = { fb: null, user: null, history: null, view: "login", phone: "", confirmation: null, verifier: null, busy: false, error: "", timer: 0, resendAt: 0 };
  const hint = () => { try { return JSON.parse(localStorage.getItem(HINT) || "null"); } catch { return null; } };
  const saveHint = (u) => { try { u ? localStorage.setItem(HINT, JSON.stringify({ name: u.name, balancePaise: u.balancePaise })) : localStorage.removeItem(HINT); } catch { /* private mode */ } };

  // ---- the button in the header (and the menu on phones) ----
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "acc-btn"; btn.id = "accBtn";
  document.querySelector(".nav-end")?.insertBefore(btn, document.getElementById("menuBtn"));
  const drawerLink = document.createElement("a");
  drawerLink.href = "#account"; drawerLink.className = "acc-drawer";
  [...document.querySelectorAll(".drawer-heading")].find((h) => /account/i.test(h.textContent))?.after(drawerLink);

  function paintButton() {
    const u = state.user || hint();
    if (u?.name || u?.balancePaise != null) {
      const first = (u.name || "?").trim().charAt(0).toUpperCase() || "?";
      btn.innerHTML = `<span class="acc-av" aria-hidden="true">${esc(first)}</span><span class="acc-bal">${esc(inr(u.balancePaise || 0))}</span>`;
      btn.setAttribute("aria-label", `${u.name || ""} ${inr(u.balancePaise || 0)}`.trim());
      drawerLink.textContent = `${u.name || tr("login_btn")} · ${inr(u.balancePaise || 0)}`;
    } else {
      btn.textContent = tr("login_btn"); btn.removeAttribute("aria-label"); drawerLink.textContent = tr("login_btn");
    }
  }

  // ---- the panel ----
  const back = document.createElement("div");
  back.className = "acc-back"; back.hidden = true;
  back.innerHTML = `<div class="acc-modal" role="dialog" aria-modal="true" aria-labelledby="accTitle"><button type="button" class="acc-x" aria-label="Close">×</button><div class="acc-body" id="accBody"></div></div>`;
  document.body.appendChild(back);
  const body = back.querySelector("#accBody");
  const modal = back.querySelector(".acc-modal");

  const open = async () => {
    back.hidden = false; document.body.classList.add("acc-open");
    back.querySelector(".acc-x").setAttribute("aria-label", tr("close"));
    state.error = "";
    if (!state.fb) { body.innerHTML = `<p class="acc-wait"><span class="spinner"></span></p>`; try { await ensureFirebase(); } catch { state.error = tr("e_net"); } }
    route();
  };
  const close = () => { back.hidden = true; document.body.classList.remove("acc-open"); btn.focus({ preventScroll: true }); };
  btn.addEventListener("click", open);
  drawerLink.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("navDrawer")?.setAttribute("hidden", ""); open(); });
  back.addEventListener("click", (e) => { if (e.target === back) close(); });
  back.querySelector(".acc-x").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !back.hidden) close(); });
  document.addEventListener("kk:lang", () => { paintButton(); if (!back.hidden) route(); });

  // ---- Firebase login ----
  async function ensureFirebase() {
    if (state.fb) return state.fb;
    const [appM, A] = await Promise.all([import(`${FB}/firebase-app.js`), import(`${FB}/firebase-auth.js`)]);
    const app = appM.getApps().length ? appM.getApp() : appM.initializeApp(cfg.firebase);
    const auth = A.getAuth(app);
    state.fb = { auth, A };
    A.onAuthStateChanged(auth, async (u) => {
      if (!u) { state.user = null; state.history = null; saveHint(null); paintButton(); if (!back.hidden) route(); return; }
      try { await loadMe(); } catch { /* shown by route() if the panel is open */ }
      paintButton(); if (!back.hidden) route();
    });
    return state.fb;
  }

  async function api(path, opts = {}) {
    const { auth } = await ensureFirebase();
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw Object.assign(new Error("auth"), { code: "AUTH" });
    let res;
    try {
      res = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: opts.body ? JSON.stringify(opts.body) : undefined });
    } catch { throw new Error(tr("e_net")); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || tr("e_generic")), { code: data.code, status: res.status });
    return data;
  }

  async function loadMe() {
    const me = await api("/api/account/me");
    state.user = { ...me.user, needsName: me.needsName };
    saveHint(state.user);
  }
  async function loadHistory() {
    try { state.history = (await api("/api/account/transactions")).transactions; } catch { state.history = []; }
  }

  const authMessage = (e) => ({
    "auth/invalid-phone-number": tr("e_phone"), "auth/missing-phone-number": tr("e_phone"),
    "auth/invalid-verification-code": tr("e_code"), "auth/code-expired": tr("e_code"),
    "auth/too-many-requests": tr("e_many"), "auth/popup-blocked": tr("e_popup"),
    "auth/unauthorized-domain": tr("e_domain"), "auth/network-request-failed": tr("e_net"),
  }[e?.code] || (e?.message && !/^Firebase/.test(e.message) && e.code == null ? e.message : tr("e_generic")));

  // ---- views ----
  const err = () => `<p class="acc-err" role="alert">${esc(state.error)}</p>`;
  const bal = () => state.user?.balancePaise || 0;

  function route() {
    clearInterval(state.timer);
    if (state.user) return state.user.needsName || state.view === "name" ? viewName() : viewWallet();
    return state.view === "otp" && state.confirmation ? viewOtp() : viewLogin();
  }
  const mount = (html) => {
    body.innerHTML = html;
    const f = body.querySelector("[autofocus], input, button.acc-primary");
    if (f && matchMedia("(hover:hover)").matches) f.focus({ preventScroll: true });
  };
  const busyBtn = (b, on, label) => { b.disabled = on; b.textContent = label; };

  function viewLogin() {
    state.view = "login";
    mount(`<h2 id="accTitle">${tr("login_title")}</h2><p class="acc-sub">${tr("login_sub")}</p>
      <button type="button" class="acc-google" id="accGoogle"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>${tr("google")}</button>
      <div class="acc-or"><span>${tr("or")}</span></div>
      <label class="acc-label" for="accPhone">${tr("mobile")}</label>
      <div class="acc-phone"><span class="acc-cc">+91</span><input id="accPhone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="98XXXXXXXX" value="${esc(state.phone)}"></div>
      <button type="button" class="acc-primary" id="accSend">${tr("send_otp")}</button>${err()}`);
    body.querySelector("#accGoogle").onclick = google;
    body.querySelector("#accSend").onclick = sendOtp;
    body.querySelector("#accPhone").onkeydown = (e) => { if (e.key === "Enter") sendOtp(); };
  }

  async function google() {
    state.error = "";
    try {
      const { auth, A } = await ensureFirebase();
      auth.languageCode = getLang() === "hi" ? "hi" : "en";
      await A.signInWithPopup(auth, new A.GoogleAuthProvider());
    } catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
      state.error = authMessage(e); route();
    }
  }

  async function sendOtp() {
    const input = body.querySelector("#accPhone"), b = body.querySelector("#accSend");
    const digits = input.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    state.phone = digits;
    if (!/^[6-9]\d{9}$/.test(digits)) { state.error = tr("e_phone"); return viewLogin(); }
    state.error = ""; busyBtn(b, true, tr("sending"));
    try {
      const { auth, A } = await ensureFirebase();
      auth.languageCode = getLang() === "hi" ? "hi" : "en";
      state.verifier?.clear(); state.verifier = new A.RecaptchaVerifier(auth, "accSend", { size: "invisible" });
      state.confirmation = await A.signInWithPhoneNumber(auth, "+91" + digits, state.verifier);
      state.view = "otp"; state.resendAt = Date.now() + 30000; viewOtp();
    } catch (e) {
      try { state.verifier?.clear(); } catch { /* gone already */ }
      state.verifier = null; state.error = authMessage(e); viewLogin();
    }
  }

  function viewOtp() {
    mount(`<h2 id="accTitle">${tr("otp_title")}</h2><p class="acc-sub">${tr("otp_sub", { n: "+91 " + esc(state.phone) })}</p>
      <input id="accCode" class="acc-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="• • • • • •" aria-label="${tr("otp_title")}">
      <button type="button" class="acc-primary" id="accVerify">${tr("verify")}</button>${err()}
      <div class="acc-links"><button type="button" class="acc-link" id="accChange">${tr("change")}</button><button type="button" class="acc-link" id="accResend" disabled></button></div>`);
    const code = body.querySelector("#accCode"), go = body.querySelector("#accVerify"), re = body.querySelector("#accResend");
    code.oninput = () => { code.value = code.value.replace(/\D/g, "").slice(0, 6); if (code.value.length === 6) confirm(); };
    go.onclick = confirm;
    body.querySelector("#accChange").onclick = () => { state.view = "login"; state.confirmation = null; state.error = ""; viewLogin(); };
    const tick = () => { const s = Math.ceil((state.resendAt - Date.now()) / 1000); re.disabled = s > 0; re.textContent = s > 0 ? tr("resend_in", { s }) : tr("resend"); };
    re.onclick = () => { state.view = "login"; state.confirmation = null; viewLogin(); body.querySelector("#accSend")?.click(); };
    tick(); state.timer = setInterval(tick, 1000);
    async function confirm() {
      if (code.value.length !== 6 || go.disabled) return;
      busyBtn(go, true, tr("verifying")); state.error = "";
      try { await state.confirmation.confirm(code.value); } catch (e) { state.error = authMessage(e); viewOtp(); }
    }
  }

  function viewName() {
    state.view = "name";
    mount(`<h2 id="accTitle">${tr("name_title")}</h2>
      <input id="accName" class="acc-input" type="text" maxlength="40" autocomplete="name" placeholder="${tr("name_ph")}" value="${esc(state.user?.name || "")}" aria-label="${tr("name_ph")}">
      <button type="button" class="acc-primary" id="accSaveName">${tr("name_save")}</button>${err()}`);
    const input = body.querySelector("#accName"), b = body.querySelector("#accSaveName");
    const save = async () => {
      busyBtn(b, true, tr("saving")); state.error = "";
      try {
        const r = await api("/api/account/me", { method: "PUT", body: { name: input.value } });
        state.user = { ...r.user, needsName: false }; saveHint(state.user); state.view = "wallet"; paintButton(); route();
      } catch (e) { state.error = e.message; viewName(); }
    };
    b.onclick = save; input.onkeydown = (e) => { if (e.key === "Enter") save(); };
  }

  function viewWallet() {
    state.view = "wallet";
    const t = cfg.topup;
    const rows = state.history == null ? `<p class="acc-muted"><span class="spinner"></span></p>`
      : state.history.length === 0 ? `<p class="acc-muted">${tr("hist_empty")}</p>`
        : `<ul class="acc-hist">${state.history.map((x) => `<li><div><strong>${tr("added")}</strong><span>${esc(new Date(x.createdAt).toLocaleDateString(getLang() === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }))} · ${tr("balance_after", { a: inr(x.balanceAfterPaise) })}</span></div><b>+${esc(inr(x.amountPaise))}</b></li>`).join("")}</ul>`;
    const add = t ? `<h3>${tr("add_title")}</h3>
      <div class="acc-quick">${QUICK.filter((a) => a >= t.min && a <= t.max).map((a) => `<button type="button" data-amt="${a}">₹${a}</button>`).join("")}</div>
      <label class="acc-label" for="accAmt">${tr("other")} <span class="acc-muted">(${tr("range", { min: t.min, max: t.max.toLocaleString("en-IN") })})</span></label>
      <input id="accAmt" class="acc-input" type="text" inputmode="numeric" maxlength="6" placeholder="500">
      <button type="button" class="acc-primary" id="accPay" disabled>${tr("add_btn", { a: "" }).trim()}</button>
      <p class="acc-note">${tr("pay_note")}${t.live ? "" : " " + tr("test_note")}</p>` : `<p class="acc-muted">${tr("soon")}</p>`;
    mount(`<h2 id="accTitle">${tr("hello", { n: esc(state.user.name || "") })}</h2>
      <div class="acc-balance"><span>${tr("bal")}</span><strong>${esc(inr(bal()))}</strong></div>${err()}${add}
      <h3>${tr("hist")}</h3>${rows}
      <div class="acc-links"><button type="button" class="acc-link" id="accEdit">${tr("edit_name")}</button><button type="button" class="acc-link" id="accOut">${tr("logout")}</button></div>`);
    body.querySelector("#accEdit").onclick = viewName;
    body.querySelector("#accOut").onclick = async () => { await state.fb.A.signOut(state.fb.auth); state.view = "login"; state.confirmation = null; close(); };
    if (state.history == null) loadHistory().then(() => { if (!back.hidden && state.view === "wallet" && state.user) viewWallet(); });
    if (t) wireTopup(t);
  }

  function wireTopup(t) {
    const input = body.querySelector("#accAmt"), pay = body.querySelector("#accPay");
    const value = () => { const v = input.value.replace(/\D/g, ""); return v ? Number(v) : 0; };
    const sync = () => { const v = value(); pay.disabled = !v; pay.textContent = v ? tr("add_btn", { a: "₹" + v.toLocaleString("en-IN") }) : tr("add_btn", { a: "" }).trim(); };
    input.oninput = () => { input.value = input.value.replace(/\D/g, "").slice(0, 6); body.querySelectorAll(".acc-quick button").forEach((q) => q.classList.toggle("on", Number(q.dataset.amt) === value())); sync(); };
    body.querySelectorAll(".acc-quick button").forEach((q) => { q.onclick = () => { input.value = q.dataset.amt; input.oninput(); }; });
    pay.onclick = () => {
      const v = value();
      if (v < t.min || v > t.max) { state.error = tr("e_amount", { min: t.min, max: t.max.toLocaleString("en-IN") }); return viewWallet(); }
      topup(v, pay);
    };
    sync();
  }

  // ---- paying ----
  async function topup(rupees, payBtn) {
    state.error = ""; busyBtn(payBtn, true, tr("opening"));
    let order;
    try {
      order = await api("/api/account/topup", { method: "POST", body: { amount: rupees } });
      await loadScript(RZP);
    } catch (e) { state.error = e.code === "AUTH" ? tr("e_generic") : (e.message || tr("e_generic")); return viewWallet(); }
    const done = async (resp) => {
      try {
        const r = await api("/api/account/topup/verify", { method: "POST", body: resp });
        state.user.balancePaise = r.balancePaise; saveHint(state.user); paintButton();
        toast(tr("added_toast", { a: inr(order.amountPaise) }));
      } catch {
        toast(tr("pending")); // the payment went through; the webhook will credit it. Check again shortly.
        for (const wait of [4000, 10000, 20000]) { await new Promise((ok) => setTimeout(ok, wait)); try { await loadMe(); paintButton(); if (state.user.balancePaise > 0) break; } catch { /* keep trying */ } }
      }
      state.history = null; state.error = ""; if (!back.hidden) viewWallet(); else paintButton();
    };
    const rzp = new window.Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amountPaise, currency: order.currency,
      name: "Kundli Kaka", description: "Wallet top-up",
      prefill: { name: state.user.name || undefined, email: state.user.email || undefined, contact: state.user.phone || undefined },
      theme: { color: "#d8321a" },
      handler: done,
      modal: { ondismiss: () => { if (!back.hidden && state.view === "wallet") viewWallet(); } },
    });
    rzp.on("payment.failed", () => { state.error = tr("failed"); if (!back.hidden) viewWallet(); });
    rzp.open();
  }

  // ---- start ----
  paintButton();
  if (hint()) {
    // Someone who logged in before: show their name and balance straight away, and quietly restore the session.
    (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => ensureFirebase().catch(() => {}));
  }
}
