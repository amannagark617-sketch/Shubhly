// The 3D sky: a chart's planets as textured spheres on the zodiac ring, at their
// real positions. Built with three.js and bundled into public/sky3d.js
// (npm run build:sky). Textures are painted at run time, so no image files.

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, SphereGeometry, TorusGeometry, RingGeometry,
  MeshStandardMaterial, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, AmbientLight, PointLight,
  Sprite, SpriteMaterial, Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, Vector2,
  Raycaster, Line, LineBasicMaterial, DoubleSide, AdditiveBlending, ConeGeometry, Vector3,
} from "three";

const RING_R = 5.2;
const SIZES = { Sun: 0.62, Moon: 0.32, Mars: 0.36, Mercury: 0.28, Jupiter: 0.55, Venus: 0.38, Saturn: 0.46, Rahu: 0.3, Ketu: 0.3, Uranus: 0.36, Neptune: 0.36, Pluto: 0.24, NorthNode: 0.28 };

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function paint(w, h, fn) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  fn(c.getContext("2d"), w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function blobs(ctx, w, h, n, r0, r1, colors, rand, alpha = 0.35) {
  for (let i = 0; i < n; i++) {
    const x = rand() * w, y = rand() * h, r = r0 + rand() * (r1 - r0);
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.globalAlpha = alpha * (0.4 + rand() * 0.6);
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function craters(ctx, w, h, n, rand, light = "rgba(255,255,255,.35)", dark = "rgba(0,0,0,.35)") {
  for (let i = 0; i < n; i++) {
    const x = rand() * w, y = rand() * h, r = 2 + rand() * rand() * 16;
    ctx.lineWidth = 1.2; ctx.strokeStyle = light;
    ctx.beginPath(); ctx.arc(x - 1, y - 1, r, 0, 6.283); ctx.stroke();
    ctx.fillStyle = dark; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(x + 1, y + 1, r * 0.85, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function bands(ctx, w, h, colors, rand, amp = 6) {
  let y = 0;
  while (y < h) {
    const bh = 6 + rand() * 22;
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x / 40 + y) * amp * rand());
    ctx.lineTo(w, y + bh); ctx.lineTo(0, y + bh); ctx.closePath(); ctx.fill();
    y += bh;
  }
}

const TEXTURES = {
  Sun: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(11);
    ctx.fillStyle = "#ffb11a"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 380, 6, 40, ["#ff7a00", "#ffd24a", "#ff9a1a", "#fff1a8"], r, 0.4);
    blobs(ctx, w, h, 40, 3, 10, ["#b84a00"], r, 0.5);
  }),
  Moon: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(23);
    ctx.fillStyle = "#c9c6bf"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 26, 20, 60, ["#8d8a85", "#a5a29c"], r, 0.5);
    craters(ctx, w, h, 160, r);
  }),
  Mercury: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(31);
    ctx.fillStyle = "#9b948a"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 60, 10, 40, ["#7d766c", "#b3ab9f"], r, 0.4);
    craters(ctx, w, h, 200, r);
  }),
  Venus: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(41);
    ctx.fillStyle = "#e8c981"; ctx.fillRect(0, 0, w, h);
    bands(ctx, w, h, ["#f3d99a", "#dcb86a", "#eed08c", "#e2bd72"], r, 14);
    blobs(ctx, w, h, 80, 20, 70, ["#fff0c2", "#c99c4f"], r, 0.18);
  }),
  Mars: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(53);
    ctx.fillStyle = "#c1502a"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 90, 12, 60, ["#8c3a1d", "#d9743f", "#a8431f"], r, 0.4);
    craters(ctx, w, h, 60, r, "rgba(255,200,170,.25)", "rgba(60,15,0,.3)");
    ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, w, 10); ctx.fillRect(0, h - 8, w, 8); ctx.globalAlpha = 1;
  }),
  Jupiter: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(61);
    ctx.fillStyle = "#d8b48a"; ctx.fillRect(0, 0, w, h);
    bands(ctx, w, h, ["#e9d4b3", "#b98557", "#f2e3c9", "#a5683f", "#d9a877"], r, 5);
    ctx.fillStyle = "#b5442a"; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(350, 170, 34, 17, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
  }),
  Saturn: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(71);
    ctx.fillStyle = "#e3cf9c"; ctx.fillRect(0, 0, w, h);
    bands(ctx, w, h, ["#efe0b4", "#d3bb85", "#e8d6a4", "#c9ae74"], r, 3);
  }),
  Uranus: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(81);
    ctx.fillStyle = "#8fd8dc"; ctx.fillRect(0, 0, w, h);
    bands(ctx, w, h, ["#a6e4e6", "#7ccfd4", "#9adde0"], r, 2);
  }),
  Neptune: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(91);
    ctx.fillStyle = "#2f58d6"; ctx.fillRect(0, 0, w, h);
    bands(ctx, w, h, ["#3e6af0", "#2748b8", "#4a78ff"], r, 4);
    blobs(ctx, w, h, 6, 10, 28, ["#0e1f6b"], r, 0.5);
  }),
  Pluto: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(101);
    ctx.fillStyle = "#b79a82"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 50, 14, 50, ["#8a6f5a", "#e2cdb8"], r, 0.4);
  }),
  Node: (seed, a, b) => paint(512, 256, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 160, 8, 50, [b, "#10102a", a], r, 0.35);
  }),
  Earth: () => paint(512, 256, (ctx, w, h) => {
    const r = rng(111);
    ctx.fillStyle = "#1f6fd1"; ctx.fillRect(0, 0, w, h);
    blobs(ctx, w, h, 36, 16, 56, ["#2f9a4a", "#3aa856", "#c9b36a"], r, 0.9);
    ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.8; ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8); ctx.globalAlpha = 1;
    blobs(ctx, w, h, 40, 10, 40, ["#ffffff"], r, 0.3);
  }),
};

