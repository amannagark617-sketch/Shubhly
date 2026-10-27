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

// ---- drawn art: gold line work on midnight, a little crimson and violet ----
const G = "#d4a64a", L = "#ecdcb0", R = "#7e1626", V = "#3d2b78", N = "#1a2760", K = "#0b0b24";
const S = `stroke="${G}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"`;
const f = (n) => Number(n.toFixed(1));
const ray = (cx, cy, r1, r2, n, off = 0) => Array.from({ length: n }, (_, i) => { const a = off + (i / n) * Math.PI * 2; return `M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}L${f(cx + Math.cos(a) * r2)} ${f(cy + Math.sin(a) * r2)}`; }).join("");
const wavy = (cx, cy, r1, r2, n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const m = a + Math.PI / n / 2; return `M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}Q${f(cx + Math.cos(m) * (r2 + 3))} ${f(cy + Math.sin(m) * (r2 + 3))} ${f(cx + Math.cos(a + Math.PI / n) * r1)} ${f(cy + Math.sin(a + Math.PI / n) * r1)}`; }).join("");
const star = (cx, cy, r, n = 8, inner = 0.4) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n; const rr = i % 2 ? r * inner : r; d += (i ? "L" : "M") + f(cx + Math.cos(a) * rr) + " " + f(cy + Math.sin(a) * rr); } return `<path d="${d}Z" fill="${G}" fill-opacity=".9" ${S}/>`; };
const glow = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${G}" fill-opacity=".1"/><circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="${G}" fill-opacity=".08"/>`;
const sun = (cx, cy, r, face = true) => `<path d="${wavy(cx, cy, r + 1.5, r + 6, 12)}${ray(cx, cy, r + 3, r + 10, 12, Math.PI / 12)}" fill="none" ${S}/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${G}" ${S}/>${face ? `<path d="M${cx - r * 0.5} ${cy - r * 0.15}q${r * 0.2} -${r * 0.25} ${r * 0.4} 0M${cx + r * 0.1} ${cy - r * 0.15}q${r * 0.2} -${r * 0.25} ${r * 0.4} 0M${cx} ${cy - r * 0.05}v${r * 0.35}M${cx - r * 0.3} ${cy + r * 0.5}q${r * 0.3} ${r * 0.25} ${r * 0.6} 0" fill="none" stroke="${K}" stroke-width=".9" stroke-linecap="round"/>` : ""}`;
const moon = (cx, cy, r, fill = L) => `<path d="M${cx + r * 0.2} ${cy - r}A${r} ${r} 0 1 0 ${cx + r * 0.2} ${cy + r}A${r * 0.78} ${r * 0.78} 0 1 1 ${cx + r * 0.2} ${cy - r}Z" fill="${fill}" ${S}/>`;
const head = (cx, cy, r = 3.6, fill = L) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S}/>`;
const robe = (cx, y, w, h, fill = R) => `<path d="M${cx - w * 0.3} ${y}L${cx + w * 0.3} ${y}L${cx + w / 2} ${y + h}L${cx - w / 2} ${y + h}Z" fill="${fill}" ${S}/>`;
const dot = (x, y, r = 1, fill = G) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const mount = (pts, fill = N) => `<polygon points="${pts}" fill="${fill}" ${S}/>`;
const eye = (cx, cy, w) => `<path d="M${cx - w} ${cy}Q${cx} ${cy - w * 0.7} ${cx + w} ${cy}Q${cx} ${cy + w * 0.7} ${cx - w} ${cy}Z" fill="${K}" ${S}/><circle cx="${cx}" cy="${cy}" r="${w * 0.32}" fill="${G}"/>`;
const pillar = (x, fill) => `<rect x="${x}" y="30" width="9" height="82" fill="${fill}" ${S}/><path d="M${x - 2} 30h13M${x - 2} 112h13" fill="none" ${S}/>`;
const wing = (cx, cy, dir, h = 22) => `<path d="M${cx} ${cy}C${cx + dir * 14} ${cy - h * 0.9} ${cx + dir * 26} ${cy - h * 0.4} ${cx + dir * 24} ${cy + 4}C${cx + dir * 18} ${cy + 2} ${cx + dir * 10} ${cy + 6} ${cx} ${cy + 8}Z" fill="${V}" ${S}/>`;
const cup = (cx, cy, k = 1) => `<path d="M${cx - 4 * k} ${cy - 4 * k}h${8 * k}c0 5 -${2 * k} 7 -${4 * k} 7s-${4 * k} -2 -${4 * k} -7zM${cx} ${cy + 3 * k}v${4 * k}M${cx - 2.5 * k} ${cy + 7 * k}h${5 * k}" fill="${G}" fill-opacity=".85" ${S}/>`;
const sparkle = (x, y, r = 2) => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${G}" stroke="none"/>`;
const sky = (n = 6) => [[20, 30], [78, 28], [86, 48], [14, 56], [28, 24], [70, 22]].slice(0, n).map(([x, y]) => sparkle(x, y, 1.6)).join("");

