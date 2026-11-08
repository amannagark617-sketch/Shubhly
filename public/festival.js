// Festival corner: virtual diya, rangoli, wish card, Dhanteras checklist,
// WhatsApp reminder link and festive sounds. Everything runs in the visitor's
// browser; nothing here is sent to our server except the normal page view.

import { drawDiya, initDiya, initRangoli } from "/festart.js";
import { getLang } from "/i18n.js";
const CHECKLIST = [
  ["Start a new work or business", "नया काम या बिज़नेस शुरू करो", "Naya kaam ya business shuru karo"],
  ["Lakshmi puja in the evening, a diya at the door", "शाम को लक्ष्मी पूजा, दरवाज़े पर दीया", "Shaam ko Lakshmi puja, darwaze par diya"],
  ["Buy a new steel, brass or silver utensil", "स्टील, पीतल या चांदी का नया बर्तन", "Steel, peetal ya chaandi ka naya bartan"],
  ["Buy a new broom", "नया झाड़ू", "Naya jhaadu"],
  ["Decorate the home with lights", "घर को रोशनी से सजाओ", "Ghar ko roshni se sajao"],
  ["Don't borrow money or lend it to anyone", "उधार मत लो, किसी को पैसे मत दो", "Udhaar mat lo, kisi ko paise mat do"],
  ["Don't buy knives, blades or weapons", "चाकू, ब्लेड या हथियार मत खरीदो", "Chaaku, blade ya hathiyaar mat kharido"],
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
    download(canvas, name); toast(({ hi: "तस्वीर डाउनलोड हो गई। व्हाट्सऐप पर भेजिए।", hn: "Picture download hui. WhatsApp mein bhejiye." })[getLang()] || "Picture downloaded. Send it on WhatsApp.");
  }, "image/png");
}

