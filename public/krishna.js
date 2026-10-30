// Krishna on the Gita pages: reading helpers and a calm chat box.
// Kept separate from the astrologer chat so the Gita pages stay light.

const $ = (id) => document.getElementById(id);
const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

// ---- light analytics (same Google Analytics property as the main site) ----
let gaReady = false;
fetch("/api/config").then((r) => r.json()).then((c) => {
  if (!c.gaId) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", c.gaId);
  const s = document.createElement("script");
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${c.gaId}`;
  document.head.appendChild(s);
  gaReady = true;
}).catch(() => {});
const track = (name, p = {}) => { try { if (gaReady && window.gtag) window.gtag("event", name, p); } catch { /* ignore */ } };

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
  let left = get("shubhly.chatLeft", null);
  let busy = false;

  const add = (role, text) => {
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
    else history.forEach((m) => add(m.role, m.text));
    ideas.hidden = history.length > 0;
  };
  const showLimit = () => {
    form.hidden = true; ideas.hidden = true;
    note.innerHTML = 'You have used your free messages for now. Keep reading the Gita here, it is always free. Want more? <a href="/premium">Join the premium list</a> or write to <a href="mailto:hello@shubhlyastro.in?subject=Krishna%20chat">hello@shubhlyastro.in</a>.';
    track("chat_limit_reached", { where: "krishna" });
  };
  const open = (q) => {
    box.hidden = false;
    $("kr-open")?.setAttribute("hidden", "");
    render();
    if (left !== null && left <= 0) showLimit();
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
    track("krishna_message");
    try {
      const r = await fetch("/api/krishna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid, language: get("shubhly.lang", "en"), messages: history.slice(-12) }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 402) { wait.remove(); history.pop(); left = 0; set("shubhly.chatLeft", 0); showLimit(); return; }
      if (!r.ok) throw new Error(j.error || "Krishna is quiet for a moment. Please try again.");
      wait.classList.remove("wait");
      wait.textContent = j.reply;
      history.push({ role: "model", text: j.reply });
      if (Number.isInteger(j.left)) { left = j.left; set("shubhly.chatLeft", left); }
      set("kk.krishna", history.slice(-20));
      if (left !== null && left <= 0) showLimit();
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
  if (location.hash === "#krishna") open();
}
