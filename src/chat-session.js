// Paid chat time with an astrologer, by the minute. A minute is paid when a message is sent after the last
// one ran out; every message inside a paid minute is covered. The cap on replies per minute keeps the AI bill
// predictable however fast someone types. Kept in memory: a restart only means the next message starts a new minute.

export class ChatSessions {
  constructor({ minuteMs = 60_000, maxReplies = 6, cap = 20_000 } = {}) {
    this.minuteMs = minuteMs;
    this.maxReplies = maxReplies;
    this.cap = cap;
    this.byUser = new Map(); // uid -> { until, replies }
  }
  /** The paid minute still running for this person, or null. */
  active(uid, now = Date.now()) {
    const s = this.byUser.get(uid);
    if (!s) return null;
    if (s.until <= now) { this.byUser.delete(uid); return null; }
    return s;
  }
  /** Start a paid minute (after the money was taken). */
  open(uid, now = Date.now()) {
    if (!this.byUser.has(uid) && this.byUser.size >= this.cap) this.byUser.delete(this.byUser.keys().next().value);
    const s = { until: now + this.minuteMs, replies: 0 };
    this.byUser.set(uid, s);
    return s;
  }
  /** Count one reply inside the running minute. False when this minute's replies are used up. */
  take(uid, now = Date.now()) {
    const s = this.active(uid, now);
    if (!s || s.replies >= this.maxReplies) return false;
    s.replies += 1;
    return true;
  }
  /** Give a reply back (the AI failed). */
  giveBack(uid) { const s = this.byUser.get(uid); if (s && s.replies > 0) s.replies -= 1; }
  /** Undo a minute that was opened but whose reply failed. */
  close(uid) { this.byUser.delete(uid); }
}