function textureFor(key) {
  if (key === "Rahu") return TEXTURES.Node(121, "#2a1650", "#6a3fb5");
  if (key === "Ketu") return TEXTURES.Node(131, "#4a1a14", "#b5523a");
  if (key === "NorthNode") return TEXTURES.Node(141, "#2a1650", "#6a3fb5");
  return (TEXTURES[key] || TEXTURES.Pluto)();
}

function label(text, { size = 46, color = "#fff", stroke = "#1b1b3a", weight = 700 } = {}) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = `${weight} ${size}px "Hind", "Noto Sans Devanagari", "Noto Sans Bengali", "Noto Sans Tamil", "Noto Sans Gujarati", "Hind Guntur", system-ui, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  c.width = w; c.height = size + 24;
  ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 8; ctx.strokeStyle = stroke; ctx.lineJoin = "round";
  ctx.strokeText(text, w / 2, c.height / 2 + 2);
  ctx.fillStyle = color; ctx.fillText(text, w / 2, c.height / 2 + 2);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  const s = new Sprite(new SpriteMaterial({ map: t, transparent: true, depthTest: false }));
  s.userData.aspect = w / c.height;
  return s;
}

const polar = (lon, r, y = 0) => {
  const a = (lon * Math.PI) / 180;
  return new Vector3(Math.cos(a) * r, y, -Math.sin(a) * r);
};

/**
 * mountSky(el, { planets: [{key, lon}], ascLon, names: {planet(key), sign(i)}, onPick(key) })
 * returns { setProgress(p), destroy() }.  Throws when WebGL is unavailable.
 */
export function mountSky(el, opts) {
  const { planets, ascLon = null, names, onPick, scrollDriven = false, lagnaText = "Lagna" } = opts;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  el.innerHTML = "";
  el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.touchAction = "pan-y";

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 200);
  const world = new Group();
  scene.add(world);

  scene.add(new AmbientLight(0xffffff, 0.95));

  // stars
  const sp = [];
  const r = rng(7);
  for (let i = 0; i < 700; i++) {
    const u = r() * 2 - 1, th = r() * 6.283, rad = 34 + r() * 20, q = Math.sqrt(1 - u * u);
    sp.push(Math.cos(th) * q * rad, u * rad, Math.sin(th) * q * rad);
  }
  const sg = new BufferGeometry();
  sg.setAttribute("position", new Float32BufferAttribute(sp, 3));
  scene.add(new Points(sg, new PointsMaterial({ color: 0xfff1c9, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0.8 })));

  // Earth at the centre
  const earth = new Mesh(new SphereGeometry(0.5, 40, 28), new MeshStandardMaterial({ map: TEXTURES.Earth(), roughness: 0.9 }));
  world.add(earth);

  // zodiac ring and sign dividers
  const ring = new Mesh(new TorusGeometry(RING_R, 0.035, 12, 180), new MeshBasicMaterial({ color: 0xf6b81c }));
  ring.rotation.x = Math.PI / 2;
  world.add(ring);
  const inner = new Mesh(new TorusGeometry(RING_R - 0.9, 0.012, 8, 180), new MeshBasicMaterial({ color: 0xf6b81c, transparent: true, opacity: 0.35 }));
  inner.rotation.x = Math.PI / 2;
  world.add(inner);
  const disc = new Mesh(new RingGeometry(RING_R - 0.9, RING_R, 96, 1), new MeshBasicMaterial({ color: 0xf6b81c, transparent: true, opacity: 0.07, side: DoubleSide }));
  disc.rotation.x = -Math.PI / 2;
  world.add(disc);
  const sign0 = ascLon === null ? 0 : 0;
  for (let i = 0; i < 12; i++) {
    const g = new BufferGeometry().setFromPoints([polar(i * 30, RING_R - 0.9), polar(i * 30, RING_R)]);
    world.add(new Line(g, new LineBasicMaterial({ color: 0xf6b81c, transparent: true, opacity: 0.6 })));
    const s = label(names.sign(i), { size: 40, color: "#ffd45e" });
    const p = polar(i * 30 + 15, RING_R + 0.62);
    s.position.copy(p);
    s.scale.set(0.52 * s.userData.aspect, 0.52, 1);
    world.add(s);
  }

  // lagna marker
  if (ascLon !== null) {
    const cone = new Mesh(new ConeGeometry(0.16, 0.45, 16), new MeshBasicMaterial({ color: 0xd8321a }));
    cone.position.copy(polar(ascLon, RING_R - 0.45, 0.02));
    cone.rotation.z = Math.PI / 2;
    cone.rotation.y = (ascLon * Math.PI) / 180;
    cone.lookAt(polar(ascLon, RING_R + 1, 0));
    cone.rotateX(Math.PI / 2);
    world.add(cone);
    const l = label(lagnaText, { size: 38, color: "#ffb4a6" });
    l.position.copy(polar(ascLon, RING_R - 1.35, 0.1));
    l.scale.set(0.46 * l.userData.aspect, 0.46, 1);
    world.add(l);
  }

  // planets
  const meshes = [];
  const sun = planets.find((p) => p.key === "Sun");
  const sunLight = new PointLight(0xfff2cc, 5, 0, 0);
  const placed = [];
  planets.forEach((p, i) => {
    const size = SIZES[p.key] || 0.3;
    const lane = 3.1 + (i % 3) * 0.42;
    const pos = polar(p.lon, lane, 0);
    const isSun = p.key === "Sun";
    const mat = isSun
      ? new MeshBasicMaterial({ map: textureFor("Sun") })
      : new MeshStandardMaterial({ map: textureFor(p.key), roughness: 0.85, metalness: 0, emissive: p.key === "Rahu" || p.key === "Ketu" || p.key === "NorthNode" ? 0x2a1450 : 0x000000, emissiveIntensity: 0.6 });
    const m = new Mesh(new SphereGeometry(size, 48, 32), mat);
    m.position.copy(pos);
    m.userData.key = p.key;
    m.userData.spin = 0.15 + (i % 4) * 0.05;
    world.add(m);
    meshes.push(m);
    if (isSun) {
      sunLight.position.copy(pos);
      const glow = new Sprite(new SpriteMaterial({ map: (() => {
        const c = document.createElement("canvas"); c.width = c.height = 128;
        const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
        g.addColorStop(0, "rgba(255,210,90,.95)"); g.addColorStop(0.35, "rgba(255,160,30,.35)"); g.addColorStop(1, "rgba(255,160,30,0)");
        x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new CanvasTexture(c);
      })(), blending: AdditiveBlending, transparent: true, depthWrite: false }));
      glow.scale.set(2.4, 2.4, 1);
      m.add(glow);
    }
    if (p.key === "Saturn") {
      const rt = paint(256, 8, (ctx, w, h) => {
        const rr = rng(5);
        for (let x = 0; x < w; x++) { ctx.fillStyle = `rgba(${200 + rr() * 40},${180 + rr() * 30},${130 + rr() * 30},${0.35 + rr() * 0.6})`; ctx.fillRect(x, 0, 1, h); }
      });
      const rg = new RingGeometry(size * 1.35, size * 2.25, 64, 1);
      const uv = rg.attributes.uv, pos2 = rg.attributes.position;
      for (let k = 0; k < uv.count; k++) {
        const d = Math.hypot(pos2.getX(k), pos2.getY(k));
        uv.setXY(k, (d - size * 1.35) / (size * 0.9), 0.5);
      }
      const rm = new Mesh(rg, new MeshBasicMaterial({ map: rt, side: DoubleSide, transparent: true }));
      rm.rotation.x = Math.PI / 2 - 0.45;
      m.add(rm);
      m.userData.tilt = rm;
    }
    const l = label(names.planet(p.key), { size: 44 });
    l.position.copy(pos).add(new Vector3(0, size + 0.42, 0));
    l.scale.set(0.5 * l.userData.aspect, 0.5, 1);
    world.add(l);
    placed.push({ m, l, size });
  });
  scene.add(sunLight);
  if (!sun) sunLight.position.set(0, 4, 0);

  // layout and view state
  let yaw = -0.4, pitch = 0.62, targetYaw = yaw, targetPitch = pitch, dist = 19, targetDist = dist;
  let dragging = false, lastX = 0, lastY = 0, moved = 0, idleSince = performance.now(), visible = true;

  function resize() {
    const w = el.clientWidth || 600, h = el.clientHeight || 420;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole ring in view on narrow screens
    camera.fov = w < h ? 52 : 38;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  function frame(ts) {
    if (!visible) return;
    const t = ts / 1000;
    if (!dragging && !scrollDriven && !reduce && ts - idleSince > 1500) targetYaw += 0.0022;
    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;
    dist += (targetDist - dist) * 0.08;
    camera.position.set(0, Math.sin(pitch) * dist, Math.cos(pitch) * dist);
    camera.lookAt(0, 0, 0);
    world.rotation.y = yaw;
    for (const { m, l, size } of placed) {
      if (!reduce) m.rotation.y = t * m.userData.spin;
      // keep the label above the planet in screen space
      l.position.set(m.position.x, m.position.y + size + 0.42, m.position.z);
    }
    earth.rotation.y = reduce ? 0 : t * 0.2;
    renderer.render(scene, camera);
  }
  let raf = 0;
  const loop = (ts) => { frame(ts); raf = requestAnimationFrame(loop); };
  if (reduce) { frame(0); setTimeout(() => frame(0), 250); } else raf = requestAnimationFrame(loop);

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (reduce && visible) frame(performance.now()); });
  io.observe(el);

  // dragging and tapping
  const ray = new Raycaster();
  const dom = renderer.domElement;
  dom.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; dom.setPointerCapture(e.pointerId); });
  dom.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (!scrollDriven) { targetYaw += dx * 0.008; targetPitch = Math.max(0.15, Math.min(1.35, targetPitch + dy * 0.006)); }
    idleSince = performance.now();
    if (reduce) frame(performance.now());
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false; idleSince = performance.now();
    if (moved < 6 && onPick) {
      const rect = dom.getBoundingClientRect();
      ray.setFromCamera(new Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)), camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      if (hit) onPick(hit.object.userData.key);
    }
  };
  dom.addEventListener("pointerup", end);
  dom.addEventListener("pointercancel", () => { dragging = false; });

  return {
    // p from 0 to 1 as the section scrolls: turn the sky and move in
    setProgress(p) {
      targetYaw = -0.4 + p * Math.PI * 2;
      targetPitch = 1.15 - Math.sin(Math.min(1, p * 1.2) * Math.PI) * 0.55;
      targetDist = 21 - Math.sin(p * Math.PI) * 3;
      if (reduce) frame(performance.now());
    },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      renderer.dispose(); el.innerHTML = "";
    },
  };
}