// ---------- 3. wish card ----------
function initWish(root, L, toast) {
  const name = root.querySelector("[data-wish-name]");
  const fest = root.querySelector("[data-wish-fest]");
  const festivals = [["Happy Dhanteras", "शुभ धनतेरस", "Shubh Dhanteras"], ["Happy Diwali", "शुभ दिवाली", "Shubh Diwali"], ["Happy Govardhan Puja", "शुभ गोवर्धन पूजा", "Shubh Govardhan Puja"], ["Happy Bhai Dooj", "शुभ भाई दूज", "Shubh Bhai Dooj"]];
  fest.innerHTML = festivals.map(([en, hi, hn], i) => `<option value="${i}">${L(en, hi, hn)}</option>`).join("");
  fest.value = "1";
  const BLESS = [
    ["May Maa Lakshmi and Lord Dhanvantari fill your home with happiness, health and prosperity.", "माँ लक्ष्मी और भगवान धन्वंतरि आपके घर में सुख, स्वास्थ्य और समृद्धि भरें।", "Maa Lakshmi aur Bhagwan Dhanvantari aapke ghar mein sukh, swasthya aur samriddhi bharein."],
    ["May the light of the diya remove the darkness from your life, and may Maa Lakshmi's blessings always stay with you.", "दीपक की रोशनी आपके जीवन का अंधेरा मिटाए और माँ लक्ष्मी की कृपा सदा बनी रहे।", "Deepak ki roshni aapke jeevan ka andhera mitaye aur Maa Lakshmi ki kripa sada bani rahe."],
    ["By the grace of Lord Krishna, may your family always have happiness and joy.", "भगवान कृष्ण की कृपा से आपके परिवार में सदा सुख और आनंद बना रहे।", "Bhagwan Krishna ki kripa se aapke parivar mein sada sukh aur anand bana rahe."],
    ["May the love between brothers and sisters always last, and may every day feel like a festival.", "भाई-बहन का प्यार यूँ ही बना रहे, और हर दिन त्योहार जैसी खुशियों से भरा हो।", "Bhai-behen ka pyaar yunhi bana rahe, aur har din tyohaar jaisi khushiyon se bhara ho."],
  ];
  // Artwork: public/img/cards/diwali-card.webp (1080x1350)
  // with a clear centre; without it the built-in design is used.
  // Fetched once, only when someone makes a card (not on page load); one small WebP.
  let bgPromise = null;
  const loadBg = () => bgPromise || (bgPromise = new Promise((res) => {
    const i = new Image(); i.decoding = "async";
    i.onload = () => res(i); i.onerror = () => res(null);
    i.src = "/img/cards/diwali-card.webp";
  }));
  const draw = async () => {
    try {
      await Promise.all([
        document.fonts.load('700 60px "Noto Serif Devanagari"', "शुभ दिवाली राशि"),
        document.fonts.load('500 40px "Noto Serif Devanagari"', "शुभ रंग"),
        document.fonts.load('700 60px "Cormorant Garamond"'), document.fonts.load('600 40px "Cormorant Garamond"'),
        document.fonts.load('italic 600 40px "Cormorant Garamond"'),
      ]);
    } catch { /* fall back to system serif */ }
    const bg = await loadBg();
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    const x = c.getContext("2d");
    x.textAlign = "center";
    const ink = "#1b1b3a", accent = bg ? "#8a1c1c" : "#d8321a", gold = "#c8921f";
    if (bg) {
      x.drawImage(bg, 0, 0, 1080, 1350);
    } else {
      x.fillStyle = "#fff"; x.fillRect(0, 0, 1080, 1350);
      x.strokeStyle = "#f6b81c"; x.lineWidth = 16; x.strokeRect(40, 40, 1000, 1270);
      x.strokeStyle = ink; x.lineWidth = 3; x.strokeRect(70, 70, 940, 1210);
      drawDiya(x, 540, 330, 290, 1, 0.3);
    }
    const f = Number(fest.value);
    const hiLang = L("a", "b") === "b";
    const SERIF = '"Cormorant Garamond","Noto Serif Devanagari",Georgia,serif';
    const DEV = '"Noto Serif Devanagari","Cormorant Garamond",Georgia,serif';
    x.fillStyle = accent; x.font = `700 104px ${DEV}`;
    x.fillText(festivals[f][1], 540, bg ? 445 : 450);
    x.strokeStyle = gold; x.lineWidth = 2.5; x.beginPath(); x.moveTo(400, 490); x.lineTo(680, 490); x.stroke();
    x.fillStyle = gold; x.beginPath(); x.arc(540, 490, 5, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#4a4458"; x.font = hiLang ? `500 50px ${DEV}` : `italic 600 58px ${SERIF}`;
    wrap(x, L(BLESS[f][0], BLESS[f][1], BLESS[f][2]), 800).slice(0, 5).forEach((l, i) => x.fillText(l, 540, 620 + i * (hiLang ? 78 : 70)));
    const who = name.value.trim();
    if (who) {
      x.fillStyle = "#7a7488"; x.font = hiLang ? `500 38px ${DEV}` : `italic 600 42px ${SERIF}`;
      x.fillText(L("With best wishes", "शुभकामनाओं सहित", "Shubhkamnaon ke saath"), 540, 920);
      x.fillStyle = ink; x.font = hiLang ? `700 66px ${DEV}` : `700 84px ${SERIF}`;
      wrap(x, who, 860).slice(0, 2).forEach((l, i) => x.fillText(l, 540, 1008 + i * 84));
    }
    x.fillStyle = accent; x.font = `700 54px ${SERIF}`;
    x.fillText("Kundli Kaka", 540, bg ? 1118 : 1170);
    x.fillStyle = "#5a5468"; x.font = `600 34px ${SERIF}`;
    x.fillText("kundlikaka.in", 540, bg ? 1156 : 1220);
    return c;
  };
  root.querySelector("[data-wish-make]").addEventListener("click", async () => {
    if (soundOn()) bell();
    const c = await draw();
    const out = root.querySelector("[data-wish-out]");
    out.innerHTML = "";
    out.append(c);
    c.style.maxWidth = "100%"; c.style.height = "auto";
    const bar = document.createElement("div"); bar.className = "fest-bar";
    bar.innerHTML = `<button type="button" class="fest-btn">${L("Download", "डाउनलोड")}</button><button type="button" class="fest-btn fest-btn--main">${L("Send on WhatsApp", "व्हाट्सऐप पर भेजें", "WhatsApp pe bhejiye")}</button>`;
    out.append(bar);
    bar.children[0].addEventListener("click", () => download(c, "shubh-wish.png"));
    bar.children[1].addEventListener("click", () => shareCanvas(c, L("A festival wish for you. kundlikaka.in", "आपके लिए शुभ कामनाएं। kundlikaka.in", "Aapke liye Shubh Wish. kundlikaka.in"), "shubh-wish.png", toast));
  });
}

// ---------- 4. Dhanteras checklist ----------
function initChecklist(root, L, toast) {
  const list = root.querySelector("[data-check-list]");
  const bar = root.querySelector("[data-check-count]");
  let done = store.get("kk.checklist", []);
  const draw = () => {
    list.innerHTML = CHECKLIST.map(([en, hi, hn], i) => `<li><label><input type="checkbox" data-i="${i}" ${done.includes(i) ? "checked" : ""} /> <span>${L(en, hi, hn)}</span></label></li>`).join("");
    bar.textContent = L(`${done.length} of ${CHECKLIST.length} done`, `${done.length} / ${CHECKLIST.length} हो गए`, `${done.length} / ${CHECKLIST.length} ho gaye`);
  };
  draw();
  list.addEventListener("change", (e) => {
    const i = Number(e.target.dataset.i);
    done = e.target.checked ? [...new Set([...done, i])] : done.filter((x) => x !== i);
    store.set("kk.checklist", done); draw();
    if (done.length === CHECKLIST.length) { if (soundOn()) bell(); toast(L("All done! Happy Dhanteras.", "सब हो गया! शुभ धनतेरस।", "Sab ho gaya! Shubh Dhanteras.")); }
  });
  root.querySelector("[data-check-share]").addEventListener("click", () => {
    const text = L("Dhanteras checklist:\n", "धनतेरस की चेकलिस्ट:\n", "Dhanteras ki checklist:\n") + CHECKLIST.map(([en, hi, hn], i) => `${done.includes(i) ? "✅" : "⬜"} ${L(en, hi, hn)}`).join("\n") + "\nkundlikaka.in";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}

// ---------- 5. WhatsApp reminder link ----------
function initReminder(root, L, config) {
  const btn = root.querySelector("[data-remind]");
  if (!config?.whatsappUrl) { btn.closest("article").hidden = true; return; }
  const text = L("Please remind me of the Diwali puja timings.", "मुझे दिवाली की पूजा का शुभ समय याद दिलाइए।", "Mujhe Diwali ke puja ka shubh samay yaad dilaiye.");
  btn.href = `${config.whatsappUrl}${config.whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
  btn.target = "_blank"; btn.rel = "noopener";
}

// ---------- sound toggle ----------
function initSound(root, L) {
  const b = root.querySelector("[data-sound]");
  const paint = () => { const on = soundOn(); b.setAttribute("aria-pressed", on); b.textContent = on ? L("Turn sound off", "आवाज़ बंद करें", "Awaaz band karo") : L("Turn sound on", "आवाज़ चालू करें", "Awaaz chalu karo"); };
  paint();
  b.addEventListener("click", () => { store.set("kk.sound", !soundOn()); paint(); if (soundOn()) bell(); });
}

// ---------- entry ----------
const FEST_TEXT = {
  "fest.diyaH": ["Virtual diya", "वर्चुअल दीया"],
  "fest.diyaSub": ["Tap a diya to light it, write a wish and share the picture.", "दीये पर टैप करके जलाइए, कामना लिखिए और तस्वीर भेजिए।", "Diye par tap karke jalaiye, kamna likhiye aur tasveer bhejiye."],
  "fest.diyaLight": ["Light one diya", "एक दीया जलाइए", "Ek diya jalaiye"],
  "fest.diyaAll": ["Light all diyas", "सारे दीये जलाइए", "Saare diye jalaiye"],
  "fest.diyaOut": ["Put out the diyas", "दीये बुझाइए", "Diye bujhaiye"],
  "fest.wishLine": ["Write your wish (optional)", "अपनी कामना लिखिए (ज़रूरी नहीं)", "Apni kamna likhiye (zaroori nahi)"],
  "fest.undo": ["Undo", "वापस", "Wapas"],
  "fest.auto": ["Auto draw", "खुद बनाओ", "Khud banao"],
  "fest.sym": ["Symmetry", "सिमेट्री"],
  "fest.size": ["Brush size", "ब्रश का साइज़", "Brush ka size"],
  "fest.erase": ["Erase", "मिटाइए", "Mitaiye"],
  "fest.guide": ["Show guide", "गाइड दिखाइए", "Guide dikhaiye"],
  "fest.colors": ["Colours", "रंग", "Rang"],
  "fest.diyaBtn": ["Light a diya", "दीया जलाइए", "Diya jalaiye"],
  "fest.save": ["Save picture", "तस्वीर सेव करें", "Picture save karein"],
  "fest.rangoliH": ["Make a rangoli", "रंगोली बनाइए", "Rangoli banaiye"],
  "fest.rangoliSub": ["Fill in colours with your finger. Symmetry is added for you.", "उंगली से रंग भरिए। सिमेट्री अपने आप लगती है।", "Ungli se rang bhariye. Symmetry apne aap lagti hai."],
  "fest.clear": ["Clear", "साफ़ करें", "Saaf karein"],
  "fest.wishH": ["Festival wish card", "शुभ कामना कार्ड", "Shubh kamna card"],
  "fest.wishSub": ["Write your name, pick a festival and send the card to friends and family.", "अपना नाम लिखिए, त्योहार चुनिए और कार्ड दोस्त-परिवार को भेजिए।", "Apna naam likhiye, tyohaar chuniye aur card dost-parivaar ko bhejiye."],
  "fest.name": ["Name", "नाम", "Naam"],
  "fest.fest": ["Festival", "त्योहार", "Tyohaar"],
  "fest.makeCard": ["Make the card", "कार्ड बनाइए", "Card banaiye"],
  "fest.checkH": ["Dhanteras checklist", "धनतेरस चेकलिस्ट"],
  "fest.checkSub": ["Your ticks are saved on this phone.", "ये काम इस फ़ोन में सेव रहेंगे।", "Ye kaam is phone mein save rahenge."],
  "fest.waShare": ["Send on WhatsApp", "व्हाट्सऐप पर भेजिए", "WhatsApp pe bhejiye"],
  "fest.remindH": ["Puja reminder", "पूजा का रिमाइंडर", "Puja ka reminder"],
  "fest.remindSub": ["Send yourself a WhatsApp message so the good timings stay in your chat.", "व्हाट्सऐप पर एक संदेश भेजिए, शुभ समय वहीं से याद रहेगा।", "WhatsApp pe ek message bhejiye, shubh samay wahi se yaad rahega."],
  "fest.remindBtn": ["WhatsApp reminder", "व्हाट्सऐप रिमाइंडर"],
  "fest.soundH": ["Festival sounds", "त्योहार की आवाज़", "Tyohaar ki awaaz"],
  "fest.soundSub": ["Soft sounds with the diya and card. Off by default.", "दीया और कार्ड के साथ हल्की आवाज़। डिफ़ॉल्ट रूप से बंद है।", "Diya aur card ke saath halki awaaz. Default roop se band hai."],
};

export function initFestivalCorner({ L, toast, config }) {
  const root = document.getElementById("festCorner");
  if (!root) return;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const pair = FEST_TEXT[el.dataset.i18n];
    if (pair) el.textContent = L(pair[0], pair[1], pair[2]);
  });
  const helpers = { L, toast, store, soundOn, crackle, shareCanvas };
  initDiya(root.querySelector("[data-tool=diya]"), helpers);
  initRangoli(root.querySelector("[data-tool=rangoli]"), helpers);
  initWish(root.querySelector("[data-tool=wish]"), L, toast);
  initChecklist(root.querySelector("[data-tool=checklist]"), L, toast);
  initReminder(root.querySelector("[data-tool=remind]"), L, config);
  initSound(root.querySelector("[data-tool=sound]"), L);
}
