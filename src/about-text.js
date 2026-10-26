// Plain-language text for "what your chart says about you".
// Everything here is a tendency tied to a real position in the chart.

// Rising sign (lagna): [strength, thing to work on]
export const RISING = {
  en: [
    ["You start fast and lead from the front", "Impatience; pause before you react"],
    ["Calm, steady and loyal; people feel safe around you", "Stubbornness; change is easier than it looks"],
    ["Quick, curious and good with words", "A restless mind; finish one thing before the next"],
    ["Caring and protective; you sense what others feel", "Mood swings; do not carry everyone's feelings"],
    ["Confident and warm; you carry presence", "Needing praise; let your work speak sometimes"],
    ["Careful, practical and helpful", "Over-thinking and self-criticism; good enough is good"],
    ["Charming, fair and easy to talk to", "Indecision; people-pleasing at your own cost"],
    ["Intense, determined and hard to fool", "Holding grudges; trust a little more"],
    ["Open, optimistic and honest", "Overpromising; follow through on small things"],
    ["Disciplined, patient and serious about goals", "Too much duty, too little rest or play"],
    ["Original, independent and fair-minded", "Emotional distance; let close people in"],
    ["Gentle, imaginative and deeply kind", "Escaping from problems; keep plans grounded"],
  ],
  hi: [
    ["आप तेज़ी से शुरुआत करते हैं और आगे बढ़कर नेतृत्व करते हैं", "अधीरता; प्रतिक्रिया से पहले रुकिए"],
    ["शांत, स्थिर और वफ़ादार; लोग आपके पास सुरक्षित महसूस करते हैं", "ज़िद; बदलाव उतना कठिन नहीं जितना लगता है"],
    ["तेज़, जिज्ञासु और बातचीत में माहिर", "बेचैन मन; एक काम पूरा करके दूसरा शुरू कीजिए"],
    ["देखभाल करने वाले; दूसरों की भावनाएँ भाँप लेते हैं", "मूड का उतार-चढ़ाव; सबकी भावनाएँ ख़ुद पर मत लादिए"],
    ["आत्मविश्वासी और गर्मजोशी भरे; आपकी मौजूदगी महसूस होती है", "तारीफ़ की चाह; कभी काम को बोलने दीजिए"],
    ["सावधान, व्यावहारिक और मददगार", "ज़्यादा सोचना और ख़ुद की आलोचना; ठीक-ठाक भी अच्छा है"],
    ["आकर्षक, न्यायप्रिय और बात करने में आसान", "फ़ैसले में देरी; दूसरों को ख़ुश करने में अपना नुकसान"],
    ["गहरे, दृढ़ और जिन्हें बहकाना मुश्किल", "पुरानी बातें पकड़े रखना; थोड़ा और भरोसा कीजिए"],
    ["खुले दिल के, आशावादी और ईमानदार", "ज़्यादा वादे; छोटी बातों में भी निभाइए"],
    ["अनुशासित, धैर्यवान और लक्ष्य के प्रति गंभीर", "कर्तव्य ज़्यादा, आराम और मस्ती कम"],
    ["मौलिक, स्वतंत्र और न्यायप्रिय", "भावनात्मक दूरी; क़रीबी लोगों को अंदर आने दीजिए"],
    ["कोमल, कल्पनाशील और बहुत दयालु", "समस्याओं से बचना; योजनाएँ ज़मीन से जुड़ी रखिए"],
  ],
  hn: [
    ["Aap tezi se shuru karte ho aur aage badhkar lead karte ho", "Adheerta; react karne se pehle ruko"],
    ["Shaant, stable aur wafadaar; log aapke paas safe feel karte hain", "Zid; badlaav utna mushkil nahi jitna lagta hai"],
    ["Tez, curious aur baat karne mein mahir", "Bechain mann; ek kaam khatam karke doosra shuru karo"],
    ["Caring aur protective; doosron ki feelings samajh lete ho", "Mood swings; sabki feelings khud pe mat lo"],
    ["Confident aur warm; aapki presence mehsoos hoti hai", "Tareef ki chaah; kabhi kaam ko bolne do"],
    ["Careful, practical aur helpful", "Zyada sochna aur self-criticism; thik-thak bhi achha hai"],
    ["Charming, fair aur baat karne mein aasaan", "Decision mein deri; sabko khush karne mein apna nuksaan"],
    ["Intense, determined aur jinhe behkana mushkil hai", "Purani baatein pakad ke rakhna; thoda aur bharosa karo"],
    ["Open, optimistic aur honest", "Zyada promise; chhoti baaton mein bhi nibhao"],
    ["Disciplined, patient aur goals ko lekar serious", "Duty zyada, rest aur masti kam"],
    ["Original, independent aur fair-minded", "Emotional doori; close logon ko andar aane do"],
    ["Gentle, imaginative aur bahut kind", "Problems se bhaagna; plans zameen se jude rakho"],
  ],
};

