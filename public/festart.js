// Festival artwork: a lit-diya scene and a symmetry rangoli painter.
// Pure canvas, no images to download. Helpers (L, toast, store, sound, share) come from festival.js.

const TAU = Math.PI * 2;
const reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

/* ---------------------------------------------------------------- diya */

// One clay diya with a wick on its spout. (cx, by) is the bottom centre, w is the width.
export function drawDiya(x, cx, by, w, lit, t, seed = 0) {
  x.save();
  x.translate(cx, by);

  // contact shadow on the plate
  x.fillStyle = "rgba(0,0,0,.30)";
  x.beginPath(); x.ellipse(0.02 * w, 0.01 * w, 0.46 * w, 0.07 * w, 0, 0, TAU); x.fill();

  // clay body
  const body = x.createLinearGradient(-0.5 * w, -0.3 * w, 0.4 * w, 0);
  body.addColorStop(0, "#e08a46"); body.addColorStop(0.45, "#b85a22"); body.addColorStop(1, "#6f2a0c");
  x.fillStyle = body;
  x.beginPath();
  x.moveTo(-0.52 * w, -0.30 * w);
  x.bezierCurveTo(-0.40 * w, -0.20 * w, -0.36 * w, -0.14 * w, -0.30 * w, -0.10 * w);
  x.bezierCurveTo(-0.22 * w, -0.03 * w, -0.14 * w, 0, 0, 0);
  x.bezierCurveTo(0.16 * w, 0, 0.32 * w, -0.06 * w, 0.41 * w, -0.24 * w);
  x.lineTo(-0.52 * w, -0.30 * w);
  x.closePath(); x.fill();

  // soft highlight along the belly
  x.strokeStyle = "rgba(255,214,160,.35)"; x.lineWidth = 0.014 * w; x.lineCap = "round";
  x.beginPath(); x.moveTo(-0.30 * w, -0.13 * w); x.bezierCurveTo(-0.18 * w, -0.05 * w, 0.06 * w, -0.04 * w, 0.22 * w, -0.09 * w); x.stroke();

  // painted gold dots
  x.fillStyle = "#f0c14b";
  for (let i = 0; i < 7; i++) {
    const u = i / 6, dx = -0.2 * w + u * 0.52 * w, dy = -0.125 * w + Math.sin(u * Math.PI) * 0.045 * w;
    x.beginPath(); x.arc(dx, dy, 0.012 * w, 0, TAU); x.fill();
  }

  // rim, shadowed inside, with the oil on top
  x.fillStyle = "#5a2209";
  x.beginPath(); x.ellipse(-0.05 * w, -0.265 * w, 0.37 * w, 0.075 * w, -0.03, 0, TAU); x.fill();
  const oil = x.createLinearGradient(0, -0.31 * w, 0, -0.22 * w);
  oil.addColorStop(0, "#f7d36b"); oil.addColorStop(1, "#b9771a");
  x.fillStyle = oil;
  x.beginPath(); x.ellipse(-0.05 * w, -0.262 * w, 0.325 * w, 0.054 * w, -0.03, 0, TAU); x.fill();
  x.fillStyle = "rgba(255,255,255,.35)";
  x.beginPath(); x.ellipse(0.08 * w, -0.278 * w, 0.09 * w, 0.011 * w, -0.03, 0, TAU); x.fill();

  // wick
  const wx = -0.44 * w, wy = -0.285 * w;
  x.strokeStyle = "#3a2410"; x.lineWidth = 0.028 * w; x.lineCap = "round";
  x.beginPath(); x.moveTo(wx + 0.01 * w, wy + 0.015 * w); x.lineTo(wx - 0.005 * w, wy - 0.075 * w); x.stroke();

  if (lit > 0.01) {
    const fx = wx - 0.005 * w, fy = wy - 0.08 * w;
    const fh = 0.36 * w * lit, fr = 0.075 * w * Math.min(1, lit * 1.3);
    const sway = (Math.sin(t * 6.3 + seed) * 0.022 + Math.sin(t * 11.7 + seed * 2) * 0.011) * w;
    const pulse = 1 + Math.sin(t * 9 + seed) * 0.05;

    x.globalCompositeOperation = "lighter";
    const glow = x.createRadialGradient(fx, fy - fh * 0.4, 0, fx, fy - fh * 0.4, w * 1.15);
    glow.addColorStop(0, `rgba(255,170,60,${0.38 * lit * pulse})`);
    glow.addColorStop(0.45, `rgba(255,120,30,${0.12 * lit})`);
    glow.addColorStop(1, "rgba(255,100,20,0)");
    x.fillStyle = glow; x.fillRect(fx - w * 1.2, fy - w * 1.4, w * 2.4, w * 2.4);
    x.globalCompositeOperation = "source-over";

    const flame = (k, c0, c1) => {
      const r = fr * k, h = fh * pulse * (0.15 + 0.85 * k), s = sway * k;
      const g = x.createLinearGradient(0, fy, 0, fy - h);
      g.addColorStop(0, c0); g.addColorStop(1, c1);
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(fx, fy);
      x.bezierCurveTo(fx - r * 1.25, fy - h * 0.15, fx - r * 0.95 + s * 0.3, fy - h * 0.7, fx + s, fy - h);
      x.bezierCurveTo(fx + r * 0.95 + s * 0.3, fy - h * 0.7, fx + r * 1.25, fy - h * 0.15, fx, fy);
      x.fill();
    };
    flame(1, "rgba(255,196,60,.95)", "rgba(255,92,18,.85)");
    flame(0.66, "rgba(255,244,190,.98)", "rgba(255,190,70,.9)");
    flame(0.32, "#fff", "rgba(255,240,170,.9)");
    x.fillStyle = `rgba(90,130,255,${0.55 * lit})`;
    x.beginPath(); x.ellipse(fx, fy - 0.012 * w, fr * 0.5, fr * 0.32, 0, 0, TAU); x.fill();
  }
  x.restore();
}

