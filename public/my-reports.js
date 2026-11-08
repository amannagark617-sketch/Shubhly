// Lists the reports saved for this login and downloads their PDFs.
const box = document.getElementById("mrBox");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const when = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const KIND = { kundli: { h: "Full kundli reports", one: "Full report PDF", sub: "12 months, best times, doshas, remedies" }, milan: { h: "Couple's reports", one: "Couple's report PDF", sub: "Marriage timing, advice, simple fixes" } };

const wallet = () => new Promise((resolve) => {
  let n = 0;
  const t = setInterval(() => { if (window.kkWallet || ++n > 60) { clearInterval(t); resolve(window.kkWallet || null); } }, 100);
});

function loginBox() {
  box.innerHTML = `<div class="card"><h2>Log in to see your reports</h2><p class="muted">Use the same mobile number you used to buy them.</p><button type="button" class="btn btn-primary" id="mrLogin">Log in</button></div>`;
  document.getElementById("mrLogin").onclick = () => window.kkWallet?.prompt("login");
}

async function load(w) {
  const res = await fetch("/api/account/reports", { headers: await w.headers() });
  if (res.status === 401) return loginBox();
  const data = await res.json().catch(() => null);
  if (!res.ok) { box.innerHTML = `<p class="error">${esc(data?.error || "Could not load your reports. Please try again.")}</p>`; return; }
  const list = data.reports || [];
  if (!list.length) { box.innerHTML = `<div class="card"><h2>No paid reports yet</h2><p class="muted">When you buy a full kundli report or a couple's report, it will be saved here.</p></div>`; return; }
  box.innerHTML = ["kundli", "milan"].map((type) => {
    const rows = list.filter((r) => r.type === type);
    if (!rows.length) return "";
    const k = KIND[type];
    return `<section class="card"><h2>${k.h}</h2>${rows.map((r) => `<div class="dl-row"><div class="dl-what"><b>${esc(r.title || k.one)}</b><span class="dl-tag dl-price">${esc(k.one)}</span><small>${esc(when(r.createdAt))}. ${esc(k.sub)}</small></div><button type="button" class="btn btn-primary" data-id="${esc(r.id)}" data-type="${type}">Download PDF</button></div>`).join("")}</section>`;
  }).join("");
}

box.addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-id]");
  if (!b) return;
  const w = window.kkWallet, old = b.textContent;
  b.disabled = true; b.textContent = "Preparing…";
  try {
    const r = await fetch("/api/account/reports/" + encodeURIComponent(b.dataset.id), { headers: await w.headers() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not open this report.");
    const rep = d.report;
    const isMilan = rep.type === "milan";
    const pdf = await fetch(isMilan ? "/api/match/pdf" : "/api/pdf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(isMilan ? { ...rep.inputs, report: rep.report } : { ...rep.inputs, lang: rep.lang, report: rep.report }) });
    if (!pdf.ok) throw new Error((await pdf.json().catch(() => ({}))).error || "PDF failed");
    const url = URL.createObjectURL(await pdf.blob());
    const a = document.createElement("a");
    a.href = url; a.download = isMilan ? "kundlikaka-couple-report.pdf" : "kundlikaka-full-report.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (ex) { alert(ex.message); }
  b.disabled = false; b.textContent = old;
});

(async () => {
  const w = await wallet();
  if (!w?.enabled) { box.innerHTML = `<div class="card"><p class="muted">Reports are saved once accounts are switched on.</p></div>`; return; }
  const run = () => load(w);
  document.addEventListener("kk:wallet", run);
  run();
})();
