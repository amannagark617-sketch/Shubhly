import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryStore } from "../src/account-store.js";

test("saved reports are listed newest first and fetched by id, per user", async () => {
  const st = memoryStore();
  const a = await st.saveReport("u1", { type: "kundli", title: "Aman", lang: "en", inputs: { x: 1 }, report: { hi: 1 }, paidPaise: 9900 });
  await st.saveReport("u1", { type: "milan", title: "A and B", lang: "en", inputs: {}, report: {}, paidPaise: 16900 });
  const list = await st.listReports("u1", 20);
  assert.equal(list.length, 2);
  assert.ok(!("report" in list[0]));
  const full = await st.getReport("u1", a.id ?? list.find((r) => r.type === "kundli").id);
  assert.equal(full.type, "kundli");
  assert.deepEqual((await st.listReports("u2", 20)), []);
});
