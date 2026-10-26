// The free life reading: strengths, where to grow, the road ahead.
// Written as tendencies. Calm, honest, no fear, no promises.

import { SIGNS } from "./astro-data.js";
import { getContent } from "./content.js";

// Per sign: two strengths and one thing to grow, in English, Hindi and Hinglish.
export const SIGN_TEXT = {
  en: [
    { s: ["Brave and quick to start things", "Honest and direct, so people know where they stand with you"], g: "Slow down before reacting; a little patience saves a lot of energy" },
    { s: ["Steady and dependable, you finish what you start", "You build comfort and security around you"], g: "Learn to adapt faster when plans change" },
    { s: ["A quick mind and a gift for talking", "Curious, you pick up new things easily"], g: "Pick one thing and see it through before the next idea" },
    { s: ["Caring and deeply loyal", "Strong intuition about people"], g: "Do not carry every mood home with you; set gentle boundaries" },
    { s: ["Warm, generous and a natural leader", "People feel your confidence"], g: "Listen as much as you lead; praise is not the only fuel" },
    { s: ["Careful, practical and reliable", "You notice details others miss"], g: "Go easy on yourself; good enough is often good" },
    { s: ["Fair-minded, charming and a natural peacemaker", "A good sense of taste and balance"], g: "Decide sooner; waiting for everyone to agree can cost you chances" },
    { s: ["Intense focus and strong willpower", "Loyal, and hard to fool"], g: "Let go of old hurts; trusting a little more will lighten you" },
    { s: ["Optimistic, honest and in love with freedom", "A big-picture thinker who inspires others"], g: "Watch promises made in excitement; follow through on small things" },
    { s: ["Disciplined and patient, you build things that last", "Responsible, so others rely on you"], g: "Make room for rest and joy, not only duty" },
    { s: ["An original thinker and a loyal friend", "You care about fairness and the bigger group"], g: "Let close people in; stay warm when someone needs you near" },
    { s: ["Gentle, creative and deeply empathetic", "Imagination and spiritual depth"], g: "Keep your feet on the ground; make plans and finish them" },
  ],
  hi: [
    { s: ["बहादुर और शुरुआत करने में तेज़", "सच्चे और सीधे, इसलिए लोग आपके साथ साफ़ रहते हैं"], g: "प्रतिक्रिया देने से पहले रुकिए; थोड़ा धैर्य बहुत ऊर्जा बचाता है" },
    { s: ["स्थिर और भरोसेमंद, जो शुरू करते हैं पूरा करते हैं", "आप अपने आसपास आराम और सुरक्षा बनाते हैं"], g: "योजना बदलने पर जल्दी ढलना सीखिए" },
    { s: ["तेज़ दिमाग और बात करने की कला", "जिज्ञासु, नई चीज़ें आसानी से सीखते हैं"], g: "अगला विचार पकड़ने से पहले एक काम पूरा कीजिए" },
    { s: ["परवाह करने वाले और बेहद वफ़ादार", "लोगों के बारे में मज़बूत अंतर्ज्ञान"], g: "हर मूड घर न ले जाएँ; नरमी से सीमाएँ बनाइए" },
    { s: ["गर्मजोशी भरे, उदार और स्वाभाविक नेता", "लोग आपका आत्मविश्वास महसूस करते हैं"], g: "जितना नेतृत्व करें उतना सुनें भी; तारीफ़ ही अकेला ईंधन नहीं है" },
    { s: ["सावधान, व्यावहारिक और भरोसेमंद", "आप वे बारीकियाँ देखते हैं जो दूसरे चूक जाते हैं"], g: "खुद पर नरम रहिए; काफ़ी अच्छा अक्सर अच्छा ही होता है" },
    { s: ["निष्पक्ष, आकर्षक और स्वाभाविक शांतिदूत", "अच्छी पसंद और संतुलन की समझ"], g: "जल्दी फ़ैसला कीजिए; सबकी सहमति का इंतज़ार मौके छीन सकता है" },
    { s: ["गहरा ध्यान और मज़बूत इच्छाशक्ति", "वफ़ादार, और आपको बहकाना मुश्किल"], g: "पुरानी चोटें छोड़िए; थोड़ा और भरोसा मन हल्का करेगा" },
    { s: ["आशावादी, सच्चे और आज़ादी पसंद", "बड़ी तस्वीर देखने वाले, दूसरों को प्रेरित करते हैं"], g: "जोश में किए वादों पर ध्यान दीजिए; छोटी बातें भी पूरी कीजिए" },
    { s: ["अनुशासित और धैर्यवान, टिकाऊ चीज़ें बनाते हैं", "ज़िम्मेदार, इसलिए लोग आप पर निर्भर रहते हैं"], g: "सिर्फ़ फ़र्ज़ नहीं, आराम और खुशी के लिए भी जगह बनाइए" },
    { s: ["मौलिक सोच और वफ़ादार दोस्त", "आप न्याय और बड़े समूह की परवाह करते हैं"], g: "करीबी लोगों को पास आने दीजिए; ज़रूरत के समय गर्मजोशी रखिए" },
    { s: ["कोमल, रचनात्मक और गहरी सहानुभूति वाले", "कल्पना और आध्यात्मिक गहराई"], g: "ज़मीन से जुड़े रहिए; योजना बनाइए और उसे पूरा कीजिए" },
  ],
  hn: [
    { s: ["Bahadur aur shuruaat karne mein tez", "Sachche aur seedhe, isliye log aapke saath saaf rehte hain"], g: "Reaction se pehle ruko; thoda sabr bahut energy bachata hai" },
    { s: ["Steady aur bharosemand, jo shuru karte ho poora karte ho", "Aap apne aas-paas aaram aur suraksha banate ho"], g: "Plan badalne par jaldi dhalna seekho" },
    { s: ["Tez dimaag aur baat karne ki kala", "Curious, nayi cheezein aasaani se seekhte ho"], g: "Agla idea pakadne se pehle ek kaam poora karo" },
    { s: ["Parvah karne wale aur behad wafadar", "Logon ke baare mein strong intuition"], g: "Har mood ghar mat le jao; narmi se boundaries banao" },
    { s: ["Garmjoshi bhare, udaar aur natural leader", "Log aapka confidence mehsoos karte hain"], g: "Jitna lead karo utna suno bhi; taareef hi akela fuel nahi hai" },
    { s: ["Savdhan, practical aur bharosemand", "Aap woh baareekiyan dekhte ho jo doosre chook jaate hain"], g: "Khud par narm raho; kaafi achha aksar achha hi hota hai" },
    { s: ["Nishpaksh, attractive aur natural peacemaker", "Achhi pasand aur balance ki samajh"], g: "Jaldi faisla karo; sabki sehmati ka intezaar mauke chheen sakta hai" },
    { s: ["Gehra focus aur strong willpower", "Wafadar, aur aapko behkana mushkil"], g: "Purani chotein chhodo; thoda aur bharosa mann halka karega" },
    { s: ["Optimistic, sachche aur azaadi pasand", "Badi tasveer dekhne wale, doosron ko inspire karte ho"], g: "Josh mein kiye vaadon par dhyan do; chhoti baatein bhi poori karo" },
    { s: ["Anushasit aur dheeraj wale, tikaau cheezein banate ho", "Zimmedaar, isliye log aap par nirbhar rehte hain"], g: "Sirf farz nahi, aaram aur khushi ke liye bhi jagah banao" },
    { s: ["Original soch aur wafadar dost", "Aap nyay aur bade samooh ki parvah karte ho"], g: "Kareebi logon ko paas aane do; zaroorat ke samay garmjoshi rakho" },
    { s: ["Komal, creative aur gehri sahanubhuti wale", "Kalpana aur aadhyatmik gehraai"], g: "Zameen se jude raho; plan banao aur use poora karo" },
  ],
};

