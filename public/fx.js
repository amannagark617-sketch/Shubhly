// Motion layer: starfield, zodiac wheel, scroll progress, cursor glow,
// scroll reveals, card tilt and the live ticker. Nothing here is needed to use
// the page, and everything switches off for people who prefer reduced motion.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- starfield ----------
function starfield() {
  const cv = document.getElementById("stars");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let w = 0, h = 0, stars = [], shoot = null, px = 0, py = 0, tx = 0, ty = 0, visible = true, last = 0;

  const size = () => {
    const r = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 70 : 170;
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: 0.2 + Math.random() * 0.8,
      r: 0.5 + Math.random() * 1.4, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.8,
      c: Math.random() > 0.75 ? "255,200,61" : Math.random() > 0.6 ? "255,150,200" : "255,240,230",
    }));
  };

  const frame = (ts) => {
    if (!visible) { requestAnimationFrame(frame); return; }
    const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ts / 1000 * s.s + s.p));
      ctx.fillStyle = `rgba(${s.c},${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(s.x + px * s.z * 26, s.y + py * s.z * 18, s.r * (0.6 + s.z * 0.6), 0, 6.283);
      ctx.fill();
    }
    if (!shoot && Math.random() < dt * 0.35) {
      shoot = { x: Math.random() * w * 0.8, y: Math.random() * h * 0.4, vx: 520 + Math.random() * 300, vy: 240 + Math.random() * 160, life: 1 };
    }
    if (shoot) {
      const len = 110;
      const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx / 6, shoot.y - shoot.vy / 6);
      g.addColorStop(0, `rgba(255,255,255,${shoot.life})`);
      g.addColorStop(1, "rgba(255,138,31,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(shoot.x - shoot.vx / 6, shoot.y - shoot.vy / 6);
      ctx.stroke();
      shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= dt * 0.9;
      if (shoot.life <= 0 || shoot.x > w + len) shoot = null;
    }
    requestAnimationFrame(frame);
  };

  size();
  window.addEventListener("resize", size);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv.parentElement);
  }
  if (fine) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  if (reduce) { frame(0); return; }
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
    glyphs += `<text x="${(200 + Math.cos(a) * 172).toFixed(1)}" y="${(200 + Math.sin(a) * 172 + 8).toFixed(1)}" text-anchor="middle" font-size="22">${g}&#xFE0E;</text>`;
  });
  let ticks = "";
  for (let i = 0; i < 72; i++) {
    const a = (Math.PI * 2 * i) / 72, r1 = i % 6 === 0 ? 192 : 196;
    ticks += `<line x1="${(200 + Math.cos(a) * r1).toFixed(1)}" y1="${(200 + Math.sin(a) * r1).toFixed(1)}" x2="${(200 + Math.cos(a) * 199).toFixed(1)}" y2="${(200 + Math.sin(a) * 199).toFixed(1)}"/>`;
  }
  const planet = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r * 2.4}" fill="${c}" opacity="0.2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
  host.insertAdjacentHTML("afterbegin", `
    <svg class="wheel" viewBox="0 0 400 400" aria-hidden="true">
      <g class="ring-a">
        <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,.28)"/>
        <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(255,138,31,.55)" stroke-dasharray="3 7"/>
        <g stroke="rgba(255,255,255,.4)">${ticks}</g>${glyphs}
      </g>
      <g class="ring-b">
        <circle cx="200" cy="200" r="122" fill="none" stroke="rgba(255,46,126,.6)" stroke-width="1.5"/>
        ${planet(322, 200, 7, "#ff2e7e")}${planet(139, 306, 5, "#8b5cf6")}${planet(110, 120, 6, "#2ee6c5")}
      </g>
      <g class="ring-c">
        <circle cx="200" cy="200" r="98" fill="none" stroke="rgba(255,200,61,.45)" stroke-dasharray="2 6"/>
        ${planet(200, 102, 6, "#ffc83d")}${planet(285, 249, 4, "#ff8a1f")}
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

function tilt() {
  if (!fine || reduce) return;
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest?.(".fact, .plan, .product, .card");
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    if (el.matches(".fact, .plan, .product")) {
      el.style.transform = `perspective(700px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg) translateY(-3px)`;
    }
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest?.(".fact, .plan, .product");
    if (el && !el.contains(e.relatedTarget)) el.style.transform = "";
  });
}

// ---------- ticker ----------
export function fillMarquee(items) {
  const tr = document.getElementById("marqueeTrack");
  if (!tr || !items.length) return;
  const html = items.map((s) => `<span>${s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</span>`).join("");
  tr.innerHTML = html + html;
}

export function initFx() {
  document.documentElement.classList.add("js");
  starfield();
  wheel();
  progress();
  cursorGlow();
  tilt();
  scan();
  if (!reduce && "MutationObserver" in window) {
    const mo = new MutationObserver(() => scan());
    ["panchang", "reading", "result", "vrat", "rashiGrid", "saved"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) mo.observe(el, { childList: true, subtree: false });
    });
  }
}
