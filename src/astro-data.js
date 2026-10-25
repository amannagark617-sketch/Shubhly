// Static astrology reference tables used by the kundli engine.

export const SIGNS = [
  { en: "Aries", hi: "मेष", lord: "Mars" },
  { en: "Taurus", hi: "वृषभ", lord: "Venus" },
  { en: "Gemini", hi: "मिथुन", lord: "Mercury" },
  { en: "Cancer", hi: "कर्क", lord: "Moon" },
  { en: "Leo", hi: "सिंह", lord: "Sun" },
  { en: "Virgo", hi: "कन्या", lord: "Mercury" },
  { en: "Libra", hi: "तुला", lord: "Venus" },
  { en: "Scorpio", hi: "वृश्चिक", lord: "Mars" },
  { en: "Sagittarius", hi: "धनु", lord: "Jupiter" },
  { en: "Capricorn", hi: "मकर", lord: "Saturn" },
  { en: "Aquarius", hi: "कुंभ", lord: "Saturn" },
  { en: "Pisces", hi: "मीन", lord: "Jupiter" },
];

export const PLANET_NAMES = {
  Sun: { hi: "सूर्य", short: "Su" },
  Moon: { hi: "चंद्र", short: "Mo" },
  Mars: { hi: "मंगल", short: "Ma" },
  Mercury: { hi: "बुध", short: "Me" },
  Jupiter: { hi: "गुरु", short: "Ju" },
  Venus: { hi: "शुक्र", short: "Ve" },
  Saturn: { hi: "शनि", short: "Sa" },
  Rahu: { hi: "राहु", short: "Ra" },
  Ketu: { hi: "केतु", short: "Ke" },
};

export const NAKSHATRAS = [
  { en: "Ashwini", hi: "अश्विनी" },
  { en: "Bharani", hi: "भरणी" },
  { en: "Krittika", hi: "कृत्तिका" },
  { en: "Rohini", hi: "रोहिणी" },
  { en: "Mrigashira", hi: "मृगशिरा" },
  { en: "Ardra", hi: "आर्द्रा" },
  { en: "Punarvasu", hi: "पुनर्वसु" },
  { en: "Pushya", hi: "पुष्य" },
  { en: "Ashlesha", hi: "आश्लेषा" },
  { en: "Magha", hi: "मघा" },
  { en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी" },
  { en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी" },
  { en: "Hasta", hi: "हस्त" },
  { en: "Chitra", hi: "चित्रा" },
  { en: "Swati", hi: "स्वाति" },
  { en: "Vishakha", hi: "विशाखा" },
  { en: "Anuradha", hi: "अनुराधा" },
  { en: "Jyeshtha", hi: "ज्येष्ठा" },
  { en: "Mula", hi: "मूल" },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा" },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा" },
  { en: "Shravana", hi: "श्रवण" },
  { en: "Dhanishta", hi: "धनिष्ठा" },
  { en: "Shatabhisha", hi: "शतभिषा" },
  { en: "Purva Bhadrapada", hi: "पूर्वा भाद्रपद" },
  { en: "Uttara Bhadrapada", hi: "उत्तरा भाद्रपद" },
  { en: "Revati", hi: "रेवती" },
];

// Vimshottari dasha order and years (total 120).
export const DASHA_ORDER = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

export const DASHA_YEARS = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};
