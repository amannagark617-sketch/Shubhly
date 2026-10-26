// Major Arcana for the tarot page: names, short reflective meanings (upright and reversed)
// in English, Hindi and Hinglish, and a simple drawn symbol for each card.

export const CARDS = [
  { n: "The Fool", hi: "द फ़ूल", hn: "The Fool",
    up: ["A fresh start and a leap of trust.", "नई शुरुआत और भरोसे की छलाँग।", "Nayi shuruaat aur bharose ki chhalaang."],
    rv: ["Hesitation, or a leap taken without looking.", "झिझक, या बिना देखे लगाई छलाँग।", "Jhijhak, ya bina dekhe lagayi chhalaang."] },
  { n: "The Magician", hi: "द मैजिशियन", hn: "The Magician",
    up: ["You have the tools and the will to begin.", "शुरू करने के साधन और इरादा आपके पास हैं।", "Shuru karne ke saadhan aur irada aapke paas hain."],
    rv: ["Talent that is scattered or not yet used.", "प्रतिभा जो बिखरी है या अभी इस्तेमाल नहीं हुई।", "Pratibha jo bikhri hai ya abhi use nahi hui."] },
  { n: "The High Priestess", hi: "द हाई प्रीस्टेस", hn: "The High Priestess",
    up: ["Listen inward; the answer is quieter than the noise.", "भीतर सुनिए; जवाब शोर से धीमा है।", "Andar suno; jawab shor se dheema hai."],
    rv: ["Ignoring your gut, or secrets that weigh on you.", "अंदर की आवाज़ अनसुनी, या भारी पड़ते राज़।", "Andar ki awaaz ansuni, ya bhaari padte raaz."] },
  { n: "The Empress", hi: "द एम्प्रेस", hn: "The Empress",
    up: ["Care, creativity and growth.", "देखभाल, रचनात्मकता और बढ़त।", "Dekhbhaal, creativity aur badhat."],
    rv: ["Over-giving, or neglecting your own needs.", "ज़रूरत से ज़्यादा देना, या अपनी ज़रूरतें भूलना।", "Zaroorat se zyada dena, ya apni zaroorat bhoolna."] },
  { n: "The Emperor", hi: "द एम्परर", hn: "The Emperor",
    up: ["Structure, steadiness and clear boundaries.", "ढाँचा, स्थिरता और साफ़ सीमाएँ।", "Dhaancha, sthirta aur saaf seemayein."],
    rv: ["Rigidity, or a need to control.", "अड़ियलपन, या सब कुछ काबू में रखने की चाह।", "Adiyalpan, ya sab kuch kaabu mein rakhne ki chaah."] },
  { n: "The Hierophant", hi: "द हायरोफ़ैंट", hn: "The Hierophant",
    up: ["Tradition, learning and trusted guidance.", "परंपरा, सीख और भरोसेमंद मार्गदर्शन।", "Parampara, seekh aur bharosemand margdarshan."],
    rv: ["Questioning old rules and finding your own way.", "पुराने नियमों पर सवाल और अपना रास्ता।", "Purane niyamon par sawaal aur apna raasta."] },
  { n: "The Lovers", hi: "द लवर्स", hn: "The Lovers",
    up: ["A heartfelt choice and real connection.", "दिल से किया चुनाव और सच्चा जुड़ाव।", "Dil se kiya chunaav aur sachcha judaav."],
    rv: ["Mixed signals, or a choice put off.", "उलझे संकेत, या टाला हुआ फ़ैसला।", "Uljhe sanket, ya tala hua faisla."] },
  { n: "The Chariot", hi: "द चैरियट", hn: "The Chariot",
    up: ["Focus and drive carry you forward.", "ध्यान और जोश आपको आगे ले जाते हैं।", "Dhyaan aur josh aapko aage le jaate hain."],
    rv: ["Scattered effort; pause and choose a direction.", "बिखरी कोशिश; रुकिए और दिशा चुनिए।", "Bikhri koshish; rukiye aur disha chuniye."] },
  { n: "Strength", hi: "स्ट्रेंथ", hn: "Strength",
    up: ["Quiet courage and patience.", "शांत हिम्मत और धैर्य।", "Shaant himmat aur dhairya."],
    rv: ["Self-doubt; be gentler with yourself.", "ख़ुद पर शक; अपने साथ नरमी रखिए।", "Khud par shak; apne saath narmi rakhiye."] },
  { n: "The Hermit", hi: "द हर्मिट", hn: "The Hermit",
    up: ["Time alone brings clarity.", "अकेले बिताया समय साफ़ दिखाता है।", "Akele bitaya samay saaf dikhata hai."],
    rv: ["Too much isolation; a good time to reach out.", "बहुत अकेलापन; किसी से जुड़ने का समय।", "Bahut akelapan; kisi se judne ka samay."] },
  { n: "Wheel of Fortune", hi: "व्हील ऑफ़ फ़ॉर्च्यून", hn: "Wheel of Fortune",
    up: ["Cycles turn; change is part of life.", "चक्र घूमते हैं; बदलाव जीवन का हिस्सा है।", "Chakra ghoomte hain; badlaav jeevan ka hissa hai."],
    rv: ["A stuck patch that is not permanent.", "अटका दौर जो हमेशा नहीं रहेगा।", "Atka daur jo hamesha nahi rahega."] },
  { n: "Justice", hi: "जस्टिस", hn: "Justice",
    up: ["Fairness, honesty and cause and effect.", "निष्पक्षता, ईमानदारी और कर्म का फल।", "Nishpakshta, imaandaari aur karm ka phal."],
    rv: ["Avoiding the truth, or an unfair weighing.", "सच से बचना, या अधूरा तौल।", "Sach se bachna, ya adhura taul."] },
  { n: "The Hanged Man", hi: "द हैंग्ड मैन", hn: "The Hanged Man",
    up: ["A pause and a new angle.", "ठहराव और देखने का नया कोण।", "Thehraav aur dekhne ka naya kon."],
    rv: ["Waiting too long; time to decide.", "बहुत इंतज़ार; अब फ़ैसले का समय।", "Bahut intezaar; ab faisle ka samay."] },
  { n: "Death", hi: "डेथ", hn: "Death",
    up: ["An ending that makes room for something new.", "एक अंत जो नए के लिए जगह बनाता है।", "Ek ant jo naye ke liye jagah banata hai."],
    rv: ["Holding on to what has already finished.", "जो ख़त्म हो चुका उसे पकड़े रखना।", "Jo khatam ho chuka use pakde rakhna."] },
  { n: "Temperance", hi: "टेम्परेंस", hn: "Temperance",
    up: ["Balance, patience and the middle path.", "संतुलन, धैर्य और बीच का रास्ता।", "Santulan, dhairya aur beech ka raasta."],
    rv: ["Overdoing it; time to restore balance.", "हद से ज़्यादा; संतुलन लौटाने का समय।", "Had se zyada; santulan lautane ka samay."] },
  { n: "The Devil", hi: "द डेविल", hn: "The Devil",
    up: ["Habits or attachments that hold you tight.", "आदतें या लगाव जो कसकर पकड़े हैं।", "Aadatein ya lagaav jo kaskar pakde hain."],
    rv: ["Loosening a grip and taking your power back.", "पकड़ ढीली होना और अपनी ताक़त लौटना।", "Pakad dheeli hona aur apni taaqat lautna."] },
  { n: "The Tower", hi: "द टावर", hn: "The Tower",
    up: ["A sudden shake-up that clears the ground.", "अचानक हलचल जो ज़मीन साफ़ करती है।", "Achanak halchal jo zameen saaf karti hai."],
    rv: ["Resisting a change that is already underway.", "ऐसे बदलाव का विरोध जो शुरू हो चुका है।", "Aise badlaav ka virodh jo shuru ho chuka hai."] },
  { n: "The Star", hi: "द स्टार", hn: "The Star",
    up: ["Hope, healing and renewed faith.", "उम्मीद, राहत और नया भरोसा।", "Ummeed, raahat aur naya bharosa."],
    rv: ["Doubt; the hope is still there, just dim.", "शक; उम्मीद है, बस धुँधली।", "Shak; ummeed hai, bas dhundhli."] },
  { n: "The Moon", hi: "द मून", hn: "The Moon",
    up: ["Uncertainty and dreams; not everything is clear yet.", "अनिश्चितता और सपने; सब कुछ अभी साफ़ नहीं।", "Anishchitata aur sapne; sab kuch abhi saaf nahi."],
    rv: ["The fog is lifting and fears fade.", "धुंध छँट रही है, डर कम हो रहे हैं।", "Dhundh chhant rahi hai, dar kam ho rahe hain."] },
  { n: "The Sun", hi: "द सन", hn: "The Sun",
    up: ["Joy, clarity and energy.", "ख़ुशी, स्पष्टता और ऊर्जा।", "Khushi, spashtta aur urja."],
    rv: ["Joy delayed; look for the small bright spots.", "ख़ुशी में देरी; छोटी रोशनियाँ ढूँढिए।", "Khushi mein deri; chhoti roshniyan dhundhiye."] },
  { n: "Judgement", hi: "जजमेंट", hn: "Judgement",
    up: ["A calling and honest reflection.", "भीतर की पुकार और ईमानदार आत्ममंथन।", "Andar ki pukaar aur imaandaar aatmmanthan."],
    rv: ["Self-criticism; forgive and move on.", "ख़ुद की आलोचना; माफ़ कीजिए और आगे बढ़िए।", "Khud ki aalochna; maaf kijiye aur aage badhiye."] },
  { n: "The World", hi: "द वर्ल्ड", hn: "The World",
    up: ["Completion and a sense of wholeness.", "पूर्णता और सब कुछ जुड़ने का एहसास।", "Poornta aur sab kuch judne ka ehsaas."],
    rv: ["Almost there; one last piece to finish.", "लगभग पहुँचे; बस एक टुकड़ा बाकी।", "Lagbhag pahunche; bas ek tukda baaki."] },
];