const SW = 900, SH = 420;
const XS = [0.14, 0.32, 0.5, 0.68, 0.86];
const WIDTHS = [108, 120, 134, 120, 108];
const BYS = [326, 336, 346, 336, 326];
const ORDER = [0, 4, 1, 3, 2];
const seeded = ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
const PETALS = Array.from({ length: 80 }, () => ({
  a: seeded() * TAU, d: Math.sqrt(seeded()), rot: seeded() * Math.PI, s: 5 + seeded() * 6,
  c: ["#f26a1b", "#f6a31c", "#f6c21c", "#e0502a"][Math.floor(seeded() * 4)],
}));
const STARS = Array.from({ length: 36 }, () => ({ x: seeded() * SW, y: seeded() * 220, r: 0.6 + seeded() * 1.4, a: 0.15 + seeded() * 0.4 }));

export function drawScene(x, slots, t) {
  const bg = x.createLinearGradient(0, 0, 0, SH);
  bg.addColorStop(0, "#0f0d24"); bg.addColorStop(0.6, "#241230"); bg.addColorStop(1, "#3a1520");
  x.fillStyle = bg; x.fillRect(0, 0, SW, SH);
  STARS.forEach((s) => { x.fillStyle = `rgba(255,236,200,${s.a})`; x.beginPath(); x.arc(s.x, s.y, s.r, 0, TAU); x.fill(); });

  // brass plate
  const px = SW / 2, py = 348, rx = 415, ry = 62;
  const plate = x.createLinearGradient(0, py - ry, 0, py + ry);
  plate.addColorStop(0, "#f1cf7a"); plate.addColorStop(0.5, "#c99235"); plate.addColorStop(1, "#7d4f12");
  x.fillStyle = plate; x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, TAU); x.fill();
  const inner = x.createLinearGradient(0, py - ry, 0, py + ry);
  inner.addColorStop(0, "#9a6a1e"); inner.addColorStop(1, "#d9a840");
  x.fillStyle = inner; x.beginPath(); x.ellipse(px, py + 3, rx * 0.9, ry * 0.84, 0, 0, TAU); x.fill();

  // marigold petals
  PETALS.forEach((p) => {
    x.fillStyle = p.c;
    x.beginPath();
    x.ellipse(px + Math.cos(p.a) * p.d * rx * 0.85, py + 4 + Math.sin(p.a) * p.d * ry * 0.72, p.s, p.s * 0.55, p.rot, 0, TAU);
    x.fill();
  });

  ORDER.forEach((i) => drawDiya(x, XS[i] * SW, BYS[i], WIDTHS[i], slots[i].lit, t, i * 1.7));
}

