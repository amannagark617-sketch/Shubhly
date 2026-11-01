// Motion layer: floating confetti, zodiac wheel, scroll progress, cursor dot,
// scroll reveals and the live ticker. Nothing here is needed to use
// the page, and everything switches off for people who prefer reduced motion.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- floating marigold confetti ----------
function starfield() {
  const cv = document.getElementById("stars");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let w = 0, h = 0, bits = [], px = 0, py = 0, tx = 0, ty = 0, visible = true, last = 0;
  const COLS = ["#1b1b3a", "#d8321a", "#f6b81c", "#f6b81c"];

  const size = () => {
    const r = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 14 : 28;
    bits = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: 0.3 + Math.random() * 0.7,
      r: 5 + Math.random() * 10, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.8,
      vy: 6 + Math.random() * 14, kind: Math.floor(Math.random() * 3), c: COLS[Math.floor(Math.random() * COLS.length)],
    }));
  };

  const draw = (b) => {
    ctx.save();
    ctx.translate(b.x + px * b.z * 30, b.y + py * b.z * 20);
    ctx.rotate(b.rot);
    ctx.fillStyle = b.c; ctx.strokeStyle = "#1b1b3a"; ctx.lineWidth = 2;
    if (b.kind === 0) { ctx.beginPath(); ctx.arc(0, 0, b.r * 0.6, 0, 6.283); ctx.fill(); }
    else if (b.kind === 1) { ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 6.283); ctx.stroke(); }
    else {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i, rr = i % 2 ? b.r * 0.35 : b.r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  let running = false;
  const frame = (ts) => {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    ctx.clearRect(0, 0, w, h);
    for (const b of bits) {
      b.y += b.vy * b.z * dt; b.rot += b.vr * dt;
      if (b.y > h + 20) { b.y = -20; b.x = Math.random() * w; }
      draw(b);
    }
    requestAnimationFrame(frame);
  };
  // the loop stops completely when the picture is off screen or the tab is hidden, and starts again when it comes back
  const wake = () => { if (!running && visible && !document.hidden && !reduce) { running = true; last = performance.now(); requestAnimationFrame(frame); } };

  size();
  window.addEventListener("resize", size);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }).observe(cv.parentElement);
    document.addEventListener("visibilitychange", wake);
  }
  if (fine) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  if (reduce) { frame(0); return; }
  running = true;
  requestAnimationFrame(frame);
}

// ---------- zodiac wheel around the live Moon ----------
function wheel() {
  const host = document.getElementById("orbit");
  if (!host) return;
  const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  let glyphs = "";
  signs.forEach((g, i) => {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    glyphs += `<text x="${(200 + Math.cos(a) * 172).toFixed(1)}" y="${(200 + Math.sin(a) * 172 + 8).toFixed(1)}" text-anchor="middle" font-size="24" font-weight="700">${g}&#xFE0E;</text>`;
  });
  let ticks = "";
  for (let i = 0; i < 72; i++) {
    const a = (Math.PI * 2 * i) / 72, r1 = i % 6 === 0 ? 192 : 196;
    ticks += `<line x1="${(200 + Math.cos(a) * r1).toFixed(1)}" y1="${(200 + Math.sin(a) * r1).toFixed(1)}" x2="${(200 + Math.cos(a) * 199).toFixed(1)}" y2="${(200 + Math.sin(a) * 199).toFixed(1)}"/>`;
  }
  const planet = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" stroke="#1b1b3a" stroke-width="2.5"/>`;
  host.insertAdjacentHTML("afterbegin", `
    <svg class="wheel" viewBox="0 0 400 400" aria-hidden="true">
      <g class="ring-a">
        <circle cx="200" cy="200" r="196" fill="none" stroke="#1b1b3a" stroke-width="2.5"/>
        <circle cx="200" cy="200" r="148" fill="none" stroke="#1b1b3a" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
        <g stroke="#1b1b3a" stroke-width="1.6">${ticks}</g>${glyphs}
      </g>
      <g class="ring-b">
        <circle cx="200" cy="200" r="122" fill="none" stroke="#d8321a" stroke-width="2.5"/>
        ${planet(322, 200, 8, "#d8321a")}${planet(139, 306, 6, "#1b1b3a")}${planet(110, 120, 7, "#f6b81c")}
      </g>
      <g class="ring-c">
        <circle cx="200" cy="200" r="98" fill="none" stroke="#1b1b3a" stroke-width="1.8" stroke-dasharray="2 6"/>
        ${planet(200, 102, 7, "#f6b81c")}${planet(285, 249, 5, "#d8321a")}
      </g>
    </svg>`);
}

