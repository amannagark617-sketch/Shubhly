// The "My reports" page: every report bought with this login, in one place, free and paid kept apart.
import { HEAD, TOP, FOOT } from "./blog.js";

export function renderMyReports(origin) {
  const url = origin + "/my-reports";
  const robots = '  <meta name="robots" content="noindex" />\n';
  return `${HEAD("My reports | Kundli Kaka", "Your Kundli Kaka reports in one place. Log in to open and download them on any phone.", url, robots)}
${TOP}
<main class="wrap my-reports">
  <h1>My reports</h1>
  <p class="muted">Everything you bought is kept here under your login. Open it on any phone and download the PDF again.</p>
  <div id="mrBox"><p class="muted">Loading…</p></div>

  <section class="card mr-free">
    <h2>Free downloads</h2>
    <p class="muted">These are free and are not saved here. Make them again any time.</p>
    <div class="dl-row"><div class="dl-what"><b>Free kundli PDF</b><span class="dl-tag">Free</span><small>Chart, planets and a short reading</small></div><a class="btn btn-outline" href="/kundli">Make my kundli</a></div>
    <div class="dl-row"><div class="dl-what"><b>Free Milan PDF</b><span class="dl-tag">Free</span><small>Score out of 36 and the 8 points</small></div><a class="btn btn-outline" href="/match">Check a match</a></div>
  </section>
</main>
<script type="module" src="/my-reports.js"></script>
${FOOT}`;
}
