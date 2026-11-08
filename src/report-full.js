// The full ₹99 report. The chart engine supplies every fact (report-facts.js); the AI writes the explanations.
// Four writing steps run side by side: the short summary cards, the life periods, the 12 months, and the windows,
// doshas and remedies. A step whose text breaks a rule (a banned word or an invented year) is written again once,
// then replaced by a plain fixed sentence, so the report is always complete and never contains made-up dates.

import { generateReport, generateJson } from "./report.js";

// Swappable for tests, so the assembly can be checked without calling the AI.
export const ai = { generateReport, generateJson };
import { buildFacts, proseOk, luckyKit } from "./report-facts.js";
import { languageRule, SHARED_RULES } from "./prompt.js";
import { PLANET_NAMES, SIGNS } from "./astro-data.js";

const T = {
  en: {
    snap: "About you", planets: "For the curious: your chart details", now: "Where you are in life right now", periods: "Your life chapters", months: "Your next 12 months, month by month",
    career: "Work and career: your best periods", money: "Money: your best periods", love: "Love and marriage: your best periods",
    doshas: "Things people often worry about", remedies: "Simple things that help, do and don't", kit: "Your lucky day, colour and number",
    lagna: "Rising sign (how others see you)", moon: "Moon sign (your mind and feelings)", nak: "Birth star", sun: "Sun sign (your core self)", rule: "Method", rulev: "Traditional Indian (Lahiri) calculation",
    planet: "Planet", sign: "Sign", house: "House", strength: "Strength", from: "From", to: "To", period: "Period",
    good: "Good", steady: "Steady", careful: "Careful", present: "Present", mild: "Mild (from Moon only)", absent: "Not present", active: "Active", inactive: "Not active",
    mangal: "Mangal Dosha (Mars effect on marriage)", kaal: "Kaal Sarp Dosha", sade: "Sade Sati (Saturn's 7.5-year test)", day: "Lucky day", colour: "Lucky colour", number: "Lucky number", mantra: "Simple mantra", gift: "Daily or weekly giving",
    exalted: "Exalted", debilitated: "Weak (debilitated)", own: "Strong (own sign)", retro: "retrograde", unknownTime: "Your birth time is not known, so house-based timing is left out of this report.",
    noWindow: "No clear window was found in the next few years. Use the month-by-month guide instead.", now_h: "Current period", dos: "Do", donts: "Don't",
  },
  hi: {
    snap: "आपका जन्म सार", planets: "आपके ग्रह", now: "अभी का समय", periods: "जीवन के दशा-काल", months: "अगले 12 महीने",
    career: "करियर: अनुकूल समय", money: "पैसा: अनुकूल समय", love: "प्रेम और विवाह: अनुकूल समय",
    doshas: "दोष और साढ़ेसाती", remedies: "सरल उपाय, क्या करें और क्या न करें", kit: "आपका शुभ सामान",
    lagna: "लग्न", moon: "चंद्र राशि", nak: "नक्षत्र", sun: "सूर्य राशि", rule: "गणना", rulev: "लाहिरी अयनांश, पूर्ण-राशि भाव",
    planet: "ग्रह", sign: "राशि", house: "भाव", strength: "बल", from: "से", to: "तक", period: "दशा",
    good: "अच्छा", steady: "सामान्य", careful: "सावधानी", present: "है", mild: "हल्का (केवल चंद्र से)", absent: "नहीं है", active: "चल रही है", inactive: "नहीं चल रही",
    mangal: "मंगल दोष", kaal: "काल सर्प दोष", sade: "साढ़ेसाती", day: "शुभ दिन", colour: "शुभ रंग", number: "शुभ अंक", mantra: "सरल मंत्र", gift: "दान",
    exalted: "उच्च", debilitated: "कमज़ोर (नीच)", own: "मज़बूत (स्वराशि)", retro: "वक्री", unknownTime: "आपका जन्म समय पता नहीं है, इसलिए भाव-आधारित समय इस रिपोर्ट में नहीं है।",
    noWindow: "अगले कुछ सालों में कोई साफ़ समय नहीं मिला। महीने-दर-महीने गाइड देखें।", now_h: "वर्तमान दशा", dos: "करें", donts: "न करें",
  },
};
T.hn = {
  ...T.en, snap: "Aapka birth snapshot", planets: "Aapke graha", now: "Abhi ka samay", periods: "Life ke dasha-kaal", months: "Agle 12 mahine",
  career: "Career: anukool samay", money: "Paisa: anukool samay", love: "Love aur shaadi: anukool samay", doshas: "Dosh aur Sade Sati",
  remedies: "Saral upay, kya karein aur kya nahi", kit: "Aapka lucky kit", good: "Accha", steady: "Normal", careful: "Savdhaan",
  dos: "Karein", donts: "Na karein", noWindow: "Agle kuch saalon mein koi saaf window nahi mili. Mahine-dar-mahine guide dekho.",
};
const tt = (lang) => T[lang] || T.en;