// What each planet's long period (mahadasha) tends to bring, and what to watch.
export const PERIOD_TEXT = {
  en: {
    Sun: { bring: "Confidence, recognition and chances to lead", watch: "Ego clashes, especially with seniors or father figures" },
    Moon: { bring: "Emotional growth, family closeness and care", watch: "Mood swings and overthinking; protect your sleep" },
    Mars: { bring: "Energy, courage and the drive to achieve", watch: "Anger and haste; channel it into exercise and work" },
    Mercury: { bring: "Learning, communication, business and new skills", watch: "Scattered focus and nervous tension" },
    Jupiter: { bring: "Growth, wisdom, good guidance and opportunities", watch: "Overconfidence and overspending" },
    Venus: { bring: "Love, comfort, creativity and enjoyment", watch: "Too much indulgence; keep money and habits balanced" },
    Saturn: { bring: "Discipline, steady progress and lasting results", watch: "Delays and heaviness; patience and routine help most" },
    Rahu: { bring: "Big ambitions, change and unusual openings", watch: "Restlessness and shortcuts; stay grounded and honest" },
    Ketu: { bring: "Detachment, insight and spiritual interest", watch: "Feeling disconnected; keep one steady routine" },
  },
  hi: {
    Sun: { bring: "आत्मविश्वास, पहचान और नेतृत्व के मौके", watch: "अहंकार का टकराव, खासकर वरिष्ठों या पिता समान लोगों से" },
    Moon: { bring: "भावनात्मक विकास, परिवार से नज़दीकी और देखभाल", watch: "मूड का उतार-चढ़ाव और ज़्यादा सोचना; नींद का ध्यान रखें" },
    Mars: { bring: "ऊर्जा, साहस और कुछ पाने की चाह", watch: "गुस्सा और जल्दबाज़ी; इसे कसरत और काम में लगाइए" },
    Mercury: { bring: "सीखना, बातचीत, व्यापार और नए हुनर", watch: "बिखरा ध्यान और घबराहट" },
    Jupiter: { bring: "विकास, समझ, अच्छा मार्गदर्शन और अवसर", watch: "ज़्यादा आत्मविश्वास और ज़्यादा खर्च" },
    Venus: { bring: "प्यार, आराम, रचनात्मकता और आनंद", watch: "अति भोग; पैसे और आदतों में संतुलन रखें" },
    Saturn: { bring: "अनुशासन, स्थिर प्रगति और टिकाऊ नतीजे", watch: "देरी और भारीपन; धैर्य और दिनचर्या सबसे मदद करते हैं" },
    Rahu: { bring: "बड़ी महत्वाकांक्षा, बदलाव और अनोखे मौके", watch: "बेचैनी और शॉर्टकट; ज़मीन से जुड़े और ईमानदार रहिए" },
    Ketu: { bring: "विरक्ति, अंतर्दृष्टि और आध्यात्मिक रुचि", watch: "कटाव महसूस होना; एक स्थिर दिनचर्या रखिए" },
  },
  hn: {
    Sun: { bring: "Confidence, pehchaan aur leadership ke mauke", watch: "Ego ka takraav, khaaskar seniors ya pita samaan logon se" },
    Moon: { bring: "Emotional growth, parivaar se nazdeeki aur dekhbhaal", watch: "Mood ke utaar-chadhaav aur zyada sochna; neend ka dhyan rakho" },
    Mars: { bring: "Energy, himmat aur kuch paane ki chaah", watch: "Gussa aur jaldbaazi; ise exercise aur kaam mein lagao" },
    Mercury: { bring: "Seekhna, baat-cheet, business aur naye skills", watch: "Bikhra focus aur ghabrahat" },
    Jupiter: { bring: "Vikas, samajh, achha guidance aur mauke", watch: "Zyada confidence aur zyada kharch" },
    Venus: { bring: "Pyaar, aaram, creativity aur anand", watch: "Atibhog; paise aur aadaton mein balance rakho" },
    Saturn: { bring: "Discipline, steady progress aur tikaau natije", watch: "Deri aur bhaaripan; sabr aur routine sabse madad karte hain" },
    Rahu: { bring: "Badi mahatvakanksha, badlav aur anokhe mauke", watch: "Bechaini aur shortcut; zameen se jude aur imaandaar raho" },
    Ketu: { bring: "Virakti, insight aur aadhyatmik ruchi", watch: "Kata-kata mehsoos hona; ek steady routine rakho" },
  },
};

