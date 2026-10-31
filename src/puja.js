// Puja guides: what you need (samagri), what to prepare, and the steps, for
// the pujas families most often do at home. Written in simple English and Hindi.
// A real photo placed at public/img/puja/<slug>.jpg (or .webp/.png) is used on
// the page when present; otherwise a plain colour panel.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HEAD, TOP, FOOT, esc } from "./blog.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "puja");
const IMG = path.join(ROOT, "public", "img", "puja");

export const ORDER = ["lakshmi", "ganesh", "satyanarayan", "griha-pravesh", "saraswati", "hanuman", "shiv", "durga"];
const ACCENT = {
  lakshmi: ["#b8326b", "#fbe9f1"], ganesh: ["#d4651a", "#fdeedd"], satyanarayan: ["#c79200", "#fbf3d4"],
  "griha-pravesh": ["#2f7d4f", "#e3f3e8"], saraswati: ["#2b6cb0", "#e4eefa"], hanuman: ["#c0392b", "#fbe4e0"],
  shiv: ["#4a4fa3", "#e8e9f8"], durga: ["#a8261f", "#fbe3e1"],
};

let cache = null;
export function loadPujas() {
  if (!cache) cache = Object.fromEntries(ORDER.map((s) => [s, JSON.parse(fs.readFileSync(path.join(DIR, s + ".json"), "utf8"))]));
  return cache;
}
export const pujaOf = (slug) => loadPujas()[slug] || null;
export const PUJA_PATHS = () => ["/puja", ...ORDER.map((s) => `/puja/${s}`)];

// Small pictures for samagri items: public/img/puja/items/<key>.jpg (or .webp/.png). Prompts: docs/puja-image-prompts.md
export const ITEMS = [
  ["panchamrit", /panchamrit|milk|curd|honey|sugar/i, "a small brass bowl of panchamrit with white milk, curd, honey, ghee and sugar in separate small bowls"],
  ["ghee", /ghee|wick|oil/i, "a small brass bowl of golden ghee next to a handful of twisted cotton wicks"],
  ["diya", /diya|lamp/i, "two lit traditional clay diyas with steady warm flames"],
  ["mango", /mango/i, "a bunch of fresh green mango leaves tied with a thread"],
  ["coconut", /coconut/i, "a whole brown coconut with husk and a tuft on top"],
  ["kalash", /kalash|small pot/i, "a polished brass kalash with a coconut and mango leaves on top, tied with red thread"],
  ["incense", /incense|dhoop/i, "a bundle of incense sticks and a small dhoop holder with thin smoke rising"],
  ["camphor", /camphor/i, "a few white camphor tablets in a small brass bowl"],
  ["gangajal", /gangajal|clean water|lota/i, "a small brass lota (pot) of clean water"],
  ["chowki", /chowki|platform|table/i, "a small low wooden chowki (platform stool) with a neat finish"],
  ["cloth", /cloth|chunri/i, "a folded bright red puja cloth with a golden border"],
  ["rice", /akshat|rice/i, "a small brass bowl full of whole unbroken raw white rice (akshat)"],
  ["kumkum", /roli|kumkum|haldi|sindoor/i, "small brass bowls of red kumkum, yellow haldi and orange sindoor powder"],
  ["moli", /kalawa|kalava|moli|mauli/i, "a roll of red and yellow sacred thread (moli, kalawa)"],
  ["betel", /betel|paan|supari/i, "fresh green betel (paan) leaves with a few whole betel nuts (supari)"],
  ["tulsi", /tulsi/i, "a bunch of fresh green tulsi leaves"],
  ["durva", /durva/i, "a small bunch of fresh green durva grass tied with a thread"],
  ["bel", /belpatra|bel/i, "three-leaf bel patra leaves, fresh and green"],
  ["chandan", /chandan|sandal|bhasma|vibhuti/i, "a small bowl of sandalwood paste and a small bowl of grey ash (bhasma)"],
  ["flowers", /flower|garland|petal|hibiscus|marigold|lotus/i, "fresh orange marigold flowers, a red hibiscus and a pink lotus with a marigold garland"],
  ["fruits", /fruit|banana/i, "a small plate of fresh seasonal fruits: bananas, an apple, a pomegranate and ber"],
  ["sweets", /modak|laddu|laddoo|sweet|halwa|sheera|kheer|boondi|bhog|prasad/i, "a steel plate of modak, boondi laddoo and sooji halwa prasad"],
  ["thali", /thali|plate/i, "an empty polished brass puja thali (aarti plate) with a small diya and kumkum bowl on it"],
  ["coins", /coin|dakshina|notes/i, "a few old gold-coloured coins and some rupee notes on a small red cloth"],
  ["books", /book|notebook|chalisa|katha/i, "a small stack of religious books, a notebook and a pen"],
  ["havan", /havan/i, "a small copper havan kund with mango wood sticks and a bowl of havan samagri"],
  ["jau", /barley|jau|soil/i, "a clay tray of fresh green sprouted barley shoots (jau) in soil"],
  ["rangoli", /rangoli/i, "bowls of bright rangoli colour powders and some flower petals"],
];
export const itemKey = (name) => (ITEMS.find(([, re]) => re.test(name)) || [])[0] || null;
const itemImg = (name) => {
  const k = itemKey(name);
  if (!k) return "";
  for (const ext of ["jpg", "webp", "png"]) if (fs.existsSync(path.join(IMG, "items", `${k}.${ext}`))) return `/img/puja/items/${k}.${ext}`;
  return "";
};

