import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "AIzaSyTESTKEYTHATMUSTNEVERLEAK1234567890";

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

test("the key is never in any file the website serves", () => {
  for (const f of walk(path.join(root, "public"))) {
    if (/\.(png|jpe?g|webp|woff2?|ico)$/.test(f)) continue;
    assert.ok(!fs.readFileSync(f, "utf8").includes("GEMINI_API_KEY"), f);
  }
  assert.ok(!fs.existsSync(path.join(root, "public", ".env")));
});

test("the running site never returns the key, even when the AI call fails", async () => {
  const port = 3900 + Math.floor(Math.random() * 90);
  const child = spawn("node", ["server.js"], { cwd: root, env: { ...process.env, PORT: String(port), GEMINI_API_KEY: KEY, GUIDES_ALWAYS_ON: "1" } });
  try {
    for (let i = 0; i < 40; i++) {
      try { await fetch(`http://localhost:${port}/api/health`); break; } catch { await new Promise((r) => setTimeout(r, 150)); }
    }
    const base = `http://localhost:${port}`;
    const birth = { date: "1995-08-14", time: "10:30", place: { lat: 28.6, lon: 77.2, tz: "Asia/Kolkata", label: "Delhi" }, tradition: "vedic" };
    const bodies = [];
    for (const p of ["/", "/kundli", "/api/health", "/api/config", "/.env", "/server.js", "/package.json", "/src/report.js", "/%2e%2e/.env", "/nope"]) {
      const r = await fetch(base + p);
      bodies.push(await r.text());
    }
    for (const [p, body] of [["/api/report", { ...birth, topic: "general", language: "en" }], ["/api/chat", { guide: "meera", cid: "abcdefgh12345", messages: [{ role: "user", text: "hi" }], language: "en" }], ["/api/kundli", { ...birth }]]) {
      const r = await fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      bodies.push(await r.text());
    }
    const health = JSON.parse(bodies[2]);
    assert.equal(health.ai, true);
    for (const b of bodies) assert.ok(!b.includes(KEY));
    assert.ok(bodies[4].includes("<!doctype html") || bodies[4].length > 0);
    assert.ok(!bodies[5].includes("process.env"), "server source must not be downloadable");
  } finally {
    child.kill();
  }
});