const PLAN = (lang, k) => (lang === "hi" ? PLANET_NAMES[k]?.hi : k) || k;
const SIGN = (lang, en) => (lang === "hi" ? SIGNS.find((s) => s.en === en)?.hi : en) || en;

const prompt = (language, what) => `You are "Kundli Kaka Astrologer", writing one part of a paid personal kundli report for an Indian reader.

LANGUAGE AND TONE
- ${languageRule(language)}
- The reader is an ordinary person who knows NOTHING about astrology. Write only about them and their life: work, money, family, love, mood, habits.
- Lead with what it means in everyday life ("a good time to ask for a raise"), and only then, if needed, the astrology word in brackets. Never leave a term like mahadasha, antardasha, house, lagna, transit or dosha unexplained; prefer plain words such as "life chapter", "this phase".
- Short sentences, simple everyday words, warm and specific, like a kind elder in the family. Talk to the person directly (you), using their name now and then.
- Be concrete: what to focus on, what to avoid, what a good month is good for. No vague filler.

${SHARED_RULES}
8. Use only the facts JSON. Never mention a year, month, planet position or dosha result that is not in it. Periods are "favourable periods" and "tendencies", never promises.

YOUR PART: ${what}
Return only valid JSON in exactly the shape described.`;

async function step(system, facts, shape, allowedYears) {
  const user = `Facts (JSON):\n${JSON.stringify(facts)}\n\nJSON shape to return:\n${shape}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await ai.generateJson({ system, user, maxOutputTokens: 4096 });
      if (out && typeof out === "object" && proseOk(out, allowedYears)) return out;
    } catch (e) {
      if (e?.code === "AI_NOT_CONFIGURED" || e?.status === 429 || e?.status === 401 || e?.status === 403) throw e;
    }
  }
  return null; // twice failed: the caller uses fixed sentences
}

const FIXED = {
  month: { good: "A supportive month. Make good use of it for the things that matter to you.", steady: "A steady month. Keep to your routine and finish what you started.", careful: "A month for patience. Avoid rushing big decisions and keep your plans simple." },
  period: "This is a period of its own lessons and opportunities. Use it with patience and steady effort.",
  window: "A period when the planets that matter for this area are active. Good for taking sensible steps, with patience.",
  dosha: "This is what the chart shows. It is a tendency to be aware of, not a verdict.",
  remedy: "Keep a regular routine, speak kindly, give a little to those in need, and say your mantra calmly on your lucky day.",
};

export async function generateFullReport({ name, topic, language, tradition = "vedic", chart, timeUnknown = false }) {
  const base = ai.generateReport({ name, topic, language, tradition, chart, timeUnknown });
  if (tradition === "western" || chart.tradition === "western") return base; // the full report is for Vedic charts

  const facts = buildFacts(chart, { timeUnknown });
  const L = language === "hn" || language === "hi" ? language : "en";
  const t = tt(L);
  const { allowedYears } = facts;
  const nm = typeof name === "string" ? name : "";

  const core = { snapshot: facts.snapshot, planets: facts.planets, today: facts.today, timeKnown: facts.timeKnown };
  const periodsStep = step(
    prompt(language, "the current life chapter (the running dasha period) and what each coming chapter tends to bring, in plain everyday terms."),
    { ...core, currentPeriod: facts.currentPeriod, mahadashas: facts.mahadashas.map(({ lord, startLabel, endLabel }) => ({ lord, startLabel, endLabel })), nextSubPeriods: facts.currentSubs },
    `{"now":"about 150 words on the current mahadasha and antardasha, what area of life it highlights and how to use it","periods":[{"lord":"<each mahadasha lord, same order as given>","text":"about 50 words"}]}`,
    allowedYears,
  );
  const monthsStep = step(
    prompt(language, "a month-by-month guide for the next 12 months. Each month has a score and tag already decided by the chart engine; explain it, do not change it."),
    { ...core, currentPeriod: facts.currentPeriod, months: facts.months },
    `{"months":[{"key":"<month key as given>","text":"about 55 words: the theme of the month, one thing to do, one thing to be careful about"}]}`,
    allowedYears,
  );
  const windowsStep = facts.timeKnown ? step(
    prompt(language, "the favourable periods for career, money and love, the dosha explanations, and simple remedies."),
    { ...core, windows: facts.windows, doshas: facts.doshas, luckyKit: luckyKit(chart), currentPeriod: facts.currentPeriod },
    `{"windows":{"career":["about 60 words per window, same order as given"],"money":["..."],"love":["..."]},"doshas":{"mangal":"about 70 words, calm, says what it does and does not mean","kaalSarp":"about 70 words","sadeSati":"about 70 words"},"remedies":"about 120 words","dos":["5 short habits"],"donts":["5 short habits"]}`,
    allowedYears,
  ) : Promise.resolve(null);

  const [cards, periods, months, win] = await Promise.all([base, periodsStep.catch(() => null), monthsStep.catch(() => null), windowsStep.catch(() => null)]);
  if (!cards || cards.markdown) return cards;

  const pm = Object.fromEntries((periods?.periods || []).map((x) => [x?.lord, x?.text]));
  const mm = Object.fromEntries((months?.months || []).map((x) => [x?.key, x?.text]));
  const sn = facts.snapshot;
  const tag = (x) => t[x];

  const sections = [];
  sections.push({ id: "snap", title: t.snap, blocks: [{ type: "table", head: [], rows: [
    ...(facts.timeKnown ? [[t.lagna, SIGN(L, sn.lagna)]] : []),
    [t.moon, SIGN(L, sn.moonSign)], [t.nak, `${sn.nakshatra}, pada ${sn.pada}`], [t.sun, SIGN(L, sn.sunSign)], [t.rule, t.rulev],
  ] }] });
  sections[0].blocks[0].head = [" ", " "];
  const planetsSection = { id: "planets", title: t.planets, blocks: [{ type: "table", head: [t.planet, t.sign, t.house, t.strength], rows: facts.planets.map((p) => [
    PLAN(L, p.planet), SIGN(L, p.sign), p.house ? String(p.house) : "-",
    [p.dignity === "exalted" ? t.exalted : p.dignity === "debilitated" ? t.debilitated : p.dignity === "own sign" ? t.own : "", p.retrograde && p.planet !== "Rahu" && p.planet !== "Ketu" ? t.retro : ""].filter(Boolean).join(", ") || "-",
  ]) }] };

  const cp = facts.currentPeriod;
  const nowBlocks = [];
  if (cp) nowBlocks.push({ type: "p", text: `${PLAN(L, cp.mahadasha)} / ${PLAN(L, cp.antardasha || "")}: ${cp.antardashaStarts || ""} - ${cp.antardashaEnds || ""}` });
  nowBlocks.push({ type: "p", text: periods?.now || FIXED.period });
  sections.push({ id: "now", title: t.now, blocks: nowBlocks });

  sections.push({ id: "periods", title: t.periods, blocks: [
    { type: "table", head: [t.period, t.from, t.to], rows: facts.mahadashas.map((m) => [PLAN(L, m.lord) + (m.current ? " *" : ""), m.startLabel, m.endLabel]) },
    { type: "rows", rows: facts.mahadashas.map((m) => ({ h: `${PLAN(L, m.lord)}  ${m.startLabel} - ${m.endLabel}`, text: pm[m.lord] || FIXED.period })) },
  ] });

  sections.push({ id: "months", title: t.months, blocks: [{ type: "rows", rows: facts.months.map((m) => ({
    h: m.label, tag: m.tag, score: m.score, text: `${tag(m.tag)}. ${mm[m.key] || FIXED.month[m.tag]}`,
  })) }] });

  if (facts.timeKnown) {
    const win_ = (topic, title) => {
      const ws = facts.windows[topic] || [];
      const texts = win?.windows?.[topic] || [];
      sections.push({ id: topic, title, blocks: ws.length
        ? [{ type: "rows", rows: ws.map((w, i) => ({ h: w.range, text: String(texts[i] || FIXED.window) })) }]
        : [{ type: "p", text: t.noWindow }] });
    };
    win_("career", t.career); win_("money", t.money); win_("love", t.love);
  } else {
    sections.push({ id: "windows", title: t.career, blocks: [{ type: "p", text: t.unknownTime }] });
  }

  const d = facts.doshas;
  const dtext = (k) => String(win?.doshas?.[k] || FIXED.dosha);
  const mangalWord = d.mangal.status === "present" ? t.present : d.mangal.status === "mild" ? t.mild : t.absent;
  sections.push({ id: "doshas", title: t.doshas, blocks: [{ type: "rows", rows: [
    { h: `${t.mangal}: ${mangalWord}`, text: dtext("mangal") },
    { h: `${t.kaal}: ${d.kaalSarp.status === "present" ? t.present : t.absent}`, text: dtext("kaalSarp") },
    { h: `${t.sade}: ${d.sadeSati.status === "active" ? t.active : d.sadeSati.status.startsWith("small") ? t.mild : t.inactive}`, text: dtext("sadeSati") },
  ] }] });

  const kit = luckyKit(chart);
  const dos = Array.isArray(win?.dos) ? win.dos : [], donts = Array.isArray(win?.donts) ? win.donts : [];
  const remBlocks = [{ type: "p", text: String(win?.remedies || FIXED.remedy) }];
  if (dos.length) remBlocks.push({ type: "list", items: [t.dos + ":", ...dos.slice(0, 5).map(String)] });
  if (donts.length) remBlocks.push({ type: "list", items: [t.donts + ":", ...donts.slice(0, 5).map(String)] });
  sections.push({ id: "remedies", title: t.remedies, blocks: remBlocks });
  sections.push({ id: "kit", title: t.kit, blocks: [{ type: "table", head: [], rows: [
    [t.day, L === "hi" ? kit.dayHi : kit.day], [t.colour, L === "hi" ? kit.colourHi : kit.colour], [t.number, kit.number], [t.mantra, kit.mantra], [t.gift, kit.gift],
  ] }] });

  sections.push(planetsSection);
  return { ...cards, sections };
}