export function initDiya(root, h) {
  const { L, toast, store, soundOn, crackle, shareCanvas } = h;
  const cv = root.querySelector("[data-diya-canvas]");
  const x = cv.getContext("2d");
  cv.width = SW; cv.height = SH;
  const count = root.querySelector("[data-diya-count]");
  const wish = root.querySelector("[data-diya-wish]");
  const slots = XS.map(() => ({ lit: 0, target: 0 }));
  const today = new Date().toISOString().slice(0, 10);
  let rec = store.get("kk.diya", { day: today, n: 0 });
  if (rec.day !== today) rec = { day: today, n: 0 };
  const paint = () => { count.textContent = rec.n ? L(`Aapne aaj ${rec.n} diye jalaaye.`, `आपने आज ${rec.n} दीये जलाए।`) : L("Kisi bhi diye par tap kijiye.", "किसी भी दीये पर टैप कीजिए।"); };
  paint();

  let raf = 0, last = 0, vis = true;
  const noMotion = reduced();
  const render = (t) => drawScene(x, slots, noMotion ? 0 : t);
  const animating = () => slots.some((s) => s.lit !== s.target) || (!noMotion && slots.some((s) => s.lit > 0));
  function frame(ts) {
    raf = 0;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    slots.forEach((s) => {
      s.lit += (s.target - s.lit) * Math.min(1, dt * (s.target ? 5 : 9));
      if (Math.abs(s.target - s.lit) < 0.004) s.lit = s.target;
    });
    render(ts / 1000);
    if (animating() && vis && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf) return;
    if (vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) kick(); }).observe(cv);
  document.addEventListener("visibilitychange", kick);
  render(0);

  const light = (i) => {
    if (slots[i].target) return false;
    slots[i].target = 1; rec.n += 1; store.set("kk.diya", rec); paint();
    if (soundOn()) crackle();
    kick(); return true;
  };
  const nearestUnlit = (sx) => {
    let best = -1, bd = 1e9;
    XS.forEach((u, i) => { const d = Math.abs(u * SW - sx); if (!slots[i].target && d < bd) { bd = d; best = i; } });
    return best;
  };
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect();
    const i = nearestUnlit(((e.clientX - r.left) / r.width) * SW);
    if (i >= 0) light(i);
  });
  root.querySelector("[data-diya-light]").addEventListener("click", () => {
    const i = [2, 1, 3, 0, 4].find((k) => !slots[k].target);
    if (i === undefined) { toast(L("Sab diye jal rahe hain.", "सारे दीये जल रहे हैं।")); return; }
    light(i);
  });
  root.querySelector("[data-diya-all]").addEventListener("click", () => {
    [2, 1, 3, 0, 4].forEach((k, n) => setTimeout(() => light(k), n * 260));
  });
  root.querySelector("[data-diya-out]").addEventListener("click", () => { slots.forEach((s) => { s.target = 0; }); kick(); });

  root.querySelector("[data-diya-save]").addEventListener("click", async () => {
    if (!slots.some((s) => s.target)) { toast(L("Pehle ek diya jalaiye.", "पहले एक दीया जलाइए।")); return; }
    try { await document.fonts?.ready; } catch { /* ignore */ }
    const sc = document.createElement("canvas"); sc.width = SW; sc.height = SH;
    drawScene(sc.getContext("2d"), slots.map((s) => ({ lit: s.target ? 1 : 0 })), 0.4);
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1080, 1350);
    g.fillStyle = "#d8321a"; g.fillRect(0, 0, 1080, 14);
    g.textAlign = "center"; g.fillStyle = "#1b1b3a"; g.font = '700 76px "Hind",sans-serif';
    g.fillText(L("Mera Diwali ka diya", "मेरा दिवाली का दीया"), 540, 150);
    g.drawImage(sc, 60, 200, 960, 448);
    const text = wish.value.trim();
    g.fillStyle = "#1b1b3a"; g.font = '600 52px "Hind",sans-serif';
    if (text) {
      const words = text.split(/\s+/); let line = ""; const lines = [];
      for (const w of words) { const tt = line ? `${line} ${w}` : w; if (g.measureText(tt).width > 880 && line) { lines.push(line); line = w; } else line = tt; }
      if (line) lines.push(line);
      g.fillStyle = "#777"; g.font = '500 38px "Hind",sans-serif';
      g.fillText(L("Meri kamna", "मेरी कामना"), 540, 770);
      g.fillStyle = "#1b1b3a"; g.font = '600 54px "Hind",sans-serif';
      lines.slice(0, 4).forEach((l, i) => g.fillText(l, 540, 850 + i * 74));
    } else {
      g.fillStyle = "#d8321a"; g.font = '700 70px "Hind",sans-serif';
      g.fillText(L("Shubh Deepawali", "शुभ दीपावली"), 540, 820);
    }
    g.fillStyle = "#d8321a"; g.font = '700 46px "Hind",sans-serif';
    g.fillText("Kundli Kaka", 540, 1210);
    g.fillStyle = "#1b1b3a"; g.font = '500 38px "Hind",sans-serif';
    g.fillText("kundlikaka.in", 540, 1264);
    shareCanvas(c, L("Maine apna diya jalaya. Aap bhi jalaaiye: kundlikaka.in", "मैंने अपना दीया जलाया। आप भी जलाइए: kundlikaka.in"), "mera-diya.png", toast);
  });
}

