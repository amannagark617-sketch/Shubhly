// The blog: a few plain, searchable articles. Each has its own address, title,
// description and article data so search engines and shares read it properly.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MORE_POSTS } from "./blog-more.js";

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const POSTS = [
  {
    slug: "when-life-feels-stuck-kundli-gita-puja",
    title: "When Life Feels Stuck: A Calm Guide Using Kundli, the Gita and Puja",
    desc: "Stuck in a job, waiting for marriage or just restless? A calm way to use your kundli, a few Gita verses and a small home puja, with a 7 day plan.",
    date: "2026-11-01",
    read: 8,
    img: "/img/blog/when-life-feels-stuck.jpg",
    lead: "Almost everyone reaches a stretch where nothing moves: the job, the rishta, the money, or your own mind. Here is a calm way to look at it, using three things Indian families have always turned to: the kundli, the Gita and a small puja at home.",
    body: `
<h2>The problems people bring us most</h2>
<p>When people ask for a kundli, the question underneath is almost always one of these:</p>
<ul>
<li><b>"Why is my career not moving?"</b> Years of hard work and the same desk.</li>
<li><b>"When will I get married?"</b> Or whether a particular match is right.</li>
<li><b>"Why does money not stay?"</b> It comes in and goes out.</li>
<li><b>"Why can't I switch off my mind?"</b> Worry at night, restlessness in the day.</li>
<li><b>"Is something wrong at home?"</b> Small fights, a heavy mood.</li>
</ul>
<p>None of these is solved by one chart or one verse. But together, the three tools below give you a way to understand the timing, steady the mind and take a small, real action.</p>

<h2>1. The kundli: understanding the timing</h2>
<p>A kundli is a map of the sky at your birth. Its most useful gift is not a verdict but <b>timing</b>. Vedic astrology divides life into planetary periods called dashas. Each period brings the themes of its planet to the front: Saturn periods tend to ask for patience and hard work, Jupiter periods for growth and guidance, Venus periods for relationships and comfort.</p>
<p>So when you feel stuck, the first useful question is not "what is wrong with me?" but "which period am I in, and what is it asking?" Many people find that a slow stretch is a Saturn period doing what Saturn does: testing, slowing and building a base that lasts.</p>
<ul>
<li>For work and money, look at your current dasha and where Saturn and Jupiter are right now.</li>
<li>For marriage, look at the seventh house, and if a match is proposed, compare both charts with <a href="/match">Kundli Milan</a>.</li>
<li>You can see your own chart, dasha and a simple reading free at <a href="/kundli">Make your free kundli</a>.</li>
</ul>
<p>If you do not know your exact birth time, give your best estimate. The Moon sign is often still right, though the ascendant and houses can shift.</p>

<h2>2. The Gita: steadying the mind</h2>
<p>A chart can tell you a slow period is on. It cannot make the waiting easier. That is where the Gita helps. Three ideas, in plain words:</p>
<ul>
<li><b>Do your work, and let go of the outcome you cannot control (<a href="/gita/2">Gita 2.47</a>).</b> You control the effort, not the result. Ask yourself tonight: what is the one effort I can make tomorrow?</li>
<li><b>Hard times and good times both pass (<a href="/gita/2">Gita 2.14</a>).</b> Cold and heat, pleasure and pain, come and go. Learn to bear them without being thrown by them.</li>
<li><b>Lift yourself by your own mind (<a href="/gita/6">Gita 6.5</a>).</b> Your mind can be your friend or your enemy. Small daily habits, like a walk, a fixed hour of sleep and one quiet minute, make it a friend.</li>
</ul>
<p>You do not have to read the whole book. One verse a day is enough. On Kundli Kaka every verse comes with the Sanskrit, a simple meaning and what it asks of you, in English and Hindi. <a href="/gita">Start with the Gita</a>.</p>

<h2>3. Puja: giving the worry a daily shape</h2>
<p>Whatever one believes about its effect, a puja does something practical: it gives you a clean space, a fixed time, a quiet mind for twenty minutes, and the feeling of having done something. People often notice they sleep better and speak more gently at home afterwards.</p>
<p>The pujas people usually choose for common worries:</p>
<ul>
<li><b>Money and a good start to a new season:</b> <a href="/puja/lakshmi">Lakshmi Puja</a>.</li>
<li><b>New beginnings, a new job, a new house:</b> <a href="/puja/ganesh">Ganesh Puja</a> and <a href="/puja/griha-pravesh">Griha Pravesh</a>.</li>
<li><b>Fear and low courage:</b> <a href="/puja/hanuman">Hanuman Puja</a>.</li>
<li><b>A heavy Saturn period:</b> <a href="/puja/shani">Shani Puja</a>, done on a Saturday with simple offerings.</li>
<li><b>Study and exams:</b> <a href="/puja/saraswati">Saraswati Puja</a>.</li>
<li><b>Strength and protection:</b> <a href="/puja/durga">Durga Puja</a>.</li>
<li><b>Peace at home:</b> <a href="/puja/satyanarayan">Satyanarayan Puja</a>.</li>
</ul>
<p>Each guide has the full samagri list with a picture of every item and the steps in order, in English and Hindi. <a href="/puja">See all puja guides</a>.</p>

<h2>A simple 7 day plan</h2>
<ol>
<li><b>Day 1:</b> Make your free kundli and note your current dasha and your Moon sign.</li>
<li><b>Day 2:</b> Read Gita 2.47 and write down one effort you will make this week, however small.</li>
<li><b>Day 3:</b> Fix one thing in your routine: a sleep time, a walk, or a screen-free hour.</li>
<li><b>Day 4:</b> Pick the puja that matches your worry and collect the samagri, ticking items off as you go.</li>
<li><b>Day 5:</b> Check the panchang and choose a calm hour that avoids Rahu Kaal.</li>
<li><b>Day 6:</b> Do the puja with your family if you can. Keep it simple and sincere.</li>
<li><b>Day 7:</b> Read Gita 2.14, then sit quietly for five minutes and write what has changed, even a little.</li>
</ol>

<h2>An honest note</h2>
<p>A kundli shows tendencies and timing, not a fixed fate. It does not replace effort, a doctor, a counsellor or a frank talk with your family. If you feel low for weeks, or cannot cope, please talk to someone you trust or a professional. Use astrology, the Gita and puja as supports for a steadier mind and clearer decisions, alongside real action and not in place of it.</p>
<p>You are not behind. You are in a period, and periods change.</p>
`,
  },
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
POSTS.unshift(...MORE_POSTS);
const BLOG_IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "img", "blog");
const coverFor = (slug) => {
  for (const ext of ["webp", "jpg", "png"]) if (fs.existsSync(path.join(BLOG_IMG, `${slug}.${ext}`))) return `/img/blog/${slug}.${ext}`;
  return fs.existsSync(path.join(BLOG_IMG, `${slug}.svg`)) ? `/img/blog/${slug}.svg` : "/img/og-image.jpg";
};
POSTS.forEach((p) => { if (!p.img || p.img === "/img/og-image.jpg") p.img = coverFor(p.slug); });
// Tags: used for the keywords, the article tags and the related posts
const TAGS = {
  "sade-sati-what-it-really-means": ["Sade Sati", "Saturn", "Shani", "Vedic astrology", "Moon sign"],
  "manglik-dosh-myth-and-meaning": ["Manglik dosh", "Mars", "Marriage", "Kundli Milan", "Vedic astrology"],
  "kundli-milan-36-gunas-explained": ["Kundli Milan", "Ashtakoot", "36 gunas", "Marriage", "Nadi dosh"],
  "moon-sign-vs-sun-sign-which-is-your-rashi": ["Rashi", "Moon sign", "Sun sign", "Rashifal", "Vedic astrology"],
  "when-life-feels-stuck-kundli-gita-puja": ["Kundli", "Bhagavad Gita", "Puja", "Career", "Marriage", "Mental peace"],
  "lakshmi-puja-at-home-on-diwali-step-by-step": ["Lakshmi Puja", "Diwali", "Puja vidhi", "Samagri list", "Puja at home"],
  "dhanteras-what-to-buy-and-how-to-do-the-puja": ["Dhanteras", "Diwali", "Lakshmi", "Dhanvantari", "Puja at home"],
  "bhai-dooj-tika-puja-vidhi-and-story": ["Bhai Dooj", "Diwali", "Tilak", "Yama Dwitiya", "Puja vidhi"],
  "ganesh-puja-at-home-before-every-new-beginning": ["Ganesh Puja", "Puja vidhi", "Samagri list", "Puja at home", "Ganesh"],
  "gita-for-anxiety-and-overthinking": ["Bhagavad Gita", "Anxiety", "Overthinking", "Gita verses", "Mental peace"],
  "career-stuck-what-your-kundli-can-show": ["Kundli", "Career", "Dasha", "Saturn", "Jupiter"],
  "marriage-delay-kundli-and-practical-steps": ["Marriage", "Kundli", "Seventh house", "Kundli Milan", "Saturn"],
  "rahu-kaal-and-choghadiya-explained-simply": ["Rahu Kaal", "Choghadiya", "Panchang", "Muhurat", "Vedic astrology"],
  "how-to-read-your-kundli-a-beginners-guide": ["Kundli", "Lagna", "Dasha", "Nakshatra", "Vedic astrology"],
  "money-not-staying-kundli-and-gita": ["Money", "Kundli", "Bhagavad Gita", "Saturn", "Jupiter"],
  "family-problems-astrology-and-gita": ["Family", "Kundli", "Bhagavad Gita", "Mental peace", "Moon sign"],
  "relationship-problems-kundli-and-practical-steps": ["Relationship", "Love", "Kundli", "Kundli Milan", "Venus"],
  "how-kundli-kaka-works": ["Kundli Kaka", "AI astrology", "Pricing", "Trust", "Refunds"],
  "three-card-tarot-how-to-read-past-present-next": ["Tarot", "Three card spread", "Love", "Career", "Money"],
};
POSTS.forEach((p) => { p.tags = TAGS[p.slug] || ["Vedic astrology", "Kundli"]; });
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
  <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96.png" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="preload" href="/fonts/yatra-one-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/hind-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/style.css" />
  <script type="module" src="/analytics.js"></script>
  <script type="module" src="/popups.js"></script>
  <script type="module" src="/shell.js"></script>