export const ART = [
  /* 0 The Fool */ `${glow(50, 62, 38)}${sun(74, 36, 6.5, false)}${mount("6,116 24,88 36,102 54,80 72,104 82,94 94,116", N)}<path d="M6 102H46L42 116H6Z" fill="${V}" ${S}/><path d="M34 62q3-7 9-5" fill="none" ${S}/>${head(34, 66, 4)}${robe(34, 72, 18, 26, R)}<path d="M30 78l2 3M36 83l3-2M33 90l2 3" ${S}/><path d="M40 76L60 60" ${S}/><circle cx="61" cy="58" r="5" fill="${V}" ${S}/><path d="M30 98l-3 6M38 98l3 5" ${S}/>${dot(30, 82, 1.2, L)}<ellipse cx="16" cy="97" rx="5" ry="3" fill="${L}" ${S}/>${head(22, 93, 2.6)}`,
  /* 1 The Magician */ `${glow(50, 60, 36)}<path d="M38 28c-6-6-12 2-6 6s12 2 18-6 12-10 18-6-6 12-12 6-12-2-18-6z" fill="none" ${S}/>${head(50, 40, 4)}${robe(50, 46, 24, 40, R)}<path d="M50 52L68 36M50 54L36 70" ${S}/><path d="M66 31l7 7" stroke="${L}" stroke-width="1.6" stroke-linecap="round"/>${dot(70, 34, 1.5)}<rect x="20" y="86" width="60" height="6" fill="${V}" ${S}/><path d="M26 92v18M74 92v18" ${S}/>${cup(30, 82, 0.8)}<path d="M42 78v8M41 80h2M50 76l5 8M50 84l5-8" ${S}/><circle cx="64" cy="81" r="3.6" fill="${G}" fill-opacity=".85" ${S}/>${dot(22, 112, 2, R)}${dot(34, 112, 2, L)}${dot(66, 112, 2, L)}${dot(78, 112, 2, R)}`,
  /* 2 High Priestess */ `${pillar(14, K)}${pillar(77, L)}<path d="M23 30H77V112H23Z" fill="${V}" fill-opacity=".55" ${S}/>${dot(34, 44, 2.2, R)}${dot(66, 44, 2.2, R)}${dot(42, 36, 2.2, R)}${dot(58, 36, 2.2, R)}${moon(50, 38, 8)}${head(50, 50, 3.6)}<path d="M44 48q6-9 12 0M40 40h20" fill="none" ${S}/>${robe(50, 56, 28, 50, N)}<path d="M50 58V104" ${S}/>${moon(50, 106, 5, G)}<path d="M44 70h12v8H44z" fill="${L}" ${S}/>`,
  /* 3 The Empress */ `${glow(50, 60, 38)}${Array.from({ length: 9 }, (_, i) => sparkle(f(50 + Math.cos(-Math.PI * 0.95 + (i / 8) * Math.PI * 0.9) * 13), f(40 + Math.sin(-Math.PI * 0.95 + (i / 8) * Math.PI * 0.9) * 13), 1.5)).join("")}${head(50, 42, 4.2)}${robe(50, 48, 34, 52, R)}<path d="M50 60c-9-8-10 4 0 10c10-6 9-18 0-10z" fill="${G}" fill-opacity=".85" ${S}/><path d="M50 76v10M46 82h8" ${S}/><path d="M14 112c4-8 4-14 0-22M22 112c4-8 4-14 0-22M86 112c-4-8-4-14 0-22M78 112c-4-8-4-14 0-22" fill="none" ${S}/>${star(78, 34, 5, 6, 0.5)}`,
  /* 4 The Emperor */ `<rect x="14" y="30" width="72" height="84" fill="${N}" ${S}/><path d="M22 110L34 78l10 14 12-20 12 16 8-10 10 32z" fill="${R}" fill-opacity=".7" ${S}/><rect x="30" y="60" width="40" height="52" fill="${V}" ${S}/>${head(50, 48, 4)}<path d="M45 44h10l-1-5h-8z" fill="${G}" ${S}/>${robe(50, 54, 26, 40, R)}<circle cx="68" cy="68" r="4" fill="${G}" ${S}/><path d="M68 72v18M64 80h8" ${S}/><path d="M32 74q-6-6-2-12q6 0 6 8M68 74q6-6 2-12q-6 0-6 8" fill="${G}" fill-opacity=".8" ${S}/>${glow(50, 62, 40)}`,
  /* 5 The Hierophant */ `${pillar(15, N)}${pillar(76, N)}<path d="M38 24h24M40 20h20M42 16h16" ${S}/>${head(50, 40, 4)}<path d="M43 36h14l-2-8h-10z" fill="${G}" ${S}/>${robe(50, 46, 34, 48, R)}<path d="M50 50v40M42 60h16" stroke="${L}" stroke-width=".8"/><path d="M66 30v44M62 36h8M63 41h6M64 46h4" ${S}/><path d="M50 56l12-8" ${S}/>${head(34, 102, 3)}${head(66, 102, 3)}<path d="M30 106h8M62 106h8" ${S}/><path d="M42 112l16-8M58 112L42 104" ${S}/>${dot(44, 113, 1.6)}${dot(56, 113, 1.6)}`,
  /* 6 The Lovers */ `${glow(50, 52, 38)}${sun(50, 26, 6, false)}${wing(44, 44, -1, 24)}${wing(56, 44, 1, 24)}${head(50, 40, 4)}${robe(50, 45, 22, 20, R)}${mount("14,116 30,82 46,100 54,92 68,84 88,116", N)}${head(30, 78, 3.4)}${robe(30, 83, 14, 30, V)}${head(70, 78, 3.4)}${robe(70, 83, 14, 30, R)}<path d="M42 44l-10 30M58 44l10 30" ${S}/><path d="M12 112V86m0 0c-6-4-4-10 0-10s6 6 0 10zM88 112V86" fill="none" ${S}/><path d="M88 86c8-6 6-14-2-14s-8 8 2 14z" fill="${R}" ${S}/>${dot(86, 78, 1.2, L)}`,
  /* 7 The Chariot */ `${glow(50, 56, 36)}<path d="M20 30h60l-6 8H26z" fill="${N}" ${S}/>${star(30, 34, 2.4, 5)}${star(50, 34, 2.4, 5)}${star(70, 34, 2.4, 5)}<path d="M26 38v26M74 38v26" ${S}/>${head(50, 52, 4)}<path d="M45 50l-4-4h18l-4 4" fill="${G}" ${S}/>${robe(50, 58, 30, 22, L)}${moon(38, 62, 4, G)}${moon(62, 62, 4, G)}<rect x="28" y="78" width="44" height="22" fill="${R}" ${S}/><path d="M50 82l-6 6h12z" fill="${G}" ${S}/><circle cx="50" cy="92" r="3" fill="${G}" ${S}/>${mount("10,118 20,106 34,106 34,118", K)}<circle cx="30" cy="110" r="6" fill="${K}" ${S}/><circle cx="70" cy="110" r="6" fill="${L}" ${S}/><path d="M24 112h16M60 112h16" ${S}/>`,
  /* 8 Strength */ `${glow(50, 60, 38)}<path d="M40 30c-8-6-16 2-8 6s12 2 18-6 12-10 18-6-6 12-12 6-12-2-16-6z" fill="none" ${S}/>${head(50, 44, 4)}${robe(50, 50, 28, 44, L)}<path d="M44 60q-12 10-4 22M56 60q10 12 4 22" fill="none" ${S}/><path d="M26 100c0-14 12-20 24-18s26 6 26 18v10H26z" fill="${G}" fill-opacity=".85" ${S}/><circle cx="40" cy="88" r="10" fill="${G}" ${S}/><path d="M32 82l4 4M48 82l-4 4M36 92h8" stroke="${K}" stroke-width=".9" fill="none" stroke-linecap="round"/>${mount("6,116 22,96 34,108", N)}${dot(76, 96, 2, R)}${dot(84, 104, 2, L)}`,
  /* 9 The Hermit */ `${sky(6)}${mount("6,118 28,92 40,104 56,76 72,100 94,118", L)}<path d="M54 82l4-6 6 8" fill="${L}" ${S}/>${head(46, 62, 3.8)}<path d="M40 60q6-7 12 0" fill="none" ${S}/>${robe(46, 66, 24, 32, V)}<path d="M52 72L64 54" ${S}/><rect x="62" y="40" width="10" height="14" fill="${G}" fill-opacity=".25" ${S}/>${star(67, 47, 3.6, 6, 0.5)}<path d="M64 38h6M66 36h2" ${S}/><path d="M36 74L30 112" ${S}/>`,
  /* 10 Wheel of Fortune */ `${glow(50, 66, 40)}<circle cx="50" cy="68" r="28" fill="${V}" fill-opacity=".6" ${S}/><circle cx="50" cy="68" r="19" fill="none" ${S}/><circle cx="50" cy="68" r="6" fill="${G}" ${S}/><path d="${ray(50, 68, 6, 28, 8)}" ${S}/><path d="${ray(50, 68, 19, 28, 8, Math.PI / 8)}" ${S} stroke-dasharray="1 2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => dot(f(50 + Math.cos((i * Math.PI) / 4) * 23.5), f(68 + Math.sin((i * Math.PI) / 4) * 23.5), 1.5)).join("")}<path d="M42 38l8-10 8 10z" fill="${L}" ${S}/>${head(50, 26, 3)}<path d="M22 54c-8 6-8 14 0 20c8 6 0 14-4 18" fill="none" stroke="${R}" stroke-width="2"/><path d="M80 64l6-10v22z" fill="${K}" ${S}/>${star(14, 26, 4, 4, 0.5)}${star(86, 26, 4, 4, 0.5)}${star(14, 112, 4, 4, 0.5)}${star(86, 112, 4, 4, 0.5)}`,
  /* 11 Justice */ `${pillar(14, K)}${pillar(77, K)}<path d="M23 30H77V112H23Z" fill="${V}" fill-opacity=".5" ${S}/>${head(50, 42, 4)}<path d="M45 38h10l-1-6h-8z" fill="${G}" ${S}/>${robe(50, 48, 30, 50, R)}<path d="M64 24v36M60 28h8" ${S}/><path d="M64 60l-4 6h8z" fill="${G}" ${S}/><path d="M26 68h24M30 68l-4 12h8zM46 68l-4 12h8z" fill="${G}" fill-opacity=".8" ${S}/><path d="M36 54v14" ${S}/>${dot(50, 70, 2, G)}`,
  /* 12 The Hanged Man */ `${glow(50, 70, 36)}<path d="M18 28H82M18 28v6M82 28v6" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round"/><path d="M50 28V40" ${S}/><circle cx="50" cy="86" r="9" fill="none" stroke="${G}" stroke-width=".6" stroke-dasharray="1 1.5"/>${head(50, 86, 4)}${robe(50, 72, 20, 12, N).replace(`M${50 - 6} 72L${50 + 6} 72L${50 + 10} 84L${50 - 10} 84Z`, "M44 72L56 72L60 60L40 60Z")}<path d="M44 60L40 40M56 60l4-20" ${S}/><path d="M40 40h20" ${S}/><path d="M44 60L38 50M56 60l6-10" stroke="${R}" stroke-width="2.4" stroke-linecap="round"/>${sparkle(30, 90, 2)}${sparkle(72, 96, 2)}`,
  /* 13 Death */ `${mount("4,118 18,96 30,118", N)}${mount("70,118 82,96 96,118", N)}${sun(50, 100, 8, false)}<path d="M6 118H94" ${S}/><path d="M50 30v54" ${S}/><path d="M50 30h30v18H50z" fill="${K}" ${S}/><circle cx="65" cy="39" r="4.2" fill="${L}" ${S}/>${dot(65, 39, 1.3, R)}<circle cx="38" cy="52" r="7" fill="${L}" ${S}/><path d="M34 51h3M39 51h3M36 57h4" stroke="${K}" stroke-width="1.2"/><path d="M38 59v22M30 66h16M31 72h14M32 78h12" ${S}/><path d="M24 90l12-6 12 6M26 96h24" ${S}/><path d="M22 100h26" ${S}/>${sparkle(24, 40, 2)}${sparkle(78, 66, 2)}`,
  /* 14 Temperance */ `${glow(50, 56, 38)}${wing(44, 52, -1, 26)}${wing(56, 52, 1, 26)}${head(50, 42, 4)}<path d="M47 36l3-5 3 5z" fill="${G}" ${S}/>${robe(50, 48, 18, 38, L)}<path d="M50 56l-4 6h8z" fill="${G}" ${S}/><path d="M60 60l12-6M40 62l-12 2" ${S}/>${cup(74, 52, 0.9)}${cup(26, 66, 0.9)}<path d="M72 60q-6 12-22 14T28 74" fill="none" stroke="${L}" stroke-width="1" stroke-dasharray="2 1.5"/>${mount("6,118 22,98 44,118", N)}<path d="M44 106c6-2 12-2 18 0s14 2 32 0v12H44z" fill="${N}" ${S}/><path d="M56 112q4-2 8 0M70 112q4-2 8 0" ${S}/><path d="M70 92v-12l10 12" fill="none" ${S}/>`,
  /* 15 The Devil */ `${glow(50, 52, 36)}<path d="M26 28c-10 4-14 14-6 20M74 28c10 4 14 14 6 20" fill="none" stroke="${G}" stroke-width="2" stroke-linecap="round"/><path d="M30 60C18 52 14 40 22 34c8 8 16 16 20 24zM70 60c12-8 16-20 8-26-8 8-16 16-20 24z" fill="${V}" ${S}/><circle cx="50" cy="48" r="11" fill="${R}" ${S}/>${eye(45, 45, 3.4)}${eye(55, 45, 3.4)}<path d="M44 55q6 6 12 0" fill="none" ${S}/><path d="M50 34l-4 8h8z" fill="none" stroke="${G}" stroke-width="1"/>${star(50, 28, 3.6, 5, 0.4)}<path d="M44 60h12l4 26H40z" fill="${V}" ${S}/><path d="M66 60l6-14" ${S}/>${dot(72, 44, 2.6, R)}<rect x="30" y="86" width="40" height="12" fill="${K}" ${S}/><path d="M36 98v8M64 98v8" ${S}/>${head(32, 108, 2.8)}${head(68, 108, 2.8)}<path d="M28 106l-3-4M72 106l3-4M34 110l8-12M66 110l-8-12" ${S}/>`,
  /* 16 The Tower */ `${sky(5)}<rect x="38" y="52" width="24" height="62" fill="${N}" ${S}/><path d="M34 52h32l-3-8H37z" fill="${K}" ${S}/><rect x="46" y="64" width="8" height="10" fill="${R}" ${S}/><rect x="46" y="86" width="8" height="10" fill="${R}" ${S}/><path d="M42 44l4-14 8 8-4-12 8 6" fill="none" ${S}/><path d="M56 22L44 46h8L46 70" fill="none" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/><path d="M48 62c-4-8 2-8 0-16M52 84c-6-8 4-10 0-18" fill="none" stroke="${R}" stroke-width="1.6"/>${mount("6,118 24,108 40,114 60,106 94,118", V)}<path d="M26 46l6 8M74 30l-6 10" ${S}/>${head(24, 62, 3)}${head(76, 84, 3)}<path d="M24 66l4 10M76 88l-6 10" ${S}/>${dot(20, 40, 1.1)}${dot(80, 52, 1.1)}${dot(28, 90, 1.1)}${dot(72, 62, 1.1)}`,
  /* 17 The Star */ `${glow(50, 44, 34)}${star(50, 40, 17, 8, 0.38)}${star(22, 26, 5, 8)}${star(78, 26, 5, 8)}${star(14, 52, 4.4, 8)}${star(86, 52, 4.4, 8)}${star(26, 64, 4, 8)}${star(74, 64, 4, 8)}${head(50, 82, 3.6)}<path d="M50 86L40 106l12-4 12 4z" fill="${R}" fill-opacity=".85" ${S}/><path d="M46 90l-12 8M54 90l12 8" ${S}/>${cup(32, 100, 0.8)}${cup(68, 100, 0.8)}<path d="M26 108q-4 8 0 10M74 108q4 8 0 10" fill="none" stroke="${L}" stroke-width=".8"/><path d="M8 116c14-4 26 0 42-2s30 2 42 2" fill="none" ${S}/>`,
  /* 18 The Moon */ `${glow(50, 38, 32)}<circle cx="50" cy="38" r="18" fill="${L}" fill-opacity=".92" ${S}/><path d="M50 22a16 16 0 0 0 0 32a9 16 0 0 1 0-32z" fill="${V}" fill-opacity=".8"/>${eye(50, 38, 7)}<path d="M22 22l-3 6M30 16l0 7M70 16v7M78 22l3 6" ${S}/><path d="M26 58l2 4M72 56l2 4M50 62l1 4" stroke="${G}" stroke-width="1.6" stroke-linecap="round"/><rect x="12" y="62" width="14" height="38" fill="${N}" ${S}/><rect x="74" y="62" width="14" height="38" fill="${N}" ${S}/><path d="M10 62h18v-6H10zM72 62h18v-6H72z" fill="${K}" ${S}/><path d="M50 114c-10-6 6-14-2-20c-8-6 8-12 4-18" fill="none" stroke="${G}" stroke-width="3"/><path d="M50 114c-10-6 6-14-2-20c-8-6 8-12 4-18" fill="none" stroke="${K}" stroke-width="1"/><path d="M32 92l6-6 6 4-2 6zM68 92l-6-6-6 4 2 6z" fill="${K}" ${S}/><path d="M40 118c4-6 8-6 12 0s8 6 12 0" fill="none" ${S}/>`,
  /* 19 The Sun */ `${glow(50, 44, 40)}${sun(50, 44, 15, true)}<rect x="6" y="88" width="88" height="26" fill="${N}" ${S}/><path d="M6 98h88M6 106h88" stroke="${G}" stroke-opacity=".4" stroke-width=".6"/>${[16, 36, 64, 84].map((x) => `<path d="M${x} 88V72" ${S}/><circle cx="${x}" cy="70" r="4.2" fill="${G}" ${S}/><circle cx="${x}" cy="70" r="1.6" fill="${K}"/>`).join("")}${head(50, 76, 3.4)}<path d="M44 94c-2-8 2-14 6-14s8 6 6 14z" fill="${L}" ${S}/><path d="M56 78l12-6v8z" fill="${R}" ${S}/>`,
  /* 20 Judgement */ `${glow(50, 42, 34)}<path d="M14 40c8-6 16-6 22 0s16 6 22 0 16-6 28 0v10H14z" fill="${V}" fill-opacity=".7" ${S}/>${wing(42, 30, -1, 24)}${wing(58, 30, 1, 24)}${head(50, 28, 4)}${robe(50, 34, 16, 18, L)}<path d="M58 36l22-10v8l-22 6zM80 26l8-2v8l-8 2z" fill="${G}" ${S}/><path d="M64 34l16 4" stroke="${R}" stroke-width="2"/>${mount("6,118 22,92 36,106 52,86 70,104 94,118", N)}<rect x="12" y="102" width="22" height="9" fill="${K}" ${S}/><rect x="40" y="104" width="22" height="9" fill="${K}" ${S}/><rect x="68" y="102" width="22" height="9" fill="${K}" ${S}/>${head(23, 92, 3)}${head(51, 94, 3)}${head(79, 92, 3)}<path d="M23 96v6M51 98v6M79 96v6M17 98l6-3 6 3M45 100l6-3 6 3M73 98l6-3 6 3" ${S}/>`,
  /* 21 The World */ `${glow(50, 68, 40)}<ellipse cx="50" cy="68" rx="25" ry="38" fill="none" stroke="${G}" stroke-width="2"/><ellipse cx="50" cy="68" rx="21" ry="34" fill="none" ${S} stroke-dasharray="1.4 2"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${f(50 - 24 * Math.cos(i * 0.4 + 0.1))} ${f(68 - 36 * Math.sin(i * 0.4 + 0.1) + 6)}l-3-2l2 4" fill="${G}" stroke="none"/>`).join("")}<path d="M50 28c-2 6-2 10 0 12" ${S}/>${head(50, 52, 3.6)}<path d="M44 58q-4 10 0 20q6 8 12 0q4-10 0-20z" fill="${L}" fill-opacity=".9" ${S}/><path d="M42 62c-10-6-18 2-22 8M58 62c10-6 18-2 22 4" fill="none" stroke="${R}" stroke-width="2.4"/><path d="M36 70l-8-8M64 70l8-8" ${S}/><path d="M44 80l-6 10M56 80l6 10" ${S}/><circle cx="14" cy="22" r="4.4" fill="${V}" ${S}/><circle cx="86" cy="22" r="4.4" fill="${N}" ${S}/><circle cx="14" cy="114" r="4.4" fill="${R}" ${S}/><circle cx="86" cy="114" r="4.4" fill="${K}" ${S}/>`,
];

// Card frame: a double gold border with small corner stars, drawn once for every card.
const FRAME = `<rect x="2.5" y="2.5" width="95" height="135" rx="6" fill="none" stroke="${G}" stroke-width="0.9"/><rect x="6" y="6" width="88" height="128" rx="3" fill="none" stroke="${G}" stroke-opacity=".55" stroke-width="0.5"/><path d="M6 22H94M6 118H94" stroke="${G}" stroke-opacity=".45" stroke-width="0.5"/>${[[6, 6], [94, 6], [6, 134], [94, 134]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${K}" stroke="${G}" stroke-width=".6"/>`).join("")}`;

export const cardSvg = (i) => `<svg viewBox="0 0 100 140" aria-hidden="true">${FRAME}<g transform="translate(0 4)"><g class="art">${ART[i]}</g></g></svg>`;

// The back of every card: a moon and sun inside a field of stars and sacred geometry.
export const backSvg = `<svg viewBox="0 0 100 140" aria-hidden="true">
  <rect x="2.5" y="2.5" width="95" height="135" rx="6" fill="none" stroke="${G}" stroke-width="0.9"/>
  <rect x="7" y="7" width="86" height="126" rx="3" fill="none" stroke="${G}" stroke-opacity=".6" stroke-width="0.5"/>
  ${[[7, 7], [93, 7], [7, 133], [93, 133]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${K}" stroke="${G}" stroke-width=".6"/>`).join("")}
  <g fill="none" stroke="${G}" stroke-width="0.6" stroke-opacity=".85">
    <circle cx="50" cy="70" r="34"/><circle cx="50" cy="70" r="27"/><circle cx="50" cy="70" r="20"/>
    <path d="${ray(50, 70, 20, 34, 24)}"/>
    <path d="M50 36L79.4 87L20.6 87Z"/><path d="M50 104L20.6 53L79.4 53Z"/>
  </g>
  <circle cx="50" cy="70" r="12" fill="${G}" fill-opacity=".18" stroke="${G}" stroke-width="0.8"/>
  <path d="M50 58a12 12 0 0 1 0 24a7 12 0 0 0 0-24z" fill="${G}"/>
  <path d="M33 22q17-9 34 0M33 118q17 9 34 0" fill="none" stroke="${G}" stroke-width=".7"/>
  ${moon(50, 20, 5, G)}${moon(50, 120, 5, G)}
  ${[[16, 20], [84, 20], [16, 120], [84, 120], [14, 70], [86, 70], [30, 34], [70, 34], [30, 106], [70, 106]].map(([x, y]) => sparkle(x, y, 2)).join("")}
</svg>`;

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
