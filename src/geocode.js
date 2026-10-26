// Place lookup using the free Open-Meteo geocoding API (no key needed).
// It returns latitude, longitude and an IANA timezone for each match.

import tzlookup from "tz-lookup";
import { localPlaces } from "./cities.js";

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

const zoneOf = (lat, lon) => {
  try { return tzlookup(lat, lon); } catch { return null; }
};

async function onlineSearch(q, count) {
  const url = `${ENDPOINT}?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
    tz: r.timezone || zoneOf(r.latitude, r.longitude),
  }));
}

// Online search first; the built-in list covers outages and empty answers,
// so a birth place can always be picked.
export async function searchPlaces(query, { count = 6 } = {}) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  let found = [];
  for (let i = 0; i < 2 && !found.length; i++) {
    try {
      found = await onlineSearch(q, count);
      break;
    } catch (e) {
      if (i === 1) console.error("Online place search failed:", e.message);
    }
  }
  if (found.length) return found.filter((p) => p.tz);
  return localPlaces(q, count).map((p) => ({ ...p, tz: zoneOf(p.lat, p.lon) })).filter((p) => p.tz);
}