const photo = (slug) => {
  for (const ext of ["jpg", "webp", "png"]) if (fs.existsSync(path.join(IMG, `${slug}.${ext}`))) return `/img/puja/${slug}.${ext}`;
  return null;
};

// Until a real photo is added, the page shows a plain colour panel with the puja name (no drawing).
const panel = (c1, c2, p) => `<div class="pj-panel" style="background:${c2};color:${c1}"><b lang="hi">${esc(p.hi)}</b><span>${esc(p.en)}</span></div>`;

// Text that shows in whichever language the visitor picked
const T = (en, hi) => `<span class="l-en">${esc(en)}</span><span class="l-hi" lang="hi">${esc(hi)}</span>`;

const LANG_JS = `<script>(function(){var l="en";try{var s=localStorage.getItem("shubhly.lang");if(s==="hi")l="hi";var q=localStorage.getItem("kk.puja.lang");if(q)l=q}catch(e){}
function set(v){document.documentElement.setAttribute("data-pl",v);try{localStorage.setItem("kk.puja.lang",v)}catch(e){}[].forEach.call(document.querySelectorAll("[data-setl]"),function(b){b.setAttribute("aria-pressed",String(b.dataset.setl===v))})}
document.documentElement.setAttribute("data-pl",l);
document.addEventListener("DOMContentLoaded",function(){set(l);document.addEventListener("click",function(e){var b=e.target.closest("[data-setl]");if(b)set(b.dataset.setl)})})})();</script>`;

const TOGGLE = `<div class="pj-lang" role="group" aria-label="Language"><button type="button" data-setl="en" aria-pressed="true">English</button><button type="button" data-setl="hi" aria-pressed="false" lang="hi">हिंदी</button></div>`;

const PAGE_JS = `<script type="module" src="/puja.js"></script>`;

export function renderPujaIndex(origin) {
  const all = loadPujas();
  const url = origin + "/puja";
  const cards = ORDER.map((s) => {
    const p = all[s];
    const [c1, c2] = ACCENT[s];
    const ph = photo(s);
    return `<a class="pj-card" href="/puja/${s}" style="--pj:${c1};--pj2:${c2}">
  <span class="pj-card-img">${ph ? `<img src="${ph}" alt="" width="1600" height="700" loading="lazy">` : `<b lang="hi">${esc(p.hi.split(" ")[0])}</b>`}</span>
  <span class="pj-card-t"><strong>${T(p.en, p.hi)}</strong><small>${T(p.tag_en, p.tag_hi)}</small><em>${T(p.time_en, p.time_hi)} · ${p.samagri.length} ${T("items", "सामग्री")}</em></span></a>`;
  }).join("\n");
  const ld = `  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "CollectionPage", name: "Puja vidhi and samagri list", url,
    description: "Step by step home puja guides with the full samagri list for Lakshmi, Ganesh, Satyanarayan, Griha Pravesh, Saraswati, Hanuman, Shiv and Durga puja.",
    isPartOf: { "@type": "WebSite", name: "Kundli Kaka", url: origin },
  })}</script>\n`;
  return HEAD("Puja Vidhi & Samagri List: Lakshmi, Ganesh, Satyanarayan & More | Kundli Kaka",
    "Simple step by step home puja guides with the full samagri (ingredients) list, mantra and tips. Lakshmi, Ganesh, Satyanarayan, Griha Pravesh, Saraswati, Hanuman, Shiv and Durga puja, in English and Hindi.",
    url, ld + LANG_JS) +
    TOP.replace("blog-page", "blog-page puja-page") +
    `<main class="wrap puja-wrap">
${TOGGLE}
<h1>${T("Puja at home, step by step", "घर पर पूजा, एक-एक कदम")}</h1>
<p class="post-lead">${T("Choose a puja to see exactly what you need, how to prepare the day before, and every step in order. No priest needed, and no Sanskrit you cannot read.", "कोई भी पूजा चुनिए और देखिए कि क्या-क्या चाहिए, एक दिन पहले क्या तैयारी करनी है, और हर कदम क्रम से। पंडित जी की ज़रूरत नहीं, और कोई कठिन संस्कृत नहीं।")}</p>
<div class="pj-grid">${cards}</div>
<aside class="gita-about"><h2>${T("A note before you begin", "शुरू करने से पहले")}</h2>
<p>${T("Every family and region does these pujas a little differently. Where your family's way or your pandit's advice differs from this page, follow theirs. What matters most is a clean, calm mind and a sincere heart.", "हर परिवार और हर क्षेत्र में पूजा थोड़ी अलग तरह से होती है। जहाँ आपके परिवार या पंडित जी का तरीका इस पेज से अलग हो, वहाँ उनका तरीका मानिए। सबसे ज़रूरी है साफ़, शांत मन और सच्ची श्रद्धा।")}</p></aside>
</main>` + FOOT.replace("</body>", PAGE_JS + "\n</body>");
}

