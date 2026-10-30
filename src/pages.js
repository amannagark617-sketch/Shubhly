// The site's pages. One HTML shell, shown differently per address so every
// page has its own URL, title, description and content for search and sharing.

import fs from "node:fs";
import { SIGNS } from "./astro-data.js";
import { STR } from "../public/i18n.js";

export const SLUGS = SIGNS.map((s) => s.en.toLowerCase());

const ALL = ["hero", "marquee", "s3d", "aaj", "rashifal", "kundli", "match", "guides", "tarot", "premium", "report", "how", "store", "faq", "final"];

export const PAGES = {
  home: {
    path: "/",
    on: ["hero", "marquee", "s3d", "aaj", "rashifal", "how", "faq", "final"],
    title: "Kundli Kaka: Free Kundli, Daily Rashifal & Panchang",
    desc: "Free daily rashifal, panchang and choghadiya, plus your kundli in minutes. Kundli Kaka: your kundli, your puja, your vibe.",
    main: "hero",
  },
  kundli: {
    path: "/kundli",
    on: ["kundli", "how", "faq"],
    title: "Free Kundli Online: Birth Chart, Dasha & Life Reading | Kundli Kaka",
    desc: "Make your free kundli in a minute. Get your birth chart, current dasha, Jupiter this year and a free reading of your strengths and what is ahead, in English, Hindi or Hinglish.",
    main: "kundli",
  },
  match: {
    path: "/match",
    on: ["match", "faq"],
    title: "Kundli Milan: Free Ashtakoot Match for Two People | Kundli Kaka",
    desc: "Check how well two people match with the traditional 36-point Ashtakoot Kundli Milan, worked out from the real Moon positions. Free, in English, Hindi or Hinglish.",
    main: "match",
  },
  rashifal: {
    path: "/rashifal",
    on: ["rashifal", "final"],
    title: "Today's Rashifal: Daily Horoscope for All 12 Rashis | Kundli Kaka",
    desc: "Honest daily rashifal for all twelve rashis, worked out from today's real Moon position. Check yesterday, today and tomorrow, in English, Hindi or Hinglish.",
    main: "rashifal",
  },
  panchang: {
    path: "/panchang",
    on: ["aaj", "final"],
    title: "Today's Panchang, Tithi, Nakshatra & Choghadiya | Kundli Kaka",
    desc: "Today's panchang for your city: tithi, nakshatra, yoga, karana, sunrise and sunset, Rahu Kaal and the choghadiya, calculated from the real sky.",
    main: "aaj",
  },
  guides: {
    path: "/guides",
    on: ["guides", "final"],
    title: "Chat With Astrologers, Free | Kundli Kaka",
    desc: "Ten astrologers for love, career, money, tarot and more. They read your real kundli and talk like a friend. Free, and always here to guide.",
    main: "guides",
  },
  tarot: {
    path: "/tarot",
    on: ["tarot", "faq"],
    title: "Free Tarot Reading Online: 3-Card Past, Present, Next | Kundli Kaka",
    desc: "Draw a free three-card tarot reading with animated cards. Choose love, career or money, turn each card and read what it may be telling you.",
    main: "tarot",
  },
  report: {
    path: "/report",
    on: ["report", "faq"],
    title: "Kundli Report: Career, Money, Love & Life Periods | Kundli Kaka",
    desc: "A personal kundli report made from your own chart: career, money, love, health and the periods of your life, in one PDF. Opening soon.",
    main: "report",
  },
  premium: {
    path: "/premium",
    on: ["premium", "faq"],
    title: "Kundli Kaka Premium: Deeper Kundli Reports | Kundli Kaka",
    desc: "Join the waiting list for deeper kundli reports and more. Free kundli, rashifal and panchang stay free.",
    main: "premium",
  },
  store: {
    path: "/store",
    on: ["store", "final"],
    title: "Puja Store: Murtis, Diyas, Rudraksha & More, Coming Soon | Kundli Kaka",
    desc: "Murtis, puja kits, diyas, incense and more are coming to Kundli Kaka. Tell us what you want first.",
    main: "store",
  },
};

