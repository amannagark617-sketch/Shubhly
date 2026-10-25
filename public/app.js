import { esc, chartSvg, renderMarkdown } from "/lib.js";

const $ = (id) => document.getElementById(id);

const HI = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
};

let selectedPlace = null;
let lastPayload = null;

// ---------- helpers ----------
function show(el, on = true) { el.hidden = !on; }

function setBusy(btn, busy, label) {
  btn.disabled = busy;
  btn.innerHTML = busy ? `<span class="spinner"></span>${esc(label)}` : esc(label);
}

async function api(path, options) {
  const res = await fetch(path, options);
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
}

function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    month: "short", year: "numeric", timeZone: "UTC",
  });
}

// ---------- place search ----------
const placeInput = $("place");
const placeList = $("places");
const picked = $("placePicked");
let searchTimer = null;
let searchSeq = 0;
let activeIdx = -1;
let currentResults = [];

function closeList() {
  show(placeList, false);
  placeInput.setAttribute("aria-expanded", "false");
  activeIdx = -1;
}

function pickPlace(p) {
  selectedPlace = p;
  placeInput.value = p.label;
  picked.textContent = `Selected: ${p.label}`;
  show(picked, true);
  closeList();
}

function renderList(results) {
  currentResults = results;
  placeList.innerHTML = "";
  if (!results.length) {
    placeList.innerHTML = '<li class="none">Koi place nahi mila, spelling check karo</li>';
  } else {
    results.forEach((p, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.textContent = p.label;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); pickPlace(p); });
      placeList.appendChild(li);
    });
  }
  show(placeList, true);
  placeInput.setAttribute("aria-expanded", "true");
}

function highlight() {
  [...placeList.children].forEach((li, i) =>
    li.setAttribute("aria-selected", i === activeIdx ? "true" : "false"));
}

placeInput.addEventListener("input", () => {
  selectedPlace = null;
  show(picked, false);
  clearTimeout(searchTimer);
  const q = placeInput.value.trim();
  if (q.length < 2) { closeList(); return; }
  searchTimer = setTimeout(async () => {
    const seq = ++searchSeq;
    try {
      const data = await api(`/api/places?q=${encodeURIComponent(q)}`);
      if (seq !== searchSeq) return;
      renderList(data.places.filter((p) => p.tz));
    } catch (e) {
      if (seq !== searchSeq) return;
      placeList.innerHTML = `<li class="none">${esc(e.message)}</li>`;
      show(placeList, true);
    }
  }, 300);
});

placeInput.addEventListener("keydown", (e) => {
  if (placeList.hidden || !currentResults.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = (activeIdx + 1) % currentResults.length; highlight(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = (activeIdx - 1 + currentResults.length) % currentResults.length; highlight(); }
  else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); pickPlace(currentResults[activeIdx]); }
  else if (e.key === "Escape") closeList();
});
placeInput.addEventListener("blur", () => setTimeout(closeList, 120));

// ---------- time unknown ----------
$("timeUnknown").addEventListener("change", (e) => {
  const t = $("time");
  if (e.target.checked) { t.value = "12:00"; t.disabled = true; }
  else { t.disabled = false; }
});

