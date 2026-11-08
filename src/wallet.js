// Money and signature helpers for the wallet. Pure functions, no network, easy to test.
// All amounts are kept in paise (1 rupee = 100 paise) as whole numbers, so there is never a rounding error.
import crypto from "node:crypto";
import { InputError } from "./validate.js";

export const CURRENCY = "INR";

/** Smallest and largest top-up in whole rupees. Can be changed with TOPUP_MIN_RUPEES / TOPUP_MAX_RUPEES. */
export function topupLimits(env = process.env) {
  const min = Math.floor(Number(env.TOPUP_MIN_RUPEES)) || 50;
  const max = Math.floor(Number(env.TOPUP_MAX_RUPEES)) || 10000;
  return { min: Math.max(1, Math.min(min, max)), max: Math.max(min, max) };
}

/** A top-up amount typed by a user, in whole rupees, checked against the limits. Returns paise. */
export function parseTopup(raw, { min, max }) {
  const text = typeof raw === "string" ? raw.trim() : raw;
  const rupees = typeof text === "number" ? text : /^\d{1,7}$/.test(text || "") ? Number(text) : NaN;
  if (!Number.isInteger(rupees)) throw new InputError("Enter a whole-rupee amount.");
  if (rupees < min) throw new InputError(`The smallest top-up is ₹${min}.`);
  if (rupees > max) throw new InputError(`The largest top-up is ₹${max.toLocaleString("en-IN")}.`);
  return rupees * 100;
}

const hmacHex = (data, secret) => crypto.createHmac("sha256", secret).update(data).digest("hex");

/** Compare two hex strings without leaking where they differ. */
export function safeEqualHex(a, b) {
  const x = Buffer.from(String(a || ""), "utf8");
  const y = Buffer.from(String(b || ""), "utf8");
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

/** Razorpay Checkout proof: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
export function signCheckout(orderId, paymentId, keySecret) {
  return hmacHex(`${orderId}|${paymentId}`, keySecret);
}
export function verifyCheckout({ orderId, paymentId, signature }, keySecret) {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  return safeEqualHex(signCheckout(orderId, paymentId, keySecret), signature);
}

/** Razorpay webhook proof: HMAC-SHA256 of the exact raw request body with the webhook secret. */
export function verifyWebhook(rawBody, signature, webhookSecret) {
  if (!rawBody || !signature || !webhookSecret) return false;
  return safeEqualHex(hmacHex(rawBody, webhookSecret), signature);
}

/** A name typed at sign-up: letters, spaces and . ' - only. Returns "" if it is not usable. */
export function cleanProfileName(raw) {
  const s = String(raw ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{M} .'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return s.length >= 2 ? s : "";
}

export const inr = (paise) => `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0 })}`;
