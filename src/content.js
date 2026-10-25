// Plain-language Hinglish content for the daily features.
// Everything here is calm and tendency-based: no fear, no guarantees.

export const MOOD_LABEL = {
  good: "Shubh din",
  ok: "Madhyam din",
  gentle: "Dhyan se chalo",
};

// Weekday (luxon: Monday = 1 ... Sunday = 7)
export const WEEKDAY_INFO = {
  1: {
    lord: "Moon", lordHi: "चंद्र",
    colour: { name: "Safed", hi: "सफ़ेद", hex: "#F4EFE6" },
    deity: "Shiv ji", deityHi: "शिव जी", mantra: "ॐ नमः शिवाय",
    note: "Somvar shaanti, sanyam aur Shiv ji ki upasana ka din maana jata hai.",
  },
  2: {
    lord: "Mars", lordHi: "मंगल",
    colour: { name: "Laal", hi: "लाल", hex: "#C62828" },
    deity: "Hanuman ji", deityHi: "हनुमान जी", mantra: "ॐ हनुमते नमः",
    note: "Mangalvar himmat aur shakti ka din maana jata hai; Hanuman ji ko yaad karne ka din.",
  },
  3: {
    lord: "Mercury", lordHi: "बुध",
    colour: { name: "Hara", hi: "हरा", hex: "#2E7D32" },
    deity: "Ganesh ji", deityHi: "गणेश जी", mantra: "ॐ गं गणपतये नमः",
    note: "Budhvar Ganesh ji ka din maana jata hai; naye kaam aur seekhne ke liye achha.",
  },
  4: {
    lord: "Jupiter", lordHi: "गुरु",
    colour: { name: "Peela", hi: "पीला", hex: "#F2B600" },
    deity: "Vishnu ji", deityHi: "विष्णु जी", mantra: "ॐ नमो भगवते वासुदेवाय",
    note: "Guruvar gyaan, guru aur Vishnu ji ki upasana ka din maana jata hai.",
  },
  5: {
    lord: "Venus", lordHi: "शुक्र",
    colour: { name: "Gulabi", hi: "गुलाबी", hex: "#E58AAE" },
    deity: "Lakshmi ji", deityHi: "लक्ष्मी जी", mantra: "ॐ श्रीं महालक्ष्म्यै नमः",
    note: "Shukravar Lakshmi ji aur Maa Durga ka din maana jata hai; sukh aur sundarta ka din.",
  },
  6: {
    lord: "Saturn", lordHi: "शनि",
    colour: { name: "Neela", hi: "नीला", hex: "#1F3A6F" },
    deity: "Shani dev", deityHi: "शनि देव", mantra: "ॐ शं शनैश्चराय नमः",
    note: "Shanivar mehnat, sabr aur imaandari ka din maana jata hai.",
  },
  7: {
    lord: "Sun", lordHi: "सूर्य",
    colour: { name: "Kesariya", hi: "केसरिया", hex: "#E8892B" },
    deity: "Surya dev", deityHi: "सूर्य देव", mantra: "ॐ घृणि सूर्याय नमः",
    note: "Ravivar Surya dev ka din maana jata hai; sehat, energy aur aatmavishwas ka din.",
  },
};

