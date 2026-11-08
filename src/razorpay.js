// Razorpay, using its plain web API (no extra package). Keys come from settings, never from the page.
const API = "https://api.razorpay.com/v1";

export function razorpayFromEnv(env = process.env) {
  const keyId = (env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (env.RAZORPAY_KEY_SECRET || "").trim();
  const webhookSecret = (env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId) || !keySecret) return null;
  return {
    keyId,
    keySecret,
    webhookSecret,
    live: keyId.startsWith("rzp_live_"),
    /** Create a payment order. The amount is decided here on the server, never taken from the browser as final. */
    async createOrder({ amountPaise, receipt, notes }, fetchImpl = fetch) {
      const res = await fetchImpl(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
        },
        body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        throw new Error(`Razorpay order failed (${res.status}): ${data?.error?.description || "no details"}`);
      }
      return { id: data.id, amountPaise: data.amount, currency: data.currency };
    },
  };
}
