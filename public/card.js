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

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#2a0b1e");
  g.addColorStop(0.6, "#4a1236");
  g.addColorStop(1, "#6b1631");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // moon motif
  ctx.fillStyle = "rgba(255,233,184,0.10)";
  ctx.beginPath(); ctx.arc(900, 220, 260, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f7a81b";
  ctx.beginPath(); ctx.arc(900, 220, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a1830";
  ctx.beginPath(); ctx.arc(936, 200, 80, 0, Math.PI * 2); ctx.fill();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffe9b8";
  ctx.font = '56px "Yatra One", Georgia, serif';
  ctx.fillText("Shubhly", 80, 130);

  ctx.fillStyle = "#fff7ec";
  ctx.font = '104px "Yatra One", Georgia, serif';
  const tl = wrap(ctx, title, W - 160).slice(0, 2);
  tl.forEach((l, i) => ctx.fillText(l, 80, 420 + i * 120));

  let y = 420 + tl.length * 120 + 10;
  if (subtitle) {
    ctx.fillStyle = "#ffdcc0";
    ctx.font = '36px "Hind", sans-serif';
    wrap(ctx, subtitle, W - 160).slice(0, 2).forEach((l) => { ctx.fillText(l, 80, y); y += 52; });
  }

  y += 40;
  for (const [k, v] of rows) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.roundRect(80, y, W - 160, 110, 24);
    ctx.fill();
    ctx.fillStyle = "#ffdcc0";
    ctx.font = '30px "Hind", sans-serif';
    ctx.fillText(k, 112, y + 66);
    ctx.fillStyle = "#ffe9b8";
    ctx.font = '700 38px "Hind", sans-serif';
    ctx.textAlign = "right";
    ctx.fillText(String(v), W - 112, y + 68);
    ctx.textAlign = "left";
    y += 130;
  }

  ctx.fillStyle = "#ffdcc0";
  ctx.font = '30px "Hind", sans-serif';
  ctx.fillText(footer || "Your kundli, your puja, your vibe.", 80, H - 80);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
