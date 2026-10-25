// Short, free, plain-language lines shown right after the chart.
// Lagna (rising sign) is the outer personality; rashi (Moon sign) is the inner mood.

import { DASHA_THEME } from "./content.js";

const LAGNA = [
  "Aap seedhe, himmati aur pehla kadam uthane wale insaan hain. Energy zyada, sabr thoda kam.",
  "Aap shaant, bharosemand aur aaram pasand karne wale hain. Dheere par pakke kadam chalte hain.",
  "Aap curious, baatuni aur jaldi seekhne wale hain. Mann ek jagah kam tikta hai.",
  "Aap bhaavuk, caring aur ghar-parivar se jude hain. Aapki intuition tez hai.",
  "Aapmein natural confidence aur leader wali energy hai. Aapko pehchaan milna pasand hai.",
  "Aap practical, detail-pasand aur madad karne wale hain. Khud se perfection ki umeed rehti hai.",
  "Aap balance, sundarta aur achhe rishton ko value dete hain. Faisle lene mein waqt lagta hai.",
  "Aap gehre, determined aur raaz sambhalne wale hain. Jo thaan lete ho, karke dikhate ho.",
  "Aap khule dil ke, optimistic aur ghoomne-seekhne ke shaukeen hain. Azaadi aapko pyaari hai.",
  "Aap mehnati, disciplined aur lambe goal par tikne wale hain. Safalta der se par pakki milti hai.",
  "Aap alag soch wale, friendly aur naye idea wale hain. Apni azaadi aur space aapke liye zaroori hai.",
  "Aap dayalu, creative aur sapno mein jeene wale hain. Doosron ka dard jaldi mehsoos karte ho.",
];

const RASHI = [
  "Mann se aap josh se bhare aur jaldi react karne wale hain.",
  "Mann se aap stable, sukoon-pasand aur loyal hain.",
  "Mann se aap hamesha kuch naya sochte aur baat karna pasand karte hain.",
  "Mann se aap nazuk, caring aur apno ke liye bahut protective hain.",
  "Mann se aap udaar, swabhimaani aur pyaar dikhane wale hain.",
  "Mann se aap sochne wale, analytical aur sudhaar-pasand hain.",
  "Mann se aap shaanti, saath aur balance dhoondhte hain.",
  "Mann se aap intense hain: kam bolte hain par gehra mehsoos karte hain.",
  "Mann se aap hopeful, seedhe aur seekhne ke bhookhe hain.",
  "Mann se aap responsible hain aur apni bhavnaayein kam dikhate hain.",
  "Mann se aap independent, thode alag aur insaaniyat ki baat sochne wale hain.",
  "Mann se aap bhaavuk, spiritual aur kalpana-shakti se bhare hain.",
];

export function quickInsights(chart, { timeUnknown = false } = {}) {
  const moon = chart.planets.find((p) => p.key === "Moon");
  const lord = chart.dasha.current?.mahadasha?.lord;
  return {
    // Without the exact birth time the lagna cannot be trusted.
    lagna: timeUnknown ? null : LAGNA[chart.ascendant.signIndex],
    rashi: RASHI[moon.signIndex],
    dasha: !timeUnknown && lord ? { lord, text: DASHA_THEME[lord] } : null,
  };
}