// ---------- scroll progress, glow, reveals, tilt ----------
function progress() {
  const bar = document.querySelector(".progress");
  if (!bar) return;
  const set = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
  };
  window.addEventListener("scroll", set, { passive: true });
  set();
}

function cursorGlow() {
  const g = document.querySelector(".glow");
  if (!g || !fine || reduce) return;
  window.addEventListener("pointermove", (e) => {
    g.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    g.classList.add("on");
  }, { passive: true });
  document.addEventListener("pointerleave", () => g.classList.remove("on"));
}

const REVEAL = ".sec-head, .banner, .fact, .slot-info, .legend, .chog-scroll, .sub-h, .rashi-grid, .pick-note, .vrat li, .card, .plan, .step, .store-banner, .product, .faq details, .final-in, .now-strip, .date-nav, .saved";
let io = null;

function scan() {
  if (reduce || !("IntersectionObserver" in window)) return;
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        io.unobserve(el);
        el.classList.add("in");
        setTimeout(() => { el.classList.remove("rv", "in"); el.style.removeProperty("--d"); }, 1200);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  }
  document.querySelectorAll(REVEAL).forEach((el) => {
    if (el.dataset.rv) return;
    el.dataset.rv = "1";
    const sibs = [...el.parentElement.children].filter((c) => c.matches(REVEAL));
    el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 8) * 70}ms`);
    el.classList.add("rv");
    io.observe(el);
  });
}

// ---------- ticker ----------
export function fillMarquee(items) {
  const tr = document.getElementById("marqueeTrack");
  if (!tr || !items.length) return;
  const html = items.map((s) => `<span>${s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</span>`).join("");
  tr.innerHTML = html + html;
}

// ---------- 3D kundli driven by scroll ----------
function kundli3d() {
  const host = document.getElementById("s3dObj");
  const sec = document.getElementById("s3d");
  if (!host || !sec) return;
  const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  let ring = "";
  signs.forEach((g, i) => {
    const a = (360 / 12) * i;
    ring += `<span class="g" style="--a:${a}deg">${g}&#xFE0E;</span>`;
  });
  const pl = [["Su", "#f6b81c", 0, -1], ["Mo", "#fff4dc", 1, 0], ["Ma", "#d8321a", 0, 1], ["Me", "#17803f", -1, 0], ["Ju", "#f28c0f", 0.55, -0.55], ["Ve", "#f4a9a0", -0.55, 0.55], ["Sa", "#1b1b3a", -0.55, -0.55]];
  const planets = pl.map(([n, c, x, y]) => `<i class="pl" style="--x:${x};--y:${y};background:${c};color:${c === "#1b1b3a" ? "#fff4dc" : "#1b1b3a"}">${n}</i>`).join("");
  host.innerHTML = `
    <div class="l l-ring">${ring}</div>
    <div class="l l-chart"><svg viewBox="0 0 200 200"><rect x="6" y="6" width="188" height="188"/><path d="M6 6L194 194M194 6L6 194M100 6L194 100L100 194L6 100Z"/></svg></div>
    <div class="l l-pl">${planets}</div>
    <div class="l l-moon"></div>`;
  if (reduce) { host.style.transform = "rotateX(55deg) rotateZ(-20deg)"; return; }
  const steps = [...sec.querySelectorAll(".s3d-steps li")];
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = sec.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = Math.max(0, Math.min(1, total > 0 ? -r.top / total : 0));
    host.style.setProperty("--p", p.toFixed(4));
    const rx = 62 - p * 50, rz = -40 + p * 400, ry = Math.sin(p * Math.PI) * 14;
    host.style.transform = `rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
    const idx = Math.min(2, Math.floor(p * 3));
    steps.forEach((li, i) => li.classList.toggle("on", i === idx));
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

export function initFx() {
  document.documentElement.classList.add("js");
  starfield();
  kundli3d();
  progress();
  cursorGlow();
  scan();
  if (!reduce && "MutationObserver" in window) {
    const mo = new MutationObserver(() => scan());
    ["panchang", "reading", "result", "vrat", "rashiGrid", "saved"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) mo.observe(el, { childList: true, subtree: false });
    });
  }
}
