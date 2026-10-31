// Puja page helpers: remembers ticked samagri on this phone, copies the list,
// and sends it on WhatsApp.
const sg = document.getElementById("pj-sg");
const dataEl = document.getElementById("pj-share");
if (sg && dataEl) {
  const d = JSON.parse(dataEl.textContent);
  const key = "kk.puja." + sg.dataset.slug;
  let done = [];
  try { done = JSON.parse(localStorage.getItem(key) || "[]"); } catch { /* private mode */ }
  const boxes = [...sg.querySelectorAll("input[data-sg]")];
  boxes.forEach((b) => { b.checked = done.includes(Number(b.dataset.sg)); });
  const prog = () => {
    const n = boxes.filter((b) => b.checked).length;
    const hi = document.documentElement.getAttribute("data-pl") === "hi";
    document.getElementById("pj-bar").style.width = (n / boxes.length) * 100 + "%";
    document.getElementById("pj-count").textContent = hi ? `${n} / ${boxes.length} जमा हो गई` : `${n} of ${boxes.length} collected`;
  };
  sg.addEventListener("change", () => {
    done = boxes.filter((b) => b.checked).map((b) => Number(b.dataset.sg));
    try { localStorage.setItem(key, JSON.stringify(done)); } catch { /* ignore */ }
    prog();
  });
  prog();
  document.addEventListener("click", (e) => { if (e.target.closest("[data-setl]")) setTimeout(prog, 0); });
  const text = () => {
    const hi = document.documentElement.getAttribute("data-pl") === "hi";
    const items = (hi ? d.items_hi : d.items_en).map((x, i) => `${i + 1}. ${x}`).join("\n");
    return `${hi ? d.hi : d.title}\n\n${items}\n\n${d.url}?utm_source=whatsapp&utm_medium=share&utm_campaign=puja_list`;
  };
  const wa = document.getElementById("pj-wa");
  wa.addEventListener("click", (e) => { e.preventDefault(); window.open("https://wa.me/?text=" + encodeURIComponent(text()), "_blank", "noopener"); });
  document.getElementById("pj-copy").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    const old = b.innerHTML;
    try { await navigator.clipboard.writeText(text()); b.textContent = "Copied"; } catch { b.textContent = "Could not copy"; }
    setTimeout(() => { b.innerHTML = old; }, 1600);
  });
  document.querySelectorAll("[data-track]").forEach((a) => a.addEventListener("click", () => window.track?.("share_click", { kind: a.dataset.track, puja: sg.dataset.slug })));
  wa.addEventListener("click", () => window.track?.("share_click", { kind: "puja_list", puja: sg.dataset.slug }));
  window.track?.("puja_view", { puja: sg.dataset.slug });
}
