// The real sky, day by day: where each planet sits in the zodiac (sidereal,
// Lahiri) and whether it is moving backward. Used by the live wheel on the home page.

import sweph from "sweph";
import { DateTime } from "luxon";

const C = sweph.constants;
sweph.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);
const FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SIDEREAL | C.SEFLG_SPEED;
const norm = (x) => ((x % 360) + 360) % 360;

const BODIES = [
  ["Sun", C.SE_SUN], ["Moon", C.SE_MOON], ["Mars", C.SE_MARS], ["Mercury", C.SE_MERCURY],
  ["Jupiter", C.SE_JUPITER], ["Venus", C.SE_VENUS], ["Saturn", C.SE_SATURN], ["Rahu", C.SE_MEAN_NODE],
];

export const MEANING = {
  en: {
    Sun: "The Sun is your core self: confidence, purpose and your father.",
    Moon: "The Moon is your mind and mood. It changes sign about every two and a quarter days.",
    Mars: "Mars is energy, courage and drive. It also carries anger.",
    Mercury: "Mercury is thinking, talking, trade and learning.",
    Jupiter: "Jupiter is wisdom, growth, teachers and good fortune.",
    Venus: "Venus is love, beauty, comfort and money.",
    Saturn: "Saturn is discipline, patience and results that last.",
    Rahu: "Rahu is ambition and the hunger for more. Ketu sits exactly opposite.",
    Ketu: "Ketu is detachment and inner wisdom. Rahu sits exactly opposite.",
  },
  hi: {
    Sun: "सूर्य आपका मूल स्वरूप है: आत्मविश्वास, उद्देश्य और पिता।",
    Moon: "चंद्र आपका मन और मूड है। यह लगभग सवा दो दिन में राशि बदलता है।",
    Mars: "मंगल ऊर्जा, साहस और जोश है। इसमें क्रोध भी आता है।",
    Mercury: "बुध सोच, बातचीत, व्यापार और सीखना है।",
    Jupiter: "गुरु ज्ञान, विकास, शिक्षक और सौभाग्य है।",
    Venus: "शुक्र प्रेम, सुंदरता, सुख और धन है।",
    Saturn: "शनि अनुशासन, धैर्य और टिकाऊ नतीजे हैं।",
    Rahu: "राहु महत्वाकांक्षा और और पाने की भूख है। केतु ठीक उसके सामने रहता है।",
    Ketu: "केतु वैराग्य और भीतरी समझ है। राहु ठीक उसके सामने रहता है।",
  },
  hn: {
    Sun: "Surya aapka core self hai: confidence, purpose aur pita.",
    Moon: "Chandra aapka mann aur mood hai. Yeh lagbhag sava do din mein rashi badalta hai.",
    Mars: "Mangal energy, courage aur josh hai. Isme gussa bhi aata hai.",
    Mercury: "Budh sochna, baat karna, vyapar aur seekhna hai.",
    Jupiter: "Guru wisdom, growth, teachers aur good luck hai.",
    Venus: "Shukra pyaar, beauty, comfort aur paisa hai.",
    Saturn: "Shani discipline, patience aur tikaau results hai.",
    Rahu: "Rahu ambition aur aur paane ki bhookh hai. Ketu theek uske saamne rehta hai.",
    Ketu: "Ketu vairagya aur inner wisdom hai. Rahu theek uske saamne rehta hai.",
  },
};

export function skyRange(fromIso, days, tz = "Asia/Kolkata") {
  const start = DateTime.fromISO(fromIso, { zone: tz });
  if (!start.isValid) throw new Error("Invalid date");
  const list = BODIES.map(([key]) => ({ key, lon: [], retro: [] }));
  for (let d = 0; d < days; d++) {
    const noon = start.plus({ days: d }).set({ hour: 12, minute: 0 }).toUTC();
    const jd = sweph.julday(noon.year, noon.month, noon.day, noon.hour + noon.minute / 60, C.SE_GREG_CAL);
    BODIES.forEach(([, id], i) => {
      const r = sweph.calc_ut(jd, id, FLAGS).data;
      list[i].lon.push(Math.round(norm(r[0]) * 100) / 100);
      list[i].retro.push(i === 7 ? true : r[3] < 0); // the Moon's nodes always move backward
    });
  }
  const rahu = list[7];
  list.push({ key: "Ketu", lon: rahu.lon.map((x) => Math.round(norm(x + 180) * 100) / 100), retro: rahu.retro.slice() });
  return { from: start.toISODate(), days, planets: list };
}
