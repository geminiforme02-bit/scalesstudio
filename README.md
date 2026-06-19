# Scales Studios — Website

A production-grade, SEO-optimized **3-page website** for [Scales Studios](https://scalesstudios.com), a luxury natural-hair salon in Atlanta, GA.

**Live site:** https://geminiforme02-bit.github.io/scalesstudio/

## Pages

- **Home** (`index.html`) — a premium scroll-driven hero where a hair-dryer video plays frame-by-frame on scroll (HTML canvas + [GSAP](https://gsap.com/) ScrollTrigger + [Lenis](https://lenis.darkroom.engineering/) smooth scroll), with staggered section reveals, an animated stats counter, a sliding marquee, testimonials and a persistent call-to-action.
- **Services** (`services.html`) — the full service menu with interactive **3D-tilt icon cards**, a 4-step process, and a stylist feature.
- **Booking** (`booking.html`) — a 3-step appointment request form (front-end demo) with live validation, plus salon hours, contact and an embedded map.

## Tech

- Vanilla HTML / CSS / JavaScript — no build step, no framework.
- GSAP + ScrollTrigger + Lenis via CDN for the home experience.
- Brand palette derived from the logo: deep pine-teal `#00585A`, cream `#EDE6D4`, ivory `#F4F0E7`, brass `#C6A15B`. Fonts: Fraunces + Manrope.
- SEO: semantic markup, Open Graph / Twitter cards, `HairSalon` / `Service` / `BreadcrumbList` JSON-LD, `sitemap.xml`, `robots.txt`, web manifest and favicons.

## Run locally

```bash
node serve.mjs        # serves the site at http://localhost:3000
# (use PORT=3100 node serve.mjs if 3000 is busy)
```

The `frames/` folder holds the 200 WebP frames extracted from the source video that power the scroll animation.

## Screenshots (dev)

```bash
npm install                       # installs Puppeteer (dev only)
node screenshot.mjs http://localhost:3000 home 0
```

---

© Scales Studios · Atlanta, GA
