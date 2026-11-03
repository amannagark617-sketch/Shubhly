// Festival corner: virtual diya, rangoli, wish card, Dhanteras checklist,
// WhatsApp reminder link and festive sounds. Everything runs in the visitor's
// browser; nothing here is sent to our server except the normal page view.

const W = 1080;
const RASHI = [
  ["Mesh", "मेष", "लाल"], ["Vrishabh", "वृषभ", "सफ़ेद"], ["Mithun", "मिथुन", "हरा"], ["Kark", "कर्क", "चांदी जैसा"],
  ["Simha", "सिंह", "नारंगी"], ["Kanya", "कन्या", "हरा"], ["Tula", "तुला", "गुलाबी"], ["Vrishchik", "वृश्चिक", "मैरून"],
  ["Dhanu", "धनु", "पीला"], ["Makar", "मकर", "भूरा"], ["Kumbh", "कुंभ", "नीला"], ["Meen", "मीन", "सी-ग्रीन"],
];
const CHECKLIST = [
  ["Naya kaam ya business shuru karo", "नया काम या बिज़नेस शुरू करो"],
  ["Shaam ko Lakshmi puja, darwaze par diya", "शाम को लक्ष्मी पूजा, दरवाज़े पर दीया"],
  ["Steel, peetal ya chaandi ka naya bartan", "स्टील, पीतल या चांदी का नया बर्तन"],
  ["Naya jhaadu", "नया झाड़ू"],
  ["Ghar ko roshni se sajao", "घर को रोशनी से सजाओ"],
  ["Udhaar mat lo, kisi ko paise mat do", "उधार मत लो, किसी को पैसे मत दो"],
  ["Chaaku, blade ya hathiyaar mat kharido", "चाकू, ब्लेड या हथियार मत खरीदो"],
];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

// ---------- sound (opt-in, off by default) ----------
let audio = null;
const soundOn = () => store.get("kk.sound", false);
function ctx() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (audio.state === "suspended") audio.resume();
  return audio;
}
function bell() {
  const a = ctx(); if (!a) return;
  [1318, 1976].forEach((f, i) => {
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.value = f; o.connect(g); g.connect(a.destination);
    const t0 = a.currentTime + i * 0.05;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
    o.start(t0); o.stop(t0 + 1.2);
  });
}
function crackle() {
  const a = ctx(); if (!a) return;
  const len = a.sampleRate * 0.35, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const s = a.createBufferSource(), g = a.createGain(); s.buffer = buf; g.gain.value = 0.25;
  s.connect(g); g.connect(a.destination); s.start();
}

// ---------- helpers ----------
const wrap = (ctx2, text, maxW) => {
  const lines = []; let line = "";
  for (const w of String(text).split(/\s+/)) {
    const t = line ? `${line} ${w}` : w;
    if (ctx2.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
};
function download(canvas, name) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, "image/png");
}
function shareCanvas(canvas, text, name, toast) {
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return; } catch { /* cancelled */ }
    }
    download(canvas, name); toast("Picture download hui. WhatsApp mein bhejiye.");
  }, "image/png");
}

