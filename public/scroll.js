// Each verse unrolls like a royal scroll as it comes into view.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const verses = [...document.querySelectorAll(".gv")];
if (!reduce && "IntersectionObserver" in window && verses.length) {
  const target = location.hash.slice(1);
  const hs = verses.map((v) => v.querySelector(".sc-paper")?.offsetHeight || 0);
  const ti = verses.findIndex((v) => v.id === target);
  verses.forEach((v, i) => { if (v.id !== target && !(ti > -1 && i < ti)) { v.style.setProperty("--h", hs[i] + "px"); v.classList.add("pending"); } });
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const v = en.target; io.unobserve(v);
      const paper = v.querySelector(".sc-paper"), bot = v.querySelector(".sc-bot"), seal = v.querySelector(".sc-seal");
      const H = Number(parseFloat(v.style.getPropertyValue("--h"))) || paper.offsetHeight;
      v.classList.remove("pending");
      const o = { duration: Math.min(1400, 700 + H * 1.1), easing: "cubic-bezier(.22,.7,.25,1)", fill: "backwards" };
      paper.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], o);
      bot.animate([{ transform: `translateY(${-H}px)` }, { transform: "translateY(0)" }], o);
      // the verse and its divider appear as the paper opens
      v.querySelector(".gv-sa")?.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: o.duration * 0.35, easing: "ease-out", fill: "backwards" });
      v.querySelector(".sc-div")?.animate([{ opacity: 0, transform: "scaleX(.2)" }, { opacity: 1, transform: "none" }], { duration: 800, delay: o.duration * 0.5, easing: "ease-out", fill: "backwards" });
      v.querySelectorAll(".gv-en,.gv-hi,.gv-ex").forEach((el, k) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: o.duration * 0.55 + k * 120, easing: "ease-out", fill: "backwards" }));
      seal.animate([{ opacity: 0, transform: "rotate(-8deg) scale(1.8)" }, { opacity: 1, transform: "rotate(-8deg) scale(1)" }], { duration: 380, delay: o.duration - 120, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "backwards" });
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  verses.forEach((v) => v.classList.contains("pending") && io.observe(v));
  // Safety: never leave a verse hidden.
  setTimeout(() => verses.forEach((v) => { if (v.classList.contains("pending") && v.getBoundingClientRect().top < innerHeight) v.classList.remove("pending"); }), 4000);
}
