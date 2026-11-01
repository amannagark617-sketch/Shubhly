import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PAGES, SLUGS, signPage, renderPage, sitemap } from "../src/pages.js";

const shell = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const origin = "https://example.com";

test("every page has its own title, description and canonical", () => {
  const all = [...Object.values(PAGES), ...SLUGS.map(signPage)];
  assert.equal(new Set(all.map((p) => p.title)).size, all.length);
  assert.equal(new Set(all.map((p) => p.desc)).size, all.length);
  for (const p of all) {
    const html = renderPage(shell, p, { origin });
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${p.path}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1, p.path);
  }
});

test("a page shows only its own sections", () => {
  const html = renderPage(shell, PAGES.kundli, { origin });
  assert.match(html, /id="kundli"(?![^>]*data-off)/);
  assert.match(html, /id="guides" data-off/);
  assert.match(html, /id="hero" data-off/);
});

test("sign pages mark the sign and the menu highlights the right link", () => {
  const html = renderPage(shell, signPage("leo"), { origin });
  assert.match(html, /data-sign="4"/);
  assert.match(html, /class="active" aria-current="page" href="\/rashifal"/);
});

test("English words are in the HTML before any script runs", () => {
  assert.match(renderPage(shell, PAGES.kundli, { origin }), /Make your kundli<\/h1>/);
});

test("sitemap lists every page, sign and Hindi page", () => {
  const x = sitemap(origin);
  assert.equal((x.match(/<loc>/g) || []).length, Object.keys(PAGES).length + 12 + 6);
});
