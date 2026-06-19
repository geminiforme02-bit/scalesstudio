/* =====================================================================
   Scales Studios — shared site behaviour
   Header, mobile nav, scroll reveals, 3D-icon tilt, counters, demo forms
   ===================================================================== */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Footer year ----- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Sticky header state ----- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----- Mobile nav ----- */
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("mobilePanel");
  if (toggle && panel) {
    const setOpen = (open) => {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("nav-open")));
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ----- Reveal on scroll (services / booking / home footer) ----- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ----- Count-up numbers (non-home pages) ----- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.counter);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ----- 3D icon tilt ----- */
  if (!prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const inner = card.querySelector(".icon-3d-inner");
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        if (inner) {
          const ry = (px - 0.5) * 26;        // left/right
          const rx = 12 - (py - 0.5) * 26;   // up/down, keep slight base tilt
          inner.style.transform = `rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
        }
      };
      const reset = () => { if (inner) inner.style.transform = ""; };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", reset);
    });
  }

  /* ----- Demo forms (newsletter etc.) ----- */
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      const input = form.querySelector("input");
      if (input && !input.checkValidity()) { input.reportValidity(); return; }
      if (btn) { btn.disabled = true; }
      if (input) { input.value = ""; input.placeholder = "Thank you — you're on the list ✓"; }
      setTimeout(() => { if (btn) btn.disabled = false; }, 1500);
    });
  });
})();
