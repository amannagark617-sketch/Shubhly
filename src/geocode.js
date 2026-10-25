// Place lookup using the free Open-Meteo geocoding API (no key needed).
// It returns latitude, longitude and an IANA timezone for each match.

import tzlookup from "tz-lookup";

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export async function searchPlaces(query, { count = 6 } = {}) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  const url = `${ENDPOINT}?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();

  return (data.results || []).map((r) => {
    let tz = r.timezone;
    if (!tz) {
      try {
        tz = tzlookup(r.latitude, r.longitude);
      } catch {
        tz = null;
      }
    }
    const parts = [r.name, r.admin1, r.country].filter(Boolean);
    return {
      label: parts.join(", "),
      lat: r.latitude,
      lon: r.longitude,
      tz,
    };
  });
}
