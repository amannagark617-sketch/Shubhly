// The AI guides: the cards in the page and the chat panel.

import { GUIDES, GUIDE_BY_ID, gtext, isResting, backAt, avatarSvg } from "/guides.js";
import { esc, renderMarkdown } from "/lib.js";

const $ = (id) => document.getElementById(id);
const HISTORY_KEEP = 30;

export function initGuides({ t, getLang, store, toast, getBirth, getBrief, share }) {
  const cid = (() => {
    let id = store.get("shubhly.cid", null);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^\w-]/g, "");
      store.set("shubhly.cid", id);
    }
    return id;
  })();

  let left = store.get("shubhly.chatLeft", null); // null = unlimited
  let open = null; // the guide in the panel
  let history = [];
  let busy = false;
  let opener = null;
  let cached = null; // last brief, kept while switching guides
  let brief = null; // what we know about the visitor's kundli, for the open chat

  const hist = (id) => store.get(`shubhly.chat.${id}`, []);
  const save = () => store.set(`shubhly.chat.${open.id}`, history.slice(-HISTORY_KEEP));
  const setLeft = (n) => { left = Number.isInteger(n) ? n : null; store.set("shubhly.chatLeft", left); };
  const limited = () => left !== null;
  const out = () => limited() && left <= 0;
  const avatar = (g, cls = "") => `<div class="avatar ${cls}">${avatarSvg(g.look)}</div>`;
  const role = (g) => gtext(g.role, getLang());

  // ---------- cards ----------
  function renderCards() {
    const lang = getLang();
    $("guideGrid").innerHTML = GUIDES.map((g) => {
      const rest = isResting(g);
      return `<article class="guide${rest ? " guide--rest" : ""}">
        <div class="guide-top">${avatar(g)}
          <div><h3>${esc(g.name)}</h3>
          <span class="badge-ai">${esc(t("g_ai"))}</span></div>
        </div>
        <p class="guide-role">${esc(role(g))}</p>
        <p class="guide-blurb">${esc(gtext(g.blurb, lang))}</p>
        <p class="guide-state"><i class="dot${rest ? "" : " dot--on"}"></i>${esc(rest ? t("g_rest", { time: backAt(g) }) : t("g_on"))}</p>
        <button type="button" class="btn ${rest ? "btn-outline" : "btn-primary"} btn-wide" data-guide="${g.id}"${rest ? " disabled" : ""}>${esc(t("g_chat"))}</button>
      </article>`;
    }).join("");
  }

  // ---------- panel ----------
  function bubble(m) {
    return m.role === "user"
      ? `<div class="msg msg--me"><p>${esc(m.text)}</p></div>`
      : `<div class="msg msg--guide">${renderMarkdown(m.text)}</div>`;
  }

  function renderLog() {
    const hello = brief
      ? t("g_intro_chart", { user: brief.user, name: open.name, summary: brief.summary }).replace(/\s+,/g, ",")
      : t("g_intro", { name: open.name, role: role(open).toLowerCase() });
    const intro = `<div class="msg msg--guide"><p>${esc(hello)}</p></div>`;
    $("chatLog").innerHTML = intro + history.map(bubble).join("");
    scrollDown();
    const starters = [...gtext(open.starters, getLang())];
    if (brief?.moon) starters.unshift(t("g_ask_moon", { sign: brief.moon }));
    $("chatStarters").innerHTML = history.length || out() ? "" :
      starters.slice(0, 3).map((s) => `<button type="button" class="chip-btn">${esc(s)}</button>`).join("");
  }

  // Errors show inside the chat; a toast would sit behind the open chat.
  function problem(text) {
    $("chatLog").querySelector(".msg--error")?.remove();
    $("chatLog").insertAdjacentHTML("beforeend", `<div class="msg msg--error" role="alert"><p>${esc(text)}</p></div>`);
    scrollDown();
  }

  function scrollDown() {
    const log = $("chatLog");
    log.scrollTop = log.scrollHeight;
  }

  function renderList() {
    $("chatList").innerHTML = GUIDES.map((g) => {
      const rest = isResting(g);
      return `<button type="button" class="chat-pick${open?.id === g.id ? " is-on" : ""}" data-pick="${g.id}"${rest ? " disabled" : ""}>
        ${avatar(g, "avatar--sm")}
        <span><b>${esc(g.name)}</b><small>${esc(role(g))}</small></span><i class="dot${rest ? "" : " dot--on"}"></i></button>`;
    }).join("");
  }

  function renderMeta() {
    const chips = brief
      ? brief.chips.map(([k, v]) => `<span class="ctx-chip"><small>${esc(k)}</small>${esc(v)}</span>`).join("")
      : getBirth()
        ? `<span class="meta-on">${esc(t("g_chart_on"))}</span>`
        : `<button type="button" class="link-btn" id="chatMake">${esc(t("g_chart_off"))}</button>`;
    const shareBtn = getBirth() ? `<button type="button" class="ctx-share" id="chatShare">${esc(t("g_share_k"))}</button>` : "";
    const lft = limited() ? `<span class="chat-left">${esc(t("g_free_left", { n: left }))}</span>` : "";
    $("chatCtx").innerHTML = `<div class="ctx-chips">${chips}</div>${shareBtn}${lft}`;
    const wall = out();
    $("chatWall").hidden = !wall;
    $("chatForm").hidden = wall;
    renderList();
    scrollDown();
  }

  function openChat(g, from) {
    open = g;
    opener = from || null;
    history = hist(g.id);
    $("chatAvatar").innerHTML = avatarSvg(g.look);
    $("chatName").textContent = g.name;
    $("chatRole").textContent = role(g);
    $("chatNote").textContent = t("g_note", { name: g.name });
    brief = cached;
    renderLog();
    renderMeta();
    $("chat").hidden = false;
    document.documentElement.classList.add("chat-open");
    if (!out() && matchMedia("(pointer: fine)").matches) setTimeout(() => $("chatInput").focus(), 50);
    // Read the visitor's kundli so the guide can greet them by it.
    if (getBirth()) {
      getBrief().then((b) => {
        if (!b || open?.id !== g.id) return;
        brief = cached = b;
        if (!history.length) renderLog();
        renderMeta();
      }).catch(() => {});
    }
  }

  function closeChat() {
    $("chat").hidden = true;
    document.documentElement.classList.remove("chat-open");
    open = null;
    if (opener && document.contains(opener)) opener.focus();
  }

  function typing(on) {
    const el = $("chatLog").querySelector(".msg--typing");
    if (!on) { el?.remove(); return; }
    if (el) return;
    $("chatLog").insertAdjacentHTML("beforeend",
      `<div class="msg msg--guide msg--typing" role="status"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr">${esc(t("g_typing"))}</span></div>`);
    scrollDown();
  }

  async function send(text) {
    text = text.trim();
    if (!text || busy || !open || out()) return;
    busy = true;
    const g = open;
    history.push({ role: "user", text });
    save();
    $("chatLog").insertAdjacentHTML("beforeend", bubble({ role: "user", text }));
    $("chatLog").querySelector(".msg--error")?.remove();
    $("chatStarters").innerHTML = "";
    $("chatInput").value = "";
    fit();
    typing(true);
    $("chatSend").disabled = true;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guide: g.id, cid, messages: history, language: getLang(), birth: getBirth() || undefined }),
      });
      let data = null;
      try { data = await res.json(); } catch { /* ignore */ }
      if (open?.id !== g.id) return; // closed or switched meanwhile
      typing(false);
      if (res.status === 402) {
        history.pop(); save();
        setLeft(0);
        $("chatLog").lastElementChild?.remove();
        renderMeta();
        return;
      }
      if (res.status === 409) {
        history.pop(); save();
        $("chatLog").lastElementChild?.remove();
        $("chatInput").value = text;
        problem(t("g_rest_msg", { name: g.name }));
        renderCards();
        return;
      }
      if (!res.ok) throw new Error(data?.error || t("err_generic"));
      history.push({ role: "model", text: data.reply });
      save();
      setLeft(data.left);
      $("chatLog").insertAdjacentHTML("beforeend", bubble({ role: "model", text: data.reply }));
      scrollDown();
      renderMeta();
    } catch (e) {
      typing(false);
      history.pop(); save();
      $("chatLog").lastElementChild?.remove();
      $("chatInput").value = text;
      fit();
      problem(e.message || t("err_generic"));
    } finally {
      busy = false;
      $("chatSend").disabled = false;
      if (open && !out()) $("chatInput").focus();
    }
  }

  function fit() {
    const el = $("chatInput");
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  // ---------- events ----------
  $("guideGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-guide]");
    if (b && !b.disabled) openChat(GUIDE_BY_ID[b.dataset.guide], b);
  });
  $("chatClose").addEventListener("click", closeChat);
  $("chatBack").addEventListener("click", closeChat);
  $("chatList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pick]");
    if (b && !b.disabled && open && b.dataset.pick !== open.id && !busy) openChat(GUIDE_BY_ID[b.dataset.pick], opener);
  });
  $("chatNew").addEventListener("click", () => {
    if (!open || busy) return;
    history = [];
    save();
    renderLog();
  });
  $("chatStarters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip-btn");
    if (b) send(b.textContent);
  });
  $("chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    send($("chatInput").value);
  });
  $("chatInput").addEventListener("input", fit);
  $("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !matchMedia("(pointer: coarse)").matches) {
      e.preventDefault();
      send($("chatInput").value);
    }
  });
  $("chat").addEventListener("click", (e) => {
    if (e.target.closest("#chatMake")) { closeChat(); if (document.body.dataset.page === "kundli") document.getElementById("kundli").scrollIntoView({ behavior: "smooth" }); else location.href = "/kundli"; }
    if (e.target.closest("#chatShare")) share();
    if (e.target.closest("#chatPremium")) { closeChat(); location.href = "/premium"; }
  });
  document.addEventListener("keydown", (e) => {
    if ($("chat").hidden) return;
    if (e.key === "Escape") { closeChat(); return; }
    if (e.key === "Tab") { // keep focus inside the panel
      const items = [...$("chat").querySelectorAll("button:not([disabled]), textarea, a[href]")].filter((x) => x.offsetParent);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // The server is the source of truth for free messages.
  fetch(`/api/chat/status?cid=${encodeURIComponent(cid)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d) { setLeft(d.left); if (open) renderMeta(); } })
    .catch(() => {});

  renderCards();
  setInterval(renderCards, 60_000); // availability changes with the hour

  return {
    // Called when the language changes or a kundli is made.
    refresh() {
      cached = null;
      renderCards();
      if (open) {
        brief = null;
        if (getBirth()) getBrief().then((b) => { if (b && open) { brief = cached = b; renderLog(); renderMeta(); } }).catch(() => {});
        $("chatNote").textContent = t("g_note", { name: open.name }); $("chatRole").textContent = role(open); renderLog(); renderMeta(); }
    },
  };
}
