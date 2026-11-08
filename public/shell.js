// Header behaviour and login for the pages that are not the main app (blog, Gita, puja guides):
// the phone menu, and the same login and wallet button the main pages have.
import { initAccount } from "/account.js";

const menu = document.getElementById("menuBtn");
const drawer = document.getElementById("navDrawer");
menu?.addEventListener("click", () => {
  const open = drawer.hidden;
  drawer.hidden = !open;
  menu.setAttribute("aria-expanded", String(open));
});

function toast(msg) {
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.textContent = msg;
  el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:200;background:#1b1b3a;color:#fff;padding:12px 18px;border-radius:6px;font-weight:600;max-width:90vw";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

(async () => {
  try {
    const res = await fetch("/api/config");
    const config = await res.json();
    initAccount({ toast, config });
  } catch { /* the page works without login */ }
})();
