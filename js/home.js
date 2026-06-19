/* =====================================================================
   Scales Studios — Home scroll experience
   Lenis smooth scroll + GSAP ScrollTrigger + canvas frame playback
   ===================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Config ---------- */
  const FRAME_COUNT = 200;
  const FRAME_SPEED = 2.0;     // product animation finishes ~50% scroll
  const IMAGE_SCALE = 0.86;    // padded cover
  const framePath = (i) => `frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

  /* ---------- Elements ---------- */
  const loader = document.getElementById("loader");
  const loaderBar = document.querySelector("#loader-bar > i");
  const loaderPct = document.getElementById("loader-percent");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const canvasWrap = document.getElementById("canvasWrap");
  const hero = document.getElementById("hero");
  const overlay = document.getElementById("dark-overlay");
  const marquee = document.getElementById("marquee");
  const scrollContainer = document.getElementById("scroll-container");

  const frames = new Array(FRAME_COUNT);
  let currentFrame = -1;
  let bgColor = "#f1efe9";

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Canvas sizing ---------- */
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (currentFrame >= 0) drawFrame(currentFrame);
  }

  function sampleBgColor(img) {
    try {
      const s = document.createElement("canvas");
      s.width = 24; s.height = 24;
      const sc = s.getContext("2d");
      sc.drawImage(img, 0, 0, 24, 24);
      const pts = [[1, 1], [22, 1], [1, 22], [22, 22]];
      let r = 0, g = 0, b = 0;
      pts.forEach(([x, y]) => { const d = sc.getImageData(x, y, 1, 1).data; r += d[0]; g += d[1]; b += d[2]; });
      r = Math.round(r / 4); g = Math.round(g / 4); b = Math.round(b / 4);
      bgColor = `rgb(${r},${g},${b})`;
    } catch (e) { /* keep previous */ }
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img) return;
    if (index % 20 === 0) sampleBgColor(img);
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ---------- Frame preloader (two-phase) ---------- */
  let loadedCount = 0;
  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        frames[i] = img.naturalWidth ? img : null;
        loadedCount++;
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        if (loaderBar) loaderBar.style.width = pct + "%";
        if (loaderPct) loaderPct.textContent = pct + "%";
        resolve();
      };
      img.src = framePath(i);
    });
  }

  async function preload() {
    sizeCanvas();
    // Phase 1: first frames for fast first paint
    const firstBatch = [];
    for (let i = 0; i < Math.min(12, FRAME_COUNT); i++) firstBatch.push(loadFrame(i));
    await Promise.all(firstBatch);
    currentFrame = 0;
    drawFrame(0);
    // Phase 2: the rest
    const rest = [];
    for (let i = 12; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
    await Promise.all(rest);
  }

  /* ---------- Hero intro ---------- */
  function playHeroIntro() {
    const words = document.querySelectorAll("#heroHeading .word > span");
    const tl = gsap.timeline({ delay: 0.1 });
    if (!prefersReduced) {
      tl.from(words, { yPercent: 115, duration: 1.0, stagger: 0.09, ease: "power4.out" })
        .from(".hero-tagline", { y: 24, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .from(".hero-cta > *", { y: 18, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.4")
        .from(".scroll-indicator", { opacity: 0, duration: 0.6 }, "-=0.2");
    }
  }

  /* ---------- Hide loader ---------- */
  function hideLoader() {
    if (loader) loader.classList.add("hidden");
    document.body.style.overflow = "";
    playHeroIntro();
    ScrollTrigger.refresh();
  }

  /* ---------- Section animation system ---------- */
  function buildSectionTimeline(section) {
    const type = section.dataset.animation;
    const children = section.querySelectorAll(
      ".section-label, .section-heading, .section-body, .section-note, .stat, .cta-card > *"
    );
    const tl = gsap.timeline({ paused: true });
    if (prefersReduced) {
      tl.from(children, { opacity: 0, duration: 0.3, stagger: 0.05 });
      return tl;
    }
    switch (type) {
      case "slide-left":
        tl.from(children, { x: -80, opacity: 0, stagger: 0.13, duration: 0.9, ease: "power3.out" }); break;
      case "slide-right":
        tl.from(children, { x: 80, opacity: 0, stagger: 0.13, duration: 0.9, ease: "power3.out" }); break;
      case "scale-up":
        tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: "power2.out" }); break;
      case "rotate-in":
        tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" }); break;
      case "stagger-up":
        tl.from(children, { y: 60, opacity: 0, stagger: 0.14, duration: 0.85, ease: "power3.out" }); break;
      case "clip-reveal":
        tl.from(children, { clipPath: "inset(100% 0 0 0)", y: 20, opacity: 0, stagger: 0.14, duration: 1.1, ease: "power4.inOut" }); break;
      default: /* fade-up */
        tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
    }
    return tl;
  }

  const sections = Array.from(document.querySelectorAll(".scroll-section")).map((el) => {
    const enter = parseFloat(el.dataset.enter) / 100;
    const leave = parseFloat(el.dataset.leave) / 100;
    const mid = (enter + leave) / 2;
    el.style.top = (mid * 100).toFixed(2) + "%";
    return {
      el,
      enter,
      leave,
      persist: el.dataset.persist === "true",
      tl: buildSectionTimeline(el),
      played: false,
    };
  });

  /* ---------- Stat counters ---------- */
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: target, duration: 1.8, ease: "power2.out",
        snap: { textContent: decimals === 0 ? 1 : 0.1 },
        onUpdate: function () {
          el.textContent = parseFloat(el.textContent).toFixed(decimals);
        },
      });
    });
  }

  /* ---------- Master scroll binding ---------- */
  function initScroll() {
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        /* Frames */
        const accelerated = Math.min(p * FRAME_SPEED, 1);
        const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (index !== currentFrame && index >= 0) {
          currentFrame = index;
          requestAnimationFrame(() => drawFrame(index));
        }

        /* Hero fade + circle wipe reveal of canvas */
        if (hero) hero.style.opacity = String(Math.max(0, 1 - p * 14));
        if (!prefersReduced) {
          const wipe = Math.min(1, Math.max(0, (p - 0.005) / 0.06));
          canvasWrap.style.clipPath = `circle(${(wipe * 78).toFixed(2)}% at 50% 50%)`;
        }

        /* Sections play / reverse */
        sections.forEach((s) => {
          const active = s.persist ? p >= s.enter : p >= s.enter && p <= s.leave;
          if (active && !s.played) {
            s.played = true;
            s.el.classList.add("is-active");
            s.tl.play();
            if (s.el.classList.contains("section-stats")) animateStats();
          } else if (!active && s.played && !s.persist) {
            s.played = false;
            s.el.classList.remove("is-active");
            s.tl.reverse();
          }
        });

        /* Dark overlay: stats window + persistent CTA finale (for cream-text contrast) */
        const fade = 0.04;
        let op = 0;
        if (p >= 0.55 - fade && p < 0.55) op = (p - (0.55 - fade)) / fade;        // stats fade-in
        else if (p >= 0.55 && p <= 0.73) op = 1;                                  // stats hold
        else if (p > 0.73 && p <= 0.73 + fade) op = 1 - (p - 0.73) / fade;        // stats fade-out
        if (p >= 0.88) op = Math.max(op, Math.min(1, (p - 0.88) / fade));         // CTA finale (holds)
        if (overlay) overlay.style.opacity = (op * 0.92).toFixed(3);

        /* Marquee slide + fade (visible 0.18 – 0.5) */
        if (marquee) {
          const mEnter = 0.16, mLeave = 0.52, mf = 0.05;
          let mop = 0;
          if (p >= mEnter - mf && p < mEnter) mop = (p - (mEnter - mf)) / mf;
          else if (p >= mEnter && p <= mLeave) mop = 1;
          else if (p > mLeave && p <= mLeave + mf) mop = 1 - (p - mLeave) / mf;
          marquee.style.opacity = (mop * 0.9).toFixed(3);
        }
      },
    });

    /* Marquee horizontal travel */
    if (marquee && !prefersReduced) {
      gsap.to(marquee.querySelector(".marquee-text"), {
        xPercent: -28, ease: "none",
        scrollTrigger: { trigger: scrollContainer, start: "top top", end: "bottom bottom", scrub: true },
      });
    }
  }

  /* ---------- Resize ---------- */
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { sizeCanvas(); ScrollTrigger.refresh(); }, 160);
  });

  /* ---------- Boot ---------- */
  document.body.style.overflow = "hidden";
  initScroll();
  preload().then(hideLoader).catch(hideLoader);
  // Safety: never trap the user behind the loader
  setTimeout(() => { if (loader && !loader.classList.contains("hidden")) hideLoader(); }, 9000);
})();
