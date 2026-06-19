# Sam Scales — Barber & Grooming Website

A production-grade, SEO-optimized **3-page website** for **Sam Scales**, a premium men's barber shop & grooming studio in **Dasuya, Punjab**.

**Live site:** https://geminiforme02-bit.github.io/scalesstudio/

## Pages

- **Home** (`index.html`) — a premium scroll-driven hero where a barber video plays frame-by-frame on scroll (HTML canvas + [GSAP](https://gsap.com/) ScrollTrigger + [Lenis](https://lenis.darkroom.engineering/) smooth scroll), with staggered section reveals, an animated stats counter, a sliding marquee, testimonials and a persistent call-to-action.
- **Services** (`services.html`) — the menu in separate sections (weekly combo offers, barber & beard, facials & cleanup, hair spa & treatments, pedicure & manicure) with interactive **3D-tilt icon cards** and real ₹ pricing on offers.
- **Booking** (`booking.html`) — a 3-step appointment request form (front-end demo) with live validation, plus phone, WhatsApp, hours and an embedded map of Dasuya.

## Brand & tech

- Vanilla HTML / CSS / JavaScript — no build step, no framework.
- GSAP + ScrollTrigger + Lenis via CDN for the home experience.
- Brand palette: warm black `#0a0807`, espresso `#1b1610`, gold `#c19433`, cream `#f1e7d0`. Fonts: Fraunces + Manrope. Gold crown logo.
- Contact: +91 76588 70807 · WhatsApp · Instagram [@sam__scales_](https://www.instagram.com/sam__scales_/) · Dasuya, Punjab.
- SEO: semantic markup, Open Graph / Twitter cards, `HairSalon` / `OfferCatalog` / `BreadcrumbList` JSON-LD, `sitemap.xml`, `robots.txt`, web manifest and favicons.

## Run locally

```bash
node serve.mjs        # serves the site at http://localhost:3000
# (use PORT=3100 node serve.mjs if 3000 is busy)
```

The `frames/` folder holds the WebP frames extracted from the source video that power the scroll animation.

---

© Sam Scales · Dasuya, Punjab
