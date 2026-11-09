// The live call goes through this server instead of straight from the browser to Google.
// The page where the site runs (AI Studio's hosting) rewrites browser connections to Google, which breaks the
// short-lived token. A relay on our own address avoids that, and keeps the Gemini key off the visitor's device.
// A visitor can only open it with a one-use ticket made when a call is started (and paid for or free).

import crypto from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { geminiKey } from "./report.js";
import { LIVE_MODEL, MAX_MINUTES, liveSetup } from "./call.js";

export const RELAY_PATH = "/api/krishna/live";
const UPSTREAM = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export function ticketBook({ now = () => Date.now(), ttlMs = 90 * 1000 } = {}) {
  const tickets = new Map();
  return {
    issue(callId) {
      for (const [k, v] of tickets) if (v.exp < now()) tickets.delete(k);
      const t = crypto.randomUUID();
      tickets.set(t, { callId, exp: now() + ttlMs });
      return t;
    },
    take(t) { // one use only
      const v = tickets.get(t); tickets.delete(t);
      return v && v.exp >= now() ? v : null;
    },
  };
}

export function attachCallRelay(server, tickets) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });
  server.on("upgrade", (req, socket, head) => {
    let url;
    try { url = new URL(req.url, "http://x"); } catch { return socket.destroy(); }
    if (url.pathname !== RELAY_PATH) return; // other upgrades are not ours
    const origin = req.headers.origin;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    let sameSite = true;
    if (origin) { try { sameSite = new URL(origin).host === String(host).split(",")[0].trim(); } catch { sameSite = false; } }
    const ok = sameSite && tickets.take(url.searchParams.get("ticket") || "");
    const key = geminiKey();
    if (!ok || !key) { socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n"); return socket.destroy(); }
    wss.handleUpgrade(req, socket, head, (client) => bridge(client, key));
  });
}

function bridge(client, key) {
  const up = new WebSocket(`${UPSTREAM}?key=${encodeURIComponent(key)}`);
  const queue = [];
  let sawSetup = false, upOpen = false;
  const stop = setTimeout(() => { try { client.close(1000, "call time over"); } catch { /* gone */ } try { up.close(); } catch { /* gone */ } }, (MAX_MINUTES * 60 + 30) * 1000);
  const shut = (why) => { clearTimeout(stop); try { client.close(1011, String(why).slice(0, 100)); } catch { /* gone */ } try { up.close(); } catch { /* gone */ } };

  up.on("open", () => {
    upOpen = true;
    up.send(JSON.stringify(liveSetup()));
    for (const m of queue.splice(0)) up.send(m.data, { binary: m.binary });
  });
  up.on("message", (data, binary) => { if (client.readyState === WebSocket.OPEN) client.send(data, { binary }); });
  up.on("close", (code, reason) => {
    clearTimeout(stop);
    try { client.close(code >= 1000 && code < 5000 && code !== 1005 && code !== 1006 ? code : 1011, reason?.toString().slice(0, 100) || "the call service closed"); } catch { /* gone */ }
  });
  up.on("error", (e) => shut("could not reach the call service: " + (e?.message || "error")));

  client.on("message", (data, binary) => {
    if (!sawSetup) { sawSetup = true; return; } // the page's own setup is ignored: the server decides the voice and instructions
    if (upOpen) up.send(data, { binary }); else queue.push({ data, binary });
  });
  client.on("close", () => { clearTimeout(stop); try { up.close(); } catch { /* gone */ } });
  client.on("error", () => shut("connection error"));
}
