// The blog: a few plain, searchable articles. Each has its own address, title,
// description and article data so search engines and shares read it properly.

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const POSTS = [
  {
    slug: "sade-sati-what-it-really-means",
    title: "Sade Sati: What It Really Means (and What It Doesn't)",
    desc: "Sade Sati is Saturn's 7.5-year walk around your Moon sign. Here is how it works, the three phases, what Dhaiya is, and why it is not a curse.",
    date: "2026-10-20",
    read: 5,
    lead: "Say \"Sade Sati\" in an Indian family and the room goes quiet. Here is the calm version: what it is, how to know if you are in it, and what people usually find in it.",
    body: `
<h2>What Sade Sati means</h2>
<p>Sade Sati means "seven and a half". It is the period when Saturn (Shani) travels through three signs in a row: the sign before your Moon sign, your Moon sign, and the sign after it. Saturn stays about two and a half years in each sign, so the whole walk takes about seven and a half years.</p>
<p>It is counted from your <b>Moon sign</b> (your rashi), not your Sun sign. Saturn takes about 29.5 years to go around the zodiac, so most people meet Sade Sati two or three times in a lifetime.</p>
<h2>The three phases</h2>
<ul>
<li><b>First phase:</b> Saturn is in the sign before your Moon sign. Traditionally this is described as pressure on money, habits and responsibilities.</li>
<li><b>Second phase:</b> Saturn crosses your Moon sign. This is the most talked-about stretch, linked with mood, focus and how heavy life feels.</li>
<li><b>Third phase:</b> Saturn is in the sign after your Moon sign. Things are described as slowly settling, with lessons being put to use.</li>
</ul>
<h2>What is Dhaiya?</h2>
<p>Dhaiya (also called Small Panoti) is Saturn spending about two and a half years in the 4th or 8th sign from your Moon sign. It is shorter than Sade Sati and is read the same way: a stretch that asks for patience.</p>
<h2>Is Sade Sati bad?</h2>
<p>Saturn is the planet of time, discipline and consequences. That is why the period is often described as slow, serious and demanding. But many people also describe it as the time they got serious about work, health or a relationship, and some of their biggest steps forward happened during it.</p>
<p>The effect depends on the whole chart: where Saturn sits in your birth chart, which dasha you are running, and which houses the transit touches. Two people with the same Moon sign can have very different Sade Sati years. It is a phase to understand, not a verdict.</p>
<h2>How to check yours</h2>
<p>You need your Moon sign, and that needs your date, time and place of birth, because the Moon changes sign about every two and a quarter days. Saturn is moving through Pisces until 2027, so people with Moon signs Aquarius, Pisces and Aries are the ones in Sade Sati during this stretch.</p>
<h2>Simple habits people keep</h2>
<ul>
<li>A regular routine for sleep, food and work.</li>
<li>Keeping promises, especially small ones.</li>
<li>A quiet Saturday habit, such as a lamp in the evening or a short walk.</li>
<li>Helping someone who works with their hands.</li>
</ul>
<p>None of these need money, and none are a guarantee. They are ways of meeting a slow planet on its own terms.</p>
`,
  },
  {
    slug: "manglik-dosh-myth-and-meaning",
    title: "Manglik Dosh: What It Means and How Much It Really Matters",
    desc: "About 4 in 10 charts have Mars in a Manglik house on paper. Learn how Manglik Dosh is found, how it is cancelled, and why it is not a reason to panic.",
    date: "2026-10-21",
    read: 5,
    lead: "Manglik is one of the most feared words in Indian matchmaking. It is also one of the most misunderstood. Here is how it is worked out and what the traditions actually say.",
    body: `
<h2>What Manglik means</h2>
<p>A chart is called Manglik (or to have Mangal Dosh) when Mars sits in certain houses of the birth chart. Mars is the planet of energy, drive and anger, and the idea is that in some houses it makes partnership more intense.</p>
<h2>Which houses count</h2>
<p>Most sources count Mars in the <b>1st, 4th, 7th, 8th and 12th</b> houses from the Ascendant. Some also add the 2nd. Some traditions check from the Moon and from Venus too, which is why one chart can be called Manglik by one person and not by another.</p>
<h2>How common is it?</h2>
<p>If Mars falls in 5 of the 12 houses, then on paper roughly 4 in 10 charts are Manglik. That is not a rare condition. It is a very common one, which is a good reason to take it calmly.</p>
<figure class="post-fig"><svg viewBox="0 0 320 240" role="img" aria-label="A kundli chart with houses 1, 4, 7, 8 and 12 highlighted, the houses where Mars makes a chart Manglik"><g fill="none" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"><rect x="40" y="10" width="240" height="220" fill="#fff6e2"/><polygon points="160,10 100,65 160,120 220,65" fill="#f6b81c"/><polygon points="40,120 100,65 160,120 100,175" fill="#f6b81c"/><polygon points="160,230 100,175 160,120 220,175" fill="#f6b81c"/><polygon points="160,230 220,175 280,230" fill="#f6b81c"/><polygon points="280,10 220,65 160,10" fill="#f6b81c"/><path d="M40 10L280 230M280 10L40 230M160 10L280 120L160 230L40 120Z"/></g><g font-family="Hind, sans-serif" font-size="15" font-weight="700" fill="#1b1b3a" text-anchor="middle"><text x="160" y="57">1</text><text x="100" y="33">2</text><text x="60" y="70">3</text><text x="100" y="125">4</text><text x="60" y="180">5</text><text x="100" y="217">6</text><text x="160" y="193">7</text><text x="220" y="217">8</text><text x="260" y="180">9</text><text x="220" y="125">10</text><text x="260" y="70">11</text><text x="220" y="33">12</text></g></svg><figcaption>Mars in the highlighted houses (1, 4, 7, 8 and 12) is what most traditions call Manglik. Lists vary by tradition.</figcaption></figure>
<h2>How it is cancelled</h2>
<p>Traditions list many cancellations, called Manglik Dosh Bhanga. Common ones include:</p>
<ul>
<li>Both partners are Manglik, so the two balance each other.</li>
<li>Mars is in its own sign (Aries or Scorpio) or its exalted sign (Capricorn).</li>
<li>Mars is joined or looked at by Jupiter.</li>
<li>Mars sits in a sign ruled by a planet that is friendly to it.</li>
<li>Some traditions say the effect fades with age, often given as 28.</li>
</ul>
<h2>What it is not</h2>
<p>It is not a prediction that a marriage will fail, and it is not a reason to turn away someone you get along with. A good astrologer reads the whole chart: the 7th house, its lord, Venus, and the current dasha. Mars in one house is one line in a long page.</p>
<h2>What people do when one partner is Manglik</h2>
<ul>
<li>Check the chart for cancellations before worrying.</li>
<li>Look at the whole match, including the Ashtakoot points.</li>
<li>Talk openly about temper, patience and how each person handles disagreement. That is useful advice with or without a chart.</li>
</ul>
<p>The honest summary: Manglik is a tendency toward intensity in partnership, shared by a large share of people, and it is balanced by many other things in a chart.</p>
`,
  },
  {
    slug: "kundli-milan-36-gunas-explained",
    title: "Kundli Milan: What the 36 Gunas Actually Check",
    desc: "The Ashtakoot Milan scores two people out of 36 using eight koota checks. See what each one measures, why 18 is the usual minimum, and what a score can and can't tell you.",
    date: "2026-10-22",
    read: 6,
    lead: "\"Your match is 28 out of 36.\" What does that actually mean? Here are the eight checks behind the number, in plain words.",
    body: `
<h2>Where the 36 comes from</h2>
<p>Ashtakoot Milan compares two people's <b>Moon sign and Moon nakshatra</b>. It checks eight areas (koota), and each area has its own maximum, adding up to 36.</p>
<h2>The eight checks</h2>
<ul>
<li><b>Varna (1 point):</b> the temperament and work approach of each person.</li>
<li><b>Vashya (2 points):</b> how naturally the two influence and adapt to each other.</li>
<li><b>Tara (3 points):</b> how the birth stars support each other, often linked with wellbeing.</li>
<li><b>Yoni (4 points):</b> physical and instinctive compatibility.</li>
<li><b>Graha Maitri (5 points):</b> the friendship between the two Moon-sign lords. This is read as mental and emotional ease.</li>
<li><b>Gana (6 points):</b> basic nature: gentle, active or intense. Matching natures mean fewer clashes.</li>
<li><b>Bhakoot (7 points):</b> how the two Moon signs sit relative to each other, linked with shared life, family and finances.</li>
<li><b>Nadi (8 points):</b> the biggest check. Traditionally tied to health and family line, and the reason same-Nadi matches get extra attention.</li>
</ul>
<figure class="post-fig"><svg viewBox="0 0 360 280" role="img" aria-label="The eight Ashtakoot checks and their maximum points: 1, 2, 3, 4, 5, 6, 7 and 8"><g font-family="Hind, sans-serif" fill="#1b1b3a" transform="translate(10 4)"><g transform="translate(0 0)"><text x="0" y="20" font-size="15" font-weight="700">Varna</text><rect x="120" y="4" width="22" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="150" y="21" font-size="14">1</text></g><g transform="translate(0 34)"><text x="0" y="20" font-size="15" font-weight="700">Vashya</text><rect x="120" y="4" width="44" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="172" y="21" font-size="14">2</text></g><g transform="translate(0 68)"><text x="0" y="20" font-size="15" font-weight="700">Tara</text><rect x="120" y="4" width="66" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="194" y="21" font-size="14">3</text></g><g transform="translate(0 102)"><text x="0" y="20" font-size="15" font-weight="700">Yoni</text><rect x="120" y="4" width="88" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="216" y="21" font-size="14">4</text></g><g transform="translate(0 136)"><text x="0" y="20" font-size="15" font-weight="700">Graha Maitri</text><rect x="120" y="4" width="110" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="238" y="21" font-size="14">5</text></g><g transform="translate(0 170)"><text x="0" y="20" font-size="15" font-weight="700">Gana</text><rect x="120" y="4" width="132" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="260" y="21" font-size="14">6</text></g><g transform="translate(0 204)"><text x="0" y="20" font-size="15" font-weight="700">Bhakoot</text><rect x="120" y="4" width="154" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="282" y="21" font-size="14">7</text></g><g transform="translate(0 238)"><text x="0" y="20" font-size="15" font-weight="700">Nadi</text><rect x="120" y="4" width="176" height="22" rx="11" fill="#f6b81c" stroke="#1b1b3a" stroke-width="2.5"/><text x="304" y="21" font-size="14">8</text></g></g></svg><figcaption>Maximum points for each check. They add up to 36.</figcaption></figure>
<h2>What score is "good"?</h2>
<p>Most sources treat <b>18 out of 36</b> as the minimum for a match to be considered acceptable. Higher scores, around 25 and above, are described as strong. These are traditional rules of thumb, not laws.</p>
<h2>What the score can't tell you</h2>
<ul>
<li>It does not look at the rest of the chart: the 7th house, Venus, Mars, or the dasha each person is in.</li>
<li>It does not know whether you two communicate well, share values or want the same life.</li>
<li>It uses only the Moon, so the birth time matters. A wrong time can change the Moon sign or nakshatra, and the whole score with it.</li>
</ul>
<h2>How to use it sensibly</h2>
<p>Treat the score as a conversation starter. Look at which areas are strong and which need care, then talk about those areas in real life. A low Nadi or Gana score points to a topic to understand together, not a closed door.</p>
<p>Kundli Kaka's Kundli Milan works out the Moon positions from the real sky and shows each of the eight areas, so you can see where a match is easy and where it asks for patience.</p>
`,
  },
  {
    slug: "moon-sign-vs-sun-sign-which-is-your-rashi",
    title: "Moon Sign vs Sun Sign: Which One Is Really Your Rashi?",
    desc: "Indian astrology uses your Moon sign, Western astrology uses your Sun sign. Here is why they differ, why your rashi may not match your zodiac sign, and how to find yours.",
    date: "2026-10-23",
    read: 5,
    lead: "You read your horoscope for one sign, and your friend from abroad reads another. Both are \"right\". Here is why your rashi and your zodiac sign are often different.",
    body: `
<h2>Two systems, two starting points</h2>
<p>Western astrology starts from your <b>Sun sign</b>, which depends on the date of your birth. Indian (Vedic) astrology starts from your <b>Moon sign</b>, called Chandra rashi, which depends on where the Moon was at your birth.</p>
<p>Your rashi is your Moon sign. It is the one used for daily rashifal, naming ceremonies, muhurat and Kundli Milan.</p>
<h2>Why the signs often don't match</h2>
<p>There are two reasons:</p>
<ul>
<li><b>Different bodies.</b> The Sun takes about a month in each sign. The Moon moves faster, about two and a quarter days in each sign, so it can be in any of the twelve signs on your birthday.</li>
<li><b>Different zodiacs.</b> Western astrology uses the tropical zodiac, tied to the seasons. Vedic astrology uses the sidereal zodiac, tied to the stars, using a correction called ayanamsa (Lahiri, in India). Today that correction is about 24 degrees, so the Sun's sidereal sign is usually one sign behind its Western sign.</li>
</ul>
<h2>An example</h2>
<p>Someone born on 10 October is a Libra in Western astrology. In the sidereal zodiac the Sun is still in Virgo on that date, and their Moon could be in almost any sign, which is why one person has three different "signs" to read about.</p>
<h2>Which one should you read?</h2>
<ul>
<li>For Indian rashifal, panchang and matching: your <b>Moon sign</b>.</li>
<li>For Western horoscopes and tarot-style personality reading: your <b>Sun sign</b>.</li>
<li>For the fullest picture: your Ascendant (Lagna), which changes about every two hours.</li>
</ul>
<h2>Why birth time matters</h2>
<p>The Moon changes sign every couple of days, so if you were born near the change, the exact time decides your rashi. The Ascendant needs an exact time and place. If you don't know your birth time, your Moon sign can still be found for most days, and the Ascendant can't.</p>
<h2>Find yours</h2>
<p>Make your free kundli on Kundli Kaka with your date, time and place of birth, and you will see your Moon sign, Sun sign and Ascendant side by side, worked out from the real sky.</p>
`,
  },
];
POSTS.forEach((p) => { p.img = `/img/blog/${p.slug}.svg`; });
export const POST_BY_SLUG = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