${extra}</head>`;

export const TOP = `<body class="blog-page">
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="/" aria-label="Kundli Kaka home"><img class="brand-mark" src="/img/logo-mark.png" alt="" width="36" height="36" /><span class="brand-text">Kundli <b>Kaka</b></span></a>
    <nav class="nav-links" aria-label="Main">
      <a href="/kundli">Free kundli</a><a href="/rashifal">Daily horoscope</a><a href="/guides">Ask an astrologer</a><a href="/store">Puja store</a>
      <div class="nav-dropdown"><button type="button" class="nav-btn" aria-haspopup="menu">More</button>
        <ul class="nav-menu" role="menu"><li><a href="/panchang" role="menuitem">Today's panchang</a></li><li><a href="/match" role="menuitem">Kundli Milan</a></li><li><a href="/tarot" role="menuitem">Tarot</a></li><li><a href="/gita" role="menuitem">Bhagavad Gita</a></li><li><a href="/puja" role="menuitem">Puja guides</a></li><li><a href="/my-reports" role="menuitem">My reports</a></li><li><a href="/blog" role="menuitem">Blog</a></li></ul>
      </div>
    </nav>
    <div class="nav-end">
      <button type="button" class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="navDrawer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
  </div>
  <div class="nav-drawer" id="navDrawer" hidden>
    <nav class="drawer-nav" aria-label="Navigation">
      <div class="drawer-section" id="drawerAcct"></div>
      <div class="drawer-section"><a href="/kundli">Free kundli</a><a href="/rashifal">Daily horoscope</a><a href="/guides">Ask an astrologer</a><a href="/store">Puja store</a></div>
      <div class="drawer-section"><a href="/panchang">Today's panchang</a><a href="/match">Kundli Milan</a><a href="/tarot">Tarot</a><a href="/gita">Bhagavad Gita</a><a href="/puja">Puja guides</a><a href="/my-reports">My reports</a><a href="/blog">Blog</a></div>
    </nav>
  </div>
