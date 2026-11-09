// What the free kundli and the free Milan result show. They give a clear first answer and a few real findings, and keep the
// details (dates, windows, fixes) for the paid reports. Every number here is worked out by the chart engine, nothing is invented.

const PICK = (lang) => (lang === "hi" ? "hi" : lang === "hn" ? "hn" : "en");
const W = {
  en: {
    lock: "In the full report",
    chapter: (when) => ["Your life chapter changes in " + when, "What the next chapter brings, and how to prepare, is in the full report."],
    months: (g, c) => [`Your next 12 months: ${g} good and ${c} careful`, "Which months, and what each one is good or bad for, is in the full report."],
    window: { career: (n) => [`${n} good window${n > 1 ? "s" : ""} for work and career`, "The exact months are in the full report."],
      money: (n) => [`${n} good window${n > 1 ? "s" : ""} for money`, "The exact months are in the full report."],
      love: (n) => [`${n} good window${n > 1 ? "s" : ""} for love and marriage`, "The exact months are in the full report."] },
    mangal: ["Mangal Dosha is in your chart", "What it means for you and the simple fixes are in the full report."],
    mangalMild: ["A mild Mangal Dosha is in your chart", "What it means for you and the simple fixes are in the full report."],
    kaal: ["Kaal Sarp Dosha is in your chart", "What it means for you and the simple fixes are in the full report."],
    care: (n) => [`${n} thing${n > 1 ? "s" : ""} in your chart need care`, "Which ones, and what to do about them, are in the full report."],
    watch: "What to avoid right now is in the full report.",
    mHook: (name) => `${name} needs care in your match. Why, and how to handle it, is in the couple's report.`,
    mMangal: "A Mars factor was found in the charts. What it means and the simple fixes are in the couple's report.",
    mLocked: "Why this score, in the couple's report.",
  },
  hi: {
    lock: "पूरी रिपोर्ट में",
    chapter: (when) => ["आपके जीवन का दौर " + when + " में बदलता है", "अगला दौर क्या लाएगा और तैयारी कैसे करें, यह पूरी रिपोर्ट में है।"],
    months: (g, c) => [`आपके अगले 12 महीने: ${g} अच्छे और ${c} सावधानी वाले`, "कौन-से महीने और हर महीना किसके लिए अच्छा या कठिन है, यह पूरी रिपोर्ट में है।"],
    window: { career: (n) => [`काम और करियर के लिए ${n} अच्छा समय`, "सही महीने पूरी रिपोर्ट में हैं।"],
      money: (n) => [`पैसे के लिए ${n} अच्छा समय`, "सही महीने पूरी रिपोर्ट में हैं।"],
      love: (n) => [`प्रेम और विवाह के लिए ${n} अच्छा समय`, "सही महीने पूरी रिपोर्ट में हैं।"] },
    mangal: ["आपकी कुंडली में मंगल दोष है", "इसका आपके लिए मतलब और सरल उपाय पूरी रिपोर्ट में हैं।"],
    mangalMild: ["आपकी कुंडली में हल्का मंगल दोष है", "इसका आपके लिए मतलब और सरल उपाय पूरी रिपोर्ट में हैं।"],
    kaal: ["आपकी कुंडली में काल सर्प दोष है", "इसका आपके लिए मतलब और सरल उपाय पूरी रिपोर्ट में हैं।"],
    care: (n) => [`आपकी कुंडली में ${n} बात ध्यान माँगती है`, "कौन-सी, और क्या करना है, यह पूरी रिपोर्ट में है।"],
    watch: "अभी किससे बचना है, यह पूरी रिपोर्ट में है।",
    mHook: (name) => `आपके मिलान में ${name} पर ध्यान चाहिए। क्यों और कैसे संभालें, यह कपल रिपोर्ट में है।`,
    mMangal: "कुंडलियों में मंगल का एक पहलू मिला है। इसका मतलब और सरल उपाय कपल रिपोर्ट में हैं।",
    mLocked: "यह अंक क्यों, कपल रिपोर्ट में।",
  },
  hn: {
    lock: "Poori report mein",
    chapter: (when) => ["Aapke jeevan ka daur " + when + " mein badalta hai", "Agla daur kya layega aur taiyari kaise karein, yeh poori report mein hai."],
    months: (g, c) => [`Aapke agle 12 mahine: ${g} achhe aur ${c} savdhaani wale`, "Kaun se mahine aur har mahina kis cheez ke liye achha ya mushkil hai, yeh poori report mein hai."],
    window: { career: (n) => [`Kaam aur career ke liye ${n} achha samay`, "Sahi mahine poori report mein hain."],
      money: (n) => [`Paise ke liye ${n} achha samay`, "Sahi mahine poori report mein hain."],
      love: (n) => [`Pyar aur shaadi ke liye ${n} achha samay`, "Sahi mahine poori report mein hain."] },
    mangal: ["Aapki kundli mein Mangal Dosh hai", "Iska aapke liye matlab aur saral upay poori report mein hain."],
    mangalMild: ["Aapki kundli mein halka Mangal Dosh hai", "Iska aapke liye matlab aur saral upay poori report mein hain."],
    kaal: ["Aapki kundli mein Kaal Sarp Dosh hai", "Iska aapke liye matlab aur saral upay poori report mein hain."],
    care: (n) => [`Aapki kundli mein ${n} baat dhyan maangti hai`, "Kaun si, aur kya karna hai, yeh poori report mein hai."],
    watch: "Abhi kis cheez se bachna hai, yeh poori report mein hai.",
    mHook: (name) => `Aapke milan mein ${name} par dhyan chahiye. Kyon aur kaise sambhalein, yeh couple report mein hai.`,
    mMangal: "Kundliyon mein Mangal ka ek pehlu mila hai. Iska matlab aur saral upay couple report mein hain.",
    mLocked: "Yeh score kyon, couple report mein.",
  },
};

