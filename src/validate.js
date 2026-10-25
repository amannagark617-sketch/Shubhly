import { DateTime } from "luxon";
import { TOPICS } from "./prompt.js";

export class InputError extends Error {}

export function cleanName(raw) {
  const s = String(raw ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{M} .'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return s || "Friend";
}

export function parseBirthInput(body) {
  const date = String(body?.date ?? "");
  const time = String(body?.time ?? "");
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm) throw new InputError("Please enter a valid date of birth.");
  if (!tm) throw new InputError("Please enter a valid time of birth.");

  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  const hour = Number(tm[1]);
  const minute = Number(tm[2]);
  if (year < 1900 || year > 2100)
    throw new InputError("Birth year must be between 1900 and 2100.");
  if (hour > 23 || minute > 59)
    throw new InputError("Please enter a valid time of birth.");

  const place = body?.place ?? {};
  const lat = Number(place.lat);
  const lon = Number(place.lon);
  const tz = String(place.tz ?? "");
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    throw new InputError("Please choose your birth place from the list.");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180)
    throw new InputError("Please choose your birth place from the list.");
  if (!tz || !DateTime.now().setZone(tz).isValid)
    throw new InputError("We could not find the timezone for that place.");

  return {
    year,
    month,
    day,
    hour,
    minute,
    lat,
    lon,
    tz,
    placeLabel: String(place.label ?? "").slice(0, 120),
    timeUnknown: body?.timeUnknown === true,
  };
}

export const DEFAULT_PLACE = {
  lat: 28.6139,
  lon: 77.209,
  tz: "Asia/Kolkata",
  label: "Delhi",
};

// Place for the daily features, from query parameters. Falls back to Delhi.
export function parseQueryPlace(q) {
  if (q?.lat === undefined && q?.lon === undefined && !q?.tz) {
    return { ...DEFAULT_PLACE };
  }
  const lat = Number(q.lat);
  const lon = Number(q.lon);
  const tz = String(q.tz ?? "");
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    throw new InputError("That place is not valid.");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180)
    throw new InputError("That place is not valid.");
  if (!tz || !DateTime.now().setZone(tz).isValid)
    throw new InputError("We could not find the timezone for that place.");
  return { lat, lon, tz, label: "" };
}

// A YYYY-MM-DD date, or today in the place's timezone when none is given.
export function parseQueryDate(q, tz) {
  const raw = q?.date ? String(q.date) : DateTime.now().setZone(tz).toISODate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new InputError("Please give a valid date.");
  const d = DateTime.fromISO(raw, { zone: tz });
  if (!d.isValid || d.year < 1950 || d.year > 2100)
    throw new InputError("Please give a valid date.");
  return raw;
}

// Moon sign index 0 to 11, or null when not given.
export function parseMoonIndex(raw) {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 11)
    throw new InputError("That rashi is not valid.");
  return n;
}

export function parseTopic(raw) {
  return Object.hasOwn(TOPICS, raw) ? raw : "general";
}

export function parseLanguage(raw) {
  return raw === "en" ? "en" : "hi";
}