</header>`;

export const FOOT = `<footer class="post-foot"><div class="wrap"><p>Kundli Kaka: your kundli, your puja, your vibe.</p><p class="post-social"><a href="https://www.instagram.com/kundlikaka/" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.facebook.com/people/Kundli-Kaka/61595737817862/" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.youtube.com/@kundlikaka" target="_blank" rel="noopener">YouTube</a></p></div></footer>
</body></html>`;

const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function renderBlogIndex(origin) {
  const url = origin + "/blog";
  const cards = POSTS.map((p) => `<a class="post-card" href="/blog/${p.slug}"><img src="${p.img}" width="1200" height="630" alt="${esc(p.title)}" loading="lazy" decoding="async" /><span class="post-meta">${fmt(p.date)} · ${p.read} min read</span><h2>${esc(p.title)}</h2><p>${esc(p.desc)}</p></a>`).join("\n");
  const ld = `  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Kundli Kaka Blog", url, description: "Plain-language articles on Sade Sati, Manglik Dosh, Kundli Milan, Moon sign and more.", isPartOf: { "@type": "WebSite", name: "Kundli Kaka", url: origin + "/" }, hasPart: POSTS.map((x) => ({ "@type": "Article", headline: x.title, url: `${origin}/blog/${x.slug}` })) })}</script>\n`;
  return HEAD("Kundli Kaka Blog: Kundli, Rashifal and Vedic Astrology Explained", "Plain-language articles on Sade Sati, Manglik Dosh, Kundli Milan, Moon sign and more from Kundli Kaka.", url, ld) +
    TOP + `<main class="wrap post-wrap"><h1>Astrology, explained simply</h1><p class="post-lead">Plain answers to the questions people actually ask about their kundli.</p><div class="post-cards">${cards}</div></main>` + FOOT;
}

