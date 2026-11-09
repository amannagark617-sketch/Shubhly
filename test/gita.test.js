import test from "node:test";
import assert from "node:assert/strict";
import { loadGita, chapterOf, GITA_PATHS, renderGitaIndex, renderChapter, buildKrishnaInstruction, krishnaReply } from "../src/gita.js";
import { sitemap } from "../src/pages.js";

const VERSES = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];

test("all 18 chapters are there with the right number of verses", () => {
  const g = loadGita();
  assert.equal(g.length, 18);
  g.forEach((c, i) => {
    assert.equal(c.n, i + 1);
    assert.equal(c.verses.length, VERSES[i], `chapter ${c.n}`);
    c.verses.forEach((v, j) => {
      assert.equal(v.n, j + 1);
      assert.ok(v.sa && v.en && v.hi, `${c.n}.${v.n} has Sanskrit, English and Hindi`);
    });
    assert.ok(c.en && c.hi && c.sum_en && c.sum_hi && c.life_en && c.life_hi);
  });
  assert.equal(g.reduce((n, c) => n + c.verses.length, 0), 701);
});

test("only real chapter numbers open a chapter", () => {
  assert.equal(chapterOf("2").n, 2);
  assert.equal(chapterOf("18").n, 18);
  for (const bad of ["0", "19", "02", "abc", "2.5", "-1", "", "2 ", "1e1"]) assert.equal(chapterOf(bad), null, bad);
});

test("the Gita pages are listed in the sitemap", () => {
  const xml = sitemap("https://kundlikaka.in", [], GITA_PATHS());
  assert.ok(xml.includes("https://kundlikaka.in/gita</loc>"));
  assert.ok(xml.includes("https://kundlikaka.in/gita/18</loc>"));
});

test("pages show the verses and escape text", () => {
  const html = renderChapter(chapterOf(2), "https://kundlikaka.in");
  assert.ok(html.includes('id="v47"'));
  assert.ok(html.includes('rel="canonical" href="https://kundlikaka.in/gita/2"'));
  assert.ok(html.includes("You have the right to work"));
  assert.ok(renderGitaIndex("https://kundlikaka.in").includes('href="/gita/18"'));
});

test("Krishna stays on the Gita, calm, honest and safe", () => {
  const t = buildKrishnaInstruction("en");
  assert.match(t, /Bhagavata Purana/);
  assert.match(t, /Never invent a verse/);
  assert.match(t, /AI voice inspired by the Gita/);
  assert.match(t, /Never predict the future/);
  assert.match(t, /14416/);
  assert.match(t, /Gita 2\.47|2\.47:/);
  assert.match(buildKrishnaInstruction("hi"), /देवनागरी/);
  assert.match(buildKrishnaInstruction("hn"), /Hinglish/);
  assert.match(buildKrishnaInstruction("en"), /simple, warm English/);
});

test("Krishna's reply is trimmed and an empty reply is an error", async () => {
  let seen;
  const r = await krishnaReply({ language: "en", turns: [{ role: "user", text: "I am worried" }] }, async (req) => { seen = req; return "  Peace, dear one.  "; });
  assert.equal(r, "Peace, dear one.");
  assert.equal(seen.contents[0].parts[0].text, "I am worried");
  assert.match(seen.systemInstruction, /Krishna/);
  await assert.rejects(krishnaReply({ language: "en", turns: [{ role: "user", text: "hi" }] }, async () => "  "));
});

import { pcmToWav, trimForSpeech, signReply, verifyReply, speakKrishna, MAX_SECONDS } from "../src/voice.js";

test("Krishna's voice: only signed replies, at most a minute, valid audio file", async () => {
  assert.ok(verifyReply("Peace, dear one.", signReply("Peace, dear one.")));
  assert.ok(!verifyReply("Something else", signReply("Peace, dear one.")));
  assert.ok(!verifyReply("Peace, dear one.", ""));
  const long = Array.from({ length: 300 }, (_, i) => `word${i}.`).join(" ");
  assert.ok(trimForSpeech(long).split(" ").length <= 120);
  assert.equal(trimForSpeech("Short and calm."), "Short and calm.");
  const wav = pcmToWav(Buffer.alloc(24000 * 2 * 120)); // two minutes in
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.length, 44 + 24000 * 2 * MAX_SECONDS);
  let prompt;
  const out = await speakKrishna("Be calm.", async (p) => { prompt = p; return Buffer.alloc(48000); });
  assert.match(prompt, /majestic and serene voice/);
  assert.equal(out.length, 44 + 48000);
});

// ---- spoken verses ----
import { verseClip, verseOf, promptFor } from "../src/gita-audio.js";
test("a verse clip is made once and reused", async () => {
  process.env.GITA_AUDIO_CACHE = (await import("node:fs")).mkdtempSync((await import("node:os")).tmpdir() + "/kkt-");
  let calls = 0;
  const speak = async () => { calls++; return Buffer.alloc(4800); };
  const a = await verseClip(9, 33, "sa", speak);
  const b = await verseClip(9, 33, "sa", speak);
  assert.equal(a.file, b.file);
  assert.equal(calls, 1);
  assert.equal(await verseClip(99, 1, "sa", speak), null);
  assert.equal(await verseClip(2, 47, "xx", speak), null);
  const { c, v } = verseOf(2, 47);
  assert.match(promptFor("sa", c, v), /Recite/);
  assert.match(promptFor("hi", c, v), /Hindi/);
});

