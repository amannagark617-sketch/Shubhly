import test from "node:test";
import assert from "node:assert/strict";
import { aiProblem } from "../src/aierror.js";

const api = (status, message) => Object.assign(new Error(message), { status });

test("AI failures say what to fix", () => {
  assert.match(aiProblem(api(400, "API key not valid. Please pass a valid API key."))[1], /GEMINI_API_KEY/);
  assert.match(aiProblem(api(403, "denied"))[1], /GEMINI_API_KEY/);
  assert.match(aiProblem(api(404, "model not found"))[1], /GEMINI_MODEL/);
  assert.match(aiProblem(api(429, "quota"))[1], /busy|limit/);
  assert.match(aiProblem(api(503, "overloaded"))[1], /trouble/);
  assert.match(aiProblem(Object.assign(new Error("fetch failed"), { cause: { code: "ENOTFOUND" } }))[1], /reach/);
});

test("other errors are left alone", () => {
  assert.equal(aiProblem(new Error("boom")), null);
});