// ---------- render result ----------
function renderResult(name, chart, payload) {
  $("resName").textContent = name;
  const where = payload.place.label || "";
  $("resMeta").textContent =
    `${payload.date} · ${payload.timeUnknown ? "time unknown" : payload.time}${where ? " · " + where : ""}`;

  const asc = chart.ascendant;
  const chips = [
    ["Lagna", `${asc.sign} (${asc.signHi}) ${asc.degInSign.toFixed(1)}°`],
    ["Rashi", `${chart.moonSign.sign} (${chart.moonSign.signHi})`],
    ["Nakshatra", `${chart.nakshatra.name} · pada ${chart.nakshatra.pada}`],
  ];
  $("chips").innerHTML = chips
    .map(([k, v]) => `<span class="chip"><b>${esc(k)}:</b> ${esc(v)}</span>`)
    .join("");
  show($("unknownNote"), payload.timeUnknown);

  $("chart").innerHTML = chartSvg(chart);
  $("legend").textContent =
    "Su सूर्य · Mo चंद्र · Ma मंगल · Me बुध · Ju गुरु · Ve शुक्र · Sa शनि · Ra राहु · Ke केतु. Number = rashi (1 Aries … 12 Pisces).";

  $("planetTable").querySelector("tbody").innerHTML = chart.planets
    .map((p) => `<tr>
      <td><b>${esc(p.key)}</b> <small>${esc(p.hi)}</small>${p.retrograde ? " <small>(R)</small>" : ""}</td>
      <td>${esc(p.sign)} <small>${esc(p.signHi)}</small></td>
      <td>${p.degInSign.toFixed(1)}°</td>
      <td>${p.house}</td>
      <td>${esc(p.nakshatra)} <small>pada ${p.pada}</small></td>
    </tr>`)
    .join("");

  const cur = chart.dasha.current;
  const box = $("dashaBox");
  if (cur && !payload.timeUnknown) {
    const md = cur.mahadasha;
    const ad = cur.antardasha;
    box.innerHTML =
      `<b>Abhi ka dasha:</b> ${esc(md.lord)} (${esc(HI[md.lord])}) mahadasha, ${fmtDate(md.start)} se ${fmtDate(md.end)} tak` +
      (ad ? `. Antardasha: ${esc(ad.lord)} (${esc(HI[ad.lord])}), ${fmtDate(ad.end)} tak.` : ".");
    show(box, true);
  } else {
    show(box, false);
  }

  show($("result"), true);
  // reset report area for a new chart
  show($("reportOut"), false);
  show($("printBtn"), false);
  show($("reportError"), false);
  $("reportOut").innerHTML = "";
  setBusy($("reportBtn"), false, "Get my AI report");
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- form ----------
function collect() {
  const timeUnknown = $("timeUnknown").checked;
  return {
    name: $("name").value.trim(),
    date: $("date").value,
    time: timeUnknown ? "12:00" : $("time").value,
    timeUnknown,
    place: selectedPlace,
  };
}

async function ensurePlace() {
  if (selectedPlace) return true;
  const q = placeInput.value.trim();
  if (q.length < 2) return false;
  try {
    const data = await api(`/api/places?q=${encodeURIComponent(q)}`);
    const first = data.places.find((p) => p.tz);
    if (first) { pickPlace(first); return true; }
  } catch { /* fall through */ }
  return false;
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("formError");
  show(err, false);

  if (!$("date").value) { err.textContent = "Please enter your date of birth."; show(err); return; }
  if (!$("timeUnknown").checked && !$("time").value) { err.textContent = "Please enter your time of birth."; show(err); return; }
  const btn = $("go");
  setBusy(btn, true, "Calculating your kundli...");
  try {
    if (!(await ensurePlace())) {
      throw new Error("Please choose your birth place from the list.");
    }
    const payload = collect();
    const data = await api("/api/kundli", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    lastPayload = payload;
    renderResult(data.name, data.chart, payload);
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, "Get my kundli");
  }
});

// ---------- AI report ----------
$("reportBtn").addEventListener("click", async () => {
  if (!lastPayload) return;
  const btn = $("reportBtn");
  const err = $("reportError");
  show(err, false);
  setBusy(btn, true, "Writing your report...");
  try {
    const lang = document.querySelector('input[name="lang"]:checked').value;
    const data = await api("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lastPayload, topic: $("topic").value, language: lang }),
    });
    $("reportOut").innerHTML = renderMarkdown(data.report);
    show($("reportOut"), true);
    show($("printBtn"), true);
    $("reportOut").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (ex) {
    err.textContent = ex.message;
    show(err);
  } finally {
    setBusy(btn, false, "Get my AI report");
  }
});

$("printBtn").addEventListener("click", () => window.print());