/* ------------------------------------------------------------- rangoli */

const PALETTE = ["#f26a1b", "#d8321a", "#f6c21c", "#ffffff", "#2e9b5f", "#e0508a", "#3b6fd8", "#8a3fc4"];
const NAMES = ["Narangi", "Laal", "Peela", "Safed", "Hara", "Gulabi", "Neela", "Baingani"];

function shades(hex) {
  const v = parseInt(hex.slice(1), 16), r = v >> 16 & 255, g = v >> 8 & 255, b = v & 255;
  return [0.82, 0.92, 1, 1.08, 1.16].map((f) => `rgb(${Math.min(255, r * f) | 0},${Math.min(255, g * f) | 0},${Math.min(255, b * f) | 0})`);
}

export function initRangoli(root, h) {
  const { L, toast, shareCanvas } = h;
  const cv = root.querySelector("[data-rangoli-canvas]");
  const guide = root.querySelector("[data-rangoli-guide]");
  const S = 800, C = S / 2;
  cv.width = cv.height = guide.width = guide.height = S;
  const x = cv.getContext("2d", { willReadFrequently: true });
  const gx = guide.getContext("2d");

  let n = 8, size = 16, erase = false, showGuide = true, colorIdx = 0, tones = shades(PALETTE[0]);
  const hist = [];
  const push = () => { hist.push(x.getImageData(0, 0, S, S)); if (hist.length > 8) hist.shift(); };

  // colours
  const sw = root.querySelector("[data-rangoli-colors]");
  sw.innerHTML = PALETTE.map((c, i) => `<button type="button" class="sw${i === 0 ? " on" : ""}" style="background:${c}" data-i="${i}" aria-label="${NAMES[i]}"></button>`).join("");
  sw.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    colorIdx = Number(b.dataset.i); tones = shades(PALETTE[colorIdx]); setErase(false);
    sw.querySelectorAll(".sw").forEach((s) => s.classList.toggle("on", s === b));
  });

  // symmetry
  const seg = root.querySelector("[data-rangoli-sym]");
  seg.innerHTML = [4, 6, 8, 12].map((k) => `<button type="button" data-n="${k}" class="${k === n ? "on" : ""}">${k}</button>`).join("");
  seg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    n = Number(b.dataset.n);
    seg.querySelectorAll("button").forEach((s) => s.classList.toggle("on", s === b));
    drawGuide();
  });

  root.querySelector("[data-rangoli-size]").addEventListener("input", (e) => { size = Number(e.target.value); });
  const eraseBtn = root.querySelector("[data-rangoli-erase]");
  function setErase(v) { erase = v; eraseBtn.setAttribute("aria-pressed", v); eraseBtn.classList.toggle("on", v); }
  eraseBtn.addEventListener("click", () => setErase(!erase));
  root.querySelector("[data-rangoli-guide-toggle]").addEventListener("change", (e) => { showGuide = e.target.checked; drawGuide(); });

  function drawGuide() {
    gx.clearRect(0, 0, S, S);
    if (!showGuide) return;
    gx.strokeStyle = "rgba(255,255,255,.14)"; gx.lineWidth = 1.5; gx.setLineDash([3, 9]);
    for (let r = 60; r < C; r += 60) { gx.beginPath(); gx.arc(C, C, r, 0, TAU); gx.stroke(); }
    gx.setLineDash([6, 10]);
    for (let k = 0; k < n; k++) { const a = (k * TAU) / n; gx.beginPath(); gx.moveTo(C, C); gx.lineTo(C + Math.cos(a) * C, C + Math.sin(a) * C); gx.stroke(); }
    gx.setLineDash([]); gx.fillStyle = "rgba(255,255,255,.3)"; gx.beginPath(); gx.arc(C, C, 4, 0, TAU); gx.fill();
  }
  drawGuide();

  // powder brush, mirrored and rotated around the centre
  function stamp(px, py) {
    const grains = Math.round(size * (erase ? 2.6 : 1.7));
    x.globalCompositeOperation = erase ? "destination-out" : "source-over";
    for (let g = 0; g < grains; g++) {
      const ang = Math.random() * TAU, rad = Math.pow(Math.random(), 0.65) * size;
      const dx = px - C + Math.cos(ang) * rad, dy = py - C + Math.sin(ang) * rad;
      const s = 1.5 + Math.random() * 2.1;
      x.fillStyle = erase ? "#000" : tones[(Math.random() * tones.length) | 0];
      for (let k = 0; k < n; k++) {
        const a = (k * TAU) / n, ca = Math.cos(a), sa = Math.sin(a);
        x.fillRect(C + dx * ca - dy * sa, C + dx * sa + dy * ca, s, s);
        x.fillRect(C - dx * ca - dy * sa, C - dx * sa + dy * ca, s, s);
      }
    }
    x.globalCompositeOperation = "source-over";
  }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * S, ((e.clientY - r.top) / r.height) * S]; };
  let down = false, lp = null;
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); push(); down = true; lp = pos(e); stamp(...lp); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!down) return;
    const p = pos(e), d = Math.hypot(p[0] - lp[0], p[1] - lp[1]), step = Math.max(3, size * 0.3);
    for (let i = 1; i <= d / step; i++) stamp(lp[0] + ((p[0] - lp[0]) * i * step) / d, lp[1] + ((p[1] - lp[1]) * i * step) / d);
    if (d >= step) lp = p;
  });
  const up = () => { down = false; lp = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

  root.querySelector("[data-rangoli-undo]").addEventListener("click", () => { const s = hist.pop(); if (s) x.putImageData(s, 0, 0); });
  root.querySelector("[data-rangoli-clear]").addEventListener("click", () => { push(); x.clearRect(0, 0, S, S); });

  // surprise me: a procedural mandala in the chosen palette
  function powderShape(path, tone, cx, cy, rad) {
    x.save(); x.fillStyle = tone; x.beginPath(); path(); x.fill(); x.clip();
    const t = shades(tone);
    const cnt = Math.round(rad * rad * 1.4);
    for (let i = 0; i < cnt; i++) { x.fillStyle = t[(Math.random() * t.length) | 0]; x.fillRect(cx + (Math.random() * 2 - 1) * rad, cy + (Math.random() * 2 - 1) * rad, 2, 2); }
    x.restore();
  }
  function auto() {
    push(); x.clearRect(0, 0, S, S);
    const cols = [...PALETTE].sort(() => Math.random() - 0.5).slice(0, 5);
    const types = ["petal", "dots", "petal", "petal", "dots", "petal"].sort(() => Math.random() - 0.5);
    const cnt = n * 2;
    [0.1, 0.19, 0.28, 0.37, 0.45].forEach((rf, i) => {
      const R = rf * S, col = cols[i], len = 34 + i * 5, wid = Math.min(len * 0.4, (Math.PI * R / cnt) * 0.9);
      const off = (i % 2) * (TAU / cnt / 2);
      for (let j = 0; j < cnt; j++) {
        const a = (j * TAU) / cnt + off, cx = C + Math.cos(a) * R, cy = C + Math.sin(a) * R;
        if (types[i] === "petal") {
          powderShape(() => x.ellipse(cx, cy, len, wid, a, 0, TAU), col, cx, cy, len * 1.1);
          const ix = C + Math.cos(a) * (R + len * 0.15), iy = C + Math.sin(a) * (R + len * 0.15);
          powderShape(() => x.ellipse(ix, iy, len * 0.45, wid * 0.4, a, 0, TAU), cols[(i + 2) % 5], ix, iy, len * 0.5);
        } else {
          powderShape(() => x.arc(cx, cy, 12 + i * 1.5, 0, TAU), col, cx, cy, 16 + i * 2);
          const ox = C + Math.cos(a + TAU / cnt / 2) * (R + 14), oy = C + Math.sin(a + TAU / cnt / 2) * (R + 14);
          powderShape(() => x.arc(ox, oy, 6, 0, TAU), cols[(i + 2) % 5], ox, oy, 8);
        }
      }
    });
    powderShape(() => x.arc(C, C, 42, 0, TAU), "#f6c21c", C, C, 44);
    powderShape(() => x.arc(C, C, 24, 0, TAU), "#d8321a", C, C, 26);
    powderShape(() => x.arc(C, C, 9, 0, TAU), "#ffffff", C, C, 10);
  }
  root.querySelector("[data-rangoli-auto]").addEventListener("click", auto);

  root.querySelector("[data-rangoli-save]").addEventListener("click", async () => {
    try { await document.fonts?.ready; } catch { /* ignore */ }
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1080, 1350);
    g.fillStyle = "#d8321a"; g.fillRect(0, 0, 1080, 14);
    g.textAlign = "center"; g.fillStyle = "#1b1b3a"; g.font = '700 76px "Hind",sans-serif';
    g.fillText(L("Meri Diwali Rangoli", "मेरी दिवाली रंगोली"), 540, 150);
    const fl = g.createRadialGradient(540, 700, 40, 540, 700, 500);
    fl.addColorStop(0, "#2e2a38"); fl.addColorStop(1, "#15131b");
    g.fillStyle = fl; g.fillRect(60, 200, 960, 960);
    g.drawImage(cv, 60, 200, 960, 960);
    g.fillStyle = "#d8321a"; g.font = '700 46px "Hind",sans-serif'; g.fillText("Kundli Kaka", 540, 1240);
    g.fillStyle = "#1b1b3a"; g.font = '500 38px "Hind",sans-serif'; g.fillText("kundlikaka.in", 540, 1294);
    shareCanvas(c, L("Meri Diwali rangoli. Aap bhi banaiye: kundlikaka.in", "मेरी दिवाली रंगोली। आप भी बनाइए: kundlikaka.in"), "meri-rangoli.png", toast);
  });
}
