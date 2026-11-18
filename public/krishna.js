// Krishna on the Gita pages: reading helpers and a calm chat box.
// Kept separate from the astrologer chat so the Gita pages stay light.

const $ = (id) => document.getElementById(id);
const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

const track = (name, p = {}) => window.track?.(name, p);

// ---- meaning language on chapter pages ----
const main = document.querySelector(".gita-wrap");
const tools = document.querySelector(".gita-tools");
if (main && tools) {
  const apply = (l) => {
    main.dataset.lang = l;
    tools.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === l)));
  };
  apply(get("kk.gitaLang", "both"));
  tools.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-l]");
    if (!b) return;
    apply(b.dataset.l);
    set("kk.gitaLang", b.dataset.l);
  });
}

// ---- Krishna ----
const box = $("krishna");
if (box) {
  const log = $("kr-log"), input = $("kr-in"), form = $("kr-form"), send = $("kr-send"), ideas = $("kr-ideas"), note = $("kr-note");
  const cid = (() => {
    let id = get("shubhly.cid", null);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^\w-]/g, "");
      set("shubhly.cid", id);
    }
    return id;
  })();
  let history = get("kk.krishna", []).filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "model")).slice(-20);
  const W = () => window.kkWallet?.enabled ? window.kkWallet : null;

  // ---- "remember me": off until they turn it on, and they can erase it at any time ----
  const mem = $("kr-mem"), memOn = $("kr-mem-on"), memState = $("kr-mem-state"), memErase = $("kr-mem-erase");
  const memCall = async (method, body) => {
    const r = await fetch("/api/account/krishna-memory", { method, headers: { "Content-Type": "application/json", ...(await W().headers()) }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error("memory");
    return r.json();
  };
  const memPaint = (m) => {
    memOn.checked = !!m.on;
    memState.textContent = m.on ? (m.count ? `He remembers ${m.count} thing${m.count > 1 ? "s" : ""} about you.` : "He will remember what matters to you.") : "";
    memErase.hidden = !(m.on || m.count);
  };
  const memLoad = async () => {
    if (!mem || !W()?.loggedIn()) { if (mem) mem.hidden = true; return; }
    try { memPaint(await memCall("GET")); mem.hidden = false; } catch { mem.hidden = true; }
  };
  if (mem) {
    memOn.addEventListener("change", async () => { try { memPaint(await memCall("PUT", { on: memOn.checked })); } catch { memOn.checked = !memOn.checked; } });
    memErase.addEventListener("click", async () => { if (!confirm("Erase everything Krishna remembers about you?")) return; try { memPaint(await memCall("DELETE")); } catch { /* try again */ } });
    document.addEventListener("kk:wallet", () => setTimeout(memLoad, 600));
    document.addEventListener("kk:balance", memLoad);
    setTimeout(memLoad, 1500);
    input?.addEventListener("focus", memLoad);
  }
  let left = get("shubhly.chatLeft", null);
  let busy = false;
  const priceTag = () => { const w = W(); return w ? `Each written reply is ₹${w.prices.krishna / 100}.` : ""; };

  const stopAll = () => {};

  const add = (role, text, sig) => {
    const d = document.createElement("div");
    d.className = "kr-msg " + (role === "user" ? "km-me" : "km-ai");
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  };
  const render = () => {
    log.textContent = "";
    if (!history.length) add("model", "Welcome, dear one. Tell me what is on your mind, and we will look at it together, calmly, in the light of the Gita.");
    else history.forEach((m) => add(m.role, m.text, m.sig));
    ideas.hidden = history.length > 0;
  };
  const showLimit = () => {
    form.hidden = true; ideas.hidden = true;
    note.innerHTML = 'You have used your free messages for now. Keep reading the Gita here, it is always free. To keep talking with Krishna, write to <a href="mailto:hello@shubhlyastro.in?subject=Krishna%20chat">hello@shubhlyastro.in</a>.';
    track("chat_limit_reached", { where: "krishna" });
  };
  const open = (q) => {
    box.hidden = false;
    $("kr-open")?.setAttribute("hidden", "");
    render();
    if (!W() && left !== null && left <= 0) showLimit();
    if (W()) note.textContent = priceTag();
    if (q) { input.value = q; input.focus(); autosize(); }
    else input.focus({ preventScroll: true });
    track("krishna_open");
    box.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const close = () => { box.hidden = true; $("kr-open")?.removeAttribute("hidden"); };
  const autosize = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; };

  async function ask(text) {
    if (busy || !text.trim()) return;
    busy = true; send.disabled = true;
    const t = text.trim().slice(0, 500);
    history.push({ role: "user", text: t });
    ideas.hidden = true;
    add("user", t);
    input.value = ""; autosize();
    const wait = add("model", "…");
    wait.classList.add("wait");
    try {
      const r = await fetch("/api/krishna", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(W() ? await W().headers() : {}) },
        body: JSON.stringify({ cid, language: get("shubhly.lang", "en"), messages: history.slice(-12), people: get("shubhly.profiles", []).slice(0, 1) }),
      });
      const j = await r.json().catch(() => ({}));
      if ((r.status === 401 || r.status === 402) && W()) {
        wait.remove(); history.pop(); input.value = t; autosize();
        if (j.balancePaise != null) W().setBalance(j.balancePaise);
        W().prompt(r.status === 401 ? "login" : "funds", j.needPaise);
        return;
      }
      if (r.status === 402) { wait.remove(); history.pop(); left = 0; set("shubhly.chatLeft", 0); showLimit(); return; }
      if (!r.ok) throw new Error(j.error || "Krishna is quiet for a moment. Please try again.");
      if (!j.reply || !String(j.reply).trim()) throw new Error("Krishna is quiet for a moment. Please ask again.");
      wait.classList.remove("wait");
      wait.textContent = j.reply;
      history.push({ role: "model", text: j.reply, sig: j.sig });
      if (W() && j.balancePaise != null) W().setBalance(j.balancePaise);
      if (Number.isInteger(j.left)) { left = j.left; set("shubhly.chatLeft", left); }
      set("kk.krishna", history.slice(-20));
      if (!W() && left !== null && left <= 0) showLimit();
    } catch (e) {
      history.pop();
      wait.classList.remove("wait");
      wait.classList.add("err");
      wait.textContent = e.message || "Something went wrong. Please try again.";
    } finally {
      busy = false; send.disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  }

  $("kr-open")?.addEventListener("click", () => open());
  document.querySelectorAll("[data-kr-open]").forEach((b) => b.addEventListener("click", () => open()));
  document.querySelectorAll("[data-ask]").forEach((b) => b.addEventListener("click", () => { open(b.dataset.ask); }));
  $("kr-close").addEventListener("click", close);
  ideas.addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) ask(b.dataset.q); });
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
  box.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  // ---- calling Krishna (shown only when the live voice is switched on) ----
  fetch("/api/config").then((r) => r.json()).then(async (c) => {
    if (!c.call) return;
    $("kr-callbtn").hidden = false;
    const { initCall } = await import("/krishna-call.js");
    initCall({ root: box, wallet: W, lang: () => get("shubhly.lang", "en"), track });
    if (location.hash === "#call") $("kr-callbtn").click();
  }).catch(() => {});
  // The landing page sends people here with #call: open Krishna and go straight to the call screen.
  if (location.hash === "#krishna" || location.hash === "#call") open();
  window.addEventListener("hashchange", () => { if (location.hash === "#call") { open(); if (!$("kr-callbtn").hidden) $("kr-callbtn").click(); } });
}