export const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

const I = "#1b1b3a", Y = "#f6b81c", R = "#d8321a";
const st = `stroke="${I}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const ray = (cx, cy, r1, r2, n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return `M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}L${(cx + Math.cos(a) * r2).toFixed(1)} ${(cy + Math.sin(a) * r2).toFixed(1)}`; }).join("");
const sun = (cx, cy, r) => `<path d="${ray(cx, cy, r + 3, r + 12, 12)}" fill="none" ${st}/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${Y}" ${st}/>`;
const crescent = (cx, cy, r) => `<path d="M${cx} ${cy - r}A${r} ${r} 0 1 0 ${cx + r * 0.9} ${cy + r * 0.4}A${r * 0.8} ${r * 0.8} 0 1 1 ${cx} ${cy - r}Z" fill="${Y}" ${st}/>`;
const star = (cx, cy, r) => `<path d="M${cx} ${cy - r}L${cx + r * 0.3} ${cy - r * 0.3}L${cx + r} ${cy}L${cx + r * 0.3} ${cy + r * 0.3}L${cx} ${cy + r}L${cx - r * 0.3} ${cy + r * 0.3}L${cx - r} ${cy}L${cx - r * 0.3} ${cy - r * 0.3}Z" fill="${Y}" ${st}/>`;
const cup = (cx, cy) => `<path d="M${cx - 14} ${cy - 14}H${cx + 14}C${cx + 14} ${cy + 6} ${cx + 6} ${cy + 12} ${cx} ${cy + 12}C${cx - 6} ${cy + 12} ${cx - 14} ${cy + 6} ${cx - 14} ${cy - 14}ZM${cx} ${cy + 12}V${cy + 26}M${cx - 10} ${cy + 26}H${cx + 10}" fill="${Y}" ${st}/>`;
const person = (cx, y, c = R) => `<circle cx="${cx}" cy="${y}" r="9" fill="#fff6e2" ${st}/><path d="M${cx - 14} ${y + 42}L${cx} ${y + 12}L${cx + 14} ${y + 42}Z" fill="${c}" ${st}/>`;
const wheel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${Y}" ${st}/><circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="#fff6e2" ${st}/><path d="${ray(cx, cy, r * 0.3, r, 8)}" fill="none" ${st}/>`;
const ground = `<path d="M10 118H90" ${st} fill="none"/>`;

