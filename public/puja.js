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
    const ph = await img(d.photo), PH = 440;
    const idol = ph ? null : await img(d.idol);
    if (ph) {
      const r = Math.max(W / ph.width, PH / ph.height), w = ph.width * r, h = ph.height * r;
      x.drawImage(ph, (W - w) / 2, (PH - h) / 2, w, h);
    } else {
      x.fillStyle = d.c2; x.fillRect(0, 0, W, PH);
      if (idol) { const sz = PH - 40; x.drawImage(idol, W - sz - 60, 20, sz, sz); }
    }
    const g = x.createLinearGradient(0, PH - 200, 0, PH); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, ph ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.0)");
    x.fillStyle = g; x.fillRect(0, PH - 200, W, 200);
    x.textAlign = "left"; x.fillStyle = ph ? "#fff" : d.c1;
    let fs = 78; const ttl = hi ? d.hi : d.title, maxT = idol ? W - 560 : W - 112;
    do { x.font = `400 ${fs}px "Yatra One","Hind",serif`; fs -= 4; } while (x.measureText(ttl).width > maxT && fs > 36);
    if (idol) { lines(x, ttl, maxT).slice(0, 3).forEach((l, i) => x.fillText(l, 56, 150 + i * (fs + 20))); } else x.fillText(ttl, 56, PH - 48);
    // tagline and facts
    x.fillStyle = "#1b1b3a"; x.font = '600 34px "Hind",system-ui,sans-serif';
    let y = PH + 62;
    for (const l of lines(x, hi ? d.tag_hi : d.tag_en, W - 112).slice(0, 2)) { x.fillText(l, 56, y); y += 44; }
    x.fillStyle = d.c1; x.font = '700 28px "Hind",system-ui,sans-serif';
    const items = hi ? d.names_hi : d.names_en;
    x.fillText(`${items.length} ${hi ? "सामग्री" : "items"}  ·  ${d.steps} ${hi ? "कदम" : "steps"}  ·  ${hi ? d.time_hi : d.time_en}`, 56, y + 4);
    // what you need, as small pictures
    y += 52;
    x.fillStyle = "#1b1b3a"; x.font = '700 32px "Hind",system-ui,sans-serif'; x.fillText(hi ? "ज़रूरी सामग्री" : "What you need", 56, y);
    if (items.length > 12) { x.fillStyle = "#666"; x.font = '600 24px "Hind",system-ui,sans-serif'; x.textAlign = "right"; x.fillText(hi ? `और ${items.length - 12} पूरी सूची में` : `+ ${items.length - 12} more in full list`, W - 56, y); x.textAlign = "left"; }
    const top0 = y + 18, FT = H - 150, rowH = Math.min(190, Math.floor((FT - top0 - 10) / 3)), th = rowH - 44, colW = (W - 112) / 4;
    const show = items.slice(0, 12), pics = await Promise.all(show.map((_, i) => img((d.pics || [])[i])));
    x.font = '500 22px "Hind",system-ui,sans-serif';
    show.forEach((name, i) => {
      const cx = 56 + (i % 4) * colW, cy = top0 + Math.floor(i / 4) * rowH, mid = cx + colW / 2;
      const bx = mid - th / 2;
      if (pics[i]) { x.save(); x.beginPath(); x.rect(bx, cy, th, th); x.clip(); const r = Math.max(th / pics[i].width, th / pics[i].height), w = pics[i].width * r, h = pics[i].height * r; x.drawImage(pics[i], mid - w / 2, cy + th / 2 - h / 2, w, h); x.restore(); }
      else { x.fillStyle = d.c2; x.fillRect(bx, cy, th, th); x.fillStyle = d.c1; x.fillRect(mid - 6, cy + th / 2 - 6, 12, 12); }
      x.fillStyle = "#333"; x.textAlign = "center";
      const base = name.replace(/\s*\(.*$/, "").split(/,| or | and | या | और /)[0].trim();
      let nm = base; while (x.measureText(nm).width > colW - 36 && nm.length > 4) nm = nm.slice(0, -1);
      x.fillText(nm === base ? nm : nm.trim() + "…", mid, cy + th + 28);
    });
    x.textAlign = "left";
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