// Jupiter's place counted from the Moon sign: the classic "this year" line.
const JUPITER_TEXT = {
  en: [
    "Jupiter is over your own sign. A year to reset your direction and look after your health.",
    "Jupiter is in your 2nd house: good for savings, family harmony and kind words.",
    "Jupiter is in your 3rd house: effort matters more than luck; skills and short trips help.",
    "Jupiter is in your 4th house: focus on home, peace of mind and family comfort.",
    "Jupiter is in your 5th house: a favourable stretch for study, creativity, romance and children.",
    "Jupiter is in your 6th house: watch health and debts; steady routines pay off.",
    "Jupiter is in your 7th house: a good time for partnerships, marriage talks and teamwork.",
    "Jupiter is in your 8th house: go slow with big risks; inner work and research suit you.",
    "Jupiter is in your 9th house: luck, learning, travel and guidance from mentors.",
    "Jupiter is in your 10th house: work needs focus; avoid hasty job moves and promises.",
    "Jupiter is in your 11th house: a strong stretch for gains, friends and fulfilled wishes.",
    "Jupiter is in your 12th house: spend wisely, rest well and turn inward.",
  ],
  hi: [
    "गुरु आपकी अपनी राशि पर है। दिशा नए सिरे से तय करने और सेहत का ध्यान रखने का समय।",
    "गुरु आपके दूसरे भाव में है: बचत, पारिवारिक मेल और मीठे बोल के लिए अच्छा।",
    "गुरु आपके तीसरे भाव में है: किस्मत से ज़्यादा मेहनत मायने रखती है; हुनर और छोटी यात्राएँ मदद करती हैं।",
    "गुरु आपके चौथे भाव में है: घर, मन की शांति और परिवार के सुकून पर ध्यान दें।",
    "गुरु आपके पाँचवें भाव में है: पढ़ाई, रचनात्मकता, प्रेम और संतान के लिए अनुकूल दौर।",
    "गुरु आपके छठे भाव में है: सेहत और कर्ज़ पर नज़र रखें; नियमित दिनचर्या फल देती है।",
    "गुरु आपके सातवें भाव में है: साझेदारी, शादी की बातचीत और टीमवर्क के लिए अच्छा समय।",
    "गुरु आपके आठवें भाव में है: बड़े जोखिम धीरे लें; भीतरी काम और शोध आपको सूट करते हैं।",
    "गुरु आपके नौवें भाव में है: किस्मत, सीख, यात्रा और गुरुजनों का मार्गदर्शन।",
    "गुरु आपके दसवें भाव में है: काम पर ध्यान चाहिए; जल्दबाज़ी में नौकरी बदलने और वादों से बचें।",
    "गुरु आपके ग्यारहवें भाव में है: लाभ, दोस्ती और इच्छाओं के पूरे होने के लिए मज़बूत दौर।",
    "गुरु आपके बारहवें भाव में है: समझदारी से खर्च करें, अच्छा आराम करें और भीतर की ओर देखें।",
  ],
  hn: [
    "Guru aapki apni rashi par hai. Disha naye sire se tay karne aur sehat ka dhyan rakhne ka samay.",
    "Guru aapke doosre bhav mein hai: bachat, parivaar mein mel aur meethe bol ke liye achha.",
    "Guru aapke teesre bhav mein hai: kismat se zyada mehnat matter karti hai; skills aur chhoti yatraayein madad karti hain.",
    "Guru aapke chauthe bhav mein hai: ghar, mann ki shaanti aur parivaar ke sukoon par dhyan do.",
    "Guru aapke paanchve bhav mein hai: padhai, creativity, pyaar aur santaan ke liye anukool daur.",
    "Guru aapke chhathe bhav mein hai: sehat aur karz par nazar rakho; steady routine phal deti hai.",
    "Guru aapke saatve bhav mein hai: partnership, shaadi ki baat-cheet aur teamwork ke liye achha samay.",
    "Guru aapke aathve bhav mein hai: bade risk dheere lo; andar ka kaam aur research aapko suit karte hain.",
    "Guru aapke nauve bhav mein hai: kismat, seekh, yatra aur guruon ka guidance.",
    "Guru aapke dasve bhav mein hai: kaam par focus chahiye; jaldbaazi mein job badalne aur vaadon se bacho.",
    "Guru aapke gyarahve bhav mein hai: laabh, dosti aur ichhaon ke poore hone ke liye strong daur.",
    "Guru aapke baarahve bhav mein hai: samajhdaari se kharch karo, achha aaram karo aur andar ki taraf dekho.",
  ],
};