export function renderPost(p, origin) {
  const url = `${origin}/blog/${p.slug}`;
  const words = p.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const ld = `  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.desc, inLanguage: "en",
    datePublished: p.date, dateModified: p.date, mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [origin + p.img], keywords: p.tags.join(", "), articleSection: p.tags[0], wordCount: words,
    author: { "@type": "Organization", name: "Kundli Kaka", url: origin + "/" },
    publisher: { "@type": "Organization", name: "Kundli Kaka", logo: { "@type": "ImageObject", url: origin + "/icons/icon-512.png" } },
  })}</script>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Kundli Kaka", item: origin + "/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: origin + "/blog" },
    { "@type": "ListItem", position: 3, name: p.title, item: url },
  ] })}</script>
  <meta name="keywords" content="${esc(p.tags.join(", "))}" />
  <meta property="article:published_time" content="${p.date}" />
  <meta property="article:modified_time" content="${p.date}" />
  <meta property="article:section" content="${esc(p.tags[0])}" />
${p.tags.map((t) => `  <meta property="article:tag" content="${esc(t)}" />`).join("\n")}
  <meta property="og:image:alt" content="${esc(p.title)}" />
`;
  const related = POSTS.filter((x) => x.slug !== p.slug).map((x) => ({ x, n: x.tags.filter((t) => p.tags.includes(t)).length })).sort((m, n) => n.n - m.n).slice(0, 4);
  const more = related.map(({ x }) => `<li><a href="/blog/${x.slug}">${esc(x.title)}</a></li>`).join("");
  return HEAD(`${p.title} | Kundli Kaka`, p.desc, url, ld, origin + p.img) + TOP +
    `<main class="wrap post-wrap"><nav class="pj-crumb" aria-label="Breadcrumb"><a href="/">Kundli Kaka</a> / <a href="/blog">Blog</a></nav><article class="post"><p class="post-meta"><time datetime="${p.date}">${fmt(p.date)}</time> · ${p.read} min read</p><h1>${esc(p.title)}</h1><img class="post-cover" src="${p.img}" width="1200" height="630" alt="${esc(p.title)}" fetchpriority="high" decoding="async" /><p class="post-lead">${esc(p.lead)}</p>${p.body}
<p class="post-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</p>
<aside class="post-cta"><h2>See your own chart</h2><p>Make your free kundli in two minutes and read your Moon sign, dasha and more, worked out from the real sky.</p><a class="btn btn-primary" href="/kundli">Make my free kundli</a></aside>
<section class="post-more"><h2>Keep reading</h2><ul>${more}</ul></section></article></main>` + FOOT;
}
