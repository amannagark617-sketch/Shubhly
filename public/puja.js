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

// ---- A shareable picture: the puja photo, its name, what you need, and our link ----
if (sg && dataEl) {
  const d = JSON.parse(dataEl.textContent);
  const lines = (ctx, text, max) => {
    const out = []; let cur = "";
    for (const w of String(text).split(/\s+/)) {
      const t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width > max && cur) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  };
  const img = (src) => new Promise((res) => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  async function card(hi) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    try { await document.fonts.load('400 40px "Yatra One"'); await document.fonts.load('600 30px "Hind"'); } catch { /* fonts optional */ }
    x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
    // picture
    const ph = await img(d.photo), PH = 560;
    if (ph) {
      const r = Math.max(W / ph.width, PH / ph.height), w = ph.width * r, h = ph.height * r;
      x.drawImage(ph, (W - w) / 2, (PH - h) / 2, w, h);
    } else { x.fillStyle = d.c2; x.fillRect(0, 0, W, PH); x.fillStyle = d.c1; let fs = 120; x.textAlign = "center"; do { x.font = `400 ${fs}px "Yatra One", serif`; fs -= 6; } while (x.measureText(d.hi).width > W - 120 && fs > 40); x.fillText(d.hi, W / 2, PH / 2 - 20); }
    const g = x.createLinearGradient(0, PH - 220, 0, PH); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.55)");
    x.fillStyle = g; x.fillRect(0, PH - 220, W, 220);
    x.textAlign = "left"; x.fillStyle = "#fff"; x.font = '400 78px "Yatra One","Hind",serif';
    x.fillText(hi ? d.hi : d.title, 56, PH - 56);
    // tagline and facts
    x.fillStyle = "#1b1b3a"; x.font = '600 36px "Hind",system-ui,sans-serif';
    let y = PH + 70;
    for (const l of lines(x, hi ? d.tag_hi : d.tag_en, W - 112).slice(0, 2)) { x.fillText(l, 56, y); y += 48; }
    x.fillStyle = d.c1; x.font = '700 30px "Hind",system-ui,sans-serif';
    const items = hi ? d.names_hi : d.names_en;
    x.fillText(`${items.length} ${hi ? "सामग्री" : "items"}  ·  ${d.steps} ${hi ? "कदम" : "steps"}  ·  ${hi ? d.time_hi : d.time_en}`, 56, y + 8);
    // what you need
    y += 70;
    x.fillStyle = "#1b1b3a"; x.font = '700 34px "Hind",system-ui,sans-serif'; x.fillText(hi ? "ज़रूरी सामग्री" : "What you need", 56, y); y += 18;
    x.font = '500 29px "Hind",system-ui,sans-serif';
    const show = items.slice(0, 12), colW = (W - 112) / 2;
    const wrapped = show.map((it) => lines(x, it, colW - 40).slice(0, 2));
    let ry = y + 44;
    for (let r = 0; r < show.length; r += 2) {
      const rows = Math.max(wrapped[r].length, (wrapped[r + 1] || []).length);
      [r, r + 1].forEach((k, j) => {
        if (!wrapped[k]) return;
        const cx = 56 + j * colW;
        x.fillStyle = d.c1; x.fillRect(cx, ry - 22, 10, 10);
        x.fillStyle = "#333"; wrapped[k].forEach((l, li) => x.fillText(l, cx + 26, ry + li * 34));
      });
      ry += (rows - 1) * 34 + 50;
    }
    if (items.length > show.length) { x.fillStyle = "#666"; x.font = '600 26px "Hind",system-ui,sans-serif'; x.fillText(hi ? `और ${items.length - show.length} चीज़ें पूरी सूची में` : `+ ${items.length - show.length} more in the full list`, 56, ry + 4); }
    // footer
    x.fillStyle = "#1b1b3a"; x.fillRect(0, H - 150, W, 150);
    const lg = await img("/img/logo-mark.png");
    if (lg) x.drawImage(lg, 56, H - 124, 98, 98);
    x.fillStyle = "#f6b81c"; x.font = '400 46px "Yatra One","Hind",serif'; x.textAlign = "left"; x.fillText("Kundli Kaka", 176, H - 76);
    x.fillStyle = "#fff"; x.font = '600 30px "Hind",system-ui,sans-serif'; x.textAlign = "right";
    x.fillText("kundlikaka.in/puja/" + d.url.split("/").pop(), W - 56, H - 62);
    return new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
  }
  const link = (camp) => `${d.url}?utm_source=whatsapp&utm_medium=share&utm_campaign=${camp}`;
  async function shareCard(kind, textFn) {
    const hi = document.documentElement.getAttribute("data-pl") === "hi";
    const text = textFn(hi);
    window.track?.("share_click", { kind, puja: sg.dataset.slug });
    try {
      const blob = await card(hi);
      const file = new File([blob], `${sg.dataset.slug}-puja-kundlikaka.jpg`, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }).catch(() => {}); return; }
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
    } catch { /* fall through to text */ }
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  }
  const top = document.getElementById("pj-share-top");
  top.addEventListener("click", (e) => {
    e.preventDefault(); e.stopImmediatePropagation();
    shareCard("puja_page", (hi) => `${hi ? d.hi : d.title}\n${hi ? d.tag_hi : d.tag_en}\n\n${hi ? "पूरी सामग्री सूची और विधि:" : "Full samagri list and step by step vidhi:"}\n${link("puja_page")}`);
  }, true);
  const wa = document.getElementById("pj-wa");
  wa.addEventListener("click", (e) => {
    e.preventDefault(); e.stopImmediatePropagation();
    shareCard("puja_list", (hi) => `${hi ? d.hi : d.title}\n\n${(hi ? d.items_hi : d.items_en).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n${hi ? "पूरी विधि:" : "Full vidhi:"} ${link("puja_list")}`);
  }, true);
}
