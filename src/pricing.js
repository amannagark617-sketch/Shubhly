// What things cost, in paise (100 paise = ₹1). One place, so prices can change without touching the rest.
// Override any of them with an environment variable (whole rupees), e.g. PRICE_CHAT_RUPEES=4.

const rupees = (env, key, fallback) => {
  const n = Number(env[key]);
  return Number.isFinite(n) && n >= 1 && n <= 5000 ? Math.round(n * 100) : fallback;
};

export function pricesFromEnv(env = process.env) {
  return {
    chat: rupees(env, "PRICE_CHAT_RUPEES", 300), // one reply from an astrologer
    krishna: rupees(env, "PRICE_KRISHNA_RUPEES", 200), // one reply from Krishna
    voice: rupees(env, "PRICE_VOICE_RUPEES", 900), // Krishna's spoken voice, on top of the text
    report: rupees(env, "PRICE_REPORT_RUPEES", 9900), // kundli report with PDF
    milan: rupees(env, "PRICE_MILAN_RUPEES", 16900), // couple's Kundli Milan report with PDF
  };
}

/** Free credit given once to each verified phone number. */
export const welcomePaise = (env = process.env) => (env.WELCOME_CREDIT_RUPEES === "0" ? 0 : rupees(env, "WELCOME_CREDIT_RUPEES", 1000));

/** Extra credit on big top-ups. Nothing below ₹499. */
export function bonusFor(paise) {
  if (paise >= 99900) return 15000;
  if (paise >= 49900) return 5000;
  return 0;
}

export const BONUS_TIERS = [{ topup: 499, bonus: 50 }, { topup: 999, bonus: 150 }];
export const VOICE_DAILY_CAP = 10;
