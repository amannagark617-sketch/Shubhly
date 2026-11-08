// The paid Kundli Milan report (the couple's report). The 36-point match and the shared good periods come from the
// chart engine; the AI only writes the advice around them. If the AI text breaks a rule, fixed sentences are used.

import { generateJson } from "./report.js";
import { buildMatch } from "./match.js";
import { buildFacts, proseOk } from "./report-facts.js";
import { languageRule, SHARED_RULES } from "./prompt.js";

export const ai = { generateJson };

const DAY = 86400000;
const L3 = (lang) => (lang === "hi" || lang === "hn" ? lang : "en");

const FIXED = {
  en: {
    headline: "A match to build on, with care and honest talk",
    glance: "The score shows tendencies, not a verdict. How you speak, listen and share the load matters far more than any number.",
    need: "Feels most at ease when there is kindness, clear talk and a little time of their own.",
    talk: ["Speak about small worries early, before they grow.", "Listen fully before you answer.", "Pick a calm time for serious topics, not the middle of a busy day.", "Say thank you for the little things every week."],
    family: ["Decide together how you will handle money and write it down.", "Talk about family expectations before they become arguments.", "Keep one fixed time each week just for the two of you."],
    first: "The first year is about learning each other's habits. Keep routines simple, share the chores fairly and celebrate small wins together.",
    closing: "Two people who try together can make almost any match work.",
    pairNote: "Both of you have a good period at the same time. These are the best months to plan an engagement or wedding.",
    noPair: "Your good periods do not line up closely. Use either person's good periods below, and keep plans flexible.",
    noTime: "Birth time is not known for one of you, so marriage timing is left out. The match score above does not need it.",
  },
  hi: {
    headline: "ऐसा रिश्ता जिसे प्यार और खुली बातचीत से मज़बूत बनाया जा सकता है",
    glance: "यह अंक एक झुकाव दिखाता है, फ़ैसला नहीं। आप कैसे बोलते, सुनते और ज़िम्मेदारी बाँटते हैं, यह किसी भी अंक से ज़्यादा मायने रखता है।",
    need: "जब दयालुता, साफ़ बातचीत और थोड़ा अपना समय मिलता है, तब सबसे सहज महसूस करते हैं।",
    talk: ["छोटी चिंताएँ बड़ी होने से पहले ही बता दें।", "जवाब देने से पहले पूरी बात सुनें।", "गंभीर बातों के लिए शांत समय चुनें।", "हर हफ़्ते छोटी बातों के लिए धन्यवाद कहें।"],
    family: ["पैसों को कैसे सँभालेंगे, यह साथ बैठकर तय करें और लिख लें।", "परिवार की उम्मीदों पर पहले ही खुलकर बात करें।", "हफ़्ते में एक समय सिर्फ़ आप दोनों के लिए रखें।"],
    first: "पहला साल एक-दूसरे की आदतें समझने का है। दिनचर्या सरल रखें, काम बराबर बाँटें और छोटी जीत साथ मनाएँ।",
    closing: "जो दो लोग साथ कोशिश करते हैं, वे लगभग हर रिश्ते को सुंदर बना लेते हैं।",
    pairNote: "इन महीनों में आप दोनों का अच्छा समय एक साथ चल रहा है। सगाई या शादी की योजना के लिए ये सबसे अच्छे हैं।",
    noPair: "आप दोनों के अच्छे समय आपस में ठीक से नहीं मिलते। नीचे किसी एक के अच्छे समय देखें और योजना लचीली रखें।",
    noTime: "आप में से किसी एक का जन्म समय पता नहीं, इसलिए विवाह का समय नहीं दिया गया। ऊपर का अंक इसके बिना भी सही है।",
  },
};
FIXED.hn = {
  ...FIXED.en,
  headline: "Aisa rishta jise pyaar aur khuli baat se mazboot banaya ja sakta hai",
  glance: "Yeh score ek jhukaav dikhata hai, faisla nahi. Aap kaise bolte, sunte aur zimmedari baantte ho, woh kisi bhi number se zyada matter karta hai.",
  talk: ["Chhoti chintayein bade hone se pehle bata do.", "Jawab dene se pehle poori baat suno.", "Serious baat ke liye shaant time chuno.", "Har hafte chhoti baaton ke liye thank you bolo."],
  family: ["Paison ko kaise sambhaloge, saath baithkar tay karo aur likh lo.", "Family ki umeedon par pehle hi khul kar baat karo.", "Hafte mein ek time sirf aap dono ke liye rakho."],
  first: "Pehla saal ek-doosre ki aadatein samajhne ka hai. Routine simple rakho, kaam barabar baanto aur chhoti jeet saath manao.",
  closing: "Jo do log saath koshish karte hain, woh lagbhag har rishta khoobsurat bana lete hain.",
  pairNote: "In mahinon mein dono ka accha time saath chal raha hai. Sagaai ya shaadi plan karne ke liye yeh best hain.",
  noPair: "Dono ke accha time aapas mein theek se nahi milte. Neeche kisi ek ke accha time dekho aur plan flexible rakho.",
  noTime: "Aap mein se kisi ek ka birth time pata nahi, isliye shaadi ka time nahi diya. Upar ka score iske bina bhi sahi hai.",
};

