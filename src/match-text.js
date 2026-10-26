// Words for Kundli Milan. Every line is a tendency, never a verdict on a couple.

const k = (name, measures, good, ok, low, cancelled) => ({ name, measures, good, ok, low, cancelled });

export const KOOTAS = {
  en: {
    varna: k("Varna", "Ego and outlook", "You see life from a similar place, so pride rarely gets in the way.", "Slightly different outlooks; respect each other's way of seeing things.", "Different outlooks; take care that neither feels looked down on."),
    vashya: k("Vashya", "Pull and influence", "A natural give and take; each can gently guide the other.", "Influence runs a little more one way; share decisions on purpose.", "One may try to steer more than the other; agree on who decides what."),
    tara: k("Tara", "Luck and well-being together", "Your birth stars support each other; good for health and shared fortune.", "Mostly supportive; one side of the pair is less so.", "Your stars pull a little against each other; look after routines and health together."),
    yoni: k("Yoni", "Chemistry and comfort", "Strong natural chemistry and comfort together.", "A workable closeness that grows with time and effort.", "Different natures; closeness takes patience and honest talk."),
    maitri: k("Graha Maitri", "Mental fit and friendship", "Your minds are friends: easy to talk to, easy to understand.", "Workable understanding; you may need to explain yourselves more.", "Your minds work differently; listen first, then reply."),
    gana: k("Gana", "Temperament", "A matching temperament; daily life flows.", "Somewhat different temperaments; give each other room.", "Very different temperaments; patience and humour will matter."),
    bhakoot: k("Bhakoot", "Emotional bond, family and money", "A warm emotional bond with good support for family and finances.", "A fair emotional bond.", "This is the point flagged in traditional matching. Talk openly about family and money early.", "Traditionally flagged, but the Moon signs are friendly, so it is considered balanced."),
    nadi: k("Nadi", "Health and energy", "Your energy types are different, which is considered a good sign for health together.", "A fair match of energies.", "Same energy type; traditionally flagged. Many families simply check this with an elder or pandit."),
  },
  hi: {
    varna: k("वर्ण", "अहं और दृष्टिकोण", "आप जीवन को एक जैसी जगह से देखते हैं, इसलिए अहं कम आड़े आता है।", "दृष्टिकोण थोड़ा अलग है; एक-दूसरे के नज़रिये का सम्मान कीजिए।", "दृष्टिकोण अलग है; ध्यान रखें कि कोई ख़ुद को छोटा न महसूस करे।"),
    vashya: k("वश्य", "खिंचाव और प्रभाव", "स्वाभाविक लेन-देन; दोनों एक-दूसरे को नरमी से राह दिखा सकते हैं।", "प्रभाव थोड़ा एक तरफ़ ज़्यादा है; फ़ैसले साझा कीजिए।", "एक साथी ज़्यादा चलाना चाह सकता है; तय करें कि कौन क्या तय करेगा।"),
    tara: k("तारा", "साथ में भाग्य और स्वास्थ्य", "आपके जन्म नक्षत्र एक-दूसरे का साथ देते हैं; स्वास्थ्य और साझा भाग्य के लिए अच्छा।", "ज़्यादातर सहयोगी; जोड़ी का एक पक्ष कम।", "नक्षत्र थोड़ा खिंचाव दिखाते हैं; दिनचर्या और सेहत का साथ में ध्यान रखिए।"),
    yoni: k("योनि", "केमिस्ट्री और सहजता", "स्वाभाविक केमिस्ट्री और साथ में सहजता मज़बूत है।", "चल सकने वाली नज़दीकी जो समय और कोशिश से बढ़ती है।", "स्वभाव अलग हैं; नज़दीकी के लिए धैर्य और खुली बात चाहिए।"),
    maitri: k("ग्रह मैत्री", "मानसिक मेल और दोस्ती", "आपके मन दोस्त हैं: बात करना और समझना आसान।", "समझ चल सकती है; शायद ज़्यादा समझाना पड़े।", "आपके मन अलग ढंग से चलते हैं; पहले सुनिए, फिर जवाब दीजिए।"),
    gana: k("गण", "स्वभाव", "स्वभाव मेल खाता है; रोज़ की ज़िंदगी सहज चलती है।", "स्वभाव कुछ अलग हैं; एक-दूसरे को जगह दीजिए।", "स्वभाव काफ़ी अलग हैं; धैर्य और हँसी-मज़ाक काम आएगा।"),
    bhakoot: k("भकूट", "भावनात्मक रिश्ता, परिवार और पैसा", "भावनात्मक रिश्ता गर्मजोशी भरा, परिवार और धन में अच्छा सहारा।", "भावनात्मक रिश्ता ठीक-ठाक।", "परंपरागत मिलान में यह बिंदु चिह्नित होता है। परिवार और पैसे पर शुरू में खुलकर बात कीजिए।", "परंपरा में चिह्नित, पर चंद्र राशियाँ मित्र हैं, इसलिए इसे संतुलित माना जाता है।"),
    nadi: k("नाड़ी", "स्वास्थ्य और ऊर्जा", "आपकी ऊर्जा के प्रकार अलग हैं, जो साथ में स्वास्थ्य के लिए शुभ माना जाता है।", "ऊर्जा का ठीक-ठाक मेल।", "ऊर्जा का प्रकार एक ही है; परंपरा में चिह्नित। कई परिवार इसे बस किसी बड़े या पंडित से जँचवा लेते हैं।"),
  },
  hn: {
    varna: k("Varna", "Ego aur outlook", "Aap zindagi ko ek jaisi jagah se dekhte ho, isliye ego kam aadey aata hai.", "Outlook thoda alag hai; ek-doosre ke nazariye ka respect kijiye.", "Outlook alag hai; dhyan rakhiye ki koi khud ko chhota na samjhe."),
    vashya: k("Vashya", "Khinchaav aur influence", "Natural give and take; dono ek-doosre ko narmi se raah dikha sakte hain.", "Influence thoda ek taraf zyada hai; decisions share kijiye.", "Ek partner zyada chalana chah sakta hai; tay kijiye kaun kya decide karega."),
    tara: k("Tara", "Saath mein luck aur wellbeing", "Aapke janm nakshatra ek-doosre ka saath dete hain; health aur shared kismat ke liye achha.", "Zyadatar supportive; jodi ka ek pehlu kam.", "Nakshatra thoda khinchaav dikhate hain; routine aur sehat ka saath mein dhyan rakhiye."),
    yoni: k("Yoni", "Chemistry aur comfort", "Natural chemistry aur saath mein comfort strong hai.", "Chalne layak closeness jo time aur koshish se badhti hai.", "Nature alag hain; closeness ke liye patience aur khuli baat chahiye."),
    maitri: k("Graha Maitri", "Mental fit aur dosti", "Aapke mann dost hain: baat karna aur samajhna aasaan.", "Samajh chal sakti hai; shayad zyada samjhana pade.", "Aapke mann alag tarah se chalte hain; pehle suniye, phir jawab dijiye."),
    gana: k("Gana", "Temperament", "Temperament match karta hai; roz ki zindagi smooth chalti hai.", "Temperament kuch alag hain; ek-doosre ko space dijiye.", "Temperament kaafi alag hain; patience aur humour kaam aayega."),
    bhakoot: k("Bhakoot", "Emotional bond, family aur paisa", "Emotional bond warm hai, family aur paise mein achha support.", "Emotional bond theek-thaak.", "Traditional matching mein yeh point flag hota hai. Family aur paise par shuru mein khulkar baat kijiye.", "Traditionally flag hota hai, par Moon signs dost hain, isliye balanced maana jaata hai."),
    nadi: k("Nadi", "Health aur energy", "Aapke energy types alag hain, jo saath mein health ke liye shubh maana jaata hai.", "Energies ka theek-thaak match.", "Energy type ek hi hai; traditionally flag hota hai. Kai families ise bas kisi bade ya pandit se check karwa leti hain."),
  },
};