export const ART = [
  `${sun(50, 36, 12)}<path d="M30 118C40 98 56 104 70 84" fill="none" ${st}/>${person(34, 62, R)}${ground}`,
  `<path d="M28 34C28 22 42 22 50 34C58 46 72 46 72 34C72 22 58 22 50 34C42 46 28 46 28 34Z" fill="none" ${st}/>${person(50, 54, R)}<path d="M22 100L78 72" ${st} fill="none"/>${ground}`,
  `<path d="M24 24V112M76 24V112" ${st} fill="none"/><path d="M34 14H66" ${st} fill="none"/>${crescent(50, 52, 18)}<circle cx="50" cy="92" r="12" fill="#fff6e2" ${st}/>`,
  `<path d="M50 44C28 24 20 54 50 84C80 54 72 24 50 44Z" fill="${R}" ${st}/>${star(50, 22, 9)}${ground}`,
  `<rect x="26" y="34" width="48" height="52" fill="${Y}" ${st}/><path d="M26 34L50 16L74 34" fill="${R}" ${st}/><circle cx="50" cy="60" r="9" fill="#fff6e2" ${st}/>${ground}`,
  `<path d="M50 14V112M32 36H68M38 60H62" ${st} fill="none"/><circle cx="50" cy="82" r="8" fill="${Y}" ${st}/>${ground}`,
  `<circle cx="38" cy="62" r="22" fill="${R}" fill-opacity=".85" ${st}/><circle cx="62" cy="62" r="22" fill="${Y}" fill-opacity=".85" ${st}/>${star(50, 24, 8)}`,
  `${wheel(32, 96, 14)}${wheel(68, 96, 14)}<path d="M26 88H74V58H26Z" fill="${R}" ${st}/>${star(50, 32, 11)}`,
  `<path d="M30 40C30 20 50 28 50 40C50 52 70 60 70 40" fill="none" ${st}/><circle cx="50" cy="96" r="18" fill="${Y}" ${st}/><path d="M38 96C44 84 56 84 62 96" fill="none" ${st}/>`,
  `<path d="M50 14L56 40L50 34L44 40Z" fill="${Y}" ${st}/>${person(50, 54, "#6a4aa8")}<circle cx="68" cy="78" r="7" fill="${Y}" ${st}/>${ground}`,
  `${wheel(50, 66, 34)}<path d="M50 22V10M50 110V122" ${st} fill="none"/>`,
  `<path d="M50 14V108M24 36H76" ${st} fill="none"/><path d="M24 36L16 68H32ZM76 36L68 68H84Z" fill="${Y}" ${st}/>${ground}`,
  `<path d="M24 22H76" ${st} fill="none"/><path d="M42 22L42 62M58 22L58 62" ${st} fill="none"/><circle cx="50" cy="84" r="9" fill="#fff6e2" ${st}/><path d="M44 62H56L50 94Z" fill="${R}" ${st}/>`,
  `<path d="M34 26C70 30 74 74 44 110" fill="none" ${st}/><path d="M34 26C20 36 30 52 42 46" fill="${Y}" ${st}/><circle cx="44" cy="110" r="5" fill="${R}" ${st}/>`,
  `${cup(34, 38)}${cup(66, 80)}<path d="M40 54C60 62 44 72 60 74" fill="none" ${st}/>`,
  `<path d="M50 16L60 46H90L66 64L76 94L50 76L24 94L34 64L10 46H40Z" fill="${R}" ${st}/><circle cx="50" cy="56" r="8" fill="#fff6e2" ${st}/>`,
  `<path d="M30 112V50H70V112Z" fill="${Y}" ${st}/><path d="M26 50H74L66 24H34Z" fill="${R}" ${st}/><path d="M56 6L44 34H54L46 56" fill="none" ${st}/>`,
  `${star(50, 56, 30)}${star(24, 22, 8)}${star(78, 26, 8)}${star(80, 100, 8)}`,
  `${crescent(50, 46, 24)}<path d="M18 112L38 86L50 100L66 82L84 112Z" fill="${R}" ${st}/>`,
  `${sun(50, 56, 22)}<path d="M26 118C30 104 70 104 74 118" fill="none" ${st}/>`,
  `<path d="M32 28L50 16L68 28V44L50 56L32 44Z" fill="${Y}" ${st}/><path d="M50 56V86M30 92H70M36 104H64" ${st} fill="none"/>`,
  `<ellipse cx="50" cy="66" rx="30" ry="40" fill="none" ${st}/><circle cx="50" cy="66" r="12" fill="${Y}" ${st}/><circle cx="50" cy="20" r="4" fill="${R}"/><circle cx="50" cy="112" r="4" fill="${R}"/><circle cx="20" cy="66" r="4" fill="${R}"/><circle cx="80" cy="66" r="4" fill="${R}"/>`,
];

export const cardSvg = (i) => `<svg viewBox="0 0 100 140" aria-hidden="true">${ART[i]}</svg>`;

// Draws n different cards using the browser's secure random numbers.
export function drawThree(n = 3) {
  const deck = CARDS.map((_, i) => i);
  const buf = new Uint32Array(deck.length * 2);
  crypto.getRandomValues(buf);
  for (let i = deck.length - 1; i > 0; i--) { const j = buf[i] % (i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck.slice(0, n).map((id, k) => ({ id, reversed: buf[deck.length + k] % 4 === 0 }));
}

export function cardText(id, reversed, lang) {
  const c = CARDS[id];
  const li = lang === "hi" ? 1 : lang === "hn" ? 2 : 0;
  const body = (reversed ? c.rv : c.up)[li];
  const name = lang === "hi" ? c.hi : lang === "hn" ? c.hn : c.n;
  return { name, body, numeral: ROMAN[id] };
}