// What the partner tends to be like: the sign in the 7th house.
export const PARTNER = {
  en: [
    "Your partner is likely bold, direct and full of energy. Honest arguments clear the air fast.",
    "Your partner is likely calm, loyal and fond of comfort. They value stability and affection.",
    "Your partner is likely witty, chatty and curious. Conversation keeps the bond alive.",
    "Your partner is likely caring and family-minded. Emotional safety matters a lot to them.",
    "Your partner is likely warm, proud and generous. They need to feel appreciated.",
    "Your partner is likely practical, thoughtful and detail-minded. They show love by helping.",
    "Your partner is likely charming, fair and sociable. Harmony and partnership matter to them.",
    "Your partner is likely intense, private and deeply committed. Trust is everything to them.",
    "Your partner is likely open-minded, adventurous and honest. They need freedom and growth.",
    "Your partner is likely serious, responsible and ambitious. Love grows slowly but lasts.",
    "Your partner is likely independent, friendly and unusual. They need space and a friend first.",
    "Your partner is likely gentle, romantic and giving. Kindness and imagination bind you.",
  ],
  hi: [
    "आपका साथी संभवतः साहसी, सीधा और ऊर्जा से भरा होगा। खुली बहस जल्दी माहौल साफ़ कर देती है।",
    "आपका साथी संभवतः शांत, वफ़ादार और आराम पसंद होगा। उसे स्थिरता और प्यार चाहिए।",
    "आपका साथी संभवतः हाज़िरजवाब, बातूनी और जिज्ञासु होगा। बातचीत रिश्ते को ज़िंदा रखती है।",
    "आपका साथी संभवतः परवाह करने वाला और परिवार-प्रेमी होगा। उसके लिए भावनात्मक सुरक्षा बहुत मायने रखती है।",
    "आपका साथी संभवतः गर्मजोश, स्वाभिमानी और उदार होगा। उसे सराहना चाहिए।",
    "आपका साथी संभवतः व्यावहारिक, समझदार और बारीकी देखने वाला होगा। वह मदद करके प्यार जताता है।",
    "आपका साथी संभवतः आकर्षक, न्यायप्रिय और मिलनसार होगा। उसके लिए तालमेल और साझेदारी अहम है।",
    "आपका साथी संभवतः गहरा, निजी और पूरी तरह समर्पित होगा। उसके लिए भरोसा ही सब कुछ है।",
    "आपका साथी संभवतः खुले विचारों का, साहसी और ईमानदार होगा। उसे आज़ादी और विकास चाहिए।",
    "आपका साथी संभवतः गंभीर, ज़िम्मेदार और महत्वाकांक्षी होगा। प्यार धीरे बढ़ता है पर टिकता है।",
    "आपका साथी संभवतः स्वतंत्र, दोस्ताना और अलग सोच वाला होगा। उसे जगह चाहिए और पहले दोस्ती।",
    "आपका साथी संभवतः कोमल, रोमांटिक और देने वाला होगा। दया और कल्पना आपको जोड़ती है।",
  ],
  hn: [
    "Aapka partner shayad bold, seedha aur energy se bhara hoga. Khuli behas jaldi mahaul saaf kar deti hai.",
    "Aapka partner shayad shaant, wafadaar aur aaram pasand hoga. Use stability aur pyaar chahiye.",
    "Aapka partner shayad witty, baatuni aur curious hoga. Baatcheet rishte ko zinda rakhti hai.",
    "Aapka partner shayad caring aur family-minded hoga. Uske liye emotional safety bahut matter karti hai.",
    "Aapka partner shayad warm, proud aur generous hoga. Use appreciation chahiye.",
    "Aapka partner shayad practical, samajhdaar aur detail dekhne wala hoga. Woh madad karke pyaar jatata hai.",
    "Aapka partner shayad charming, fair aur sociable hoga. Uske liye harmony aur partnership zaroori hai.",
    "Aapka partner shayad gehra, private aur poori tarah committed hoga. Uske liye trust hi sab kuch hai.",
    "Aapka partner shayad open-minded, adventurous aur honest hoga. Use freedom aur growth chahiye.",
    "Aapka partner shayad serious, responsible aur ambitious hoga. Pyaar dheere badhta hai par tikta hai.",
    "Aapka partner shayad independent, friendly aur alag soch wala hoga. Use space chahiye aur pehle dosti.",
    "Aapka partner shayad gentle, romantic aur dene wala hoga. Kindness aur imagination aapko jodte hain.",
  ],
};