export const VERDICTS = {
  en: ["A match that asks for effort and honest talk", "A good match with room to grow", "A very good match", "An excellent match"],
  hi: ["ऐसा मेल जिसमें मेहनत और खुली बात चाहिए", "अच्छा मेल, बढ़ने की गुंजाइश के साथ", "बहुत अच्छा मेल", "उत्कृष्ट मेल"],
  hn: ["Aisa match jisme mehnat aur khuli baat chahiye", "Achha match, badhne ki gunjaish ke saath", "Bahut achha match", "Excellent match"],
};

export const SUMMARY = {
  en: "Ashtakoot is a traditional way to compare two Moon positions. It is one lens on how two people may feel together, not a ruling on your future. Understanding, respect and effort matter far more than any score.",
  hi: "अष्टकूट दो चंद्र स्थितियों की तुलना का पारंपरिक तरीक़ा है। यह दो लोगों के साथ में अनुभव का एक नज़रिया है, भविष्य का फ़ैसला नहीं। किसी भी अंक से ज़्यादा समझ, सम्मान और कोशिश मायने रखती है।",
  hn: "Ashtakoot do Moon positions ko compare karne ka traditional tareeka hai. Yeh do logon ke saath ke anubhav ka ek nazariya hai, future ka faisla nahi. Kisi bhi score se zyada samajh, respect aur koshish matter karti hai.",
};
