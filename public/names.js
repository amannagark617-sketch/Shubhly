// Names of signs, planets, nakshatras and weekdays in each language.
// Shared by the page and the PDF writer. Languages without a table here
// (English and Hinglish) are handled by the helpers below.

export const SIGN_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
export const NAK_EN = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
export const DAY_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const PLANET_KEYS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune", "Pluto", "NorthNode"];

const HN = {
  planets: { Sun: "Surya", Moon: "Chandra", Mars: "Mangal", Mercury: "Budh", Jupiter: "Guru", Venus: "Shukra", Saturn: "Shani", Rahu: "Rahu", Ketu: "Ketu", Uranus: "Uranus", Neptune: "Neptune", Pluto: "Pluto", NorthNode: "North Node" },
  signs: { Aries: "Mesh", Taurus: "Vrishabh", Gemini: "Mithun", Cancer: "Kark", Leo: "Singh", Virgo: "Kanya", Libra: "Tula", Scorpio: "Vrishchik", Sagittarius: "Dhanu", Capricorn: "Makar", Aquarius: "Kumbh", Pisces: "Meen" },
  days: { Monday: "Somvar", Tuesday: "Mangalvar", Wednesday: "Budhvar", Thursday: "Guruvar", Friday: "Shukravar", Saturday: "Shanivar", Sunday: "Ravivar" },
};

export const NAMES = {
  hi: {
    signs: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    planets: ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु", "यूरेनस", "नेप्च्यून", "प्लूटो", "उत्तर नोड"],
    naks: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती"],
    days: ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"],
  },
  mr: {
    signs: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    planets: ["सूर्य", "चंद्र", "मंगळ", "बुध", "गुरू", "शुक्र", "शनी", "राहू", "केतू", "युरेनस", "नेपच्यून", "प्लूटो", "उत्तर नोड"],
    naks: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशीर्ष", "आर्द्रा", "पुनर्वसू", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूळ", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शततारका", "पूर्वा भाद्रपदा", "उत्तरा भाद्रपदा", "रेवती"],
    days: ["सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"],
  },
  bn: {
    signs: ["মেষ", "বৃষ", "মিথুন", "কর্কট", "সিংহ", "কন্যা", "তুলা", "বৃশ্চিক", "ধনু", "মকর", "কুম্ভ", "মীন"],
    planets: ["সূর্য", "চন্দ্র", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি", "রাহু", "কেতু", "ইউরেনাস", "নেপচুন", "প্লুটো", "উত্তর নোড"],
    naks: ["অশ্বিনী", "ভরণী", "কৃত্তিকা", "রোহিণী", "মৃগশিরা", "আর্দ্রা", "পুনর্বসু", "পুষ্যা", "অশ্লেষা", "মঘা", "পূর্বফাল্গুনী", "উত্তরফাল্গুনী", "হস্তা", "চিত্রা", "স্বাতী", "বিশাখা", "অনুরাধা", "জ্যেষ্ঠা", "মূলা", "পূর্বাষাঢ়া", "উত্তরাষাঢ়া", "শ্রবণা", "ধনিষ্ঠা", "শতভিষা", "পূর্বভাদ্রপদ", "উত্তরভাদ্রপদ", "রেবতী"],
    days: ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"],
  },
  ta: {
    signs: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
    planets: ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி", "ராகு", "கேது", "யுரேனஸ்", "நெப்டியூன்", "புளூட்டோ", "வட நோடு"],
    naks: ["அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"],
    days: ["திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி", "ஞாயிறு"],
  },
  te: {
    signs: ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"],
    planets: ["సూర్యుడు", "చంద్రుడు", "కుజుడు", "బుధుడు", "గురుడు", "శుక్రుడు", "శని", "రాహువు", "కేతువు", "యురేనస్", "నెప్ట్యూన్", "ప్లూటో", "ఉత్తర నోడ్"],
    naks: ["అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఘ", "పూర్వ ఫల్గుణి", "ఉత్తర ఫల్గుణి", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ", "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"],
    days: ["సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం", "ఆదివారం"],
  },
  gu: {
    signs: ["મેષ", "વૃષભ", "મિથુન", "કર્ક", "સિંહ", "કન્યા", "તુલા", "વૃશ્ચિક", "ધન", "મકર", "કુંભ", "મીન"],
    planets: ["સૂર્ય", "ચંદ્ર", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ", "રાહુ", "કેતુ", "યુરેનસ", "નેપ્ચ્યુન", "પ્લુટો", "ઉત્તર નોડ"],
    naks: ["અશ્વિની", "ભરણી", "કૃત્તિકા", "રોહિણી", "મૃગશીર્ષ", "આર્દ્રા", "પુનર્વસુ", "પુષ્ય", "આશ્લેષા", "મઘા", "પૂર્વા ફાલ્ગુની", "ઉત્તરા ફાલ્ગુની", "હસ્ત", "ચિત્રા", "સ્વાતિ", "વિશાખા", "અનુરાધા", "જ્યેષ્ઠા", "મૂળ", "પૂર્વાષાઢા", "ઉત્તરાષાઢા", "શ્રવણ", "ધનિષ્ઠા", "શતભિષા", "પૂર્વા ભાદ્રપદ", "ઉત્તરા ભાદ્રપદ", "રેવતી"],
    days: ["સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર", "રવિવાર"],
  },
};

// Languages whose own table has the name; others fall back as noted.
const tableOf = (lang) => NAMES[lang] || null;

export function planetName(lang, key) {
  if (lang === "hn") return HN.planets[key] || key;
  const n = tableOf(lang);
  if (n) return n.planets[PLANET_KEYS.indexOf(key)] || key;
  return key === "NorthNode" ? "North Node" : key;
}

// short = true drops the English in brackets for Hinglish.
export function signName(lang, en, hi, short = false) {
  if (lang === "hn") return short ? HN.signs[en] || en : `${HN.signs[en] || en} (${en})`;
  const n = tableOf(lang);
  if (n) return n.signs[SIGN_EN.indexOf(en)] || hi || en;
  return en;
}

export function nakName(lang, en, hi) {
  const n = tableOf(lang);
  if (n) {
    const i = NAK_EN.indexOf(en);
    return (i >= 0 && n.naks[i]) || hi || en;
  }
  return en;
}

export function dayName(lang, en, hi) {
  if (lang === "hn") return HN.days[en] || en;
  const n = tableOf(lang);
  if (n) return n.days[DAY_EN.indexOf(en)] || hi || en;
  return en;
}

// Names with no table of their own (tithi, yoga, karana, choghadiya, festivals):
// Hindi and Marathi share the Devanagari wording; the rest show the roman name.
export function pickName(lang, en, hi) {
  return lang === "hi" || lang === "mr" ? hi : en;
}

export const DATE_LOCALE = { en: "en-IN", hn: "en-IN", hi: "hi-IN", mr: "mr-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", gu: "gu-IN" };