// Work style: the sign in the 10th house.
export const CAREER = {
  en: [
    "Work where you can lead, start things and move fast: business, sports, the armed forces, engineering.",
    "Work with steady, tangible results: finance, food, art, design, property, banking.",
    "Work with ideas and people: writing, media, sales, teaching, technology, trade.",
    "Work that looks after others: healthcare, hospitality, education, real estate, public service.",
    "Work with visibility and leadership: management, politics, entertainment, government, teaching.",
    "Work that rewards precision: analysis, medicine, accounts, quality, research, editing.",
    "Work with people and taste: law, design, fashion, diplomacy, consulting, the arts.",
    "Work that goes deep: research, investigation, surgery, finance, psychology, strategy.",
    "Work with big-picture thinking: teaching, travel, law, publishing, advice, philosophy.",
    "Work that builds slowly and lasts: administration, construction, industry, government, planning.",
    "Work that serves many people: technology, science, social causes, networks, innovation.",
    "Work with imagination or care: healing, film, music, spirituality, creative fields, charity.",
  ],
  hi: [
    "ऐसा काम जहाँ आप नेतृत्व करें और तेज़ी से बढ़ें: व्यवसाय, खेल, सेना, इंजीनियरिंग।",
    "स्थिर और ठोस नतीजों वाला काम: वित्त, खान-पान, कला, डिज़ाइन, प्रॉपर्टी, बैंकिंग।",
    "विचारों और लोगों वाला काम: लेखन, मीडिया, बिक्री, शिक्षण, तकनीक, व्यापार।",
    "दूसरों की देखभाल वाला काम: स्वास्थ्य, आतिथ्य, शिक्षा, रियल एस्टेट, जन-सेवा।",
    "पहचान और नेतृत्व वाला काम: प्रबंधन, राजनीति, मनोरंजन, सरकारी सेवा, शिक्षण।",
    "सटीकता को महत्व देने वाला काम: विश्लेषण, चिकित्सा, लेखा, गुणवत्ता, शोध, संपादन।",
    "लोगों और रुचि वाला काम: क़ानून, डिज़ाइन, फ़ैशन, कूटनीति, परामर्श, कला।",
    "गहराई वाला काम: शोध, जाँच, सर्जरी, वित्त, मनोविज्ञान, रणनीति।",
    "बड़ी सोच वाला काम: शिक्षण, यात्रा, क़ानून, प्रकाशन, सलाह, दर्शन।",
    "धीरे बनने और टिकने वाला काम: प्रशासन, निर्माण, उद्योग, सरकारी सेवा, योजना।",
    "बहुत लोगों की सेवा वाला काम: तकनीक, विज्ञान, सामाजिक कार्य, नेटवर्क, नवाचार।",
    "कल्पना या देखभाल वाला काम: उपचार, फ़िल्म, संगीत, अध्यात्म, रचनात्मक क्षेत्र, दान।",
  ],
  hn: [
    "Aisa kaam jahan aap lead karo aur tezi se badho: business, sports, army, engineering.",
    "Stable aur thos results wala kaam: finance, food, art, design, property, banking.",
    "Ideas aur logon wala kaam: writing, media, sales, teaching, technology, trade.",
    "Doosron ki dekhbhaal wala kaam: healthcare, hospitality, education, real estate, public service.",
    "Visibility aur leadership wala kaam: management, politics, entertainment, sarkari seva, teaching.",
    "Precision ko value dene wala kaam: analysis, medicine, accounts, quality, research, editing.",
    "Logon aur taste wala kaam: law, design, fashion, diplomacy, consulting, arts.",
    "Gehraai wala kaam: research, investigation, surgery, finance, psychology, strategy.",
    "Bade soch wala kaam: teaching, travel, law, publishing, advice, philosophy.",
    "Dheere banne aur tikne wala kaam: administration, construction, industry, sarkari seva, planning.",
    "Bahut logon ki seva wala kaam: technology, science, social causes, networks, innovation.",
    "Imagination ya care wala kaam: healing, film, music, spirituality, creative fields, charity.",
  ],
};

