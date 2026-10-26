// The live sky on the home page: today's real planet positions on a zodiac
// wheel. Drag the wheel, tap a planet, or slide through two months of time.

import { SIGN_EN, planetName, signName } from "/names.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SIGN_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const COLOR = { Sun: "#f6b81c", Moon: "#fff4dc", Mars: "#d8321a", Mercury: "#17803f", Jupiter: "#f28c0f", Venus: "#f4a9a0", Saturn: "#1b1b3a", Rahu: "#7a3b9a", Ketu: "#8a8a8a" };
const SHORT = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };
const DARK = new Set(["Saturn", "Rahu", "Ketu", "Mars", "Mercury"]);
const SPAN = 60; // days either side of today

const rad = (lon) => ((lon - 90) * Math.PI) / 180; // Aries at the top, signs go clockwise
const at = (lon, r) => [200 + Math.cos(rad(lon)) * r, 200 + Math.sin(rad(lon)) * r];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function initLiveSky({ t, getLang }) {
  const host = document.getElementById("orbit");
  if (!host) return { refresh() {} };

  // ---- the wheel (zodiac first, planets when the data arrives) ----
  let seg = "", glyphs = "", ticks = "";
  for (let i = 0; i < 12; i++) {
    const a0 = i * 30, a1 = a0 + 30;
    const [x0, y0] = at(a0, 196), [x1, y1] = at(a1, 196), [x2, y2] = at(a1, 156), [x3, y3] = at(a0, 156);
    seg += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A196 196 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A156 156 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z" class="seg ${i % 2 ? "odd" : ""}"/>`;
    const [gx, gy] = at(a0 + 15, 176);
    glyphs += `<text x="${gx.toFixed(1)}" y="${(gy + 8).toFixed(1)}" text-anchor="middle" font-size="22" font-weight="700" transform="rotate(${a0 + 15} ${gx.toFixed(1)} ${(gy + 1).toFixed(1)})">${SIGN_GLYPH[i]}&#xFE0E;</text>`;
  }
  for (let i = 0; i < 72; i++) {
    const [x1, y1] = at(i * 5, i % 6 === 0 ? 150 : 153), [x2, y2] = at(i * 5, 156);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  host.insertAdjacentHTML("afterbegin", `
    <svg class="wheel live" viewBox="0 0 400 400" role="group" aria-label="${esc(t("sk_live"))}">
      <g class="zod" id="zod">
        <circle cx="200" cy="200" r="198" class="rim"/>
        ${seg}<g class="tick">${ticks}</g>${glyphs}
        <circle cx="200" cy="200" r="156" class="inner"/>
        <g id="planets"></g>
      </g>
    </svg>`);
  const zod = document.getElementById("zod");
  const layer = document.getElementById("planets");

  // ---- state ----
  let data = null, day = SPAN, rot = 0, drag = null, picked = "Moon", raf = 0;
  const cur = {}; // displayed longitude per planet (animated)
  const nodes = {};

  const lonAt = (k, d) => data.planets.find((p) => p.key === k).lon[d];
  const retroAt = (k, d) => data.planets.find((p) => p.key === k).retro[d];
  const nameOf = (k) => planetName(getLang(), k);
  const signOf = (lon) => signName(getLang(), SIGN_EN[Math.floor(lon / 30) % 12], "");

  function build() {
    layer.innerHTML = data.planets.map((p) => `<g class="pn" data-k="${p.key}" tabindex="0" role="button" aria-label="${esc(nameOf(p.key))}">
      <circle r="13" fill="${COLOR[p.key]}" stroke="#1b1b3a" stroke-width="2.4"/>
      <text y="4" text-anchor="middle" font-size="10.5" font-weight="800" fill="${DARK.has(p.key) ? "#fff4dc" : "#1b1b3a"}">${SHORT[p.key]}</text>
      <circle class="vk" r="17.5" fill="none" stroke="#d8321a" stroke-width="1.6" stroke-dasharray="3 3"/></g>`).join("");
    data.planets.forEach((p) => { nodes[p.key] = layer.querySelector(`[data-k="${p.key}"]`); cur[p.key] = lonAt(p.key, day); });
  }

  function place() {
    // stagger planets that sit close together so none hides another
    const order = data.planets.map((p) => p.key).sort((a, b) => cur[a] - cur[b]);
    const level = {};
    order.forEach((k, i) => {
      const prev = order[i - 1];
      level[k] = prev !== undefined && (cur[k] - cur[prev] + 360) % 360 < 14 && level[prev] === 0 ? 1 : 0;
    });
    order.forEach((k) => {
      const [x, y] = at(cur[k], level[k] ? 108 : 132);
      nodes[k].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      nodes[k].classList.toggle("is-retro", retroAt(k, day));
      nodes[k].classList.toggle("is-on", k === picked);
    });
  }

  function tick() {
    let moving = false;
    for (const p of data.planets) {
      const to = lonAt(p.key, day);
      let d = ((to - cur[p.key] + 540) % 360) - 180;
      if (reduce || Math.abs(d) < 0.05) { cur[p.key] = to; continue; }
      cur[p.key] = (cur[p.key] + d * 0.22 + 360) % 360;
      moving = true;
    }
    place();
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  const go = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // ---- text ----
  const noteEl = document.getElementById("skyNote");
  const pill = document.getElementById("livePill");
  const dateEl = document.getElementById("skyDate");
  function words(k, d) {
    const lon = lonAt(k, d);
    const deg = (lon % 30).toFixed(0);
    const back = retroAt(k, d) && k !== "Rahu" && k !== "Ketu" ? `, ${t("sk_back")}` : "";
    return `${t("sk_in", { planet: nameOf(k), sign: signOf(lon) })} (${deg}°)${back}.`;
  }
  function note() {
    if (!noteEl) return;
    noteEl.textContent = `${words(picked, day)} ${data.meaning[picked] || ""}`;
  }
  function livePill() {
    if (!pill) return;
    const t0 = SPAN;
    const parts = ["Moon", "Sun"].map((k) => t("sk_pill", { planet: nameOf(k), sign: signOf(lonAt(k, t0)) }));
    const retro = data.planets.filter((p) => ["Saturn", "Jupiter", "Mercury", "Venus", "Mars"].includes(p.key) && retroAt(p.key, t0)).slice(0, 2);
    retro.forEach((p) => parts.push(`${nameOf(p.key)} ${t("sk_back_short")}`));
    pill.innerHTML = `<i class="live-dot" aria-hidden="true"></i><b>${esc(t("sk_live"))}</b> ${esc(parts.join(" · "))}`;
    pill.hidden = false;
  }
  function dateLabel() {
    if (!dateEl) return;
    const diff = day - SPAN;
    const reset = document.getElementById("skyReset");
    if (reset) reset.hidden = !diff;
    if (!diff) { dateEl.textContent = t("d_today"); return; }
    const d = new Date(data.today + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + diff);
    dateEl.textContent = d.toLocaleDateString(getLang() === "hi" || getLang() === "mr" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }

  // ---- events ----
  layer.addEventListener("click", (e) => {
    const n = e.target.closest(".pn");
    if (!n) return;
    picked = n.dataset.k; place(); note();
  });
  layer.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const n = e.target.closest(".pn");
    if (n) { e.preventDefault(); picked = n.dataset.k; place(); note(); }
  });
  const svg = host.querySelector("svg.wheel");
  const angleOf = (e) => {
    const r = svg.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  svg.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".pn")) return;
    drag = { a: angleOf(e), rot };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add("dragging");
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    rot = drag.rot + (angleOf(e) - drag.a);
    zod.style.transform = `rotate(${rot.toFixed(1)}deg)`;
  });
  const end = () => { drag = null; svg.classList.remove("dragging"); };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);

  const range = document.getElementById("skyRange");
  if (range) range.addEventListener("input", () => {
    if (!data) return;
    day = SPAN + Number(range.value);
    dateLabel(); note(); go();
  });
  document.getElementById("skyReset")?.addEventListener("click", () => {
    if (!data) return;
    day = SPAN; if (range) range.value = 0;
    rot = 0; zod.style.transform = "";
    dateLabel(); note(); go();
  });

  // ---- data ----
  async function load() {
    try {
      const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
      const d0 = new Date(today + "T00:00:00Z"); d0.setUTCDate(d0.getUTCDate() - SPAN);
      const from = d0.toISOString().slice(0, 10);
      const res = await fetch(`/api/sky?from=${from}&days=${SPAN * 2 + 1}&lang=${getLang()}`);
      if (!res.ok) return;
      const next = await res.json();
      const first = !data;
      data = next;
      if (first) { build(); if (range) { range.min = -SPAN; range.max = SPAN; range.value = 0; } }
      place(); note(); livePill(); dateLabel();
    } catch { /* the wheel simply stays empty */ }
  }
  load();

  return {
    refresh() { if (data) { load(); } },
  };
}
