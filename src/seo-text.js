// Page-specific words for the tool pages, in English and Hindi, so every page has its own
// readable content and questions (and not only a title). Used by src/seo.js.

export const SEO_TEXT = {
  home: {
    en: {
      h: "What Kundli Kaka gives you",
      intro: [
        "Kundli Kaka is a free Vedic astrology site made for everyday questions: what is my kundli saying, how will today go, which day is good for a puja, and are we a good match.",
        "Everything is worked out from the real positions of the Sun, Moon and planets at your time and place, and explained in plain words in English, Hindi or Hinglish. There is no sign-up for the free tools.",
      ],
      get: [
        "Free kundli with your birth chart, dasha and a simple life reading",
        "Daily rashifal for all twelve rashis, from the real Moon position",
        "Today's panchang for your city, with Rahu Kaal and choghadiya",
        "Kundli Milan with the 36-point Ashtakoot match",
        "Free three-card tarot reading",
        "Bhagavad Gita verses with simple meaning, in English and Hindi",
        "Puja guides with samagri lists and step by step vidhi for 14 gods",
      ],
      how: [],
      faq: [
        ["Is Kundli Kaka free?", "Yes. The kundli, rashifal, panchang, Kundli Milan, tarot and puja guides are free to use and need no sign-up."],
        ["How is the kundli worked out?", "From the real planetary positions for your date, time and place of birth, using the Lahiri ayanamsa that is standard in Vedic astrology."],
        ["Which languages can I use?", "English, Hindi and Hinglish, and the main pages are also available in other Indian languages."],
        ["Can I do a puja at home with these guides?", "Yes. Each puja guide lists every item with a picture, then gives the steps in order, so you can follow it at home."],
      ],
    },
    hi: {
      h: "कुंडली काका में आपको क्या मिलता है",
      intro: [
        "कुंडली काका एक मुफ़्त वैदिक ज्योतिष साइट है, जो रोज़ के सवालों के लिए बनी है: मेरी कुंडली क्या कहती है, आज का दिन कैसा रहेगा, पूजा के लिए कौन-सा दिन शुभ है, और क्या हम एक-दूसरे के लिए सही हैं।",
        "सब कुछ आपके समय और स्थान पर सूर्य, चंद्रमा और ग्रहों की असली स्थिति से निकाला जाता है, और अंग्रेज़ी, हिंदी या हिंग्लिश में सीधे शब्दों में समझाया जाता है। मुफ़्त टूल के लिए साइन-अप नहीं चाहिए।",
      ],
      get: [
        "मुफ़्त कुंडली: जन्म कुंडली, दशा और सरल जीवन फल",
        "सभी बारह राशियों का दैनिक राशिफल, असली चंद्र स्थिति से",
        "आपके शहर का आज का पंचांग, राहु काल और चौघड़िया के साथ",
        "36 गुणों वाला अष्टकूट कुंडली मिलान",
        "मुफ़्त तीन कार्ड टैरो रीडिंग",
        "भगवद्गीता के श्लोक सरल अर्थ के साथ, हिंदी और अंग्रेज़ी में",
        "14 देवताओं की पूजा गाइड: सामग्री सूची और विधि कदम दर कदम",
      ],
      how: [],
      faq: [
        ["क्या कुंडली काका मुफ़्त है?", "हाँ। कुंडली, राशिफल, पंचांग, कुंडली मिलान, टैरो और पूजा गाइड मुफ़्त हैं और इनके लिए साइन-अप नहीं चाहिए।"],
        ["कुंडली कैसे बनती है?", "आपकी जन्म तिथि, समय और स्थान के असली ग्रह स्थानों से, वैदिक ज्योतिष में मानक लाहिरी अयनांश के साथ।"],
        ["कौन-सी भाषाएँ चुन सकते हैं?", "अंग्रेज़ी, हिंदी और हिंग्लिश, और मुख्य पेज अन्य भारतीय भाषाओं में भी उपलब्ध हैं।"],
        ["क्या इन गाइड से घर पर पूजा कर सकते हैं?", "हाँ। हर पूजा गाइड में हर सामान की तस्वीर के साथ सूची है और फिर विधि क्रम से दी है, जिसे आप घर पर आसानी से कर सकते हैं।"],
      ],
    },
  },
  kundli: {
    en: {
      h: "About the free kundli",
      intro: [
        "A kundli, also called a janam kundli or birth chart, is a map of the sky at the exact moment and place you were born. It shows where the Sun, Moon and the other planets stood, which house each one sits in, and which rashi and nakshatra your Moon is in.",
        "Kundli Kaka works this out with real planetary positions and the Lahiri ayanamsa used in Vedic astrology. You get the chart, your current dasha period, where Jupiter is this year, and a short reading of your strengths in plain language.",
      ],
      how: [
        "Enter your date of birth, time of birth and place of birth.",
        "If you are not sure of the time, give your best guess and tick that you are unsure. The page tells you what that affects.",
        "Read your chart and reading. You can change the language between English, Hindi and Hinglish at any time.",
      ],
      get: [
        "Birth chart with planets in all twelve houses",
        "Moon sign (rashi) and nakshatra",
        "Current Vimshottari dasha and antardasha",
        "Where Jupiter and Saturn are for you right now",
        "A reading of strengths, work, money and relationships",
      ],
      faq: [
        ["Is the kundli free?", "Yes. The kundli is free and needs no sign-up."],
        ["What if I do not know my exact birth time?", "Use your best estimate. The Moon sign is usually right even if the time is a little off, but the ascendant and houses can change, so treat those parts with care."],
        ["What is a dasha?", "A dasha is a planetary period in your life, worked out from where your Moon was at birth. Each period brings the themes of its planet to the front."],
        ["Which ayanamsa do you use?", "The Lahiri ayanamsa, which is the standard for Vedic astrology in India."],
        ["Can I read the kundli in Hindi?", "Yes. Choose Hindi or Hinglish at the top and the whole reading changes language."],
      ],
    },
    hi: {
      h: "मुफ़्त कुंडली के बारे में",
      intro: [
        "कुंडली, जिसे जन्म कुंडली भी कहते हैं, आपके जन्म के ठीक समय और स्थान पर आकाश का नक्शा है। इसमें दिखता है कि सूर्य, चंद्रमा और अन्य ग्रह कहाँ थे, हर ग्रह किस भाव में है, और आपका चंद्रमा किस राशि और नक्षत्र में है।",
        "कुंडली काका यह असली ग्रह स्थितियों और वैदिक ज्योतिष के लाहिरी अयनांश से निकालता है। आपको कुंडली, अभी की दशा, इस साल गुरु कहाँ है, और आपकी ताकतों का सरल भाषा में फल मिलता है।",
      ],
      how: [
        "अपनी जन्म तिथि, जन्म का समय और जन्म स्थान भरें।",
        "समय पक्का न हो तो अंदाज़ा भरें और टिक करें कि आप पक्के नहीं हैं। पेज बताता है कि इससे क्या बदलता है।",
        "अपनी कुंडली और फल पढ़ें। भाषा कभी भी अंग्रेज़ी, हिंदी या हिंग्लिश में बदल सकते हैं।",
      ],
      get: [
        "बारह भावों में ग्रहों के साथ जन्म कुंडली",
        "चंद्र राशि और नक्षत्र",
        "वर्तमान विंशोत्तरी दशा और अंतर्दशा",
        "अभी आपके लिए गुरु और शनि कहाँ हैं",
        "ताकत, काम, पैसा और रिश्तों का फल",
      ],
      faq: [
        ["क्या कुंडली मुफ़्त है?", "हाँ। कुंडली मुफ़्त है और साइन-अप नहीं चाहिए।"],
        ["जन्म का सही समय न पता हो तो?", "अपना सबसे अच्छा अंदाज़ा भरें। समय थोड़ा गलत हो तब भी चंद्र राशि अक्सर सही रहती है, पर लग्न और भाव बदल सकते हैं, इसलिए उन हिस्सों को सावधानी से लें।"],
        ["दशा क्या होती है?", "दशा आपके जीवन का ग्रह काल है, जो जन्म के समय चंद्रमा की स्थिति से निकलता है। हर दशा में उस ग्रह के विषय आगे रहते हैं।"],
        ["आप कौन-सा अयनांश इस्तेमाल करते हैं?", "लाहिरी अयनांश, जो भारत में वैदिक ज्योतिष का मानक है।"],
        ["क्या कुंडली हिंदी में पढ़ सकते हैं?", "हाँ। ऊपर से हिंदी या हिंग्लिश चुनिए, पूरा फल उसी भाषा में बदल जाता है।"],
      ],
    },
  },
  match: {
    en: {
      h: "About Kundli Milan",
      intro: [
        "Kundli Milan, also called gun milan or Ashtakoot matching, compares the birth charts of two people before marriage. The traditional method scores them out of 36 points across eight areas, using the Moon's nakshatra and rashi in each chart.",
        "Kundli Kaka works out the Moon positions from the real sky for each birth date, time and place, then gives you the score for each area, the total, and a short note on what needs care.",
      ],
      how: [
        "Enter the date, time and place of birth for both people.",
        "Read the total score out of 36 and the score for each of the eight areas.",
        "Read the notes on any area that scores low, and what is usually done about it.",
      ],
      get: [
        "Total Ashtakoot score out of 36",
        "Varna (1), Vashya (2), Tara (3) and Yoni (4)",
        "Graha Maitri (5), Gana (6), Bhakoot (7) and Nadi (8)",
        "Plain-language notes on each area",
      ],
      faq: [
        ["How many points are needed for a good match?", "Traditionally 18 out of 36 is the minimum, and 24 or more is considered good. The score is one part of the picture, not the whole of it."],
        ["What are the eight kootas?", "Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi. They carry 1, 2, 3, 4, 5, 6, 7 and 8 points, which add up to 36."],
        ["What is Nadi dosha?", "It is a low score on Nadi, the area worth 8 points, which happens when both people share the same Nadi. It is traditionally given a lot of weight, so the page explains it."],
        ["Is it free?", "Yes. Kundli Milan is free and needs no sign-up."],
        ["Do I need exact birth times?", "The match mostly depends on the Moon's nakshatra, so a close time is usually enough, but the exact time gives the best result."],
      ],
    },
    hi: {
      h: "कुंडली मिलान के बारे में",
      intro: [
        "कुंडली मिलान, जिसे गुण मिलान या अष्टकूट मिलान भी कहते हैं, विवाह से पहले दो लोगों की जन्म कुंडलियों की तुलना है। पारंपरिक तरीके में दोनों कुंडलियों के चंद्र नक्षत्र और राशि से आठ क्षेत्रों में 36 अंकों में से अंक दिए जाते हैं।",
        "कुंडली काका हर जन्म तिथि, समय और स्थान के असली आकाश से चंद्र स्थिति निकालता है, फिर हर क्षेत्र के अंक, कुल अंक, और किस बात पर ध्यान देना है इसका छोटा नोट देता है।",
      ],
      how: [
        "दोनों लोगों की जन्म तिथि, समय और स्थान भरें।",
        "36 में से कुल अंक और आठों क्षेत्रों के अंक पढ़ें।",
        "जिस क्षेत्र में अंक कम हों, उसका नोट और आमतौर पर क्या किया जाता है, पढ़ें।",
      ],
      get: [
        "36 में से कुल अष्टकूट अंक",
        "वर्ण (1), वश्य (2), तारा (3) और योनि (4)",
        "ग्रह मैत्री (5), गण (6), भकूट (7) और नाड़ी (8)",
        "हर क्षेत्र पर सरल भाषा में नोट",
      ],
      faq: [
        ["अच्छे मिलान के लिए कितने गुण चाहिए?", "पारंपरिक रूप से 36 में से कम से कम 18 गुण चाहिए, और 24 या ज़्यादा अच्छे माने जाते हैं। अंक तस्वीर का एक हिस्सा है, पूरी तस्वीर नहीं।"],
        ["आठ कूट कौन-से हैं?", "वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी। इनके अंक 1, 2, 3, 4, 5, 6, 7 और 8 हैं, जो मिलकर 36 होते हैं।"],
        ["नाड़ी दोष क्या है?", "यह नाड़ी में कम अंक है, जो 8 अंकों का क्षेत्र है, और तब होता है जब दोनों की नाड़ी एक ही हो। पारंपरिक रूप से इसे बहुत महत्व दिया जाता है, इसलिए पेज इसे समझाता है।"],
        ["क्या यह मुफ़्त है?", "हाँ। कुंडली मिलान मुफ़्त है और साइन-अप नहीं चाहिए।"],
        ["क्या जन्म का सही समय ज़रूरी है?", "मिलान ज़्यादातर चंद्र नक्षत्र पर निर्भर है, इसलिए पास का समय अक्सर काफ़ी है, पर सही समय से सबसे अच्छा परिणाम मिलता है।"],
      ],
    },
  },
  rashifal: {
    en: {
      h: "About the daily rashifal",
      intro: [
        "Rashifal is the daily horoscope for your Moon sign, called your rashi. In Vedic astrology the Moon is the main guide for how a day feels, because it changes sign about every two and a half days and its position shapes mood, energy and focus.",
        "Kundli Kaka reads the real Moon position for the day and shows what it means for each of the twelve rashis: mood, love, work and one simple tip. You can look at yesterday, today and tomorrow.",
      ],
      how: [
        "Find your rashi. If you do not know it, make a free kundli and it will show your Moon sign.",
        "Open your sign and read today's mood, love, work and tip.",
        "Come back each day, since the Moon moves and the rashifal changes with it.",
      ],
      get: [
        "Daily rashifal for Mesh, Vrishabh, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh and Meen",
        "Yesterday, today and tomorrow",
        "Mood, love, work and a tip for each sign",
      ],
      faq: [
        ["How do I know my rashi?", "Your rashi is the sign your Moon was in when you were born. Make a free kundli on Kundli Kaka and it shows your Moon sign."],
        ["Is the rashifal the same as my Western sun sign?", "No. Vedic astrology uses the sidereal zodiac and the Moon sign, so your rashi is often different from your Western sun sign."],
        ["How is the daily rashifal worked out?", "From the real position of the Moon for the day. It is not the same text repeated or written once for the whole month."],
        ["Is it free?", "Yes. The daily rashifal is free and needs no sign-up."],
        ["Can I read it in Hindi?", "Yes. Choose Hindi or Hinglish at the top and the rashifal changes language."],
      ],
    },
    hi: {
      h: "दैनिक राशिफल के बारे में",
      intro: [
        "राशिफल आपकी चंद्र राशि का दैनिक भविष्यफल है। वैदिक ज्योतिष में चंद्रमा दिन के अनुभव का मुख्य मार्गदर्शक है, क्योंकि वह लगभग सवा दो दिन में राशि बदलता है और उसकी स्थिति मन, ऊर्जा और ध्यान को प्रभावित करती है।",
        "कुंडली काका उस दिन की असली चंद्र स्थिति पढ़कर बारह राशियों के लिए बताता है कि मन, प्रेम, काम और एक सरल सुझाव क्या हैं। आप कल, आज और आने वाले कल का राशिफल देख सकते हैं।",
      ],
      how: [
        "अपनी राशि खोजें। राशि न पता हो तो मुफ़्त कुंडली बनाइए, उसमें आपकी चंद्र राशि दिखेगी।",
        "अपनी राशि खोलकर आज का मन, प्रेम, काम और सुझाव पढ़ें।",
        "हर दिन आइए, क्योंकि चंद्रमा चलता है और राशिफल उसी के साथ बदलता है।",
      ],
      get: [
        "मेष, वृषभ, मिथुन, कर्क, सिंह, कन्या, तुला, वृश्चिक, धनु, मकर, कुंभ और मीन का दैनिक राशिफल",
        "कल, आज और आने वाला कल",
        "हर राशि के लिए मन, प्रेम, काम और सुझाव",
      ],
      faq: [
        ["मेरी राशि कैसे पता करें?", "आपकी राशि वह है जिसमें जन्म के समय आपका चंद्रमा था। कुंडली काका पर मुफ़्त कुंडली बनाइए, उसमें चंद्र राशि दिखती है।"],
        ["क्या राशिफल मेरी पश्चिमी सन साइन जैसा है?", "नहीं। वैदिक ज्योतिष निरयन राशिचक्र और चंद्र राशि इस्तेमाल करता है, इसलिए आपकी राशि अक्सर पश्चिमी सन साइन से अलग होती है।"],
        ["दैनिक राशिफल कैसे बनता है?", "उस दिन की असली चंद्र स्थिति से। यह एक ही लिखा हुआ पाठ बार-बार दोहराया नहीं जाता।"],
        ["क्या यह मुफ़्त है?", "हाँ। दैनिक राशिफल मुफ़्त है और साइन-अप नहीं चाहिए।"],
        ["क्या इसे हिंदी में पढ़ सकते हैं?", "हाँ। ऊपर से हिंदी या हिंग्लिश चुनिए, राशिफल उसी भाषा में बदल जाएगा।"],
      ],
    },
  },
  panchang: {
    en: {
      h: "About today's panchang",
      intro: [
        "The panchang is the Hindu calendar for the day. Its five limbs are tithi (the lunar day), vara (the weekday), nakshatra (the star the Moon is in), yoga and karana. People look at it to choose a good time for a puja, travel or a new beginning.",
        "Kundli Kaka calculates the panchang from the real sky for your city, including sunrise and sunset, Rahu Kaal, and the choghadiya slots that are good or to be avoided.",
      ],
      how: [
        "Choose your city, since sunrise and the timings depend on where you are.",
        "Read the tithi, nakshatra, yoga and karana for the day.",
        "Check Rahu Kaal and the choghadiya, then pick a good slot for what you plan to do.",
      ],
      get: [
        "Tithi, vara, nakshatra, yoga and karana",
        "Sunrise and sunset for your city",
        "Rahu Kaal for the day",
        "Choghadiya slots: Amrit, Shubh, Labh, Char, Udveg, Kaal and Rog",
      ],
      faq: [
        ["What is a tithi?", "A tithi is a lunar day, one thirtieth of the Moon's cycle. There are 30 tithis in a lunar month, 15 in the waxing phase and 15 in the waning phase."],
        ["What is Rahu Kaal?", "Rahu Kaal is a stretch of about an hour and a half each day that is traditionally avoided for starting something new. Its time changes with the weekday and your sunrise."],
        ["What is choghadiya?", "Choghadiya divides the day and the night into eight slots each. Amrit, Shubh and Labh are considered good, and Udveg, Kaal and Rog are avoided."],
        ["Why do the timings differ by city?", "Sunrise and sunset change with where you are, and the panchang timings are counted from them."],
        ["Is it free?", "Yes. The panchang is free and needs no sign-up."],
      ],
    },
    hi: {
      h: "आज के पंचांग के बारे में",
      intro: [
        "पंचांग दिन का हिंदू कैलेंडर है। इसके पाँच अंग हैं: तिथि (चंद्र दिन), वार (सप्ताह का दिन), नक्षत्र (वह तारा जिसमें चंद्रमा है), योग और करण। लोग पूजा, यात्रा या नई शुरुआत का शुभ समय चुनने के लिए इसे देखते हैं।",
        "कुंडली काका आपके शहर के असली आकाश से पंचांग निकालता है, जिसमें सूर्योदय, सूर्यास्त, राहु काल और शुभ तथा अशुभ चौघड़िया शामिल हैं।",
      ],
      how: [
        "अपना शहर चुनिए, क्योंकि सूर्योदय और समय आपकी जगह पर निर्भर हैं।",
        "दिन की तिथि, नक्षत्र, योग और करण पढ़ें।",
        "राहु काल और चौघड़िया देखकर अपने काम के लिए अच्छा समय चुनें।",
      ],
      get: [
        "तिथि, वार, नक्षत्र, योग और करण",
        "आपके शहर का सूर्योदय और सूर्यास्त",
        "दिन का राहु काल",
        "चौघड़िया: अमृत, शुभ, लाभ, चर, उद्वेग, काल और रोग",
      ],
      faq: [
        ["तिथि क्या होती है?", "तिथि चंद्र दिन है, जो चंद्रमा के चक्र का तीसवाँ भाग है। एक चंद्र मास में 30 तिथियाँ होती हैं, 15 शुक्ल पक्ष की और 15 कृष्ण पक्ष की।"],
        ["राहु काल क्या है?", "राहु काल हर दिन लगभग डेढ़ घंटे का समय है, जिसमें पारंपरिक रूप से नया काम शुरू नहीं किया जाता। इसका समय वार और आपके सूर्योदय से बदलता है।"],
        ["चौघड़िया क्या है?", "चौघड़िया दिन और रात को आठ-आठ भागों में बाँटता है। अमृत, शुभ और लाभ अच्छे माने जाते हैं, और उद्वेग, काल और रोग से बचा जाता है।"],
        ["अलग शहरों में समय अलग क्यों होता है?", "सूर्योदय और सूर्यास्त आपकी जगह के साथ बदलते हैं, और पंचांग का समय उन्हीं से गिना जाता है।"],
        ["क्या यह मुफ़्त है?", "हाँ। पंचांग मुफ़्त है और साइन-अप नहीं चाहिए।"],
      ],
    },
  },
  tarot: {
    en: {
      h: "About the free tarot reading",
      intro: [
        "Tarot is a deck of 78 cards used to reflect on a question. In a three-card spread, the first card stands for the past, the second for the present and the third for what is next, so you can see a situation as a short story.",
        "On Kundli Kaka you choose love, career or money, turn each card yourself, and read what it may be telling you. It is a way to think a question through, not a promise of what will happen.",
      ],
      how: [
        "Choose what you want to ask about: love, career or money.",
        "Take a breath, then turn the three cards one by one.",
        "Read the meaning of each card and how the three fit together.",
      ],
      get: [
        "Three-card reading: past, present and next",
        "Love, career and money themes",
        "A short note for each card",
      ],
      faq: [
        ["Is the tarot reading free?", "Yes. It is free and needs no sign-up."],
        ["How many cards are in a tarot deck?", "A full deck has 78 cards: 22 Major Arcana cards and 56 Minor Arcana cards."],
        ["What does the three-card spread mean?", "The three cards stand for the past, the present and what comes next. Reading them together tells a small story about your question."],
        ["Can tarot predict the future?", "Tarot is best used to reflect and to see choices more clearly. Use it as a guide for thinking, not as a fixed forecast."],
        ["Can I ask the same question again?", "You can, but a fresh reading for the same question usually adds little. Wait for something to change, then ask again."],
      ],
    },
    hi: {
      h: "मुफ़्त टैरो रीडिंग के बारे में",
      intro: [
        "टैरो 78 कार्डों की एक डेक है, जिसका उपयोग किसी सवाल पर सोचने के लिए होता है। तीन कार्ड के स्प्रेड में पहला कार्ड अतीत, दूसरा वर्तमान और तीसरा आगे का सूचक है, ताकि आप स्थिति को एक छोटी कहानी की तरह देख सकें।",
        "कुंडली काका पर आप प्रेम, करियर या धन चुनते हैं, हर कार्ड खुद पलटते हैं, और पढ़ते हैं कि वह क्या कह रहा है। यह सवाल पर सोचने का तरीका है, भविष्य का वादा नहीं।",
      ],
      how: [
        "चुनिए कि किस बारे में पूछना है: प्रेम, करियर या धन।",
        "एक गहरी साँस लीजिए, फिर तीनों कार्ड एक-एक करके पलटिए।",
        "हर कार्ड का अर्थ और तीनों का आपस में मेल पढ़ें।",
      ],
      get: [
        "तीन कार्ड रीडिंग: अतीत, वर्तमान और आगे",
        "प्रेम, करियर और धन के विषय",
        "हर कार्ड पर छोटा नोट",
      ],
      faq: [
        ["क्या टैरो रीडिंग मुफ़्त है?", "हाँ। यह मुफ़्त है और साइन-अप नहीं चाहिए।"],
        ["टैरो डेक में कितने कार्ड होते हैं?", "पूरी डेक में 78 कार्ड होते हैं: 22 मेजर अर्काना और 56 माइनर अर्काना।"],
        ["तीन कार्ड स्प्रेड का क्या मतलब है?", "तीनों कार्ड अतीत, वर्तमान और आगे का प्रतीक हैं। उन्हें साथ पढ़ने से आपके सवाल पर एक छोटी कहानी बनती है।"],
        ["क्या टैरो भविष्य बता सकता है?", "टैरो का सबसे अच्छा उपयोग सोचने और विकल्प साफ़ देखने में है। इसे सोच का मार्गदर्शक मानिए, पक्की भविष्यवाणी नहीं।"],
        ["क्या वही सवाल दोबारा पूछ सकते हैं?", "पूछ सकते हैं, पर उसी सवाल की नई रीडिंग से आमतौर पर कुछ नया नहीं मिलता। कुछ बदलने का इंतज़ार कीजिए, फिर पूछिए।"],
      ],
    },
  },
};