// Moon nakshatra ruler: the temperament the Moon star adds.
export const STAR_LORD = {
  en: {
    Ketu: "Your Moon star is ruled by Ketu: detached, intuitive, spiritual and drawn to solitude. You can feel like an outsider; this is also your depth.",
    Venus: "Your Moon star is ruled by Venus: affectionate, artistic and pleasure-loving. Comfort and relationships shape your mood.",
    Sun: "Your Moon star is ruled by the Sun: proud, honest and a natural leader. You need respect and purpose.",
    Moon: "Your Moon star is ruled by the Moon: sensitive, caring and tied to home and family. Your feelings run deep.",
    Mars: "Your Moon star is ruled by Mars: energetic, brave and competitive. You need action, and anger needs an outlet.",
    Rahu: "Your Moon star is ruled by Rahu: ambitious, unconventional and hungry for more. You break moulds and need to stay grounded.",
    Jupiter: "Your Moon star is ruled by Jupiter: wise, generous and optimistic. People come to you for advice.",
    Saturn: "Your Moon star is ruled by Saturn: serious, patient and hard-working. You mature early and rise slowly.",
    Mercury: "Your Moon star is ruled by Mercury: quick, witty and curious. You learn fast and need mental stimulation.",
  },
  hi: {
    Ketu: "आपका चंद्र नक्षत्र केतु का है: निर्लिप्त, सहज-बोध वाला, आध्यात्मिक और एकांत की ओर झुकाव। कभी बाहरी जैसा लगता है; यही आपकी गहराई भी है।",
    Venus: "आपका चंद्र नक्षत्र शुक्र का है: स्नेही, कलात्मक और सुख-प्रिय। आराम और रिश्ते आपका मूड तय करते हैं।",
    Sun: "आपका चंद्र नक्षत्र सूर्य का है: स्वाभिमानी, ईमानदार और जन्मजात नेता। आपको सम्मान और उद्देश्य चाहिए।",
    Moon: "आपका चंद्र नक्षत्र चंद्र का है: संवेदनशील, देखभाल करने वाला और घर-परिवार से जुड़ा। भावनाएँ गहरी हैं।",
    Mars: "आपका चंद्र नक्षत्र मंगल का है: ऊर्जावान, साहसी और प्रतिस्पर्धी। आपको क्रिया चाहिए, और ग़ुस्से को निकास चाहिए।",
    Rahu: "आपका चंद्र नक्षत्र राहु का है: महत्वाकांक्षी, अलग राह चलने वाला और और पाने की भूख। ज़मीन से जुड़े रहना ज़रूरी है।",
    Jupiter: "आपका चंद्र नक्षत्र गुरु का है: समझदार, उदार और आशावादी। लोग सलाह के लिए आपके पास आते हैं।",
    Saturn: "आपका चंद्र नक्षत्र शनि का है: गंभीर, धैर्यवान और मेहनती। आप जल्दी परिपक्व होते हैं और धीरे ऊपर उठते हैं।",
    Mercury: "आपका चंद्र नक्षत्र बुध का है: तेज़, हाज़िरजवाब और जिज्ञासु। आप जल्दी सीखते हैं और दिमाग़ी खुराक चाहिए।",
  },
  hn: {
    Ketu: "Aapka Moon nakshatra Ketu ka hai: detached, intuitive, spiritual aur akelepan ki taraf jhukaav. Kabhi outsider jaisa lagta hai; yehi aapki gehraai bhi hai.",
    Venus: "Aapka Moon nakshatra Shukra ka hai: affectionate, artistic aur sukh-priya. Comfort aur relationships aapka mood tay karte hain.",
    Sun: "Aapka Moon nakshatra Surya ka hai: proud, honest aur natural leader. Aapko respect aur purpose chahiye.",
    Moon: "Aapka Moon nakshatra Chandra ka hai: sensitive, caring aur ghar-parivar se jude. Feelings gehri hain.",
    Mars: "Aapka Moon nakshatra Mangal ka hai: energetic, brave aur competitive. Aapko action chahiye, aur gusse ko outlet chahiye.",
    Rahu: "Aapka Moon nakshatra Rahu ka hai: ambitious, alag raah chalne wale aur aur paane ki bhookh. Zameen se jude rehna zaroori hai.",
    Jupiter: "Aapka Moon nakshatra Guru ka hai: wise, generous aur optimistic. Log salaah ke liye aapke paas aate hain.",
    Saturn: "Aapka Moon nakshatra Shani ka hai: serious, patient aur mehnati. Aap jaldi mature hote ho aur dheere upar uthte ho.",
    Mercury: "Aapka Moon nakshatra Budh ka hai: tez, witty aur curious. Aap jaldi seekhte ho aur mental stimulation chahiye.",
  },
};

