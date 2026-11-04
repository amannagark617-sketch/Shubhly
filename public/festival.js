// Festival corner: virtual diya, rangoli, wish card, Dhanteras checklist,
// WhatsApp reminder link and festive sounds. Everything runs in the visitor's
// browser; nothing here is sent to our server except the normal page view.

import { drawDiya, initDiya, initRangoli } from "/festart.js";
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
function actx() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (audio.state === "suspended") audio.resume();
  return audio;
}
function bell() {
  const a = actx(); if (!a) return;
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
  const a = actx(); if (!a) return;
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
    drawDiya(x, 540, 330, 290, 1, 0.3);
    x.textAlign = "center"; x.fillStyle = "#d8321a";
    x.font = '700 92px "Hind",sans-serif';
    x.fillText(festivals[fest.value][1], 540, 450);
    x.fillStyle = "#1b1b3a"; x.font = '600 64px "Hind",sans-serif';
    const who = name.value.trim() || L("Aap", "आप");
    wrap(x, who, 880).slice(0, 2).forEach((l, i) => x.fillText(l, 540, 560 + i * 80));
    const [ren, rhi, col] = RASHI[rashi.value];
    x.fillStyle = "#555"; x.font = '500 46px "Hind",sans-serif';
    x.fillText(`${rhi} (${ren})`, 540, 740);
    x.fillText(`Shubh rang: ${col}`, 540, 806);
    x.strokeStyle = "#f6b81c"; x.lineWidth = 3; x.beginPath(); x.moveTo(300, 870); x.lineTo(780, 870); x.stroke();
    x.fillStyle = "#1b1b3a"; x.font = '500 46px "Hind",sans-serif';
    wrap(x, "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", 860).forEach((l, i) => x.fillText(l, 540, 960 + i * 62));
    x.fillStyle = "#555"; x.font = '400 36px "Hind",sans-serif';
    x.fillText("Bhagavad Gita 2.47", 540, 1100);
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
  "fest.diyaSub": ["Diye par tap karke jalaiye, kamna likhiye aur tasveer bhejiye.", "दीये पर टैप करके जलाइए, कामना लिखिए और तस्वीर भेजिए।"],
  "fest.diyaLight": ["Ek diya jalaiye", "एक दीया जलाइए"],
  "fest.diyaAll": ["Saare diye jalaiye", "सारे दीये जलाइए"],
  "fest.diyaOut": ["Diye bujhaiye", "दीये बुझाइए"],
  "fest.wishLine": ["Apni kamna likhiye (zaroori nahi)", "अपनी कामना लिखिए (ज़रूरी नहीं)"],
  "fest.undo": ["Wapas", "वापस"],
  "fest.auto": ["Khud banao", "खुद बनाओ"],
  "fest.sym": ["Symmetry", "सिमेट्री"],
  "fest.size": ["Brush ka size", "ब्रश का साइज़"],
  "fest.erase": ["Mitaiye", "मिटाइए"],
  "fest.guide": ["Guide dikhaiye", "गाइड दिखाइए"],
  "fest.colors": ["Rang", "रंग"],
  "fest.diyaBtn": ["Diya jalaiye", "दीया जलाइए"],
  "fest.save": ["Picture save karein", "तस्वीर सेव करें"],
  "fest.rangoliH": ["Rangoli banaiye", "रंगोली बनाइए"],
  "fest.rangoliSub": ["Ungli se rang bhariye. Symmetry apne aap lagti hai.", "उंगली से रंग भरिए। सिमेट्री अपने आप लगती है।"],
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
  const helpers = { L, toast, store, soundOn, crackle, shareCanvas };
  initDiya(root.querySelector("[data-tool=diya]"), helpers);
  initRangoli(root.querySelector("[data-tool=rangoli]"), helpers);
  initWish(root.querySelector("[data-tool=wish]"), L, toast);
  initChecklist(root.querySelector("[data-tool=checklist]"), L, toast);
  initReminder(root.querySelector("[data-tool=remind]"), L, config);
  initSound(root.querySelector("[data-tool=sound]"), L);
}
