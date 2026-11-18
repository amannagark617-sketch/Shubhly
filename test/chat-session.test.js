import test from "node:test";
import assert from "node:assert/strict";
import { ChatSessions } from "../src/chat-session.js";

test("a paid minute covers replies until it ends, then needs paying again", () => {
  const s = new ChatSessions({ minuteMs: 60_000, maxReplies: 2 });
  assert.equal(s.active("u", 0), null);
  s.open("u", 0);
  assert.ok(s.active("u", 59_000));
  assert.equal(s.take("u", 1000), true);
  assert.equal(s.take("u", 2000), true);
  assert.equal(s.take("u", 3000), false); // this minute's replies are used up
  assert.equal(s.active("u", 60_000), null); // minute over
});

test("a failed reply gives its slot back, and a failed first reply closes the minute", () => {
  const s = new ChatSessions({ maxReplies: 1 });
  s.open("u", 0); s.take("u", 1);
  s.giveBack("u");
  assert.equal(s.take("u", 2), true);
  s.close("u");
  assert.equal(s.active("u", 3), null);
});