// A planet in its own or exalted sign gives its good side freely.
export const STRONG = {
  en: {
    Sun: "Your Sun is strong: natural confidence, dignity and leadership.",
    Moon: "Your Moon is strong: emotional steadiness and a gift for caring for people.",
    Mars: "Your Mars is strong: courage, drive and the stamina to push through.",
    Mercury: "Your Mercury is strong: a sharp mind, good communication and quick learning.",
    Jupiter: "Your Jupiter is strong: wisdom, good judgement and the luck of good advice.",
    Venus: "Your Venus is strong: charm, a feel for beauty and warmth in relationships.",
    Saturn: "Your Saturn is strong: discipline, patience and results that last.",
  },
  hi: {
    Sun: "आपका सूर्य बलवान है: स्वाभाविक आत्मविश्वास, गरिमा और नेतृत्व।",
    Moon: "आपका चंद्र बलवान है: भावनात्मक स्थिरता और लोगों की देखभाल का गुण।",
    Mars: "आपका मंगल बलवान है: साहस, जोश और आगे बढ़ने की सहनशक्ति।",
    Mercury: "आपका बुध बलवान है: तेज़ दिमाग़, अच्छा संवाद और जल्दी सीखना।",
    Jupiter: "आपका गुरु बलवान है: समझ, अच्छा विवेक और अच्छी सलाह का सौभाग्य।",
    Venus: "आपका शुक्र बलवान है: आकर्षण, सौंदर्य की समझ और रिश्तों में गर्मजोशी।",
    Saturn: "आपका शनि बलवान है: अनुशासन, धैर्य और टिकाऊ नतीजे।",
  },
  hn: {
    Sun: "Aapka Surya strong hai: natural confidence, dignity aur leadership.",
    Moon: "Aapka Chandra strong hai: emotional stability aur logon ki care karne ka gun.",
    Mars: "Aapka Mangal strong hai: courage, josh aur aage badhne ki stamina.",
    Mercury: "Aapka Budh strong hai: tez dimaag, achhi communication aur jaldi seekhna.",
    Jupiter: "Aapka Guru strong hai: wisdom, achha judgement aur achhi salaah ka saubhagya.",
    Venus: "Aapka Shukra strong hai: charm, beauty ki samajh aur relationships mein warmth.",
    Saturn: "Aapka Shani strong hai: discipline, patience aur tikaau results.",
  },
};

// A planet in its weak sign asks for more effort in that area. Never a curse.
export const TESTED = {
  en: {
    Sun: "Your Sun is in a tender sign: confidence builds slowly; own your wins and do not wait for approval.",
    Moon: "Your Moon is in a tender sign: feelings run strong; sleep, routine and a trusted friend steady you.",
    Mars: "Your Mars is in a tender sign: energy comes in bursts; regular exercise and patience help.",
    Mercury: "Your Mercury is in a tender sign: you may overthink or doubt your words; write things down first.",
    Jupiter: "Your Jupiter is in a tender sign: ask for advice and keep learning; do not take luck for granted.",
    Venus: "Your Venus is in a tender sign: love and money need care; say what you need and avoid overspending.",
    Saturn: "Your Saturn is in a tender sign: patience is the lesson; small steady habits beat big pushes.",
  },
  hi: {
    Sun: "आपका सूर्य कमज़ोर राशि में है: आत्मविश्वास धीरे बनता है; अपनी जीत मानिए, मंज़ूरी का इंतज़ार मत कीजिए।",
    Moon: "आपका चंद्र कमज़ोर राशि में है: भावनाएँ तेज़ चलती हैं; नींद, दिनचर्या और एक भरोसेमंद दोस्त संभालते हैं।",
    Mars: "आपका मंगल कमज़ोर राशि में है: ऊर्जा झटकों में आती है; नियमित कसरत और धैर्य मदद करते हैं।",
    Mercury: "आपका बुध कमज़ोर राशि में है: ज़्यादा सोचना या बात पर शक हो सकता है; पहले लिख लीजिए।",
    Jupiter: "आपका गुरु कमज़ोर राशि में है: सलाह लीजिए और सीखते रहिए; क़िस्मत को हल्के में मत लीजिए।",
    Venus: "आपका शुक्र कमज़ोर राशि में है: प्यार और पैसे में सँभलना है; अपनी ज़रूरत कहिए और फ़िज़ूलख़र्ची से बचिए।",
    Saturn: "आपका शनि कमज़ोर राशि में है: धैर्य सबक़ है; छोटी स्थिर आदतें बड़े धक्कों से बेहतर हैं।",
  },
  hn: {
    Sun: "Aapka Surya kamzor rashi mein hai: confidence dheere banta hai; apni jeet maniye, approval ka intezaar mat kijiye.",
    Moon: "Aapka Chandra kamzor rashi mein hai: feelings tez chalti hain; neend, routine aur ek bharosemand dost sambhalte hain.",
    Mars: "Aapka Mangal kamzor rashi mein hai: energy jhatkon mein aati hai; regular exercise aur patience madad karte hain.",
    Mercury: "Aapka Budh kamzor rashi mein hai: zyada sochna ya apni baat pe shak ho sakta hai; pehle likh lijiye.",
    Jupiter: "Aapka Guru kamzor rashi mein hai: salaah lijiye aur seekhte rahiye; kismat ko halke mein mat lijiye.",
    Venus: "Aapka Shukra kamzor rashi mein hai: pyaar aur paise mein sambhalna hai; apni zaroorat boliye aur fizoolkharchi se bachiye.",
    Saturn: "Aapka Shani kamzor rashi mein hai: patience hi sabak hai; chhoti steady aadatein bade dhakkon se behtar hain.",
  },
};