// Moon's house counted from a person's own Moon sign (gochar).
export const HOUSE_READING = {
  1: { mood: "good", theme: "Aap aur aapka mann",
    text: "Chandra aaj aapki apni rashi se guzar raha hai, isliye mann zyada mehsoos karega aur aapki presence strong rahegi. Apne liye aur apni planning ke liye achha din.",
    stars: { love: 4, career: 4, money: 3, health: 4 } },
  2: { mood: "gentle", theme: "Paisa aur baat-cheet",
    text: "Aaj paise aur bolchaal par thoda dhyan rakho. Kharch soch-samajh kar karo aur kuch bolne se pehle ek pal ruko; parivar ke saath meetha bolna kaam aayega.",
    stars: { love: 3, career: 3, money: 2, health: 3 } },
  3: { mood: "good", theme: "Himmat aur koshish",
    text: "Aaj himmat aur initiative ka din hai. Chhote kaam shuru karne, logon se baat karne aur dosto ya bhai-behen se judne ke liye achha samay.",
    stars: { love: 3, career: 4, money: 4, health: 4 } },
  4: { mood: "ok", theme: "Ghar aur sukoon",
    text: "Mann ghar, parivar aur apne comfort ki taraf khichega. Thoda aaram karo, apno ke saath waqt bitao aur bade faisle kal par chhod do.",
    stars: { love: 4, career: 2, money: 3, health: 3 } },
  5: { mood: "ok", theme: "Creativity aur pyaar",
    text: "Creativity, padhai aur pyaar ke liye achha mahaul hai, par dimag thoda idhar-udhar bhatak sakta hai. Ek waqt par ek hi kaam pakdo.",
    stars: { love: 4, career: 3, money: 3, health: 3 } },
  6: { mood: "good", theme: "Kaam nipta do",
    text: "Aaj mushkilein suljhane ka mood hai. Pending kaam, health routine aur chhoti-moti pareshaniyan nipta do; aapka discipline strong rahega.",
    stars: { love: 3, career: 4, money: 4, health: 4 } },
  7: { mood: "good", theme: "Saath aur rishte",
    text: "Logon se milne-julne aur partnership ke liye achha din. Dost, partner ya business saathi se khulkar baat karo, baat ban sakti hai.",
    stars: { love: 5, career: 4, money: 4, health: 4 } },
  8: { mood: "gentle", theme: "Dheere chalo",
    text: "Energy thodi dheemi ya andar ki taraf ja sakti hai. Jaldbaazi mat karo, neend aur pani ka khayal rakho aur sirf zaroori kaam pakdo.",
    stars: { love: 2, career: 2, money: 2, health: 2 } },
  9: { mood: "ok", theme: "Seekhna aur salah",
    text: "Seekhne, badon se salah lene aur lambe plan sochne ka din. Bina soche plan mat badlo; kisi anubhavi insaan se baat karna fayda de sakta hai.",
    stars: { love: 3, career: 3, money: 3, health: 3 } },
  10: { mood: "good", theme: "Kaam aur pehchaan",
    text: "Aaj kaam mein pehchaan milne ka mauka hai. Apna best kaam saamne rakho; boss ya clients se baat karne ke liye achha din.",
    stars: { love: 3, career: 5, money: 4, health: 4 } },
  11: { mood: "good", theme: "Labh aur dosti",
    text: "Dosti, network aur labh ka din. Purane dosto se milna ya naye logon se judna kaam aa sakta hai; kisi purani umeed ka achha jawab mil sakta hai.",
    stars: { love: 4, career: 4, money: 5, health: 4 } },
  12: { mood: "gentle", theme: "Aaram aur andar ki yatra",
    text: "Aaj thoda ruk kar apne andar jhaankne ka din hai. Aaram, dhyan aur shaant waqt achha rahega; fizool kharch aur zyada socha-vichari se bacho.",
    stars: { love: 3, career: 2, money: 2, health: 3 } },
};

export const TITHI_TONE = {
  Nanda: "Aaj ki tithi (Nanda) khushi aur nayi shuruaat wale kaamon ke liye achhi maani jaati hai.",
  Bhadra: "Aaj ki tithi (Bhadra) seva, sehat aur routine kaamon ke liye achhi maani jaati hai.",
  Jaya: "Aaj ki tithi (Jaya) mehnat, competition aur jeet wale kaamon ke liye achhi maani jaati hai.",
  Rikta: "Aaj ki tithi (Rikta) mein naye bade kaam shuru karne se pehle ruk jaana behtar maana jata hai; purane kaam nipta do.",
  Purna: "Aaj ki tithi (Purna) kaam poora karne aur shubh kaamon ke liye achhi maani jaati hai.",
};