test("every verse has a 'what Krishna meant' explanation in English and Hindi", () => {
  for (const c of loadGita()) for (const v of c.verses) {
    assert.ok(v.ex_en && v.ex_en.length > 40, `${c.n}.${v.n} English`);
    assert.match(v.ex_hi || "", /[ऀ-ॿ]/, `${c.n}.${v.n} Hindi`);
  }
});
test("a chapter page shows the explanation", () => {
  const html = renderChapter(chapterOf("2"), "https://x.test");
  assert.match(html, /What Krishna meant/);
  assert.match(html, /gv-ex-hi/);
});

import { renderPuja, renderPujaIndex, loadPujas, ORDER } from "../src/puja.js";
import { buildMyDay } from "../src/myday.js";

test("every puja guide has samagri, steps and both languages", () => {
  const all = loadPujas();
  for (const s of ORDER) {
    const p = all[s];
    assert.ok(p.samagri.length >= 14 && p.steps.length >= 10, s);
    assert.equal(p.before_en.length, p.before_hi.length);
    assert.equal(p.tips_en.length, p.tips_hi.length);
    assert.ok(renderPuja(p, "https://x.test").includes("Step by step"));
  }
  assert.ok(renderPujaIndex("https://x.test").includes("/puja/lakshmi"));
});

test("my day gives do, avoid, wear and times", () => {
  const birth = { year: 1995, month: 5, day: 12, hour: 9, minute: 30, lat: 28.6, lon: 77.2, tz: "Asia/Kolkata" };
  for (const lang of ["en", "hi"]) {
    const d = buildMyDay({ name: "Aman", birth, date: "2026-10-31", place: { lat: 28.6, lon: 77.2, tz: "Asia/Kolkata", label: "Delhi" }, lang });
    assert.ok(d.do.length >= 4 && d.avoid.length >= 4 && d.wear.colours.length >= 1 && d.best.length >= 1);
  }
});

// ---- search: own content, Hindi addresses, language alternates ----
import { renderPage as _rp, PAGES as _PAGES, loadShell as _ls, sitemap as _sm } from "../src/pages.js";
import { renderPuja as _rpj, pujaOf as _pof, ORDER as _ORD } from "../src/puja.js";
import { SEO_TEXT as _ST } from "../src/seo-text.js";

test("every main page has its own questions in English and Hindi", () => {
  for (const k of ["home", "kundli", "match", "rashifal", "panchang", "tarot"]) {
    for (const l of ["en", "hi"]) assert.ok(_ST[k][l].faq.length >= 4 && _ST[k][l].intro.length >= 2, `${k} ${l}`);
    assert.equal(_ST[k].en.faq.length, _ST[k].hi.faq.length, k);
  }
});

test("main pages render their own block, FAQ data and language alternates", () => {
  const shell = _ls(new URL("../public/index.html", import.meta.url).pathname);
  for (const k of ["kundli", "match", "rashifal", "panchang", "tarot"]) {
    const en = _rp(shell, _PAGES[k], { origin: "https://x.in" });
    assert.match(en, /class="seo-block"/);
    assert.match(en, /"@type":"FAQPage"/);
    assert.match(en, new RegExp(`hreflang="hi" href="https://x.in/hi${_PAGES[k].path}"`));
    const hi = _rp(shell, _PAGES[k], { origin: "https://x.in", lang: "hi" });
    assert.match(hi, /<html lang="hi">/);
    assert.match(hi, new RegExp(`rel="canonical" href="https://x.in/hi${_PAGES[k].path}"`));
  }
});

test("puja pages have a Hindi address with Hindi markup only", () => {
  for (const s of _ORD) {
    const p = _pof(s);
    const hi = _rpj(p, "https://x.in", "hi");
    assert.match(hi, /<html lang="hi">/);
    assert.match(hi, new RegExp(`rel="canonical" href="https://x.in/hi/puja/${s}"`));
    assert.doesNotMatch(hi, /class="l-en"/);
    assert.match(_rpj(p, "https://x.in", "en"), new RegExp(`hreflang="hi" href="https://x.in/hi/puja/${s}"`));
  }
});

test("sitemap lists the Hindi pages", () => {
  const x = _sm("https://x.in", [], []);
  for (const u of ["/hi", "/hi/kundli", "/hi/match", "/hi/tarot"]) assert.ok(x.includes(`https://x.in${u}</loc>`), u);
});

import { POSTS as _POSTS, renderPost as _rpost } from "../src/blog.js";
test("every blog post has tags, a good description and unique address", () => {
  const slugs = new Set();
  for (const p of _POSTS) {
    assert.ok(!slugs.has(p.slug), p.slug); slugs.add(p.slug);
    assert.ok(p.tags.length >= 3, p.slug);
    assert.ok(p.desc.length >= 80 && p.desc.length <= 175, `${p.slug} desc ${p.desc.length}`);
    assert.ok(p.title.length <= 75, `${p.slug} title ${p.title.length}`);
    const h = _rpost(p, "https://x.in");
    assert.match(h, /article:tag/);
    assert.match(h, /"@type":"BreadcrumbList"/);
    assert.match(h, new RegExp(`alt="${p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/&/g, "&amp;")}"`));
  }
  assert.ok(_POSTS.length >= 14);
});

test("inline scripts on puja pages are valid JavaScript", () => {
  const check = (html, what) => { const re = /<script>([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(html))) assert.doesNotThrow(() => new Function(m[1]), what); };
  check(_rpj(_pof("lakshmi"), "https://x.in", "en"), "puja en");
  check(_rpj(_pof("lakshmi"), "https://x.in", "hi"), "puja hi");
  import("../src/puja.js").then((m) => { check(m.renderPujaIndex("https://x.in", "en"), "index en"); check(m.renderPujaIndex("https://x.in", "hi"), "index hi"); });
});
