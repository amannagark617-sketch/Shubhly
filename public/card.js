// Draws a 1080x1350 share card on a canvas and returns it as a PNG blob.

function wrap(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function makeShareCard({ title, subtitle, rows, footer }) {
  try {
    await Promise.all([
      document.fonts.load('64px "Yatra One"'),
      document.fonts.load('32px "Hind"'),
      document.fonts.load('700 32px "Hind"'),
    ]);
  } catch { /* fall back to system fonts */ }

  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f6b81c";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(27,27,58,0.16)";
  for (let x = 12; x < W; x += 28) for (let y = 12; y < H; y += 28) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = 10; ctx.strokeStyle = "#1b1b3a"; ctx.strokeRect(30, 30, W - 60, H - 60);

  // moon motif
  ctx.fillStyle = "#fff4dc";
  ctx.beginPath(); ctx.arc(890, 230, 100, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = "#d8321a";
  ctx.beginPath(); ctx.arc(890, 230, 100, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(890, 230, 100, 0, Math.PI * 2); ctx.stroke();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1b1b3a";
  ctx.font = '56px "Yatra One", Georgia, serif';
  ctx.fillText("Kundli Kaka", 80, 130);

  ctx.fillStyle = "#1b1b3a";
  ctx.font = '104px "Yatra One", Georgia, serif';
  const tl = wrap(ctx, title, W - 160).slice(0, 2);
  tl.forEach((l, i) => ctx.fillText(l, 80, 420 + i * 120));

  let y = 420 + tl.length * 120 + 10;
  if (subtitle) {
    ctx.fillStyle = "#3a3866";
    ctx.font = '36px "Hind", sans-serif';
    wrap(ctx, subtitle, W - 160).slice(0, 2).forEach((l) => { ctx.fillText(l, 80, y); y += 52; });
  }

  y += 40;
  for (const [k, v] of rows) {
    ctx.fillStyle = "#fff4dc"; ctx.strokeStyle = "#1b1b3a"; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(80, y, W - 160, 110, 24);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#4a4870";
    ctx.font = '30px "Hind", sans-serif';
    ctx.fillText(k, 112, y + 66);
    ctx.fillStyle = "#1b1b3a";
    ctx.font = '700 38px "Hind", sans-serif';
    ctx.textAlign = "right";
    ctx.fillText(String(v), W - 112, y + 68);
    ctx.textAlign = "left";
    y += 130;
  }

  ctx.fillStyle = "#1b1b3a";
  ctx.font = '700 30px "Hind", sans-serif';
  ctx.fillText(footer || "Your kundli, your puja, your vibe.", 80, H - 80);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