const LUCKY_NUMBER = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };

const textLang = (lang) => (lang === "hi" || lang === "hn" ? lang : "en");

// Which tendency list applies: Moon sign for Vedic, Sun sign for Western.
export function buildReading(chart, { lang = "en", timeUnknown = false, jupiter = null, today = "" } = {}) {
  const L = textLang(lang);
  const west = chart.tradition === "western";
  const moon = chart.planets.find((p) => p.key === "Moon");
  const idx = west ? chart.sunSign.signIndex : moon.signIndex;
  const out = {
    basis: west ? "sun" : "moon",
    strengths: SIGN_TEXT[L][idx].s,
    growth: SIGN_TEXT[L][idx].g,
    periods: [],
    jupiter: null,
    lucky: null,
  };
  if (west) return out;

  const C = getContent(L);
  const lord = SIGNS[moon.signIndex].lord;
  const wd = Object.entries(C.WEEKDAY_INFO).find(([, v]) => v.lord === lord);
  if (wd) out.lucky = { lord, weekday: Number(wd[0]), colour: wd[1].colour.name, hex: wd[1].colour.hex, mantra: wd[1].mantra, number: LUCKY_NUMBER[lord] };

  if (!timeUnknown && chart.dasha?.mahadashas) {
    out.periods = chart.dasha.mahadashas
      .filter((m) => m.end > today)
      .slice(0, 4)
      .map((m) => ({
        lord: m.lord,
        from: m.start,
        to: m.end,
        current: m.start === chart.dasha.current?.mahadasha?.start,
        ...PERIOD_TEXT[L][m.lord],
      }));
  }
  if (jupiter) {
    const house = ((jupiter.index - moon.signIndex + 12) % 12) + 1;
    out.jupiter = { house, text: JUPITER_TEXT[L][house - 1], leaves: jupiter.leaves || null };
  }
  return out;
}
