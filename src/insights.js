// Short, free, plain-language lines shown right after the chart.
// Vedic: lagna (rising sign) is the outer personality; rashi (Moon sign) is the inner mood.
// Western: Sun sign, Moon sign and Rising sign.

import { getContent } from "./content.js";

export function quickInsights(chart, { timeUnknown = false, lang = "hn" } = {}) {
  const C = getContent(lang);
  const moon = chart.planets.find((p) => p.key === "Moon");
  if (chart.tradition === "western") {
    return {
      sun: C.SUN[chart.sunSign.signIndex],
      rashi: C.RASHI[moon.signIndex],
      lagna: timeUnknown ? null : C.LAGNA[chart.ascendant.signIndex],
      dasha: null,
    };
  }
  const lord = chart.dasha.current?.mahadasha?.lord;
  return {
    // Without the exact birth time the lagna cannot be trusted.
    lagna: timeUnknown ? null : C.LAGNA[chart.ascendant.signIndex],
    rashi: C.RASHI[moon.signIndex],
    dasha: !timeUnknown && lord ? { lord, text: C.DASHA_THEME[lord] } : null,
  };
}
