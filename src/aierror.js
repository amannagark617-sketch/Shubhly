// Say what is wrong when the AI service refuses a request, so it can be fixed.
import { InputError } from "./validate.js";

export function aiProblem(e) {
  if (e instanceof InputError || e?.code === "AI_NOT_CONFIGURED") return null;
  const msg = String(e?.message || "");
  const net = ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(e?.cause?.code) || /fetch failed/i.test(msg);
  if (net) {
    console.error("AI service unreachable:", e?.cause?.code || msg);
    return [503, "The server could not reach the service. Please try again in a moment."];
  }
  const status = Number(e?.status);
  if (!status) return null;
  console.error("Service request failed:", status, msg.slice(0, 300));
  if (status === 400 && /api key/i.test(msg)) return [503, "The service key on the server is not valid. Check the GEMINI_API_KEY setting."];
  if (status === 401 || status === 403) return [503, "The service key on the server is not allowed to use this model. Check the GEMINI_API_KEY setting."];
  if (status === 404) return [503, "The model name is not available. Remove the GEMINI_MODEL setting or set it to gemini-2.5-flash."];
  if (status === 429) return [503, "The service is busy or its free limit is used up for now. Please try again in a few minutes."];
  if (status >= 500) return [503, "The service is having trouble. Please try again in a moment."];
  return [503, "Could not answer that. Please try again."];
}