// ---------- 1. virtual diya ----------
function initDiya(root, L, toast) {
  const btn = root.querySelector("[data-diya-light]");
  const stage = root.querySelector("[data-diya-stage]");
  const count = root.querySelector("[data-diya-count]");
  const save = root.querySelector("[data-diya-save]");
  const today = new Date().toISOString().slice(0, 10);
  let rec = store.get("kk.diya", { day: today, n: 0 });
  if (rec.day !== today) rec = { day: today, n: 0 };
  const show = () => { count.textContent = L(`Aapne aaj ${rec.n} diye jalaaye.`, `आपने आज ${rec.n} दीये जलाए।`); };
  show();
  btn.addEventListener("click", () => {
    rec.n += 1; store.set("kk.diya", rec); show();
    const f = document.createElement("span");
    f.className = "diya-flame";
    f.style.left = `${12 + Math.random() * 76}%`;
    stage.append(f);
    if (soundOn()) crackle();
    if (stage.childElementCount > 40) stage.firstElementChild.remove();
  });
  save.addEventListener("click", () => {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1080;
    const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, 1080, 1080);
    const g = x.createRadialGradient(540, 470, 10, 540, 520, 380);
    g.addColorStop(0, "rgba(246,184,28,.9)"); g.addColorStop(1, "rgba(246,184,28,0)");
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = "#b5651d"; x.beginPath(); x.ellipse(540, 680, 260, 90, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#ffd36b"; x.beginPath(); x.ellipse(540, 660, 230, 60, 0, 0, Math.PI * 2); x.fill();
    const fl = x.createRadialGradient(540, 470, 5, 540, 500, 120);
    fl.addColorStop(0, "#fff7d1"); fl.addColorStop(0.4, "#ffb020"); fl.addColorStop(1, "rgba(216,50,26,0)");
    x.fillStyle = fl; x.beginPath(); x.ellipse(540, 490, 80, 150, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#1b1b3a"; x.textAlign = "center"; x.font = '700 60px "Hind",sans-serif';
    x.fillText(L("Mera diya", "मेरा दीया"), 540, 880);
    x.fillStyle = "#d8321a"; x.font = '600 44px "Hind",sans-serif';
    x.fillText("kundlikaka.in", 540, 960);
    shareCanvas(c, L("Maine apna diya jalaya. Aap bhi jalaaiye: kundlikaka.in", "मैंने अपना दीया जलाया। आप भी जलाइए: kundlikaka.in"), "mera-diya.png", toast);
  });
}

// ---------- 2. rangoli maker ----------
function initRangoli(root, L, toast) {
  const cv = root.querySelector("[data-rangoli-canvas]");
  const x = cv.getContext("2d");
  const colors = ["#d8321a", "#f6b81c", "#e0508a", "#ff7a1a", "#2e8b57"];
  let color = colors[0];
  const sw = root.querySelector("[data-rangoli-colors]");
  sw.innerHTML = colors.map((c, i) => `<button type="button" class="sw${i === 0 ? " on" : ""}" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join("");
  sw.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    color = b.dataset.c;
    sw.querySelectorAll(".sw").forEach((s) => s.classList.toggle("on", s === b));
  });
  const reset = () => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height);
    x.strokeStyle = "#eee"; x.lineWidth = 1;
    for (let i = 0; i <= 12; i++) { const p = (cv.width / 12) * i; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, cv.height); x.stroke(); x.beginPath(); x.moveTo(0, p); x.lineTo(cv.width, p); x.stroke(); }
  };
  reset();
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height]; };
  const petal = (px, py) => {
    const r = 18 + Math.random() * 8;
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k;
      x.fillStyle = color; x.beginPath(); x.ellipse(px + Math.cos(a) * r, py + Math.sin(a) * r, r * 0.55, r * 0.28, a, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = "#f6b81c"; x.beginPath(); x.arc(px, py, 6, 0, Math.PI * 2); x.fill();
  };
  let drawing = false, last = null;
  cv.addEventListener("pointerdown", (e) => { drawing = true; const [px, py] = pos(e); petal(px, py); last = [px, py]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const [px, py] = pos(e);
    if (!last || Math.hypot(px - last[0], py - last[1]) > 26) { petal(px, py); last = [px, py]; }
  });
  const stop = () => { drawing = false; last = null; };
  cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
  root.querySelector("[data-rangoli-clear]").addEventListener("click", reset);
  root.querySelector("[data-rangoli-save]").addEventListener("click", () => {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1200;
    const y = c.getContext("2d");
    y.fillStyle = "#fff"; y.fillRect(0, 0, 1080, 1200);
    y.drawImage(cv, 0, 0, 1080, 1080);
    y.fillStyle = "#1b1b3a"; y.textAlign = "center"; y.font = '700 56px "Hind",sans-serif';
    y.fillText(L("Meri rangoli", "मेरी रंगोली"), 540, 1135);
    y.fillStyle = "#d8321a"; y.font = '600 40px "Hind",sans-serif';
    y.fillText("kundlikaka.in", 540, 1185);
    shareCanvas(c, L("Meri Diwali rangoli. Aap bhi banaiye: kundlikaka.in", "मेरी दिवाली रंगोली। आप भी बनाइए: kundlikaka.in"), "meri-rangoli.png", toast);
  });
}

// ---------- 3. wish card ----------
function initWish(root, L, toast) {
  const name = root.querySelector("[data-wish-name]");
  const rashi = root.querySelector("[data-wish-rashi]");
  const fest = root.querySelector("[data-wish-fest]");
  rashi.innerHTML = RASHI.map(([en, hi], i) => `<option value="${i}">${L(en, hi)}</option>`).join("");
  const festivals = [["Shubh Dhanteras", "शुभ धनतेरस"], ["Shubh Diwali", "शुभ दिवाली"], ["Shubh Bhai Dooj", "शुभ भाई दूज"]];
  fest.innerHTML = festivals.map(([en, hi], i) => `<option value="${i}">${L(en, hi)}</option>`).join("");
  const draw = () => {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, 1080, 1350);
    x.strokeStyle = "#f6b81c"; x.lineWidth = 16; x.strokeRect(40, 40, 1000, 1270);
    x.strokeStyle = "#1b1b3a"; x.lineWidth = 3; x.strokeRect(70, 70, 940, 1210);
    x.textAlign = "center"; x.fillStyle = "#d8321a";
    x.font = '700 92px "Hind",sans-serif';
    x.fillText(festivals[fest.value][1], 540, 330);
    x.fillStyle = "#1b1b3a"; x.font = '600 64px "Hind",sans-serif';
    const who = name.value.trim() || L("Aap", "आप");
    wrap(x, who, 880).slice(0, 2).forEach((l, i) => x.fillText(l, 540, 470 + i * 80));
    const [ren, rhi, col] = RASHI[rashi.value];
    x.fillStyle = "#555"; x.font = '500 46px "Hind",sans-serif';
    x.fillText(`${rhi} (${ren})`, 540, 680);
    x.fillText(`Shubh rang: ${col}`, 540, 748);
    x.strokeStyle = "#f6b81c"; x.lineWidth = 3; x.beginPath(); x.moveTo(300, 820); x.lineTo(780, 820); x.stroke();
    x.fillStyle = "#1b1b3a"; x.font = '500 46px "Hind",sans-serif';
    wrap(x, "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", 860).forEach((l, i) => x.fillText(l, 540, 920 + i * 62));
    x.fillStyle = "#555"; x.font = '400 36px "Hind",sans-serif';
    x.fillText("Bhagavad Gita 2.47", 540, 1060);
    x.fillStyle = "#d8321a"; x.font = '700 50px "Hind",sans-serif';
    x.fillText("Kundli Kaka", 540, 1160);
    x.fillStyle = "#1b1b3a"; x.font = '500 40px "Hind",sans-serif';
    x.fillText("kundlikaka.in", 540, 1215);
    return c;
  };
  root.querySelector("[data-wish-make]").addEventListener("click", () => {
    if (soundOn()) bell();
    const c = draw();
    const out = root.querySelector("[data-wish-out]");
    out.innerHTML = "";
    out.append(c);
    c.style.maxWidth = "100%"; c.style.height = "auto";
    const bar = document.createElement("div"); bar.className = "fest-bar";
    bar.innerHTML = `<button type="button" class="fest-btn">${L("Download", "डाउनलोड")}</button><button type="button" class="fest-btn fest-btn--main">${L("WhatsApp pe bhejiye", "व्हाट्सऐप पर भेजें")}</button>`;
    out.append(bar);
    bar.children[0].addEventListener("click", () => download(c, "shubh-wish.png"));
    bar.children[1].addEventListener("click", () => shareCanvas(c, L("Aapke liye Shubh Wish. kundlikaka.in", "आपके लिए शुभ कामनाएं। kundlikaka.in"), "shubh-wish.png", toast));
  });
}

// ---------- 4. Dhanteras checklist ----------
function initChecklist(root, L, toast) {
  const list = root.querySelector("[data-check-list]");
  const bar = root.querySelector("[data-check-count]");
  let done = store.get("kk.checklist", []);
  const draw = () => {
    list.innerHTML = CHECKLIST.map(([en, hi], i) => `<li><label><input type="checkbox" data-i="${i}" ${done.includes(i) ? "checked" : ""} /> <span>${L(en, hi)}</span></label></li>`).join("");
    bar.textContent = L(`${done.length} / ${CHECKLIST.length} ho gaye`, `${done.length} / ${CHECKLIST.length} हो गए`);
  };
  draw();
  list.addEventListener("change", (e) => {
    const i = Number(e.target.dataset.i);
    done = e.target.checked ? [...new Set([...done, i])] : done.filter((x) => x !== i);
    store.set("kk.checklist", done); draw();
    if (done.length === CHECKLIST.length) { if (soundOn()) bell(); toast(L("Sab ho gaya! Shubh Dhanteras.", "सब हो गया! शुभ धनतेरस।")); }
  });
  root.querySelector("[data-check-share]").addEventListener("click", () => {
    const text = L("Dhanteras ki checklist:\n", "धनतेरस की चेकलिस्ट:\n") + CHECKLIST.map(([en, hi], i) => `${done.includes(i) ? "✅" : "⬜"} ${L(en, hi)}`).join("\n") + "\nkundlikaka.in";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}

// ---------- 5. WhatsApp reminder link ----------
function initReminder(root, L, config) {
  const btn = root.querySelector("[data-remind]");
  if (!config?.whatsappUrl) { btn.closest("article").hidden = true; return; }
  const text = L("Mujhe Diwali ke puja ka shubh samay yaad dilaiye.", "मुझे दिवाली की पूजा का शुभ समय याद दिलाइए।");
  btn.href = `${config.whatsappUrl}${config.whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
  btn.target = "_blank"; btn.rel = "noopener";
}

// ---------- sound toggle ----------
function initSound(root, L) {
  const b = root.querySelector("[data-sound]");
  const paint = () => { const on = soundOn(); b.setAttribute("aria-pressed", on); b.textContent = on ? L("Awaaz band karo", "आवाज़ बंद करें") : L("Awaaz chalu karo", "आवाज़ चालू करें"); };
  paint();
  b.addEventListener("click", () => { store.set("kk.sound", !soundOn()); paint(); if (soundOn()) bell(); });
}

// ---------- entry ----------
const FEST_TEXT = {
  "fest.diyaH": ["Virtual diya", "वर्चुअल दीया"],
  "fest.diyaSub": ["Tap karke diya jalaiye and picture save karein.", "टैप करके दीया जलाइए और तस्वीर सेव करें।"],
  "fest.diyaBtn": ["Diya jalaiye", "दीया जलाइए"],
  "fest.save": ["Picture save karein", "तस्वीर सेव करें"],
  "fest.rangoliH": ["Rangoli banaiye", "रंगोली बनाइए"],
  "fest.rangoliSub": ["Screen par drag karke rang bhariye.", "स्क्रीन पर ड्रैग करके रंग भरिए।"],
  "fest.clear": ["Saaf karein", "साफ़ करें"],
  "fest.wishH": ["Shubh kamna card", "शुभ कामना कार्ड"],
  "fest.wishSub": ["Naam aur rashi chunkar card banaiye.", "नाम और राशि चुनकर कार्ड बनाइए।"],
  "fest.name": ["Naam", "नाम"],
  "fest.rashi": ["Rashi", "राशि"],
  "fest.fest": ["Tyohaar", "त्योहार"],
  "fest.makeCard": ["Card banaiye", "कार्ड बनाइए"],
  "fest.checkH": ["Dhanteras checklist", "धनतेरस चेकलिस्ट"],
  "fest.checkSub": ["Ye kaam is phone mein save rahenge.", "ये काम इस फ़ोन में सेव रहेंगे।"],
  "fest.waShare": ["WhatsApp pe bhejiye", "व्हाट्सऐप पर भेजिए"],
  "fest.remindH": ["Puja ka reminder", "पूजा का रिमाइंडर"],
  "fest.remindSub": ["WhatsApp pe ek message bhejiye, shubh samay wahi se yaad rahega.", "व्हाट्सऐप पर एक संदेश भेजिए, शुभ समय वहीं से याद रहेगा।"],
  "fest.remindBtn": ["WhatsApp reminder", "व्हाट्सऐप रिमाइंडर"],
  "fest.soundH": ["Tyohaar ki awaaz", "त्योहार की आवाज़"],
  "fest.soundSub": ["Diya aur card ke saath halki awaaz. Default roop se band hai.", "दीया और कार्ड के साथ हल्की आवाज़। डिफ़ॉल्ट रूप से बंद है।"],
};

export function initFestivalCorner({ L, toast, config }) {
  const root = document.getElementById("festCorner");
  if (!root) return;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const pair = FEST_TEXT[el.dataset.i18n];
    if (pair) el.textContent = L(pair[0], pair[1]);
  });
  initDiya(root.querySelector("[data-tool=diya]"), L, toast);
  initRangoli(root.querySelector("[data-tool=rangoli]"), L, toast);
  initWish(root.querySelector("[data-tool=wish]"), L, toast);
  initChecklist(root.querySelector("[data-tool=checklist]"), L, toast);
  initReminder(root.querySelector("[data-tool=remind]"), L, config);
  initSound(root.querySelector("[data-tool=sound]"), L);
}
