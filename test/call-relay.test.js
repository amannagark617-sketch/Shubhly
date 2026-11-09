import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { WebSocket } from "ws";
import { ticketBook, attachCallRelay, RELAY_PATH } from "../src/call-relay.js";
import { liveSetup } from "../src/call.js";

test("a ticket works once and then expires", () => {
  let t = 1000;
  const b = ticketBook({ now: () => t, ttlMs: 90000 });
  const x = b.issue("c1");
  assert.equal(b.take(x).callId, "c1");
  assert.equal(b.take(x), null);
  const y = b.issue("c2"); t += 91000;
  assert.equal(b.take(y), null);
});

test("the setup message locks the model, voice and Hindi instructions on the server", () => {
  const s = liveSetup().setup;
  assert.match(s.model, /^models\//);
  assert.deepEqual(s.generationConfig.responseModalities, ["AUDIO"]);
  assert.ok(s.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName);
  assert.match(s.systemInstruction.parts[0].text, /LIVE VOICE CALL/);
});

test("the relay refuses a connection without a valid ticket", async () => {
  const srv = http.createServer(); attachCallRelay(srv, ticketBook());
  await new Promise((r) => srv.listen(0, r));
  const code = await new Promise((res) => {
    const ws = new WebSocket(`ws://127.0.0.1:${srv.address().port}${RELAY_PATH}?ticket=nope`);
    ws.on("unexpected-response", (_q, r) => res(r.statusCode)); ws.on("open", () => res(200)); ws.on("error", () => {});
  });
  srv.close();
  assert.equal(code, 403);
});