// Mars in these houses from the rising sign (the old "manglik" idea), said calmly.
export const MARS_HOUSE = {
  en: {
    1: "Mars in your 1st house: bold, direct and competitive. Watch a short temper.",
    2: "Mars in your 2nd house: sharp speech and strong earning drive. Choose words before arguments.",
    4: "Mars in your 4th house: a restless home life and strong feelings about family. Create calm at home.",
    7: "Mars in your 7th house: passionate and strong-willed in partnership. Talk before tempers rise.",
    8: "Mars in your 8th house: intense, private and resilient. Handle shared money and secrets openly.",
    12: "Mars in your 12th house: energy that turns inward. Exercise and rest keep you balanced.",
  },
  hi: {
    1: "आपके पहले भाव में मंगल: साहसी, सीधे और प्रतिस्पर्धी। छोटे ग़ुस्से का ध्यान रखिए।",
    2: "आपके दूसरे भाव में मंगल: तीखी वाणी और कमाने की तेज़ चाह। बहस से पहले शब्द चुनिए।",
    4: "आपके चौथे भाव में मंगल: घर में बेचैनी और परिवार को लेकर गहरी भावनाएँ। घर में शांति बनाइए।",
    7: "आपके सातवें भाव में मंगल: साझेदारी में जोशीले और दृढ़। ग़ुस्सा बढ़ने से पहले बात कीजिए।",
    8: "आपके आठवें भाव में मंगल: गहरे, निजी और लचीले। साझा पैसे और राज़ खुलकर सँभालिए।",
    12: "आपके बारहवें भाव में मंगल: ऊर्जा भीतर मुड़ती है। कसरत और आराम संतुलन रखते हैं।",
  },
  hn: {
    1: "Aapke pehle bhav mein Mangal: bold, seedhe aur competitive. Chhote gusse ka dhyan rakhiye.",
    2: "Aapke doosre bhav mein Mangal: tez zubaan aur kamaane ki strong drive. Behas se pehle shabd chuniye.",
    4: "Aapke chauthe bhav mein Mangal: ghar mein bechaini aur parivar ko lekar gehri feelings. Ghar mein shaanti banaiye.",
    7: "Aapke saatve bhav mein Mangal: partnership mein josheele aur strong-willed. Gussa badhne se pehle baat kijiye.",
    8: "Aapke aathve bhav mein Mangal: intense, private aur resilient. Shared paise aur raaz khulkar sambhaliye.",
    12: "Aapke baarahve bhav mein Mangal: energy andar ki taraf mudti hai. Exercise aur rest balance rakhte hain.",
  },
};

export const RETRO = {
  en: "Retrograde in your chart: {planets}. These areas turn inward; results can come later, but with more depth and thought.",
  hi: "आपकी कुंडली में वक्री: {planets}। इन क्षेत्रों में ध्यान भीतर मुड़ता है; नतीजे देर से आ सकते हैं, पर गहराई के साथ।",
  hn: "Aapki kundli mein vakri: {planets}. In areas mein dhyan andar mudta hai; results der se aa sakte hain, par gehraai ke saath.",
};