export const HEAD = (title, desc, url, extra = "", img = "/img/og-image.jpg") => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="theme-color" content="#1b1b3a" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:site_name" content="Kundli Kaka" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/icons/icon-192.png" />
  <link rel="preload" href="/fonts/yatra-one-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/hind-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/style.css" />
${extra}</head>`;

export const TOP = `<body class="blog-page">
<header class="post-top"><div class="wrap post-top-in">
  <a class="brand" href="/" aria-label="Kundli Kaka home"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#f6b81c" stroke="#1b1b3a" stroke-width="5"/><path d="M32 3a29 29 0 0 1 0 58a18 29 0 0 0 0-58z" fill="#d8321a"/></svg>Kundli Kaka</a>
  <nav aria-label="Main"><a href="/kundli">Kundli</a><a href="/rashifal">Rashifal</a><a href="/match">Kundli Milan</a><a href="/gita">Gita</a><a href="/blog">Blog</a></nav>
</div></header>`;

export const FOOT = `<footer class="post-foot"><div class="wrap"><p>Kundli Kaka: your kundli, your puja, your vibe.</p></div></footer>
</body></html>`;

const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function renderBlogIndex(origin) {
  const url = origin + "/blog";
  const cards = POSTS.map((p) => `<a class="post-card" href="/blog/${p.slug}"><img src="${p.img}" width="1200" height="630" alt="" loading="lazy" /><span class="post-meta">${fmt(p.date)} · ${p.read} min read</span><h2>${esc(p.title)}</h2><p>${esc(p.desc)}</p></a>`).join("\n");
  return HEAD("Kundli Kaka Blog: Kundli, Rashifal and Vedic Astrology Explained", "Plain-language articles on Sade Sati, Manglik Dosh, Kundli Milan, Moon sign and more from Kundli Kaka.", url) +
    TOP + `<main class="wrap post-wrap"><h1>Astrology, explained simply</h1><p class="post-lead">Plain answers to the questions people actually ask about their kundli.</p><div class="post-cards">${cards}</div></main>` + FOOT;
}

export function renderPost(p, origin) {
  const url = `${origin}/blog/${p.slug}`;
  const ld = `  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.desc,
    datePublished: p.date, dateModified: p.date, mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Kundli Kaka" }, publisher: { "@type": "Organization", name: "Kundli Kaka" },
  })}</script>\n`;
  const more = POSTS.filter((x) => x.slug !== p.slug).map((x) => `<li><a href="/blog/${x.slug}">${esc(x.title)}</a></li>`).join("");
  return HEAD(`${p.title} | Kundli Kaka`, p.desc, url, ld, origin + p.img) + TOP +
    `<main class="wrap post-wrap"><article class="post"><p class="post-meta">${fmt(p.date)} · ${p.read} min read</p><h1>${esc(p.title)}</h1><img class="post-cover" src="${p.img}" width="1200" height="630" alt="" /><p class="post-lead">${esc(p.lead)}</p>${p.body}
<aside class="post-cta"><h2>See your own chart</h2><p>Make your free kundli in two minutes and read your Moon sign, dasha and more, worked out from the real sky.</p><a class="btn btn-primary" href="/kundli">Make my free kundli</a></aside>
<section class="post-more"><h2>Keep reading</h2><ul>${more}</ul></section></article></main>` + FOOT;
}