// A simple, calm fix for each weak point of the match.
const REMEDY = {
  en: {
    varna: "Respect each other's way of seeing things. Take turns to decide on everyday matters.",
    vashya: "Avoid one person always leading. Make big decisions together, even if it takes longer.",
    tara: "Mark good days together: start new things on days you both feel fresh, and rest on heavy days.",
    yoni: "Spend relaxed time together without screens. Small touches and kind words build closeness.",
    maitri: "Explain yourselves more than you think you need to. Never assume the other person understood.",
    gana: "Your natures differ. Agree on a calm word or pause to use when a talk gets hot.",
    bhakoot: "Plan money and family matters together, and keep a weekly talk about them. A shared Monday prayer or temple visit can be a calm habit for both.",
    nadi: "Look after health together: regular check-ups, good sleep and a shared walk. A doctor's advice matters more than any ritual.",
  },
  hi: {
    varna: "एक-दूसरे के सोचने के ढंग का सम्मान करें। रोज़मर्रा के फ़ैसले बारी-बारी से लें।",
    vashya: "हमेशा एक ही व्यक्ति आगे न रहे। बड़े फ़ैसले साथ लें, चाहे समय लगे।",
    tara: "अच्छे दिन साथ चुनें: नई शुरुआत उन दिनों करें जब दोनों तरोताज़ा हों।",
    yoni: "फ़ोन के बिना साथ आराम से समय बिताएँ। छोटे स्पर्श और मीठे बोल नज़दीकी बढ़ाते हैं।",
    maitri: "जितना सोचते हैं उससे ज़्यादा समझाएँ। मान न लें कि दूसरे ने समझ लिया।",
    gana: "स्वभाव अलग हैं। बहस गर्म होने पर रुकने का एक शांत शब्द तय कर लें।",
    bhakoot: "पैसे और परिवार की बातें साथ तय करें और हर हफ़्ते उन पर बात करें। सोमवार को साथ प्रार्थना या मंदिर जाना एक शांत आदत बन सकती है।",
    nadi: "सेहत का ध्यान साथ रखें: नियमित जाँच, अच्छी नींद और साथ टहलना। डॉक्टर की सलाह किसी भी उपाय से ज़्यादा ज़रूरी है।",
  },
};
REMEDY.hn = {
  varna: "Ek-doosre ke sochne ke dhang ka samman karo. Rozmarra ke faisle baari-baari se lo.",
  vashya: "Hamesha ek hi vyakti aage na rahe. Bade faisle saath lo, chahe time lage.",
  tara: "Accha din saath chuno: nayi shuruaat un dino karo jab dono fresh ho.",
  yoni: "Phone ke bina saath relax time bitao. Chhote touch aur meethe bol closeness badhate hain.",
  maitri: "Jitna sochte ho usse zyada samjhao. Maan mat lo ki doosre ne samajh liya.",
  gana: "Swabhaav alag hain. Behas garm hone par rukne ka ek shaant word tay kar lo.",
  bhakoot: "Paisa aur family ki baatein saath tay karo aur har hafte unpar baat karo. Somvaar ko saath prarthana ya mandir ek shaant aadat ban sakti hai.",
  nadi: "Sehat ka dhyan saath rakho: regular check-up, accha neend aur saath walk. Doctor ki salah kisi bhi upay se zyada zaroori hai.",
};

const monthYear = (ms, lang) => new Date(ms).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
const rangeLabel = (a, b, lang) => `${monthYear(a, lang)} - ${monthYear(b, lang)}`;

/** Months in which both people have a good period for marriage, plus each person's own periods. */
export function marriageTiming(chartA, chartB, { timeUnknown = [false, false], lang = "en", now } = {}) {
  if (timeUnknown.some(Boolean)) return { known: false, shared: [], a: [], b: [] };
  const fa = buildFacts(chartA, { now }), fb = buildFacts(chartB, { now });
  const wa = fa.windows.love || [], wb = fb.windows.love || [];
  const shared = [];
  for (const x of wa) for (const y of wb) {
    const s = Math.max(x.startMs, y.startMs), e = Math.min(x.endMs, y.endMs);
    if (e - s >= 45 * DAY) shared.push({ start: s, end: e });
  }
  shared.sort((p, q) => p.start - q.start);
  const lab = (w) => ({ range: rangeLabel(w.startMs, w.endMs, lang) });
  return { known: true, shared: shared.slice(0, 3).map((w) => ({ range: rangeLabel(w.start, w.end, lang) })), a: wa.map(lab), b: wb.map(lab), years: [...fa.allowedYears, ...fb.allowedYears] };
}