const list = (arr, hiArr) => arr.map((e, i) => `<li>${T(e, hiArr[i])}</li>`).join("");

export function renderPuja(p, origin) {
  const url = `${origin}/puja/${p.slug}`;
  const [c1, c2] = ACCENT[p.slug];
  const ph = photo(p.slug);
  const idx = ORDER.indexOf(p.slug);
  const all = loadPujas();
  const others = ORDER.filter((s) => s !== p.slug).map((s) => `<a href="/puja/${s}">${T(all[s].en, all[s].hi)}</a>`).join("");
  const samagri = p.samagri.map((it, i) => `<li><label><input type="checkbox" data-sg="${i}">${itemImg(it.en) ? `<img class="pj-it" src="${itemImg(it.en)}" alt="" width="64" height="64" loading="lazy">` : ""}<span class="pj-sg"><b>${T(it.en, it.hi)}</b><i>${T(it.qty_en, it.qty_hi)}</i><small>${T(it.use_en, it.use_hi)}</small></span></label></li>`).join("");
  const steps = p.steps.map((s, i) => `<li><span class="pj-n">${i + 1}</span><div><h3>${T(s.title_en, s.title_hi)}</h3><p>${T(s.en, s.hi)}</p></div></li>`).join("");
  const share = `${p.en}: samagri list and steps, simple, in English and Hindi.\n${url}`;
  const ld = `  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "HowTo", name: `${p.en} at home: samagri and step by step vidhi`,
    description: p.intro_en, totalTime: undefined,
    supply: p.samagri.map((s) => ({ "@type": "HowToSupply", name: s.en })),
    step: p.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title_en, text: s.en })),
  })}</script>\n`;
  return HEAD(`${p.en} Vidhi & Samagri List at Home | Kundli Kaka`,
    `${p.en} at home: full samagri list, preparation, step by step vidhi and mantra, in simple English and Hindi. ${p.tag_en}`,
    url, ld + LANG_JS, ph ? origin + ph : "/img/og-image.jpg") +
    TOP.replace("blog-page", "blog-page puja-page") +
    `<main class="wrap puja-wrap" style="--pj:${c1};--pj2:${c2}">
<p class="pj-crumb"><a href="/puja">${T("All pujas", "सभी पूजा")}</a></p>
${TOGGLE}
<div class="pj-hero">${ph ? `<img class="pj-photo" src="${ph}" alt="${esc(p.en)}" width="1600" height="700" fetchpriority="high">` : panel(c1, c2, p)}</div>
<h1>${T(p.en, p.hi)}</h1>
<p class="post-lead">${T(p.tag_en, p.tag_hi)}</p>
<div class="pj-glance"><div><b>${p.samagri.length}</b><span>${T("items", "सामग्री")}</span></div><div><b>${p.steps.length}</b><span>${T("steps", "कदम")}</span></div><div><b>${T(p.time_en.replace(/^About /, ""), p.time_hi.replace(/^लगभग /, ""))}</b><span>${T("time", "समय")}</span></div></div>
<a class="btn btn-wa pj-share-top" href="https://wa.me/?text=${encodeURIComponent(p.en + " at home: full samagri list and step by step vidhi, simple and free.\n" + url + "?utm_source=whatsapp&utm_medium=share&utm_campaign=puja_page")}" target="_blank" rel="noopener" data-track="puja_page"><img class="wa-ic" src="/img/whatsapp.svg" alt="" width="22" height="22">${T("Share this puja on WhatsApp", "यह पूजा WhatsApp पर शेयर करें")}</a>
<div class="pj-facts"><div><small>${T("When", "कब")}</small><p>${T(p.when_en, p.when_hi)}</p></div><div><small>${T("Time needed", "समय")}</small><p>${T(p.time_en, p.time_hi)}</p></div></div>
<p>${T(p.intro_en, p.intro_hi)}</p>
<h2>${T("What you need (samagri)", "ज़रूरी सामग्री")}</h2>
<div class="pj-prog" aria-live="polite"><div class="pj-prog-bar"><i id="pj-bar"></i></div><span id="pj-count"></span></div>
<p class="pj-hint">${T("Tick each item as you collect it. Your ticks stay on this phone.", "सामान जमा करते हुए हर चीज़ पर टिक लगाइए। टिक इसी फ़ोन में रहते हैं।")}</p>
<ul class="pj-samagri" id="pj-sg" data-slug="${p.slug}">${samagri}</ul>
<div class="pj-actions"><button type="button" class="btn" id="pj-copy" data-title="${esc(p.en)}">${T("Copy list", "सूची कॉपी करें")}</button><a class="btn btn-wa" id="pj-wa" href="#" rel="noopener"><img class="wa-ic" src="/img/whatsapp.svg" alt="" width="22" height="22">${T("Send this list on WhatsApp", "यह सूची WhatsApp पर भेजें")}</a><button type="button" class="btn" onclick="window.print()">${T("Print", "प्रिंट")}</button></div>
<h2>${T("The day before", "एक दिन पहले")}</h2>
<ul class="pj-plain">${list(p.before_en, p.before_hi)}</ul>
<h2>${T("Step by step", "कदम-दर-कदम विधि")}</h2>
<ol class="pj-steps">${steps}</ol>
<section class="pj-mantra"><small>${T("A simple mantra", "एक सरल मंत्र")}</small><p class="pj-sa" lang="sa">${esc(p.mantra.sa)}</p><p class="pj-tr">${esc(p.mantra.tr)}</p><p>${T(p.mantra.en, p.mantra.hi)}</p></section>
<h2>${T("Helpful tips", "काम की बातें")}</h2>
<ul class="pj-plain">${list(p.tips_en, p.tips_hi)}</ul>
<h2>${T("Common mistakes to avoid", "इन बातों का ध्यान रखें")}</h2>
<ul class="pj-plain pj-avoid">${list(p.avoid_en, p.avoid_hi)}</ul>
<aside class="pj-cta"><h2>${T("Choose a good day for it", "शुभ दिन चुनिए")}</h2><p>${T("A pandit or a trusted calendar can confirm the best date and time for your family. You can also check today's panchang and choghadiya here.", "आपके परिवार के लिए सबसे अच्छी तिथि और समय पंडित जी या भरोसेमंद पंचांग से पक्का करें। आज का पंचांग और चौघड़िया यहाँ भी देख सकते हैं।")}</p><a class="btn btn-primary" href="/panchang">${T("Today's panchang", "आज का पंचांग")}</a> <a class="btn" href="/kundli">${T("Make my kundli", "मेरी कुंडली बनाएँ")}</a></aside>
<nav class="pj-more" aria-label="More pujas"><h2>${T("More pujas", "और पूजा")}</h2><div>${others}</div></nav>
<p class="pj-note">${T("Families and regions do this a little differently. Follow your own family's or pandit's way where it differs.", "परिवार और क्षेत्र के अनुसार तरीका थोड़ा अलग हो सकता है। जहाँ अलग हो, वहाँ अपने परिवार या पंडित जी का तरीका मानिए।")}</p>
<script type="application/json" id="pj-share">${JSON.stringify({ title: p.en, hi: p.hi, url, share, items_en: p.samagri.map((s) => `${s.en} (${s.qty_en})`), items_hi: p.samagri.map((s) => `${s.hi} (${s.qty_hi})`) }).replace(/</g, "\\u003c")}</script>
</main>` + FOOT.replace("</body>", PAGE_JS + "\n</body>");
}
