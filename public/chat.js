// The AI astrologers: the cards in the page and the chat panel.

import { GUIDES, GUIDE_BY_ID, gtext, isResting, backAt } from "/guides.js";
import { esc, renderMarkdown } from "/lib.js";

const $ = (id) => document.getElementById(id);
const HISTORY_KEEP = 30;

export function initGuides({ t, getLang, store, toast, getPeople, getBrief, share }) {
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
  let until = 0; // when the paid minute ends (ms), 0 = none running
  let armed = false; // the visitor tapped "continue" for paid chat

  const hist = (id) => store.get(`shubhly.chat.${id}`, []);
  const save = () => store.set(`shubhly.chat.${open.id}`, history.slice(-HISTORY_KEEP));
  const setLeft = (n) => { left = Number.isInteger(n) ? n : null; store.set("shubhly.chatLeft", left); };
  const W = () => window.kkWallet?.enabled ? window.kkWallet : null; // the wallet, when accounts are switched on
  const limited = () => !W() && left !== null;
  const out = () => limited() && left <= 0;
  const paidMode = () => !!W() && left !== null && left <= 0; // the free questions are used: chat is paid by the minute
  const sessionOn = () => until > Date.now();
  const needsContinue = () => paidMode() && !sessionOn() && !armed;
  const minPaise = () => W()?.prices?.chatMin || 500;
  const clock = (ms) => { const sec = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; };
  const hhmm = (at) => at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase() : "";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const avatar = (g, cls = "") => g.image
    ? `<div class="avatar ${cls}"><img src="${g.image}" alt="${g.name}" loading="lazy" class="guide-avatar-img"></div>`
    : `<div class="avatar ${cls}"><span class="avatar-placeholder">${g.name.charAt(0)}</span></div>`;
  const role = (g) => gtext(g.role, getLang());
  // "Meera AI": the AI label is part of the name, not a tag under it.
  const named = (g) => `${esc(g.name)} <span class="ai-suffix"></span>`;

  // ---------- who the chat is about (one person, or two or three together) ----------
  const WHO = "shubhly.chatWho";
  function selected() {
    const all = getPeople();
    const keys = store.get(WHO, []);
    const picked = all.filter((p) => keys.includes(p.key));
    return (picked.length ? picked : all.slice(0, 1)).slice(0, 3);
  }
  function toggle(key) {
    let keys = selected().map((p) => p.key);
    if (keys.includes(key)) { if (keys.length > 1) keys = keys.filter((k) => k !== key); }
    else keys = [...keys, key].slice(-3);
    store.set(WHO, keys);
    brief = cached = null;
    loadBrief();
    renderLog();
    renderMeta();
  }
  function loadBrief() {
    const first = selected()[0];
    if (!first) return;
    getBrief(first.payload).then((b) => {
      if (!b || !open) return;
      brief = cached = b;
      if (!history.length) renderLog();
      renderMeta();
    }).catch(() => {});
  }
  const names = () => selected().map((p) => p.label).join(" & ");

  // ---------- cards ----------
  function renderCards() {
    const lang = getLang();
    $("guideGrid").innerHTML = GUIDES.map((g) => {
      const rest = isResting(g);
      return `<article class="guide${rest ? " guide--rest" : ""}">
        <div class="guide-top">${avatar(g)}
          <div><h3>${named(g)}</h3></div>
        </div>
        <p class="guide-role">${esc(role(g))}</p>
        <p class="guide-blurb">${esc(gtext(g.blurb, lang))}</p>
        <p class="guide-state"><i class="dot${rest ? "" : " dot--on"}"></i>${esc(rest ? t("g_rest", { time: backAt(g) }) : t("g_on"))}</p>
        <button type="button" class="btn ${rest ? "btn-outline" : "btn-primary"} btn-wide" data-guide="${g.id}"${rest ? " disabled" : ""}>${esc(t("g_chat"))}</button>
      </article>`;
    }).join("");
  }

  // ---------- panel ----------
  function bubble(m, seen = true) {
    const time = m.at ? `<span class="msg-t">${esc(hhmm(m.at))}${m.role === "user" ? `<span class="tick${seen ? " tick--read" : ""}" aria-hidden="true">\u2713\u2713</span>` : ""}</span>` : "";
    return m.role === "user"
      ? `<div class="msg msg--me"><p>${esc(m.text)}</p>${time}</div>`
      : `<div class="msg msg--guide">${renderMarkdown(m.text)}${time}</div>`;
  }

  function renderLog() {
    const together = selected().length > 1;
    const hello = together
      ? t("g_pair_intro", { names: names() })
      : brief
      ? t("g_intro_chart", { user: brief.user, name: open.name, summary: brief.summary }).replace(/\s+,/g, ",")
      : t("g_intro", { name: open.name, role: role(open).toLowerCase() });
    const intro = `<div class="msg msg--guide"><p>${esc(hello)}</p></div>`;
    const hint = W() && left > 0 && !history.length ? `<div class="msg-note">${esc(t("g_free_hint", { n: left }))}</div>` : "";
    $("chatLog").innerHTML = hint + intro + history.map((m) => bubble(m)).join("");
    scrollDown();
    const starters = [...gtext(open.starters, getLang())];
    if (together) starters.unshift(t("g_pair_q1"), t("g_pair_q2"), t("g_pair_q3"));
    else if (brief?.moon) starters.unshift(t("g_ask_moon", { sign: brief.moon }));
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
        <span><b>${named(g)}</b><small>${esc(role(g))}</small></span><i class="dot${rest ? "" : " dot--on"}"></i></button>`;
    }).join("");
  }

  function timerText() {
    return sessionOn() ? t("g_time_left", { t: clock(until - Date.now()) }) + " · " + t("g_min_price", { p: "₹" + minPaise() / 100 }) : t("g_min_price", { p: "₹" + minPaise() / 100 });
  }

  function renderMeta() {
    const all = getPeople();
    const sel = selected();
    const keys = sel.map((p) => p.key);
    const together = sel.length > 1;
    const people = all.length
      ? `<span class="ctx-who">${esc(t("g_who"))}</span>` + all.map((p) =>
          `<button type="button" class="who-chip${keys.includes(p.key) ? " is-on" : ""}" data-who="${esc(p.key)}" aria-pressed="${keys.includes(p.key)}">${esc(p.label)}</button>`).join("") +
        `<button type="button" class="link-btn" id="chatMake">${esc(t("g_add"))}</button>`
      : `<button type="button" class="link-btn" id="chatMake">${esc(t("g_chart_off"))}</button>`;
    const chips = !together && brief
      ? brief.chips.map(([k, v]) => `<span class="ctx-chip"><small>${esc(k)}</small>${esc(v)}</span>`).join("")
      : "";
    const shareBtn = sel.length ? `<button type="button" class="ctx-share" id="chatShare">${esc(t("g_share_k"))}</button>` : "";
    const w = W();
    const bal = w && w.loggedIn() ? " · " + esc(t("g_wallet", { b: "₹" + (w.balance() / 100).toLocaleString("en-IN") })) : "";
    const lft = w
      ? (left > 0
        ? `<span class="chat-left chat-left--free">${esc(t("g_free_q", { n: left }))}</span>`
        : `<span class="chat-left"><span id="chatTimer">${esc(timerText())}</span>${bal}</span>`)
      : limited() ? `<span class="chat-left">${esc(t("g_free_left", { n: left }))}</span>` : "";
    $("chatCtx").innerHTML = `<div class="ctx-who-row">${people}</div>${chips ? `<div class="ctx-chips">${chips}</div>` : ""}${shareBtn}${lft}`;
    const wall = out();
    const cont = needsContinue();
    $("chatCont").hidden = !cont;
    if (cont && open) {
      $("chatContAv").innerHTML = open.image ? `<img src="${open.image}" alt="" class="guide-avatar-img">` : "";
      $("chatContTx").textContent = t(until ? "g_cont_over" : "g_cont_h", { p: "₹" + minPaise() / 100 });
    }
    $("chatWall").hidden = !wall;
    if (wall && !window.__wallSeen) { window.__wallSeen = true; window.track?.("chat_limit_reached"); }
    $("chatForm").hidden = wall || cont;
    renderList();
    scrollDown();
  }

  function openChat(g, from) {
    open = g;
    opener = from || null;
    history = hist(g.id);
    $("chatAvatar").innerHTML = g.image
      ? `<img src="${g.image}" alt="${g.name}" loading="lazy" class="guide-avatar-img">`
      : `<span class="avatar-placeholder">${g.name.charAt(0)}</span>`;
    $("chatName").innerHTML = named(g);
    $("chatRole").textContent = role(g);
    $("chatNote").textContent = "";
    brief = cached;
    renderLog();
    renderMeta();
    $("chat").hidden = false;
    document.documentElement.classList.add("chat-open");
    if (!out() && matchMedia("(pointer: fine)").matches) setTimeout(() => $("chatInput").focus(), 50);
    // Read the visitor's kundli so the guide can greet them by it.
    if (!brief) loadBrief();
  }

  function closeChat() {
    $("chat").hidden = true;
    document.documentElement.classList.remove("chat-open");
    open = null;
    if (opener && document.contains(opener)) opener.focus();
  }

  function status(on) { if (open) $("chatRole").textContent = on ? t("g_typing_s") : role(open); }

  function typing(on) {
    status(on);
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
    const t0 = Date.now();
    history.push({ role: "user", text, at: t0 });
    save();
    $("chatLog").querySelector(".msg-note")?.remove();
    $("chatLog").insertAdjacentHTML("beforeend", bubble({ role: "user", text, at: t0 }, false));
    const mine = $("chatLog").lastElementChild;
    $("chatLog").querySelector(".msg--error")?.remove();
    $("chatStarters").innerHTML = "";
    $("chatInput").value = "";
    fit();
    scrollDown();
    // Like a real chat: the message is seen, then the astrologer types. Replies are never instant.
    const seenTimer = setTimeout(() => { mine.querySelector(".tick")?.classList.add("tick--read"); typing(true); }, 900);
    $("chatSend").disabled = true;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", ...(W() ? await W().headers() : {}) },
        body: JSON.stringify({ guide: g.id, cid, messages: history, language: getLang(), people: selected().map((p) => p.payload) }),
      });
      let data = null;
      try { data = await res.json(); } catch { /* ignore */ }
      if (open?.id !== g.id) { clearTimeout(seenTimer); return; } // closed or switched meanwhile
      if (res.ok && data?.reply && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const delay = Math.min(8000, 2400 + data.reply.length * 28);
        await sleep(Math.max(0, delay - (Date.now() - t0)));
        if (open?.id !== g.id) { clearTimeout(seenTimer); return; }
      }
      clearTimeout(seenTimer);
      mine.querySelector(".tick")?.classList.add("tick--read");
      typing(false);
      if ((res.status === 401 || res.status === 402) && W()) {
        history.pop(); save();
        $("chatLog").lastElementChild?.remove();
        $("chatInput").value = text; fit();
        if (data?.balancePaise != null) W().setBalance(data.balancePaise);
        W().prompt(res.status === 401 ? "login" : "funds", data?.needPaise);
        return;
      }
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
      history.push({ role: "model", text: data.reply, at: Date.now() });
      save();
      setLeft(data.left);
      if (data.until) { until = data.until; armed = true; }
      if (W() && data.balancePaise != null) W().setBalance(data.balancePaise);
      $("chatLog").insertAdjacentHTML("beforeend", bubble({ role: "model", text: data.reply, at: Date.now() }));
      scrollDown();
      renderMeta();
    } catch (e) {
      clearTimeout(seenTimer);
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
  $("chatContGo").addEventListener("click", () => {
    if (W() && !W().loggedIn()) { W().prompt("login"); return; }
    armed = true;
    window.track?.("chat_continue_tap");
    renderMeta();
    const draft = $("chatInput").value.trim();
    if (draft) send(draft); else $("chatInput").focus();
  });
  setInterval(() => {
    if (!open) return;
    const el = $("chatTimer");
    if (el) el.textContent = timerText();
    if (until && !sessionOn() && armed) { armed = false; renderMeta(); } // the paid minute ran out
  }, 1000);
  $("chatInput").addEventListener("input", fit);
  $("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !matchMedia("(pointer: coarse)").matches) {
      e.preventDefault();
      send($("chatInput").value);
    }
  });
  $("chat").addEventListener("click", (e) => {
    if (e.target.closest("#chatMake")) { closeChat(); if (document.body.dataset.page === "kundli") document.getElementById("kundli").scrollIntoView({ behavior: "smooth" }); else location.href = "/kundli"; }
    if (e.target.closest("#chatShare")) share(selected()[0]?.payload);
    const w = e.target.closest("[data-who]");
    if (w && !busy) toggle(w.dataset.who);
    if (e.target.closest("#chatPremium")) { window.track?.("add_money_from_chat_limit"); if (W()) W().open(); else location.href = "mailto:hello@shubhlyastro.in"; }
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

  document.addEventListener("kk:balance", () => { if (open) renderMeta(); });
  document.addEventListener("kk:wallet", () => { if (open) renderMeta(); });
  renderCards();
  setInterval(renderCards, 60_000); // availability changes with the hour

  return {
    // Opens the first astrologer who is up, with a question ready to send.
    ask(text, topic) {
      const pick = { love: "meera", money: "kavya", job: "arjun", marriage: "vikram", family: "sunita", health: "dev", tarot: "anaya" }[topic];
      const g = (GUIDE_BY_ID[pick] && !isResting(GUIDE_BY_ID[pick]) && GUIDE_BY_ID[pick]) || GUIDES.find((x) => !isResting(x)) || GUIDES[0];
      openChat(g, null);
      $("chatInput").value = text;
      fit();
      $("chatInput").focus();
    },
    // Called when the language changes or a kundli is made.
    refresh() {
      cached = null;
      renderCards();
      if (open) {
        brief = null;
        loadBrief();
        $("chatNote").textContent = ""; $("chatRole").textContent = role(open); renderLog(); renderMeta(); }
    },
  };
}