export const signPage = (slug) => {
  const i = SLUGS.indexOf(slug);
  if (i < 0) return null;
  const s = SIGNS[i];
  return {
    path: `/rashifal/${slug}`,
    on: ["rashifal", "final"],
    title: `${s.en} (${s.hi}) Rashifal Today: Daily ${s.en} Horoscope | Kundli Kaka`,
    desc: `Today's ${s.en} (${s.hi}) rashifal, worked out from the real Moon position: mood, love, work and a simple tip for the day. Free on Kundli Kaka.`,
    main: "rashifal",
    sign: i,
    navPath: "/rashifal",
  };
};

let shell = null;
export function loadShell(file) {
  if (!shell || process.env.NODE_ENV !== "production") shell = fs.readFileSync(file, "utf8");
  return shell;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function renderPage(html, page, { origin, reading = "", noindex = false } = {}) {
  const url = origin + page.path;
  let out = html;

  // head
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  out = out.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.desc)}" />`);
  out = out.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(page.title)}" />`);
  out = out.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.desc)}" />`);
  out = out.replace(
    "</head>",
    `  <link rel="canonical" href="${esc(url)}" />\n  <meta property="og:url" content="${esc(url)}" />\n  <meta property="og:site_name" content="Kundli Kaka" />\n` +
      (noindex ? `  <meta name="robots" content="noindex" />\n` : "") +
      `  <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Kundli Kaka",
        url: origin + "/",
      })}</script>\n</head>`
  );

  // words in English, so the page reads fully before any script runs
  out = out.replace(/(<([a-z0-9]+)\b[^>]*\bdata-i="([\w]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, key, close) =>
    typeof STR.en[key] === "string" && !STR.en[key].includes("{") ? open + esc(STR.en[key]) + close : m);

  // which sections show
  for (const id of ALL) {
    if (page.on.includes(id)) continue;
    out = out.replace(new RegExp(`(<(?:section|div)\\b[^>]*\\bid="${id}")`), "$1 data-off");
  }

  // the page's own heading is the h1; on the home page the hero already is
  if (page.main !== "hero") {
    out = out.replace(new RegExp(`<h2 id="(${escRe(headingId(page.main))})"([^>]*)>([\\s\\S]*?)</h2>`), `<h1 id="$1"$2>$3</h1>`);
    out = out.replace(/<h1 id="hero-h"/, '<h2 id="hero-h"').replace(/(<h2 id="hero-h"[^>]*>[\s\S]*?)<\/h1>/, "$1</h2>");
  }

  // current page in the menus
  const navPath = page.navPath || page.path;
  out = out.replace(new RegExp(`<a href="${escRe(navPath)}"( data-| class="nav-premium")`, "g"), (_m, tail) =>
    tail.startsWith(" class") ? `<a href="${navPath}" class="nav-premium active" aria-current="page"` : `<a class="active" aria-current="page" href="${navPath}"${tail}`
  );

  out = out.replace("<body>", `<body data-page="${esc(Object.keys(PAGES).find((k) => PAGES[k].path === navPath) || "home")}"${page.sign != null ? ` data-sign="${page.sign}"` : ""}>`);
  if (reading) out = out.replace('<div id="reading"></div>', `<div id="reading">${reading}</div>`);
  return out;
}

function headingId(main) {
  return { aaj: "aaj-h", rashifal: "rf-h", kundli: "k-h", match: "m-h", guides: "g-h", premium: "pr-h", report: "rp-h", tarot: "tr-h", store: "store-h" }[main];
}

export function sitemap(origin, posts = [], extra = []) {
  const urls = [...Object.values(PAGES).map((p) => p.path), ...SLUGS.map((s) => `/rashifal/${s}`), ...(posts.length ? ["/blog"] : []), ...posts.map((p) => `/blog/${p.slug}`), ...extra];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${origin}${u === "/" ? "/" : u}</loc><changefreq>${u.startsWith("/rashifal") || u === "/panchang" || u === "/" ? "daily" : "weekly"}</changefreq></url>`).join("\n") + `\n</urlset>\n`;
}
