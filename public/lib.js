// Pure helpers shared by the page and the tests (no DOM access here).

export const SHORT = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Centre point of each house in the North Indian chart (house 1 at the top,
// then counter-clockwise).
const HOUSE_CENTERS = [
  [200, 112], [105, 44], [40, 105], [105, 200], [40, 295], [105, 356],
  [200, 288], [295, 356], [360, 295], [295, 200], [360, 105], [295, 44],
];

export function chartSvg(chart) {
  let parts = "";
  parts += '<rect x="10" y="10" width="380" height="380" fill="#fffdf9" stroke="#5E1A2B" stroke-width="2.5"/>';
  parts += '<g stroke="#5E1A2B" stroke-width="1.6" fill="none">';
  parts += '<path d="M10 10L390 390M390 10L10 390"/>';
  parts += '<path d="M200 10L390 200L200 390L10 200Z"/>';
  parts += "</g>";

  chart.houses.forEach((h, i) => {
    const [cx, cy] = HOUSE_CENTERS[i];
    const signNo = h.signIndex + 1;
    const pls = h.planets.map((k) => SHORT[k]);
    const lines = [];
    for (let j = 0; j < pls.length; j += 2) lines.push(pls.slice(j, j + 2).join(" "));
    const total = 1 + lines.length;
    const startY = cy - ((total - 1) * 15) / 2;
    parts += `<text x="${cx}" y="${startY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#E8892B" font-weight="600">${signNo}</text>`;
    lines.forEach((ln, k) => {
      parts += `<text x="${cx}" y="${startY + 15 * (k + 1)}" text-anchor="middle" dominant-baseline="middle" font-size="13.5" fill="#3A2A2E" font-weight="600">${esc(ln)}</text>`;
    });
  });
  parts += '<text x="200" y="62" text-anchor="middle" font-size="10" fill="#7A6468">Lagna</text>';

  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img">${parts}</svg>`;
}

// Safe, minimal markdown: escapes everything first, then adds headings,
// bullet lists, bold and paragraphs.
export function renderMarkdown(md) {
  const lines = esc(md).split(/\r?\n/);
  const out = [];
  let list = false;
  const inline = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\s)\*(.+?)\*(?=\s|$|[.,!?])/g, "$1<em>$2</em>");
  const closeList = () => {
    if (list) { out.push("</ul>"); list = false; }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    let m;
    if ((m = /^#{1,3}\s+(.*)$/.exec(line))) {
      closeList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = /^[-*•]\s+(.*)$/.exec(line))) {
      if (!list) { out.push("<ul>"); list = true; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}
