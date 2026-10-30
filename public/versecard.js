// Turns a verse into a picture people can share.
const track = (n, p) => window.track?.(n, p);
const W = 1080, H = 1350;

function wrap(ctx, text, maxW) {
  const lines = []; let line = "";
  for (const w of text.split(/\s+/)) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
const toast = (m) => { const d = document.createElement("div"); d.className = "gv-toast"; d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 2200); };

async function make(ref, sa, en) {
  const [ch] = ref.split(".");
  await document.fonts?.ready;
  const img = new Image(); img.src = document.querySelector(".gita-banner")?.getAttribute("src") || `/gita-art/${ch}.svg`;
  await img.decode().catch(() => {});
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
  if (img.naturalWidth) x.drawImage(img, 0, 0, W, W * 340 / 800);
  const top = W * 340 / 800 + 50;
  x.textAlign = "center"; x.fillStyle = "#243a8c";
  x.font = '600 44px "Noto Serif Devanagari","Hind",serif';
  let y = top + 20;
  for (const l of wrap(x, sa.replace(/\n/g, " "), W - 140).slice(0, 4)) { x.fillText(l, W / 2, y); y += 76; }
  x.fillStyle = "#1b1b3a"; x.font = '500 38px "Hind",system-ui,sans-serif';
  y += 24;
  for (const l of wrap(x, en, W - 160).slice(0, 7)) { x.fillText(l, W / 2, y); y += 56; }
  x.fillStyle = "#f6b81c"; x.fillRect(W / 2 - 40, H - 150, 80, 5);
  x.fillStyle = "#1b1b3a"; x.font = '700 34px "Hind",system-ui,sans-serif';
  x.fillText(`Bhagavad Gita ${ref}`, W / 2, H - 90);
  x.fillStyle = "#555"; x.font = '500 28px "Hind",system-ui,sans-serif';
  x.fillText(`kundlikaka.in/gita/${ch}#v${ref.split(".")[1]}`, W / 2, H - 48);
  return new Promise((r) => c.toBlob(r, "image/png"));
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-share]"); if (!b) return;
  const art = b.closest(".gv"); const ref = b.dataset.share;
  b.disabled = true;
  try {
    const blob = await make(ref, art.dataset.sa, art.dataset.en);
    const file = new File([blob], `gita-${ref}.png`, { type: "image/png" });
    const link = `${location.origin}/gita/${ref.split(".")[0]}#v${ref.split(".")[1]}`;
    track("share_click", { kind: "gita_verse", verse: ref });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `Bhagavad Gita ${ref}\n${link}` }).catch(() => {});
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); toast("Picture saved"); }
  } catch { toast("Could not make the picture"); }
  b.disabled = false;
});