export const RASHI_TRAIT = [
  "Mesh ka josh aaj sahi jagah lagao: pehle plan, phir action.",
  "Vrishabh ki sthirta aapki taakat hai; aaj apne routine par tike raho.",
  "Mithun ki baat-cheet ki kala aaj kaam aayegi; kisi se khulkar baat karo.",
  "Kark ki samvedansheelta aaj sahi insaan pehchanne mein madad karegi; apni feeling par bharosa rakho.",
  "Singh ka confidence aaj chamakta hai; doosron ko bhi mauka do, aapki value aur badhegi.",
  "Kanya ki baariki aaj kaam aayegi; khud se perfection ki umeed thodi kam rakho.",
  "Tula ka santulan aaj ek achhe faisle mein madad karega; zyada der doubt mein mat raho.",
  "Vrishchik ki gehri soch aaj kaam aayegi; bharosemand logon ke saath hi raaz baanto.",
  "Dhanu ki positivity aaj logon ko prerit karegi; kuch naya seekhne ka mauka mat chhodo.",
  "Makar ka discipline aaj kaam aayega; chhote kadam lagataar uthate raho.",
  "Kumbh ke anokhe idea aaj sunne layak hain; unhe likh kar rakho.",
  "Meen ki kalpana aur dayalutaa aaj chamakti hai; apna khayal rakhna na bhoolo.",
];

// Number traditionally linked with each rashi's ruling planet.
export const PLANET_NUMBER = {
  Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9,
};

export const HIGHLIGHTS = {
  ekadashi: { en: "Ekadashi", hi: "एकादशी", note: "Parampara ke anusaar Vishnu ji ki pooja aur vrat ka din." },
  purnima: { en: "Purnima", hi: "पूर्णिमा", note: "Parampara ke anusaar daan, Satyanarayan katha aur chandra darshan ka din." },
  amavasya: { en: "Amavasya", hi: "अमावस्या", note: "Parampara ke anusaar pitron ko yaad karne, daan aur dhyan ka din." },
  pradosh: { en: "Pradosh (Trayodashi)", hi: "प्रदोष (त्रयोदशी)", note: "Parampara ke anusaar shaam ke samay Shiv ji ki pooja ka din." },
  shivratri: { en: "Masik Shivratri", hi: "मासिक शिवरात्रि", note: "Krishna Chaturdashi: Shiv ji ki upasana ka din maana jata hai." },
  vinayaka: { en: "Vinayaka Chaturthi", hi: "विनायक चतुर्थी", note: "Shukla Chaturthi: Ganesh ji ki pooja ka din maana jata hai." },
  sankashti: { en: "Sankashti Chaturthi", hi: "संकष्टी चतुर्थी", note: "Krishna Chaturthi: Ganesh ji ke vrat ka din maana jata hai." },
};

export const DASHA_THEME = {
  Sun: "Aatmavishwas, pehchaan aur zimmedari ka daur. Apni baat saaf rakho aur apne principles par tike raho.",
  Moon: "Mann, ghar aur rishton ka daur. Bhaavnaon ko samajhna aur khud ka khayal rakhna zaroori hai.",
  Mars: "Josh, mehnat aur action ka daur. Energy ko sahi jagah lagao aur gusse par kaabu rakho.",
  Mercury: "Seekhne, baat-cheet aur business ka daur. Skills badhao aur networking karo.",
  Jupiter: "Gyaan, vikas aur achhe mauko ka daur. Mentors aur seekhne se fayda milta hai.",
  Venus: "Rishte, aaram, kala aur sukh ka daur. Balance mein rehna zaroori hai.",
  Saturn: "Mehnat, discipline aur sabr ka daur. Dheere kadam, par pakka natija.",
  Rahu: "Naye raaste, badlav aur badi mahatvakanksha ka daur. Hawa mein mat bahein; zameen par rehkar plan banao.",
  Ketu: "Andar ki taraf jaane, seekhne aur chhodne ka daur. Simple aur spiritual jeevan ki taraf jhukaav.",
};