/** The locked findings shown on the free page, from the engine's facts. */
export function lockedFindings(facts, { chart, lang = "en" } = {}) {
  const T = W[PICK(lang)];
  const out = [];
  const mdEnd = facts.currentPeriod?.mahadashaEnds;
  if (mdEnd) { const [title, text] = T.chapter(mdEnd); out.push({ key: "chapter", title, text }); }
  const g = facts.months.filter((m) => m.tag === "good").length, c = facts.months.filter((m) => m.tag === "careful").length;
  if (g + c) { const [title, text] = T.months(g, c); out.push({ key: "months", title, text }); }
  for (const k of ["love", "career", "money"]) {
    const n = facts.windows?.[k]?.length || 0;
    if (n) { const [title, text] = T.window[k](n); out.push({ key: k, title, text }); }
  }
  const d = facts.doshas;
  if (d?.mangal?.status === "present") out.push({ key: "mangal", title: T.mangal[0], text: T.mangal[1] });
  else if (d?.mangal?.status === "mild") out.push({ key: "mangal", title: T.mangalMild[0], text: T.mangalMild[1] });
  if (d?.kaalSarp?.status === "present") out.push({ key: "kaal", title: T.kaal[0], text: T.kaal[1] });
  return out;
}

/** The free kundli: the chart, the three signs, today's chapter and a few findings. No dates of later chapters, no windows, no fixes. */
const PROBLEM_KEY = { marriage: "love", job: "career", money: "money", family: "focus", love: "love", confused: "focus" };
export function teaseKundli(out, lang = "en", problem = "") {
  const T = W[PICK(lang)];
  const a = out.about;
  if (a) {
    const cares = (a.tested?.length || 0) + (a.mars ? 1 : 0) + (a.retro ? 1 : 0);
    const keep = { big3: a.big3, star: a.star };
    if (cares) { const [title, text] = T.care(cares); keep.caution = { title, text }; }
    // the one answer the visitor asked for stays free
    const k = PROBLEM_KEY[problem];
    if (k && a[k]) keep[k] = a[k];
    if (k && a.sub) keep.sub = { text: a.sub.text, bring: "", watch: "" };
    out.about = keep;
    out.aboutLocked = true;
  }
  const r = out.reading;
  if (r) {
    const now = (r.periods || []).find((p) => p.current);
    out.reading = {
      basis: r.basis, strengths: (r.strengths || []).slice(0, 2), growth: "", lucky: r.lucky,
      periods: now ? [{ lord: now.lord, from: now.from, to: now.to, current: true, bring: now.bring, watch: T.watch }] : [],
      jupiter: null,
    };
  }
  return out;
}

/** The free Milan result: the score, the verdict, which area is strongest and which needs care. The reasons stay in the couple's report. */
export function teaseMatch(r, lang = "en") {
  const T = W[PICK(lang)];
  return {
    ...r,
    areas: r.areas.map((a) => ({ ...a, text: "" })),
    items: r.items.map((i) => ({ ...i, text: i.key === r.care ? T.mHook(i.name) : i.key === r.best ? i.text : "" })),
    people: r.people.map((p) => ({ ...p, grow: "" })),
    mangal: r.mangal ? T.mMangal : r.mangal,
    care: r.care,
  };
}
