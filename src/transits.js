// Slow-moving planet transits (Saturn, Jupiter, Rahu, Ketu) and the
// Sade Sati / Dhaiya check for a person's Moon sign.

import sweph from "sweph";
import { DateTime } from "luxon";
import { SIGNS } from "./astro-data.js";
import { getContent } from "./content.js";

const C = sweph.constants;
sweph.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);
const FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SIDEREAL;
const norm360 = (x) => ((x % 360) + 360) % 360;

const signOf = (jd, body) =>
  Math.floor(norm360(sweph.calc_ut(jd, body, FLAGS).data[0]) / 30);

function noonJd(date, tz) {
  const noon = DateTime.fromISO(date, { zone: tz }).set({ hour: 12 }).toUTC();
  if (!noon.isValid) throw new Error("Invalid date or timezone");
  return sweph.julday(noon.year, noon.month, noon.day, noon.hour + noon.minute / 60, C.SE_GREG_CAL);
}

const signInfo = (i) => ({ index: i, sign: SIGNS[i].en, signHi: SIGNS[i].hi });

export function slowPlanets(date, tz) {
  const jd = noonJd(date, tz);
  const rahu = signOf(jd, C.SE_MEAN_NODE);
  return {
    Saturn: signInfo(signOf(jd, C.SE_SATURN)),
    Jupiter: signInfo(signOf(jd, C.SE_JUPITER)),
    Rahu: signInfo(rahu),
    Ketu: signInfo((rahu + 6) % 12),
  };
}

function jdToIso(jd) {
  const u = sweph.jdut1_to_utc(jd, C.SE_GREG_CAL);
  return `${u.year}-${String(u.month).padStart(2, "0")}-${String(u.day).padStart(2, "0")}`;
}

// When did Saturn enter its current sign, and when does it leave?
export function saturnWindow(date, tz) {
  const jd = noonJd(date, tz);
  const cur = signOf(jd, C.SE_SATURN);

  function scan(direction) {
    let prev = jd;
    for (let d = 5; d <= 4000; d += 5) {
      const next = jd + direction * d;
      if (signOf(next, C.SE_SATURN) !== cur) {
        let lo = direction > 0 ? prev : next;
        let hi = direction > 0 ? next : prev;
        // lo is inside the current sign when going forward, hi when going back
        for (let i = 0; i < 30; i++) {
          const mid = (lo + hi) / 2;
          const inside = signOf(mid, C.SE_SATURN) === cur;
          if (direction > 0) { if (inside) lo = mid; else hi = mid; }
          else { if (inside) hi = mid; else lo = mid; }
        }
        // hi is the first point outside the sign going forward, and the first
        // point inside it going back, which is the ingress date either way
        return jdToIso(hi);
      }
      prev = next;
    }
    return null;
  }

  return { ...signInfo(cur), entered: scan(-1), leaves: scan(1) };
}

// Saturn's place from the person's Moon sign.
export function sadeSati(natalMoonSignIndex, saturnSignIndex, lang = "hn") {
  const { SADE_SATI } = getContent(lang);
  const d = (saturnSignIndex - natalMoonSignIndex + 12) % 12;
  const key =
    d === 11 ? "rising" :
    d === 0 ? "peak" :
    d === 1 ? "setting" :
    d === 3 ? "kantak" :
    d === 7 ? "ashtam" : "none";
  const s = SADE_SATI.states[key];
  return {
    key,
    active: ["rising", "peak", "setting"].includes(key),
    dhaiya: key === "kantak" || key === "ashtam",
    title: s.title,
    text: s.text,
    ...(key === "none" ? {} : { common: SADE_SATI.common, tip: SADE_SATI.tip }),
  };
}