export const SADE_SATI = {
  common:
    "Shani ke is daur ko aksar darawna bataya jata hai, par asal mein ise sabr, mehnat aur zimmedari seekhne ka samay maana jata hai. Asar aapki poori kundli par depend karta hai, isliye ghabrao mat.",
  tip: "Sehat, routine, imaandari aur seva par dhyan do. Chhote, seedhe kadam kaafi hote hain.",
  states: {
    rising: { title: "Sade Sati: pehla charan", text: "Shani aapki rashi se pehle wali rashi mein hain. Ye aksar zimmedari aur discipline badhne ka daur hota hai." },
    peak: { title: "Sade Sati: beech ka charan", text: "Shani aapki apni rashi mein hain. Ye aksar apne aap ko parakhne aur mazboot banne ka daur hota hai." },
    setting: { title: "Sade Sati: aakhri charan", text: "Shani aapki rashi se agli rashi mein hain. Is daur mein aksar rahat aur samajh dono badhne lagte hain." },
    kantak: { title: "Shani ki Dhaiya (4th)", text: "Shani aapki rashi se chauthi rashi mein hain. Ghar, sukoon aur sehat par thoda extra dhyan dena achha rehta hai." },
    ashtam: { title: "Shani ki Dhaiya (8th)", text: "Shani aapki rashi se aathvi rashi mein hain. Dheere chalna, plan karna aur jaldbaazi se bachna achha rehta hai." },
    none: { title: "Sade Sati nahi chal rahi", text: "Abhi aapki rashi par Shani ki Sade Sati ya Dhaiya nahi hai." },
  },
};

export const LAGNA = [
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

export const RASHI = [
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


const BASE = {
  MOOD_LABEL, WEEKDAY_INFO, HOUSE_READING, TITHI_TONE, RASHI_TRAIT, HIGHLIGHTS,
  DASHA_THEME, SADE_SATI, LAGNA, RASHI,
};

// Tables for a language: "hn" (Hinglish, default), "en" or "hi".
// Other languages only replace the wording; ratings, moods and numbers are shared.
export function getContent(lang = "hn") {
  if (lang === "en") return merge(BASE, EN);
  if (lang === "hi") return merge(BASE, HI_TEXT);
  return BASE;
}

function merge(base, t) {
  const out = { ...base };
  out.MOOD_LABEL = t.MOOD_LABEL;
  out.TITHI_TONE = t.TITHI_TONE;
  out.RASHI_TRAIT = t.RASHI_TRAIT;
  out.DASHA_THEME = t.DASHA_THEME;
  out.SADE_SATI = t.SADE_SATI;
  out.LAGNA = t.LAGNA;
  out.RASHI = t.RASHI;
  out.WEEKDAY_INFO = Object.fromEntries(
    Object.entries(base.WEEKDAY_INFO).map(([k, v]) => [k, {
      ...v,
      colour: { ...v.colour, name: t.WEEKDAY[k].colour },
      deity: t.WEEKDAY[k].deity,
      note: t.WEEKDAY[k].note,
    }])
  );
  out.HOUSE_READING = Object.fromEntries(
    Object.entries(base.HOUSE_READING).map(([k, v]) => [k, { ...v, ...t.HOUSE[k] }])
  );
  out.HIGHLIGHTS = Object.fromEntries(
    Object.entries(base.HIGHLIGHTS).map(([k, v]) => [k, { ...v, note: t.HIGHLIGHT_NOTE[k] }])
  );
  return out;
}

import { EN } from "./content-en.js";
import { HI_TEXT } from "./content-hi.js";