const cap = (v, n) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");
const list = (v, n, len) => (Array.isArray(v) ? v.map((x) => cap(x, len)).filter(Boolean).slice(0, n) : []);

/** Keeps only the fields and lengths the PDF and the page expect. */
export function cleanMatchReport(raw) {
  if (!raw || typeof raw !== "object") return null;
  const win = raw.timing && typeof raw.timing === "object" ? raw.timing : {};
  const rng = (a) => (Array.isArray(a) ? a.map((x) => cap(x?.range, 40)).filter(Boolean).slice(0, 4).map((range) => ({ range })) : []);
  return {
    headline: cap(raw.headline, 200), glance: cap(raw.glance, 500),
    needs: Array.isArray(raw.needs) ? raw.needs.slice(0, 2).map((n) => ({ name: cap(n?.name, 60), text: cap(n?.text, 500) })) : [],
    talk: list(raw.talk, 6, 260), family: list(raw.family, 5, 260), first: cap(raw.first, 700), closing: cap(raw.closing, 200),
    timing: { known: !!win.known, note: cap(win.note, 300), shared: rng(win.shared), a: rng(win.a), b: rng(win.b) },
    remedies: Array.isArray(raw.remedies) ? raw.remedies.slice(0, 8).map((x) => ({ name: cap(x?.name, 40), text: cap(x?.text, 400) })).filter((x) => x.text) : [],
  };
}

export async function generateMatchReport({ names = ["", ""], chartA, chartB, language = "en", timeUnknown = [false, false], now } = {}) {
  const L = L3(language);
  const r = buildMatch(chartA, chartB, { lang: L, timeUnknown });
  const F = FIXED[L];
  const n1 = names[0] || (L === "en" ? "Person 1" : "1"), n2 = names[1] || (L === "en" ? "Person 2" : "2");
  const timing = marriageTiming(chartA, chartB, { timeUnknown, lang: L, now });
  const weak = r.items.filter((i) => i.score / i.max < 0.5);

  // the AI writes the advice around facts it is given
  const facts = { people: [n1, n2], score: r.total, outOf: r.outOf, verdict: r.verdict, areas: r.areas.map(({ name, pct }) => ({ name, pct })), mangal: r.mangal, weakPoints: weak.map((w) => w.name), best: r.items.find((i) => i.key === r.best)?.name, each: r.people.map((p) => ({ strength: p.strength, grow: p.grow })) };
  const system = `You are "Kundli Kaka Astrologer", writing the advice part of a paid Kundli Milan (marriage match) report for two people in India.

LANGUAGE AND TONE
- ${languageRule(language)}
- The readers know nothing about astrology. Speak about their relationship in everyday life: talking, money, family, habits.
- Warm, calm, specific, like a kind elder. Never scary. Never predict separation or trouble. A low score means "things to work on together".

${SHARED_RULES}
8. Use only the facts JSON. Do not mention any year or date.

Return only valid JSON in exactly this shape:
{"headline":"one line, max 14 words","glance":"about 60 words on what this match is like","needs":[{"name":"<first person>","text":"about 45 words on what they need from the partner"},{"name":"<second person>","text":"about 45 words"}],"talk":["4 short tips for talking and settling disagreements"],"family":["3 short tips on money and family"],"first":"about 70 words on the first year together","closing":"one warm line"}`;
  let out = null;
  for (let attempt = 0; attempt < 2 && !out; attempt++) {
    try {
      const o = await ai.generateJson({ system, user: `Facts (JSON):\n${JSON.stringify(facts)}`, maxOutputTokens: 3000 });
      if (o && typeof o === "object" && proseOk(o, [])) out = o;
    } catch (e) {
      if (e?.code === "AI_NOT_CONFIGURED" || e?.status === 429 || e?.status === 401 || e?.status === 403) throw e;
    }
  }
  const pick = (v, d) => (typeof v === "string" && v.trim() ? v : d);
  const arr = (v, d) => (Array.isArray(v) && v.filter((x) => typeof x === "string" && x.trim()).length >= 2 ? v : d);

  return cleanMatchReport({
    headline: pick(out?.headline, F.headline), glance: pick(out?.glance, F.glance),
    needs: [0, 1].map((i) => ({ name: [n1, n2][i], text: pick(out?.needs?.[i]?.text, F.need) })),
    talk: arr(out?.talk, F.talk), family: arr(out?.family, F.family), first: pick(out?.first, F.first), closing: pick(out?.closing, F.closing),
    timing: { known: timing.known, note: !timing.known ? F.noTime : timing.shared.length ? F.pairNote : F.noPair, shared: timing.shared, a: timing.a, b: timing.b },
    remedies: weak.map((w) => ({ name: w.name, text: REMEDY[L][w.key] || "" })),
  });
}
