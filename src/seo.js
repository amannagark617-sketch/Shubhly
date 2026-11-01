// Search helpers: a page-specific content block with questions, Hindi page addresses,
// language alternates and structured data.
import { SEO_TEXT } from "./seo-text.js";

export const TOOL_KEYS = ["home", "kundli", "match", "rashifal", "panchang", "tarot"];

export const HI_META = {
  home: { title: "कुंडली काका: मुफ़्त कुंडली, राशिफल और पंचांग", desc: "मुफ़्त दैनिक राशिफल, पंचांग और चौघड़िया, और मिनटों में आपकी कुंडली। कुंडली काका: आपकी कुंडली, आपकी पूजा, आपका अंदाज़।" },
  kundli: { title: "मुफ़्त कुंडली ऑनलाइन: जन्म कुंडली, दशा और जीवन फल | कुंडली काका", desc: "एक मिनट में अपनी मुफ़्त कुंडली बनाइए। जन्म कुंडली, वर्तमान दशा, इस साल गुरु की स्थिति और अपनी ताकतों का फल, हिंदी, अंग्रेज़ी या हिंग्लिश में।" },
  match: { title: "कुंडली मिलान: दो लोगों का मुफ़्त अष्टकूट गुण मिलान | कुंडली काका", desc: "36 गुणों वाले पारंपरिक अष्टकूट कुंडली मिलान से जानिए दो लोग कितने मेल खाते हैं, असली चंद्र स्थिति से। मुफ़्त, हिंदी, अंग्रेज़ी या हिंग्लिश में।" },
  rashifal: { title: "आज का राशिफल: सभी 12 राशियों का दैनिक भविष्यफल | कुंडली काका", desc: "आज की असली चंद्र स्थिति से बना सभी बारह राशियों का सच्चा दैनिक राशिफल। कल, आज और आने वाले कल का, हिंदी, अंग्रेज़ी या हिंग्लिश में।" },
  panchang: { title: "आज का पंचांग, तिथि, नक्षत्र और चौघड़िया | कुंडली काका", desc: "आपके शहर का आज का पंचांग: तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त, राहु काल और चौघड़िया, असली आकाश से निकाला हुआ।" },
  tarot: { title: "मुफ़्त टैरो रीडिंग ऑनलाइन: तीन कार्ड, अतीत, वर्तमान, आगे | कुंडली काका", desc: "एनिमेटेड कार्ड के साथ मुफ़्त तीन कार्ड टैरो रीडिंग। प्रेम, करियर या धन चुनिए, हर कार्ड पलटिए और पढ़िए वह क्या कह रहा है।" },
};

export const hiPath = (p) => (p === "/" ? "/hi" : "/hi" + p);
export const enPath = (p) => p.replace(/^\/hi(?=\/|$)/, "") || "/";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const alternates = (origin, enP) =>
  `  <link rel="alternate" hreflang="en" href="${esc(origin + enP)}" />\n  <link rel="alternate" hreflang="hi" href="${esc(origin + hiPath(enP))}" />\n  <link rel="alternate" hreflang="x-default" href="${esc(origin + enP)}" />\n`;

export function seoBlock(key, lang = "en") {
  const t = SEO_TEXT[key]?.[lang];
  if (!t) return "";
  const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
  const how = t.how?.length ? `<h3>${lang === "hi" ? "यह कैसे काम करता है" : "How it works"}</h3><ol>${li(t.how)}</ol>` : "";
  const get = t.get?.length ? `<h3>${lang === "hi" ? "आपको क्या मिलता है" : "What you get"}</h3><ul>${li(t.get)}</ul>` : "";
  const faq = t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  return `<section class="seo-block" id="about-page"><div class="wrap seo-in">
<h2>${esc(t.h)}</h2>
${t.intro.map((p) => `<p>${esc(p)}</p>`).join("\n")}
${how}${get}
<h3>${lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Questions people ask"}</h3>
<div class="faq">${faq}</div>
</div></section>`;
}

const APP_NAMES = {
  kundli: { en: "Free Kundli", hi: "मुफ़्त कुंडली" },
  match: { en: "Kundli Milan", hi: "कुंडली मिलान" },
  tarot: { en: "Free Tarot Reading", hi: "मुफ़्त टैरो रीडिंग" },
  rashifal: { en: "Daily Rashifal", hi: "दैनिक राशिफल" },
  panchang: { en: "Daily Panchang", hi: "दैनिक पंचांग" },
};

export function seoLd(key, lang, origin, urlPath, pageTitle) {
  const out = [];
  const t = SEO_TEXT[key]?.[lang];
  const url = origin + urlPath;
  if (t) out.push({ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang, mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  if (APP_NAMES[key]) out.push({ "@context": "https://schema.org", "@type": "WebApplication", name: APP_NAMES[key][lang], url, inLanguage: lang, applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, provider: { "@type": "Organization", name: "Kundli Kaka", url: origin + "/" } });
  if (key === "home") out.push({ "@context": "https://schema.org", "@type": "Organization", name: "Kundli Kaka", url: origin + "/", logo: origin + "/img/logo-mark.png" });
  if (key !== "home") out.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: lang === "hi" ? "कुंडली काका" : "Kundli Kaka", item: origin + (lang === "hi" ? "/hi" : "/") },
    { "@type": "ListItem", position: 2, name: APP_NAMES[key]?.[lang] || pageTitle, item: url },
  ] });
  return out.map((o) => `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>\n`).join("");
}
