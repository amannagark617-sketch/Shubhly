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

export function parseTopic(raw) {
  return Object.hasOwn(TOPICS, raw) ? raw : "general";
}

export function parseLanguage(raw) {
  return raw === "en" ? "en" : "hi";
}
